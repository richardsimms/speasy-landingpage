import { PageHeader } from "@/components/page-header"

export const metadata = {
  title: "Terms of Service - Speasy",
  description: "Speasy's terms of service and user agreement",
}

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader title="Terms of service" description="Please read these terms carefully before using our service" />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Agreement to terms</h2>
              <p className="text-muted-foreground">
                These Terms of Service constitute a legally binding agreement made between you and Speasy ("we," "us,"
                or "our"), concerning your access to and use of the Speasy website and service.
              </p>
              <p className="text-muted-foreground">
                You agree that by accessing the Service, you have read, understood, and agree to be bound by all of
                these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly
                prohibited from using the Service and you must discontinue use immediately.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">User registration</h2>
              <p className="text-muted-foreground">
                You may be required to register with the Service. You agree to keep your password confidential and will
                be responsible for all use of your account and password. We reserve the right to remove, reclaim, or
                change a username you select if we determine, in our sole discretion, that such username is
                inappropriate, obscene, or otherwise objectionable.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Subscription and billing</h2>
              <p className="text-muted-foreground">
                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a
                recurring and periodic basis, depending on the type of subscription plan you select. At the end of each
                period, your subscription will automatically renew under the exact same conditions unless you cancel it
                or we cancel it.
              </p>
              <p className="text-muted-foreground">
                You may cancel your subscription either through your online account management page or by contacting our
                customer support team. You will receive a confirmation email upon cancellation, but you will not receive
                a refund for the current billing period. You will continue to have access to the Service until the end
                of your current billing period.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Prohibited activities</h2>
              <p className="text-muted-foreground">
                You may not access or use the Service for any purpose other than that for which we make the Service
                available. The Service may not be used in connection with any commercial endeavors except those that are
                specifically endorsed or approved by us.
              </p>
              <p className="text-muted-foreground">As a user of the Service, you agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>
                  Systematically retrieve data or other content from the Service to create or compile, directly or
                  indirectly, a collection, compilation, database, or directory without written permission from us.
                </li>
                <li>
                  Make any unauthorized use of the Service, including collecting usernames and/or email addresses of
                  users by electronic or other means for the purpose of sending unsolicited email, or creating user
                  accounts by automated means or under false pretenses.
                </li>
                <li>Use the Service to advertise or offer to sell goods and services.</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
                <li>Engage in unauthorized framing of or linking to the Service.</li>
                <li>
                  Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account
                  information such as user passwords.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Limitation of liability</h2>
              <p className="text-muted-foreground">
                In no event will we or our directors, employees, or agents be liable to you or any third party for any
                direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost
                profit, lost revenue, loss of data, or other damages arising from your use of the service, even if we
                have been advised of the possibility of such damages.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Contact us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground">
                legal@speasy.com
                <br />
                123 Tech Street
                <br />
                San Francisco, CA 94107
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
