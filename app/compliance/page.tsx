export default function HealthcareCompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 mt-15">
      <h1 className="text-3xl font-bold mb-4">Healthcare Compliance</h1>
      <p className="text-gray-700 mb-6">TheraTreat Technologies Private Limited</p>
      <div className="prose max-w-none">
        <h2>1. Medical Disclaimer</h2>
        <p>
          TheraTreat is a technology platform. We do not provide medical care. Therapists on our platform are
          independent professionals responsible for their services. For emergencies, call your local emergency number immediately.
        </p>

        <h2>2. Licensed Professionals</h2>
        <p>
          Therapists must maintain valid licenses and credentials and follow their professional codes.
          We verify qualifications during onboarding and conduct periodic checks.
        </p>

        <h2>3. Data Protection</h2>
        <p>
          We implement strong safeguards (encryption in transit and at rest, access controls) and follow DPDP 2023,
          GDPR (as applicable), and HIPAA-level security for health data.
        </p>

        <h2>4. Consent</h2>
        <p>
          Informed consent is required for therapy sessions. Recording sessions, if enabled, requires explicit consent.
        </p>

        <h2>5. Contact</h2>
        <p>
          compliance@theratreat.in • legal@theratreat.in • support@theratreat.in • +91 8446602680<br />
          Registered Office: 1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra
        </p>
      </div>
    </div>
  );
}
