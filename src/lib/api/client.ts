// ---------------------------------------------------------------------------
// Data-service layer.
//
// This is the ONLY place that knows where data comes from. Today it reads the
// JSON files in /mock; tomorrow each function becomes a fetch() to the Python
// backend. Components never import from /mock directly.
// ---------------------------------------------------------------------------

import auditJson from "@mock/audit-log.json";
import merchantsJson from "@mock/merchants.json";
import paymentCodesJson from "@mock/payment-codes.json";
import plansJson from "@mock/plans.json";
import pricingJson from "@mock/pricing.json";
import pricingVersionsJson from "@mock/pricing-versions.json";
import productsJson from "@mock/products.json";
import transactionsJson from "@mock/transactions.json";
import usersJson from "@mock/users.json";
import withdrawalsJson from "@mock/withdrawals.json";

import type {
  AdminStats,
  Balance,
  AuditEntry,
  Merchant,
  PaymentCode,
  Plan,
  Pricing,
  PricingSnapshot,
  PricingVersion,
  Product,
  PublicUser,
  ResolvedPaymentCode,
  SettlementRow,
  Transaction,
  User,
  Withdrawal,
} from "./types";

const users = usersJson as User[];
const merchants = merchantsJson as Merchant[];
const products = productsJson as Product[];
const paymentCodes = paymentCodesJson as PaymentCode[];
const transactions = transactionsJson as Transaction[];
const plans = plansJson as Plan[];
const pricing = pricingJson as Pricing;
const pricingVersions = pricingVersionsJson as PricingVersion[];
const auditLog = auditJson as AuditEntry[];
const withdrawals = withdrawalsJson as Withdrawal[];

/** Withdrawals cannot be requested against money the bank has not released yet. */
function balanceOf(merchantId: string): Balance {
  const mine = transactions.filter((t) => t.merchantId === merchantId && t.status === "success");
  const settled = mine
    .filter((t) => t.settlementStatus === "settled")
    .reduce((s, t) => s + t.netCents, 0);
  const onHold = mine
    .filter((t) => t.settlementStatus !== "settled")
    .reduce((s, t) => s + t.netCents, 0);
  const mineWd = withdrawals.filter((w) => w.merchantId === merchantId);
  const paidOut = mineWd
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + w.amountCents, 0);
  const inFlight = mineWd
    .filter((w) => w.status === "pending" || w.status === "approved")
    .reduce((s, w) => s + w.amountCents, 0);
  return {
    availableCents: Math.max(0, settled - paidOut - inFlight),
    onHoldCents: onHold,
    pendingWithdrawalCents: inFlight,
    withdrawnCents: paidOut,
  };
}

/** The pricing row in force for a plan right now — the source of every fee. */
function activePricing(planId: string): PricingVersion {
  const now = Date.now();
  const live = pricingVersions
    .filter(
      (v) =>
        v.planId === planId &&
        v.status === "published" &&
        new Date(v.effectiveFrom).getTime() <= now,
    )
    .sort((a, b) => b.version - a.version);
  return live[0] ?? pricingVersions[pricingVersions.length - 1]!;
}

const snapshotOf = (v: PricingVersion): PricingSnapshot => ({
  version: v.version,
  platformFeePercent: v.platformFeePercent,
  platformFixedFeeCents: v.platformFixedFeeCents,
  providerPercent: v.providerPercent,
  providerFixedCents: v.providerFixedCents,
  feeBearer: v.feeBearer,
});

function audit(entry: Omit<AuditEntry, "id" | "createdAt">) {
  auditLog.unshift({
    ...entry,
    id: `aud_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}

/** Simulated network latency so loading states are real. */
const zarCents = (c: number) => `R{(c / 100).toFixed(2)}`;

const latency = (ms = 260) => new Promise((r) => setTimeout(r, ms));

/** How long a one-off till charge stays payable. */
export const CHARGE_TTL_MS = 5 * 60 * 1000;

const isExpired = (c: PaymentCode) =>
  !!c.expiresAt && new Date(c.expiresAt).getTime() <= Date.now();

// Till charges are shared across tabs/devices in the demo (the merchant creates
// one, the customer's phone pays it). The real backend replaces this with a row.
const CHARGE_KEY = "scanpay.charges";

/** Merges two views of the same charge, always keeping the furthest-along state. */
const mergeCharge = (a: PaymentCode, b: PaymentCode): PaymentCode => ({
  ...a,
  ...b,
  paidAt: a.paidAt ?? b.paidAt ?? null,
  active: a.active && b.active,
  payments: Math.max(a.payments, b.payments),
  scans: Math.max(a.scans, b.scans),
});

function syncCharges() {
  if (typeof localStorage === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(CHARGE_KEY) ?? "[]") as PaymentCode[];
    for (const c of stored) {
      const existing = paymentCodes.find((x) => x.id === c.id);
      if (!existing) paymentCodes.push(c);
      else Object.assign(existing, mergeCharge(existing, c));
    }
    const mine = paymentCodes.filter((c) => c.singleUse);
    localStorage.setItem(CHARGE_KEY, JSON.stringify(mine.slice(-40)));
  } catch {
    /* demo storage only */
  }
}





const strip = (u: User): PublicUser => {
  const { password: _password, ...rest } = u;
  return rest;
};

export const normalisePhone = (raw: string) => {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return `+27${digits.slice(1)}`;
  if (digits.startsWith("27")) return `+${digits}`;
  return digits;
};

export const api = {
  async login(identifier: string, password: string): Promise<PublicUser> {
    await latency();
    const phone = normalisePhone(identifier);
    const email = identifier.trim().toLowerCase();
    const found = users.find((u) => u.phone === phone || u.email.toLowerCase() === email);
    if (!found) throw new Error("No ScanPay account found for those details.");
    if (found.password !== password) throw new Error("That password is incorrect.");
    return strip(found);
  },

  async register(input: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    userType: User["userType"];
    businessName: string;
  }): Promise<PublicUser> {
    await latency(420);
    const phone = normalisePhone(input.phone);
    if (users.some((u) => u.phone === phone)) {
      throw new Error("That mobile number is already registered.");
    }
    const id = `usr_${String(users.length + 1).padStart(3, "0")}`;
    const merchantId = `mch_${String(merchants.length + 1).padStart(3, "0")}`;
    const user: User = {
      id,
      fullName: input.fullName,
      phone,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      userType: input.userType,
      merchantId,
      avatarInitials: input.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      createdAt: new Date().toISOString(),
      phoneVerified: true,
      emailVerified: false,
    };
    users.push(user);
    merchants.push({
      id: merchantId,
      userId: id,
      businessName: input.businessName || input.fullName,
      displayName: input.businessName || input.fullName,
      tradingCategory:
        input.userType === "tip" ? "Tips" : input.userType === "taxi" ? "Taxi transport" : "General",
      city: "—",
      province: "—",
      planId: "plan_free",
      payoutBank: "Not set",
      payoutAccountMasked: "—",
      settlementCycle: "Weekly",
      status: "active",
      joinedAt: new Date().toISOString(),
      slug: id,
    });
    // Every new account gets a permanent QR code straight away.
    paymentCodes.push({
      id: `pc_${String(paymentCodes.length + 1).padStart(3, "0")}`,
      merchantId,
      reference: `QR-${Math.random().toString(16).slice(2, 9).toUpperCase()}`,
      label:
        input.userType === "tip"
          ? "My tip code"
          : input.userType === "taxi"
            ? "My fare code"
            : "My payment code",
      caption:
        input.userType === "tip"
          ? "Scan to Tip"
          : input.userType === "taxi"
            ? "Scan to Pay Fare"
            : "Scan to Pay",
      mode: "variable",
      productId: null,
      amountCents: null,
      description: "",
      active: true,
      scans: 0,
      payments: 0,
      createdAt: new Date().toISOString(),
      placement: "Not set",
      isPrimary: true,
    });
    return strip(user);
  },

  async getUser(id: string): Promise<PublicUser | null> {
    await latency(80);
    const u = users.find((x) => x.id === id);
    return u ? strip(u) : null;
  },

  async getMerchant(id: string): Promise<Merchant | null> {
    await latency(120);
    return merchants.find((m) => m.id === id) ?? null;
  },

  async listProducts(merchantId: string): Promise<Product[]> {
    await latency();
    return products.filter((p) => p.merchantId === merchantId);
  },

  async updateProductPrice(productId: string, priceCents: number): Promise<Product> {
    await latency(320);
    const p = products.find((x) => x.id === productId);
    if (!p) throw new Error("Product not found");
    p.previousPriceCents = p.priceCents;
    p.priceCents = priceCents;
    p.updatedAt = new Date().toISOString();
    return p;
  },

  async listPaymentCodes(merchantId: string): Promise<PaymentCode[]> {
    await latency();
    // One-off till charges are not printable codes — they live on the Charge page.
    return paymentCodes.filter((c) => c.merchantId === merchantId && !c.singleUse);
  },


  async getPaymentCode(id: string): Promise<PaymentCode | null> {
    await latency(140);
    syncCharges();
    return paymentCodes.find((c) => c.id === id || c.reference === id) ?? null;
  },

  /** The permanent code generated at sign-up (falls back to the oldest code). */
  async getPrimaryCode(merchantId: string): Promise<PaymentCode | null> {
    await latency(140);
    const mine = paymentCodes.filter((c) => c.merchantId === merchantId);
    return mine.find((c) => c.isPrimary) ?? mine[0] ?? null;
  },

  async updatePaymentCode(
    id: string,
    patch: Partial<Pick<PaymentCode, "label" | "caption" | "placement" | "active">>,
  ): Promise<PaymentCode> {
    await latency(280);
    const code = paymentCodes.find((c) => c.id === id);
    if (!code) throw new Error("Payment code not found");
    Object.assign(code, patch);
    return code;
  },

  async updateMerchant(
    id: string,
    patch: Partial<Pick<Merchant, "displayName" | "city" | "province">>,
  ): Promise<Merchant> {
    await latency(280);
    const m = merchants.find((x) => x.id === id);
    if (!m) throw new Error("Merchant not found");
    Object.assign(m, patch);
    return m;
  },

  async createPaymentCode(input: {
    merchantId: string;
    label: string;
    mode: PaymentCode["mode"];
    productId: string | null;
    amountCents: number | null;
    placement: string;
    description: string;
  }): Promise<PaymentCode> {
    await latency(400);
    const code: PaymentCode = {
      id: `pc_${String(paymentCodes.length + 1).padStart(3, "0")}`,
      reference: `QR-${Math.random().toString(16).slice(2, 9).toUpperCase()}`,
      active: true,
      scans: 0,
      payments: 0,
      createdAt: new Date().toISOString(),
      ...input,
    };
    paymentCodes.push(code);
    return code;
  },

  /**
   * A till charge: the merchant types the total (they never capture what was
   * sold), we mint a throwaway QR that dies after CHARGE_TTL_MS or on payment.
   */
  async createCharge(input: {
    merchantId: string;
    amountCents: number;
    note?: string;
  }): Promise<PaymentCode> {
    await latency(320);
    if (input.amountCents < 100) throw new Error("Enter at least R1.00");
    const now = Date.now();
    const code: PaymentCode = {
      id: `pc_chg_${now}`,
      merchantId: input.merchantId,
      reference: `PAY-${Math.random().toString(16).slice(2, 9).toUpperCase()}`,
      label: input.note?.trim() || "Amount due",
      mode: "amount",
      productId: null,
      amountCents: input.amountCents,
      description: "One-off charge created at the till",
      active: true,
      scans: 0,
      payments: 0,
      createdAt: new Date(now).toISOString(),
      placement: "On screen",
      singleUse: true,
      expiresAt: new Date(now + CHARGE_TTL_MS).toISOString(),
      paidAt: null,
    };
    paymentCodes.push(code);
    syncCharges();
    return code;
  },

  /** Most recent till charges, newest first. */
  async listCharges(merchantId: string): Promise<PaymentCode[]> {
    await latency(160);
    syncCharges();
    return paymentCodes
      .filter((c) => c.merchantId === merchantId && c.singleUse)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);
  },

  async cancelCharge(id: string): Promise<PaymentCode> {
    await latency(160);
    const code = paymentCodes.find((c) => c.id === id);
    if (!code) throw new Error("Charge not found");
    code.active = false;
    code.expiresAt = new Date().toISOString();
    syncCharges();
    return code;
  },

  /** Resolves a scanned reference to what the customer should be shown, right now. */
  async resolveCode(reference: string): Promise<ResolvedPaymentCode | null> {
    await latency(320);
    syncCharges();
    const code = paymentCodes.find(
      (c) => c.reference.toLowerCase() === reference.toLowerCase() || c.id === reference,
    );
    if (!code || !code.active) return null;
    if (isExpired(code)) return null;
    const merchant = merchants.find((m) => m.id === code.merchantId);
    if (!merchant) return null;
    const product = code.productId
      ? (products.find((p) => p.id === code.productId) ?? null)
      : null;
    const amountCents =
      code.mode === "fixed" ? (product?.priceCents ?? null) : code.mode === "amount" ? code.amountCents : null;
    return { code, merchant, product, amountCents, expiresAt: code.expiresAt ?? null };
  },



  async listTransactions(merchantId: string): Promise<Transaction[]> {
    await latency();
    return transactions.filter((t) => t.merchantId === merchantId);
  },

  async listPlans(): Promise<Plan[]> {
    await latency(120);
    return plans;
  },

  async getPricing(): Promise<Pricing> {
    await latency(80);
    return pricing;
  },

  /** Simulates creating a Paystack payment session and its webhook confirmation. */
  async payCode(input: {
    codeId: string;
    amountCents: number;
    method: Transaction["method"];
  }): Promise<Transaction> {
    await latency(1400);
    const code = paymentCodes.find((c) => c.id === input.codeId);
    if (!code) throw new Error("Payment code not found");
    if (isExpired(code) || !code.active) {
      throw new Error("This payment request has expired. Ask for a new one.");
    }

    const merchant = merchants.find((m) => m.id === code.merchantId);
    // Fees always come from the pricing row live at this moment, and the values
    // used are frozen onto the transaction so later pricing changes can't
    // rewrite what this customer paid.
    const version = activePricing(merchant?.planId ?? "plan_free");
    const platformFeeCents =
      Math.round((input.amountCents * version.platformFeePercent) / 100) +
      version.platformFixedFeeCents;
    const providerFeeCents =
      Math.round((input.amountCents * version.providerPercent) / 100) + version.providerFixedCents;
    const txn: Transaction = {
      id: `txn_${Date.now()}`,
      reference: `STP${Math.floor(100000 + Math.random() * 899999)}`,
      merchantId: code.merchantId,
      paymentCodeId: code.id,
      productId: code.productId,
      item: code.label,
      amountCents: input.amountCents,
      platformFeeCents,
      providerFeeCents,
      netCents: input.amountCents - platformFeeCents - providerFeeCents,
      status: "success",
      method: input.method,
      customerLabel: "Anonymous",
      settlementStatus: "pending",
      createdAt: new Date().toISOString(),
      pricing: snapshotOf(version),
    };
    transactions.unshift(txn);
    code.payments += 1;
    code.scans += 1;
    if (code.singleUse) {
      code.paidAt = txn.createdAt;
      code.active = false;
      syncCharges();
    }
    return txn;
  },


  // -------------------------------------------------------------------------
  // Admin console — platform-wide reads and configuration. In the real backend
  // every one of these sits behind a staff-role check.
  // -------------------------------------------------------------------------

  async adminStats(): Promise<AdminStats> {
    await latency(200);
    const success = transactions.filter((t) => t.status === "success");
    return {
      merchants: merchants.length,
      activeMerchants: merchants.filter((m) => m.status === "active").length,
      users: users.filter((u) => u.role !== "admin").length,
      codes: paymentCodes.filter((c) => !c.singleUse).length,
      payments: success.length,
      volumeCents: success.reduce((s, t) => s + t.amountCents, 0),
      platformRevenueCents: success.reduce((s, t) => s + t.platformFeeCents, 0),
      providerFeesCents: success.reduce((s, t) => s + t.providerFeeCents, 0),
      pendingSettlementCents: success
        .filter((t) => t.settlementStatus !== "settled")
        .reduce((s, t) => s + t.netCents, 0),
      failedPayments: transactions.filter((t) => t.status === "failed").length,
    };
  },

  async adminListUsers(): Promise<PublicUser[]> {
    await latency(200);
    return users.map(strip);
  },

  async adminSetUserStatus(id: string, status: "active" | "suspended"): Promise<PublicUser> {
    await latency(240);
    const u = users.find((x) => x.id === id);
    if (!u) throw new Error("User not found");
    u.status = status;
    audit({
      actor: "Admin console",
      actorRole: "admin",
      action: status === "suspended" ? "user.suspended" : "user.reactivated",
      target: u.fullName,
      detail: `${u.phone} set to ${status}.`,
      ip: "102.132.14.7",
    });
    return strip(u);
  },

  async adminListMerchants(): Promise<Merchant[]> {
    await latency(220);
    return merchants;
  },

  async adminSetMerchantStatus(id: string, status: string): Promise<Merchant> {
    await latency(240);
    const m = merchants.find((x) => x.id === id);
    if (!m) throw new Error("Merchant not found");
    m.status = status;
    audit({
      actor: "Admin console",
      actorRole: "admin",
      action: `merchant.${status}`,
      target: m.businessName,
      detail: `Status changed to ${status}.`,
      ip: "102.132.14.7",
    });
    return m;
  },

  async adminSetMerchantPlan(id: string, planId: string): Promise<Merchant> {
    await latency(240);
    const m = merchants.find((x) => x.id === id);
    if (!m) throw new Error("Merchant not found");
    m.planId = planId;
    audit({
      actor: "Admin console",
      actorRole: "admin",
      action: "merchant.plan.changed",
      target: m.businessName,
      detail: `Moved to ${plans.find((p) => p.id === planId)?.name ?? planId}.`,
      ip: "102.132.14.7",
    });
    return m;
  },

  async adminListTransactions(): Promise<Transaction[]> {
    await latency(280);
    return [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async adminListCodes(): Promise<PaymentCode[]> {
    await latency(220);
    syncCharges();
    return [...paymentCodes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async adminSettlements(): Promise<SettlementRow[]> {
    await latency(240);
    return merchants.map((m) => {
      const mine = transactions.filter((t) => t.merchantId === m.id && t.status === "success");
      return {
        merchantId: m.id,
        merchantName: m.businessName,
        cycle: m.settlementCycle,
        pendingCents: mine
          .filter((t) => t.settlementStatus !== "settled")
          .reduce((s, t) => s + t.netCents, 0),
        settledCents: mine
          .filter((t) => t.settlementStatus === "settled")
          .reduce((s, t) => s + t.netCents, 0),
        payments: mine.length,
        lastPaymentAt:
          mine.map((t) => t.createdAt).sort((a, b) => b.localeCompare(a))[0] ?? null,
      };
    });
  },

  async adminListPricingVersions(): Promise<PricingVersion[]> {
    await latency(200);
    return [...pricingVersions].sort((a, b) => b.version - a.version);
  },

  /** Publishing pricing is a data change — never a new deployment. */
  async adminPublishPricing(input: {
    name: string;
    planId: string;
    monthlySubscriptionCents: number;
    platformFeePercent: number;
    platformFixedFeeCents: number;
    providerPercent: number;
    providerFixedCents: number;
    feeBearer: PricingVersion["feeBearer"];
    effectiveFrom: string;
    note: string;
  }): Promise<PricingVersion> {
    await latency(420);
    const version = Math.max(...pricingVersions.map((v) => v.version)) + 1;
    const effective = new Date(input.effectiveFrom).getTime();
    if (Number.isNaN(effective)) throw new Error("Choose a valid effective date.");
    const row: PricingVersion = {
      ...input,
      id: `pv_${String(version).padStart(3, "0")}`,
      version,
      status: effective <= Date.now() ? "published" : "scheduled",
      createdBy: "Admin console",
      createdAt: new Date().toISOString(),
    };
    if (row.status === "published") {
      pricingVersions
        .filter((v) => v.planId === row.planId && v.status === "published")
        .forEach((v) => {
          v.status = "retired";
        });
    }
    pricingVersions.push(row);
    audit({
      actor: "Admin console",
      actorRole: "admin",
      action: "pricing.published",
      target: `Pricing version ${version} · ${row.name}`,
      detail: `${row.platformFeePercent}% + ${zarCents(row.platformFixedFeeCents)} platform fee, effective ${row.effectiveFrom.slice(0, 10)}.`,
      ip: "102.132.14.7",
    });
    return row;
  },

  /** The pricing row a new payment on this plan would use right now. */
  async adminActivePricing(planId: string): Promise<PricingVersion> {
    await latency(80);
    return activePricing(planId);
  },

  async adminListAudit(): Promise<AuditEntry[]> {
    await latency(200);
    return auditLog;
  },

  // -------------------------------------------------------------------------
  // Withdrawals — merchants ask for their settled balance to be paid out.
  // -------------------------------------------------------------------------

  async getBalance(merchantId: string): Promise<Balance> {
    await latency(160);
    return balanceOf(merchantId);
  },

  async listWithdrawals(merchantId: string): Promise<Withdrawal[]> {
    await latency(200);
    return withdrawals
      .filter((w) => w.merchantId === merchantId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },

  async requestWithdrawal(input: {
    merchantId: string;
    amountCents: number;
    note?: string;
  }): Promise<Withdrawal> {
    await latency(420);
    const merchant = merchants.find((m) => m.id === input.merchantId);
    if (!merchant) throw new Error("Business not found");
    if (input.amountCents < 5000) throw new Error("The smallest withdrawal is R50.00");
    const balance = balanceOf(input.merchantId);
    if (input.amountCents > balance.availableCents) {
      throw new Error("That is more than your available balance.");
    }
    const wd: Withdrawal = {
      id: `wd_${Date.now()}`,
      reference: `WD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      merchantId: input.merchantId,
      amountCents: input.amountCents,
      bank: merchant.payoutBank,
      accountMasked: merchant.payoutAccountMasked,
      status: "pending",
      note: input.note?.trim() ?? "",
      requestedAt: new Date().toISOString(),
      decidedAt: null,
      decidedBy: null,
      paidAt: null,
    };
    withdrawals.unshift(wd);
    audit({
      actor: merchant.businessName,
      actorRole: "merchant",
      action: "withdrawal.requested",
      target: wd.reference,
      detail: `${zarCents(wd.amountCents)} to ${wd.bank} ${wd.accountMasked}.`,
      ip: "41.13.88.201",
    });
    return wd;
  },

  async cancelWithdrawal(id: string): Promise<Withdrawal> {
    await latency(240);
    const wd = withdrawals.find((w) => w.id === id);
    if (!wd) throw new Error("Withdrawal not found");
    if (wd.status !== "pending") throw new Error("Only a pending withdrawal can be cancelled.");
    wd.status = "rejected";
    wd.note = "Cancelled by the business";
    wd.decidedAt = new Date().toISOString();
    wd.decidedBy = "Business";
    return wd;
  },

  async adminListWithdrawals(): Promise<Withdrawal[]> {
    await latency(220);
    return [...withdrawals].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },

  /** Approve, pay out or reject — each step is audited. */
  async adminSetWithdrawalStatus(
    id: string,
    status: Exclude<Withdrawal["status"], "pending">,
    reason?: string,
  ): Promise<Withdrawal> {
    await latency(320);
    const wd = withdrawals.find((w) => w.id === id);
    if (!wd) throw new Error("Withdrawal not found");
    if (status === "paid" && wd.status !== "approved") {
      throw new Error("Approve the withdrawal before marking it paid.");
    }
    wd.status = status;
    wd.decidedAt = new Date().toISOString();
    wd.decidedBy = "Admin console";
    if (status === "paid") wd.paidAt = wd.decidedAt;
    if (reason) wd.note = reason;
    const merchant = merchants.find((m) => m.id === wd.merchantId);
    audit({
      actor: "Admin console",
      actorRole: "admin",
      action: `withdrawal.${status}`,
      target: wd.reference,
      detail: `${zarCents(wd.amountCents)} · ${merchant?.businessName ?? wd.merchantId}.`,
      ip: "102.132.14.7",
    });
    return wd;
  },
};
