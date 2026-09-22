import type { Metadata } from "next";
import { FileText, AlertCircle, CreditCard, Truck } from "lucide-react";
import { PageHero } from "../../components/sections/PageHero";
import { Reveal } from "../../components/ui/Reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of use, sales, and policies for PrintPressRepeat.com.",
  alternates: { canonical: "/terms" },
};

export default function TermsAndConditions() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        description="Please read these terms and conditions carefully before placing an order or using our services."
        crumbs={[{ label: "Terms & Conditions" }]}
      />

      <section className="section-py container-px grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8 text-primary-600">

          <div className="space-y-4">
            <p className="text-sm text-primary-400">Last Updated: 12.05.2022</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Terms of Sale & Refunds</h2>
            <h3 className="text-lg font-semibold text-primary-900">Terms of Sale</h3>
            <p>
              Full payment, including shipping and handling is required with each order. No work will proceed until payment is received. No refunds are given once your order has been verified. No partial refunds for work not completed.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Refund Policy</h3>
            <p>
              All sales are final. No refunds are available on orders unless files have not been sent to press and the refund is requested the same business day. In the case of a refund on an order that work has not started, the refund is subject to a <strong>$50.00 processing fee</strong>.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Sales Tax</h3>
            <p>
              All Arizona orders are subject to a sales tax of 9.30%. If the customer is tax exempt, an exemption certificate (Form 5000) must be sent or faxed to us with the first job.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Artwork & Files</h2>
            <h3 className="text-lg font-semibold text-primary-900">File Requirements</h3>
            <p>
              All images, after being enlarged or reduced for reproduction, will crop approximately 1/16″ to 1/8″ to allow for bleed and / or cutting. See our file checklist for more details. We cannot process orders that do not meet the minimum requirements.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Changing Files Once Sent to Press</h3>
            <p>
              Once a job has been &ldquo;sent to press&rdquo; on PrintPressRepeat.com, no changes are allowed to the artwork, job characteristics, or turnaround time. If the order has not yet gone to press, the sole remedy available is to cancel the order, subject to a $50.00 cancellation fee, and place a new order.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Proofs & Accuracy</h3>
            <p>
              <strong>IMPORTANT:</strong> You are 100% responsible for the accuracy of your layouts. Please proofread all layouts carefully. As postal regulations are subject to change, you are also 100% responsible for complying with current mailing restrictions for postcard backside layouts. Check with your local Post Office.
            </p>
            <p>
              PrintPressRepeat.com will reproduce color from submitted digital layouts as closely as possible, but cannot exactly match color and density because of limitations in the printing process, as well as neighboring image ink requirements. We accept no responsibility for color variations between submitted images and the actual artwork or product they represent.
            </p>
            <p>
              Acceptance of an email proof will be deemed binding. Customer is responsible to check and verify all copy such as names, addresses, phone numbers, etc. If you order an email proof, turnaround will not start until final approval has been received.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Turnaround Times & Delivery</h2>
            <h3 className="text-lg font-semibold text-primary-900">Turnaround Times</h3>
            <p>
              Orders sent to press after 5pm Arizona Time will begin counting turnaround time the next business day. If you order a fax or hard copy proof, turnaround begins when we receive proof approval. Allow additional business days for delivery based on the shipping method you selected. Business days are Monday through Friday. Turnaround time does not apply to Saturdays, Sundays and holidays.
            </p>
            <p>
              Turnaround does not begin until acceptable artwork has been provided. Please note that if we are unable to print your files because they do not conform to our file requirements, your job status will return to &ldquo;On Hold-Need Artwork&rdquo; and your turnaround time will be reset. For jobs that do not have complete digital source files provided, turnaround begins when we have the photos and artwork needed to print your postcard, not from when the order is first submitted.
            </p>
            <p>
              Turnaround time for accepted artwork is not guaranteed and only an estimate. The remedy for failing to meet a deadline is limited to a refund of any rush charges or a courtesy rush on your next order. Cancellation of an order based on turnaround time is only allowed if the original order clearly states that the job is time sensitive and that if it cannot be shipped by the contracted date the customer does not want us to process the order. Turnaround time for jobs with additional services (die cutting, perforating, scoring, direct mail, etc.) requires additional time.
            </p>
            <p>
              PrintPressRepeat.com assumes no responsibility for delays caused by machine or equipment failure, natural disasters, acts of god, delivery carriers or any damages resulting from the failure to receive a job on time. Our expected delivery date is not guaranteed.
            </p>
            <p>
              <strong>Rush Charges:</strong> Rush Service will move your job to the top of the list for the next available production run. It does not guarantee turnaround time; however, through proper communication with our staff, we almost always meet or beat expectations.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Delivery Information</h3>
            <p>
              Your order may arrive late due to unforeseen delays in delivery service, the breakdown of equipment, illness, acts of god, etc. PrintPressRepeat.com assumes no responsibility for delays caused by delivery carriers.
            </p>
            <p>
              Orders shipped by Air Cargo must be picked up at the airport! Delivery to your door is not included or available when you select Air Cargo. Air Cargo shipping charges are COD/Collect. Dash service must be prepaid. A $5.00 fee will be added to each air cargo or for increased transportation charges.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Will Call</h3>
            <p>
              Will Call orders will be kept for 30 days from the delivery of the notification email. Orders left at PrintPressRepeat.com for more than 30 days will be considered abandoned and be recycled. Should a shipment be refused by a client, an additional charge of $25-50 charge will be assessed to cover return freight.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Additional Policies</h2>
            <h3 className="text-lg font-semibold text-primary-900">Complaints</h3>
            <p>
              All complaints must be registered within 24 hours of receipt of job. Should the job contain manufacturing errors and/or defects, we would rerun the job at no charge. We maintain the right to judge what a manufacturing error and defect is. No job will be rerun or corrected unless PrintPressRepeat.com has in its possession 100% of the defected merchandise.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Indemnification</h3>
            <p>
              The customer will indemnify and hold harmless the printer, PrintPressRepeat.com or its parent company, from any and all loss, cost expense, and damages on any and all manner of claims, demands, actions and proceeding that may be instituted against the printer on the grounds alleging that said printing violates any copyright or any proprietary right of any person.
            </p>
            <p>
              You certify that you own the rights to use the image(s) being reproduced on your order.
            </p>
            <h3 className="text-lg font-semibold text-primary-900">Order Completion Notification</h3>
            <p>
              Once an order is complete and ready for pickup or ready to ship you will receive an automatically generated email (to the email on file with your account) notifying you of this. From time to time these emails wind up in junk mail, please be aware of this. We will not provide a courtesy call once an order is ready.
            </p>
          </div>

        </div>

        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start">
          <Reveal>
            <div className="rounded-2xl border border-primary-50 bg-white p-6 shadow-card space-y-5">
              <h3 className="text-base font-bold text-primary-900 border-b border-primary-50 pb-3 mb-4">
                Quick Policy Reference
              </h3>

              <InfoRow
                icon={FileText}
                label="Cancellation Fee"
                value="$50.00 (Pre-press only)"
              />

              <InfoRow
                icon={CreditCard}
                label="AZ Sales Tax"
                value="9.30%"
              />

              <InfoRow
                icon={AlertCircle}
                label="Complaint Window"
                value="Within 24 hours of receipt"
              />

              <InfoRow
                icon={Truck}
                label="Will Call Limit"
                value="30 Days Maximum"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600 shrink-0">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-primary-400">{label}</p>
        <p className="font-medium text-primary-900">{value}</p>
      </div>
    </div>
  );
}
