import { createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection, LegalList } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vula Pay" },
      { name: "description", content: "How Vula Pay collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="23 September 2026">
      <p>
        Vula Pay is a product of Adequate Strategies (Pty) Ltd
        (Reg. No. 2024/021247/07).
      </p>

      <p>
        Vula Pay (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is
        committed to protecting your personal information in accordance with
        the Protection of Personal Information Act, 2013 (POPIA) and other
        applicable South African data-protection requirements.
      </p>

      <LegalSection title="1. Information We Collect">
        <p>
          Depending on how you use Vula Pay, we may collect the following
          information:
        </p>

        <LegalList
          items={[
            "Account information: full name, email address, mobile number and account identifiers.",
            "Merchant or recipient information: business or display name, trading category and other profile information.",
            "Banking information: bank-account details required for merchant or recipient verification and settlement.",
            "Transaction information: transaction amounts, timestamps, payment status, transaction references, QR-code references and related settlement information.",
            "Payment-related information: payment-provider references, tokens or identifiers made available to Vula Pay. Vula Pay does not store full payment-card numbers.",
            "Device and technical information: device type, operating system, browser type, IP address and information required to maintain the security and operation of the platform.",
            "Verification information: information reasonably required to verify identity, business information or banking details where applicable.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use personal information where necessary to:</p>

        <LegalList
          items={[
            "Create and manage Vula Pay accounts.",
            "Operate the QR-code payment platform.",
            "Identify the correct merchant, recipient, product or payment request.",
            "Initiate and record payment transactions through the applicable payment provider.",
            "Facilitate merchant or recipient settlement through the applicable payment provider or banking infrastructure.",
            "Display transaction and settlement information within the Vula Pay dashboard.",
            "Calculate and record applicable platform and payment-provider fees.",
            "Verify identity, business information and banking details where required.",
            "Detect, investigate and prevent fraud, misuse and security incidents.",
            "Provide customer and merchant support.",
            "Communicate important account, transaction and service information.",
            "Maintain, secure and improve the Vula Pay platform.",
            "Comply with applicable legal, regulatory and contractual requirements.",
          ]}
        />

        <p>
          Vula Pay does not use customer or merchant personal information for
          unrelated advertising, profiling or unrelated commercial purposes.
        </p>
      </LegalSection>

      <LegalSection title="3. Information Sharing">
        <p>
          Vula Pay does not sell your personal information.
        </p>

        <p>
          We may share personal information only where reasonably necessary
          with:
        </p>

        <LegalList
          items={[
            "Payment processors and payment service providers used to process transactions and settlements.",
            "Payment-method providers, digital-wallet providers and payment networks where required to complete a transaction.",
            "Banks and banking partners where required for account verification, settlement or payment processing.",
            "Cloud-hosting, security and technical service providers that support the operation of Vula Pay.",
            "Professional advisers, auditors or compliance service providers where reasonably required.",
            "Law-enforcement agencies, regulators, courts or other authorities where disclosure is required or permitted by law.",
          ]}
        />

        <p>
          Where information is shared with a third-party service provider, we
          aim to limit the information disclosed to what is reasonably
          necessary for that provider to perform the relevant service.
        </p>
      </LegalSection>

      <LegalSection title="4. Payment Information">
        <p>
          Vula Pay does not store full payment-card numbers, card security
          codes or other full card credentials on its platform.
        </p>

        <p>
          Payment credentials are handled by the applicable payment provider
          or payment-method provider. Vula Pay may receive transaction
          references, payment status information and payment-related tokens or
          identifiers required to identify and record a transaction.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Hosting">
        <p>
          Vula Pay&apos;s primary application and account data is hosted using
          Amazon Web Services (AWS) in the Africa (Cape Town) region
          (af-south-1), South Africa.
        </p>

        <p>
          Vula Pay uses cloud infrastructure and technical service providers
          only where required to operate, secure, maintain and support the
          platform.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <p>
          We implement reasonable technical and organisational safeguards
          designed to protect personal information against unauthorised access,
          loss, misuse, alteration or disclosure.
        </p>

        <LegalList
          items={[
            "Encrypted network connections using TLS.",
            "Access controls and authentication measures.",
            "Restricted access to personal and banking information.",
            "Use of established cloud-hosting and payment-service providers.",
            "Security monitoring and measures intended to detect unauthorised activity.",
          ]}
        />

        <p>
          No electronic system can be guaranteed to be completely secure.
          However, we take reasonable steps appropriate to the nature of the
          information processed by Vula Pay.
        </p>
      </LegalSection>

      <LegalSection title="7. Data Retention">
        <p>
          We retain personal information only for as long as reasonably
          necessary for the purposes for which it was collected, while an
          account remains active, and for any additional period required by
          applicable legal, regulatory, contractual, fraud-prevention or
          record-keeping requirements.
        </p>

        <p>
          Information that is no longer required will be deleted, destroyed or
          de-identified where reasonably practicable and where retention is not
          otherwise required.
        </p>
      </LegalSection>

      <LegalSection title="8. Your Rights Under POPIA">
        <p>
          Subject to applicable law, you may have the right to:
        </p>

        <LegalList
          items={[
            "Request access to personal information held about you.",
            "Request correction or updating of inaccurate or incomplete personal information.",
            "Request deletion or destruction of personal information where Vula Pay is not legally required or otherwise entitled to retain it.",
            "Object to certain processing of your personal information.",
            "Request information about how and why your personal information is processed.",
            "Lodge a complaint with South Africa's Information Regulator.",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Cookies and Similar Technologies">
        <p>
          Vula Pay may use cookies and similar technologies that are necessary
          for authentication, security, session management and the proper
          operation of the platform.
        </p>

        <p>
          Vula Pay does not use personal information obtained through the
          platform for unrelated advertising or behavioural profiling.
        </p>
      </LegalSection>

      <LegalSection title="10. Children">
        <p>
          Registered Vula Pay accounts are intended for persons aged 18 years
          or older. We do not knowingly register minors as Vula Pay account
          holders.
        </p>
      </LegalSection>

      <LegalSection title="11. Third-Party Services">
        <p>
          Vula Pay uses third-party providers for functions such as payment
          processing, banking, infrastructure and technical services. Those
          providers may process personal information under their own privacy
          policies and applicable legal obligations.
        </p>

        <p>
          Where the payment provider used by Vula Pay changes, the relevant
          transaction information may be provided to the new or applicable
          payment provider where necessary to process payments, perform
          verification or facilitate settlement.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect
          changes to the Vula Pay platform, service providers, legal
          requirements or data-processing activities.
        </p>

        <p>
          Where appropriate, we will notify users of material changes through
          the platform, email or another suitable communication method.
        </p>
      </LegalSection>

      <LegalSection title="13. Information Officer & Contact">
        <p>
          Vula Pay is a product of Adequate Strategies (Pty) Ltd
          (Reg. No. 2024/021247/07).
        </p>

        <p>
          For privacy-related enquiries, requests concerning your personal
          information or POPIA-related matters, contact our Information Officer
          at{" "}
          <a
            href="mailto:privacy@vula-pay.co.za"
            className="font-medium text-primary hover:underline"
          >
            privacy@vula-pay.co.za
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}