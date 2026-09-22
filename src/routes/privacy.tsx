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
    <LegalLayout title="Privacy Policy" lastUpdated="22 September 2026">
      <p>
        Vula Pay (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal
        information in accordance with the Protection of Personal Information Act (POPIA) of South Africa.
      </p>

      <LegalSection title="1. Information We Collect">
        <LegalList
          items={[
            "Account information: full name, email address, mobile number",
            "Financial information: bank account details (for merchant payouts), payment method tokens",
            "Transaction data: amounts, timestamps, payment status, QR code references",
            "Business information: business/display name, trading category, location (for merchants)",
            "Device information: device type, operating system, browser type",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <LegalList
          items={[
            "Process payments and payouts",
            "Verify your identity and prevent fraud",
            "Communicate important account updates",
            "Improve our platform and user experience",
            "Comply with legal obligations",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Information Sharing">
        <p>We do not sell your personal information. We may share data with:</p>
        <LegalList
          items={[
            "Payment processors (Paystack, Apple Pay, Google Pay) to complete transactions",
            "Banking partners to process payouts",
            "Law enforcement when required by law or a court order",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Data Security">
        <p>
          We implement industry-standard security measures, including encryption, secure connections (TLS),
          and access controls, to protect your data.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We retain your information for as long as your account is active, or as needed to provide
          services. Transaction records are kept for 5 years as required by South African financial
          regulations.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Rights Under POPIA">
        <p>You have the right to:</p>
        <LegalList
          items={[
            "Access your personal information",
            "Request correction of inaccurate data",
            "Request deletion of your data (subject to legal retention requirements)",
            "Object to processing of your data",
            "Lodge a complaint with the Information Regulator",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Vula Pay uses essential cookies to maintain your session. We do not use tracking or advertising
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>
          Vula Pay is not intended for users under 18 years of age. We do not knowingly collect information
          from minors.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>We will notify you of material changes to this policy via email or in-app notification.</p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          For privacy-related enquiries, contact our Information Officer at{" "}
          <a href="mailto:privacy@vula-pay.co.za" className="font-medium text-primary hover:underline">
            privacy@vula-pay.co.za
          </a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
