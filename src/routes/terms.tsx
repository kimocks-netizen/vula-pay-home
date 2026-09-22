import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection, LegalList } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Vula Pay" },
      { name: "description", content: "The terms that govern your use of Vula Pay." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="22 September 2026">
      <p>Welcome to Vula Pay. By using our platform, you agree to these terms.</p>

      <LegalSection title="1. About Vula Pay">
        <p>
          Vula Pay is a QR-code payment platform for South Africa&apos;s informal and small business sector.
          It lets vendors (spaza shops, barbers, car washes, and similar small businesses), taxi associations,
          and tip earners accept cashless payments from customers (&quot;Payers&quot;) using a single QR code —
          no card machine required.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and a resident of South Africa to register a Vula Pay account.
          By registering, you confirm that all information you provide is accurate and kept up to date.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <LegalList
          items={[
            "You are responsible for keeping your account credentials secure.",
            "You may not share your account with anyone else.",
            "We reserve the right to suspend or close accounts that violate these terms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Payments & Fees">
        <LegalList
          items={[
            "All transactions are processed in South African Rand (ZAR).",
            "Card payments are processed by Paystack, a PCI-DSS compliant payment processor, and may be completed via card, Apple Pay, or Google Pay.",
            "Vula Pay charges a platform fee on successful transactions, set by your selected plan. Fees are shown before you confirm your plan and are visible on your transaction history.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Merchant Payouts">
        <LegalList
          items={[
            "Merchants must provide valid banking details to receive payouts.",
            "Payouts are processed according to your account's settlement cycle and may take 1–3 business days to reflect, depending on your bank.",
            "Vula Pay is not responsible for delays caused by banking institutions.",
            "Vula Pay may hold pending payouts for a merchant account until identity/banking (KYC) verification is complete.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Refunds">
        <p>
          Vula Pay does not itself issue refunds for completed payments. A charge, once processed and
          confirmed by our payment processor, is final and cannot be reversed by Vula Pay. Any refund must
          be arranged directly between the customer and the merchant.
        </p>
      </LegalSection>

      <LegalSection title="7. Payment Finality">
        <p>
          A payment is considered final once it has been successfully processed and confirmed by our
          payment processor. Customers should confirm the amount and the merchant&apos;s details before
          authorising payment.
        </p>
      </LegalSection>

      <LegalSection title="8. Chargebacks & Disputes">
        <LegalList
          items={[
            "Card-network rules entitle customers to raise a chargeback with their issuing bank. Vula Pay will cooperate with any legitimate dispute investigation but is not the arbiter of disputes between a customer, their bank, and the card networks.",
            "Where a chargeback is upheld, Vula Pay may recover the disputed amount from the merchant's balance or future payouts.",
            "Fraudulent chargebacks may result in account suspension and reporting to the relevant authorities.",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Data & Account Security">
        <LegalList
          items={[
            "Vula Pay does not store your full card details on our platform — card payments are handled by Paystack, a PCI-DSS compliant provider, and Vula Pay never sees or stores your full card number.",
            "Banking details used for merchant payouts are stored securely and used only to process payouts.",
            "Personal information is handled in accordance with our Privacy Policy and the Protection of Personal Information Act (POPIA).",
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Prohibited Conduct">
        <p>You may not use Vula Pay to:</p>
        <LegalList
          items={[
            "Engage in fraudulent or illegal activity",
            "Launder money or finance terrorism",
            "Harass, abuse, or harm other users",
            "Attempt to reverse-engineer, disrupt, or exploit the platform",
          ]}
        />
      </LegalSection>

      <LegalSection title="11. Limitation of Liability">
        <p>
          Vula Pay is provided &quot;as is.&quot; We do not guarantee uninterrupted service and are not
          liable for indirect or consequential damages arising from your use of the platform.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to These Terms">
        <p>
          We may update these terms from time to time. Continued use of Vula Pay after changes constitutes
          acceptance of the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing Law">
        <p>
          These terms are governed by and construed in accordance with the laws of the Republic of South
          Africa. Any disputes arising shall be subject to the exclusive jurisdiction of the South African
          courts.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          For questions about these terms, contact us at{" "}
          <a href="mailto:support@vula-pay.co.za" className="font-medium text-primary hover:underline">
            support@vula-pay.co.za
          </a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
