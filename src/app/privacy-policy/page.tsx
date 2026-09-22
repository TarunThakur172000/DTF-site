import type { Metadata } from "next";
import { Mail, Shield, Lock } from "lucide-react";
import { PageHero } from "../../components/sections/PageHero";
import { Reveal } from "../../components/ui/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how PrintPressRepeat.com collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="We are committed to maintaining the confidentiality and security of our customers' information."
        crumbs={[{ label: "Privacy Policy" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8 text-primary-600">

          <div className="space-y-4">
            <p>
              <strong>PrintPressRepeat.com</strong> is committed to maintaining the confidentiality of our customers. We do not share, sell, or otherwise disclose information about our clients to any other party except as required to process and ship purchases.
            </p>
            <p className="text-sm text-primary-400">Last Updated: 01.05.2022</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Information Collection</h2>
            <p>
              PrintPressRepeat.com is the sole owner of the information collected on http://www.PrintPressRepeat.com. PrintPressRepeat.com collects information from our users at several different points on our Web site.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900">Registration & Orders</h3>
            <p>
              In order to use PrintPressRepeat.com, a user must first complete the registration form. During registration a user is required to give a name and email address. We use this information to contact the user about our services even if they have not placed an order.
            </p>
            <p>
              We request information from the user on our order form. A user must provide contact information (such as name, email and shipping address) and financial information (such as credit card number and expiration date). This information is used for credit card authorization and to fill customers orders. If we have trouble processing an order, the information is used to contact the user.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900">Cookies & Log Files</h3>
            <p>
              A cookie is a piece of data stored on the user&apos;s computer tied to information about the user. We use persistent cookies. A persistent cookie is a small text file stored on the user&apos;s hard drive for an extended period of time. Persistent cookies can be removed by following Internet browser help file directions.
            </p>
            <p>
              Cookies are used by PrintPressRepeat.com in order to uniquely identify users, associate user files with orders, and to enable the shopping basket. Our site cannot be used with cookies turned off.
            </p>
            <p>
              Like most standard web site servers, we use log files. This includes internet protocol (IP) addresses, browser type, internet service provider (ISP), referring/exit pages, platform type, date/time stamp, and number of clicks to analyze trends, administer the site, track users&apos; movement in the aggregate, and gather broad demographic information for aggregate use. This data is not linked to personally identifiable information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Communications</h2>
            <h3 className="text-lg font-semibold text-primary-900">Special Offers, Updates & Newsletters</h3>
            <p>
              Established members will occasionally receive information on products, services, special deals, and a newsletter. Customers are automatically subscribed to our newsletter, we ask for contact information such as name and email address.
            </p>
            <p>
              Out of respect for the privacy of our users we present the option to not receive these types of communications. If you do not wish to receive future emails or newsletters, send an email to <strong>remove@PrintPressRepeat.com</strong> or reply to unsubscribe in the subject line in the email.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Customer Service</h3>
            <p>
              We communicate with users on a regular basis to provide requested services. Our production and customer service use both email and phone information to communicate with customers in regards to issues relating to in process order.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Information Sharing & Disclosures</h2>
            <h3 className="text-lg font-semibold text-primary-900">Legal Disclaimer</h3>
            <p>
              Though we make every effort to preserve user privacy, we may need to disclose personal information when required by law wherein we have a good-faith belief that such action is necessary to comply with a current judicial proceeding, a court order or legal process served on our Web site.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Third Party Intermediaries</h3>
            <p>
              We use an outside shipping company to ship orders, and a credit card processing company to bill users for goods and services. These companies do not retain, share, store or use personally identifiable information for any secondary purposes.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Business Transitions</h3>
            <p>
              If PrintPressRepeat.com goes through a business transition, such as a merger, being acquired by another company, or selling a portion of its assets, users&apos; personal information will, in most instances, be part of the assets transferred.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Security</h2>
            <p>
              Our Websites take every precaution to protect our users&apos; information. When users submit sensitive information via the Web site, their information is protected both online and off-line.
            </p>
            <p>
              When our registration/order form asks users to enter sensitive information (such as credit card number) that information is encrypted and is protected with the best encryption software in the industry – SSL. While on a secure page, the lock icon on the bottom of Web browsers becomes locked.
            </p>
            <p>
              While we use SSL encryption to protect sensitive information online, we also do everything in our power to protect user information off-line. All of our users&apos; information is restricted in our offices. Only employees who need the information to perform a specific job are granted access to personally identifiable information.
            </p>
            <p>
              We also record your IP address when an order is paid for. This is another security measure to authenticate the origin of all orders that are paid for.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Links & Notification of Changes</h2>
            <p>
              Our sites may contain links to other sites. Please be aware that we are not responsible for the privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of each Web site that collects personally identifiable information.
            </p>
            <p>
              If we decide to change our privacy policy, we will post those changes to this privacy statement, the homepage, and other places we deem appropriate. If we are going to use users&apos; personally identifiable information in a manner different from that stated at the time of collection we will notify users via email, giving them a choice as to whether or not we use their information in this different manner.
            </p>
          </div>

        </div>

        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start">
          <Reveal>
            <div className="rounded-2xl border border-primary-50 bg-white p-6 shadow-card space-y-5">
              <h3 className="text-base font-bold text-primary-900 border-b border-primary-50 pb-3 mb-4">
                Privacy Contacts & Opt-Out
              </h3>

              <InfoRow
                icon={Mail}
                label="Opt-out or Unsubscribe"
                value="remove@PrintPressRepeat.com"
              />

              <InfoRow
                icon={Shield}
                label="Privacy Questions"
                value="privacy@PrintPressRepeat.com"
              />

              <InfoRow
                icon={Lock}
                label="Security Method"
                value="256-bit SSL Encryption"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600 shrink-0">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-primary-400">{label}</p>
        <p className="font-medium text-primary-900 break-all">{value}</p>
      </div>
    </div>
  );
}
