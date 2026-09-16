// Shapes returned by the future Python backend. The mock JSON in /mock matches
// these exactly, so swapping the data source is a one-file change.

/**
 * Every account works identically — the type only changes wording and defaults.
 * vendor -> shops, spaza, car wash, services
 * tip    -> customer chooses the amount
 * taxi   -> taxi association / operator charging fixed route fares
 */
export type UserType = "vendor" | "tip" | "taxi";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  userType: UserType;
  merchantId: string;
  avatarInitials: string;
  createdAt: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  /** Vula Pay staff accounts see the admin console instead of a merchant dashboard. */
  role?: "merchant" | "admin";
  status?: "active" | "suspended";
}

export type PublicUser = Omit<User, "password">;

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  /** Public-facing name shown on QR posters — may differ from the legal name. */
  displayName: string;
  tradingCategory: string;
  city: string;
  province: string;
  planId: string;
  payoutBank: string;
  payoutAccountMasked: string;
  settlementCycle: string;
  status: string;
  joinedAt: string;
  slug: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  priceCents: number;
  previousPriceCents: number;
  sku: string;
  active: boolean;
  category: string;
  updatedAt: string;
}

/**
 * fixed    -> price resolved from the linked product (price can change, QR cannot)
 * amount   -> fixed amount stored on the code itself (e.g. taxi fare)
 * variable -> the customer types the amount
 */
export type PaymentCodeMode = "fixed" | "amount" | "variable";

export interface PaymentCode {
  id: string;
  merchantId: string;
  reference: string;
  label: string;
  mode: PaymentCodeMode;
  productId: string | null;
  amountCents: number | null;
  description: string;
  active: boolean;
  scans: number;
  payments: number;
  createdAt: string;
  placement: string;
  /** The permanent code created at sign-up — shown on the "My QR code" page. */
  isPrimary?: boolean;
  /** Poster headline, e.g. "Scan to Tip". */
  caption?: string;
  /**
   * One-off charge created by the merchant at the till: the amount is typed in
   * the app, the QR lives for a few minutes and dies once it is paid.
   */
  singleUse?: boolean;
  /** ISO time after which the code stops resolving (single-use charges only). */
  expiresAt?: string | null;
  /** ISO time the charge was paid. */
  paidAt?: string | null;

}

export type TransactionStatus = "success" | "pending" | "failed";
export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export interface Transaction {
  id: string;
  reference: string;
  merchantId: string;
  paymentCodeId: string;
  productId: string | null;
  item: string;
  amountCents: number;
  platformFeeCents: number;
  providerFeeCents: number;
  netCents: number;
  status: TransactionStatus;
  method: PaymentMethod;
  customerLabel: string;
  settlementStatus: string;
  createdAt: string;
  /**
   * Pricing snapshot — the fees that applied when this payment was taken.
   * Later pricing changes never rewrite history.
   */
  pricing?: PricingSnapshot;
}

export interface PricingSnapshot {
  version: number;
  platformFeePercent: number;
  platformFixedFeeCents: number;
  providerPercent: number;
  providerFixedCents: number;
  feeBearer: FeeBearer;
}

/** Who pays the fees on top of the basket amount. */
export type FeeBearer = "merchant" | "customer" | "split";

export type PricingStatus = "published" | "scheduled" | "retired";

/** One published pricing row — pricing is data, never a deployment. */
export interface PricingVersion {
  id: string;
  version: number;
  name: string;
  planId: string;
  monthlySubscriptionCents: number;
  platformFeePercent: number;
  platformFixedFeeCents: number;
  providerPercent: number;
  providerFixedCents: number;
  feeBearer: FeeBearer;
  effectiveFrom: string;
  status: PricingStatus;
  createdBy: string;
  createdAt: string;
  note: string;
}

export type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected";

/** A merchant asking for their available balance to be paid into their bank. */
export interface Withdrawal {
  id: string;
  reference: string;
  merchantId: string;
  amountCents: number;
  bank: string;
  accountMasked: string;
  status: WithdrawalStatus;
  note: string;
  requestedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  paidAt: string | null;
}

/** What a merchant may withdraw right now. */
export interface Balance {
  availableCents: number;
  onHoldCents: number;
  pendingWithdrawalCents: number;
  withdrawnCents: number;
}

export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: "admin" | "merchant" | "system";
  action: string;
  target: string;
  detail: string;
  createdAt: string;
  ip: string;
}

/** Per-merchant settlement view built from successful transactions. */
export interface SettlementRow {
  merchantId: string;
  merchantName: string;
  cycle: string;
  pendingCents: number;
  settledCents: number;
  payments: number;
  lastPaymentAt: string | null;
}

export interface AdminStats {
  merchants: number;
  activeMerchants: number;
  users: number;
  codes: number;
  payments: number;
  volumeCents: number;
  platformRevenueCents: number;
  providerFeesCents: number;
  pendingSettlementCents: number;
  failedPayments: number;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPriceCents: number;
  platformFeePercent: number;
  features: string[];
  recommended: boolean;
}

export interface Pricing {
  currency: string;
  provider: string;
  providerPercent: number;
  providerFixedCents: number;
  platformFeePercentByPlan: Record<string, number>;
  version: string;
  effectiveFrom: string;
}

/** What a scanning customer sees — resolved live, so price changes need no new QR. */
export interface ResolvedPaymentCode {
  code: PaymentCode;
  merchant: Merchant;
  product: Product | null;
  /** null when the customer must enter the amount */
  amountCents: number | null;
  /** Set for one-off charges — the customer sees a countdown. */
  expiresAt?: string | null;
}

