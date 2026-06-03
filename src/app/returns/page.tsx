import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | creamXstore',
  description: 'Return Policy for creamXstore',
};

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-[var(--color-background)] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
      </div>

      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-white/50 overflow-hidden animate-fadeIn">
        <div className="px-6 py-10 md:p-14">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] mb-8 font-[family-name:var(--font-outfit)] border-b border-[var(--color-border)] pb-6">
            Return Policy
          </h1>
          <div className="text-[var(--color-text-muted)] font-[family-name:var(--font-inter)] whitespace-pre-wrap leading-relaxed text-lg">
            {`We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.

To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.

To start a return, you can contact us at cemirates5@gmail.com.

If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.

You can always contact us for any return question at cemirates5@gmail.com.




Refunds
We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically credited on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
If more than 15 business days have passed since we’ve approved your return, please contact us at cemirates5@gmail.com.`}
          </div>
        </div>
      </div>
    </div>
  );
}
