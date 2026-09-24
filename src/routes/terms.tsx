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
    <LegalLayout title="Terms of Service" lastUpdated="23 September 2026">
      <p>
        Welcome to Vula Pay, a product of Adequate Strategies (Pty) Ltd
        (Reg. No. 2024/021247/07) & KIMOCKS AT ONLINE (PTY) LTD (Reg. No. 2024/265021/07). By registering for, accessing, or using
        Vula Pay, you agree to these Terms of Service.
      </p>

      <LegalSection title="1. About Vula Pay">
        <p>
          Vula Pay is a QR-code payment technology platform for South
          Africa&apos;s informal and small business sector. It enables vendors,
          small businesses, taxi operators, service providers, tip earners and
          other registered users to accept cashless payments from customers
          using QR codes without requiring a traditional card machine.
        </p>

        <p>
          These Terms apply to registered merchants, recipients and account
          users who use Vula Pay to receive payments, as well as customers,
          supporters and other payers who use Vula Pay to make payments.
        </p>

        <p>
          Vula Pay provides the technology used to identify the relevant
          merchant or recipient, present the checkout experience, maintain
          transaction records and facilitate communication with the applicable
          payment provider. Payment processing and settlement are performed
          through the applicable payment provider and banking infrastructure.
        </p>

        <p>
          Vula Pay does not operate a stored-value wallet and does not intend
          to hold customer or merchant funds in its own bank account.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and a resident of South Africa to
          register a Vula Pay account. By registering, you confirm that the
          information you provide is accurate, complete and kept up to date.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <LegalList
          items={[
            "You are responsible for keeping your account credentials secure.",
            "You may not allow another person to access or use your account without authorisation.",
            "You must keep your personal, business and banking information accurate and up to date.",
            "We may restrict, suspend or close accounts that breach these Terms, present a fraud or security risk, or are used for unlawful activity.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Payments & Fees">
        <LegalList
          items={[
            "All transactions are processed in South African Rand (ZAR), unless otherwise stated.",
            "Payments are processed through the applicable third-party payment provider. Vula Pay may integrate with payment providers such as Paystack, Ozow or other approved providers depending on the payment method and service available.",
            "Available payment methods may include card payments, Apple Pay, Google Pay and other payment methods supported by the applicable payment provider.",
            "Vula Pay charges a platform or service fee on successful transactions in accordance with the merchant's selected plan or agreed commercial arrangement.",
            "Applicable Vula Pay fees are made available to merchants through the platform, pricing information or transaction records.",
            "Payment-provider processing fees are separate from Vula Pay's platform or service fee and may vary according to the provider and payment method used.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Merchant and Recipient Settlement">
        <LegalList
          items={[
            "Merchants and recipients must provide valid and accurate banking details where bank-account settlement is required.",
            "Settlement of successful payments is performed through the applicable payment provider or banking infrastructure in accordance with the relevant settlement arrangement.",
            "Settlement timing may vary depending on the payment provider, banking institution, transaction type, verification status and applicable settlement cycle.",
            "Vula Pay does not independently hold merchant or recipient funds in its own bank account for onward distribution.",
            "Vula Pay may display transaction, fee and settlement information within the merchant or recipient dashboard. These records form part of the platform's transaction ledger and do not represent stored monetary value held by Vula Pay.",
            "Payment or settlement functionality may be restricted or delayed where identity, business or banking verification required by Vula Pay or the applicable payment provider has not been completed.",
            "Vula Pay is not responsible for settlement delays caused by banks, payment providers, payment networks or other third-party financial institutions.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Refunds">
        <p>
          Vula Pay does not itself process or independently settle refunds from
          merchant funds. Where a customer requests a refund, the request must
          be handled in accordance with the merchant&apos;s refund policy and
          the refund functionality, rules and procedures supported by the
          applicable payment provider.
        </p>

        <p>
          Nothing in these Terms limits any rights that a customer may have
          under applicable South African law.
        </p>
      </LegalSection>

      <LegalSection title="7. Payment Confirmation and Finality">
        <p>
          A payment will be treated by Vula Pay as successful once the
          applicable payment provider confirms that the transaction has been
          successfully processed.
        </p>

        <p>
          Customers should verify the merchant or recipient, payment amount and
          transaction details before authorising a payment.
        </p>

        <p>
          A successful payment confirmation displayed by Vula Pay reflects the
          transaction status received from the applicable payment provider and
          does not mean that Vula Pay has taken possession of the underlying
          funds.
        </p>
      </LegalSection>

      <LegalSection title="8. Chargebacks & Disputes">
        <LegalList
          items={[
            "Customers may have rights to dispute transactions or raise chargebacks through their issuing bank, card network or applicable payment provider.",
            "Vula Pay may provide transaction records and other relevant information to assist with legitimate dispute or chargeback investigations.",
            "Where a chargeback, reversal or settlement adjustment is upheld, the applicable payment provider may adjust, recover or offset the relevant amount in accordance with its settlement and chargeback procedures.",
            "Vula Pay may reflect chargebacks, reversals and settlement adjustments in the merchant's transaction ledger or account records.",
            "Fraudulent use of the platform or fraudulent disputes may result in account restriction, suspension or reporting to the relevant authorities where appropriate.",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Data & Account Security">
        <LegalList
          items={[
            "Vula Pay does not store full payment-card numbers on its platform. Card details are handled by the applicable PCI-DSS compliant payment provider.",
            "Vula Pay may receive transaction references, payment status information and payment-related tokens or identifiers made available by the applicable payment provider.",
            "Banking details provided for merchant or recipient settlement are stored and processed only where required for account verification, settlement or related platform functions.",
            "Personal information is handled in accordance with our Privacy Policy and the Protection of Personal Information Act, 2013 (POPIA).",
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Prohibited Conduct">
        <p>You may not use Vula Pay to:</p>

        <LegalList
          items={[
            "Engage in fraudulent, unlawful or misleading activity.",
            "Launder money, finance terrorism or facilitate prohibited financial activity.",
            "Use the platform to sell or facilitate goods or services prohibited by applicable law or the applicable payment provider.",
            "Harass, abuse, defraud or harm other users.",
            "Provide false identity, business or banking information.",
            "Attempt to reverse-engineer, disrupt, interfere with or exploit the platform.",
            "Attempt to bypass security, verification, payment or fraud-prevention controls.",
          ]}
        />
      </LegalSection>

      <LegalSection title="11. Third-Party Payment Services">
        <p>
          Vula Pay relies on third-party payment providers, banks, payment
          networks and other service providers to process and settle
          transactions.
        </p>

        <p>
          Use of particular payment methods may also be subject to the terms,
          conditions and policies of the applicable payment provider, issuing
          bank, payment network or digital-wallet provider.
        </p>

        <p>
          Vula Pay is not responsible for outages, processing failures,
          settlement delays or service interruptions caused by third-party
          providers outside Vula Pay&apos;s reasonable control.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of Liability">
        <p>
          Vula Pay is provided on an &quot;as available&quot; basis. While we
          take reasonable steps to maintain a reliable and secure service, we
          do not guarantee uninterrupted or error-free availability.
        </p>

        <p>
          To the extent permitted by law, Vula Pay,  Adequate Strategies
          (Pty) Ltd and KIMOCKS AT ONLINE (PTY) LTD will not be liable for indirect, incidental or
          consequential loss arising from use of the platform or from failures
          caused by third-party payment, banking or telecommunications
          services.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to These Terms">
        <p>
          We may update these Terms from time to time to reflect changes to the
          Vula Pay platform, payment-provider arrangements, legal requirements
          or business operations.
        </p>

        <p>
          Where appropriate, we will provide notice of material changes.
          Continued use of Vula Pay after updated Terms become effective
          constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws
          of the Republic of South Africa. Any dispute arising from these Terms
          or the use of Vula Pay will be subject to the jurisdiction of the
          competent South African courts.
        </p>
      </LegalSection>

      <LegalSection title="15. Company Information & Contact">
        <p>
          Vula Pay is a product of Adequate Strategies (Pty) Ltd
          (Reg. No. 2024/021247/07) & KIMOCKS AT ONLINE (PTY) LTD (Reg. No. 2024/265021/07).
        </p>

        <p>
          For questions about these Terms, contact us at{" "}
          <a
            href="mailto:support@vula-pay.co.za"
            className="font-medium text-primary hover:underline"
          >
            support@vula-pay.co.za
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}