import { PageHeader } from "@/components/page-header"

export const metadata = {
  title: "Privacy Policy - Speasy",
  description: "Speasy's privacy policy and data handling practices",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" description="How we collect, use, and protect your information" />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Introduction</h2>
              <p className="text-muted-foreground">
                At Speasy, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our service. Please read this privacy policy carefully. If
                you do not agree with the terms of this privacy policy, please do not access the service.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will
                alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are
                encouraged to periodically review this Privacy Policy to stay informed of updates.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Information we collect</h2>
              <p className="text-muted-foreground">
                We may collect information about you in various ways. The information we may collect via the Service
                includes:
              </p>
              <h3 className="text-xl font-medium tracking-tight">Personal Data</h3>
              <p className="text-muted-foreground">
                Personally identifiable information, such as your name, email address, and other contact information
                that you voluntarily give to us when you register with the Service or when you choose to participate in
                various activities related to the Service. You are under no obligation to provide us with personal
                information of any kind, however your refusal to do so may prevent you from using certain features of
                the Service.
              </p>
              <h3 className="text-xl font-medium tracking-tight">Email Data</h3>
              <p className="text-muted-foreground">
                If you choose to connect your email account to our Service, we will access your emails solely for the
                purpose of identifying newsletters and creating audio summaries. We do not store the full content of
                your emails on our servers. We only extract and process the necessary information to create the
                summaries.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">How we use your information</h2>
              <p className="text-muted-foreground">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized
                experience. Specifically, we may use information collected about you via the Service to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Create and manage your account.</li>
                <li>Process your subscription and payments.</li>
                <li>Generate audio summaries of newsletters and emails.</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and requests.</li>
                <li>Improve our Service and develop new features.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Disclosure of your information</h2>
              <p className="text-muted-foreground">
                We may share information we have collected about you in certain situations. Your information may be
                disclosed as follows:
              </p>
              <h3 className="text-xl font-medium tracking-tight">By Law or to Protect Rights</h3>
              <p className="text-muted-foreground">
                If we believe the release of information about you is necessary to respond to legal process, to
                investigate or remedy potential violations of our policies, or to protect the rights, property, and
                safety of others, we may share your information as permitted or required by any applicable law, rule, or
                regulation.
              </p>
              <h3 className="text-xl font-medium tracking-tight">Third-Party Service Providers</h3>
              <p className="text-muted-foreground">
                We may share your information with third parties that perform services for us or on our behalf,
                including payment processing, data analysis, email delivery, hosting services, customer service, and
                marketing assistance.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Contact us</h2>
              <p className="text-muted-foreground">
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground">
                privacy@speasy.com
                <br />
                2a Florence Street
                <br />
                Melbourne, AU 3187
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
