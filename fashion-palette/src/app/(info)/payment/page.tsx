import { Metadata } from "next";
import PolicyLayout, { PolicySection, PolicyBlock } from "@/components/info/PolicyLayout";

export const metadata: Metadata = {
  title: "Payment Policy",
  description:
    "Payment methods, currency, authorization, security, Cash on Delivery, refunds, and payment disputes.",
};

const intro: PolicyBlock[] = [
  {
    p: "This Policy explains payment methods, currency, authorization, security, Cash on Delivery, refunds, and payment disputes for Fashion Palette orders.",
  },
];

const sections: PolicySection[] = [
  {
    heading: "1. Available payment methods",
    blocks: [
      {
        p: "Fashion Palette accepts only the payment methods actually displayed at checkout or expressly approved in writing for a particular order. Depending on location and technical availability, these may include:",
      },
      {
        ul: [
          "Cash on Delivery for eligible Pakistan orders;",
          "JazzCash or another enabled mobile-wallet method;",
          "bank transfer, if instructions are issued by Fashion Palette;",
          "debit or credit card through an authorized payment gateway; or",
          "another method added to checkout in the future.",
        ],
      },
      {
        p: "A logo in a footer, advertisement, screenshot, or old page does not mean that a method is active. The checkout option at the time of order controls.",
      },
      {
        p: "Never send a full card number, card security code, payment PIN, online-banking password, or one-time code to Fashion Palette by email, WhatsApp, contact form, or social media.",
      },
    ],
  },
  {
    heading: "2. Currency and international conversion",
    blocks: [
      {
        p: "All product prices, delivery charges, discounts, and order totals are displayed and charged in Pakistani Rupees (PKR) unless checkout expressly states otherwise.",
      },
      { p: "If an international card, bank, or wallet pays a PKR charge:" },
      {
        ul: [
          "the issuer or payment provider performs the currency conversion;",
          "its exchange rate may differ from public rates;",
          "it may add foreign transaction, conversion, cross-border, or other fees; and",
          "Fashion Palette does not control or receive those external charges.",
        ],
      },
      {
        p: "Destination-country customs duties and import taxes are separate from the Fashion Palette order total unless checkout expressly states they are included.",
      },
    ],
  },
  {
    heading: "3. Payment authorization",
    blocks: [
      { p: "By submitting payment, you confirm that:" },
      {
        ul: [
          "you are authorized to use the selected payment method;",
          "the billing and payment information is accurate;",
          "sufficient funds or credit are available; and",
          "the provider may perform identity, device, fraud, sanctions, security, and authentication checks.",
        ],
      },
      {
        p: "An authorization, wallet debit, bank transfer, or card charge confirms payment activity but does not by itself mean that Fashion Palette has accepted the order. Order acceptance occurs only when we send the second stock-confirmation / processing email.",
      },
      {
        p: "If payment fails, expires, is reversed, cannot be verified, or is flagged for reasonable security review, we may hold, refuse, or cancel the order.",
      },
    ],
  },
  {
    heading: "4. Cash on Delivery",
    blocks: [
      {
        p: "Cash on Delivery may be offered for eligible addresses within Pakistan. The exact order amount must be paid to the authorized courier at delivery, subject to the courier’s accepted payment process.",
      },
      {
        p: "We may verify a Cash on Delivery order by telephone, WhatsApp, email, or account history. We may require prepayment, limit Cash on Delivery, or refuse an order where:",
      },
      {
        ul: [
          "the address or contact details cannot be verified;",
          "prior orders were refused or unclaimed;",
          "the value, location, item, or fraud risk is unsuitable for Cash on Delivery; or",
          "courier service is unavailable.",
        ],
      },
      {
        p: "Do not pay any amount different from the invoice/order total unless Fashion Palette has confirmed the change through an official channel.",
      },
    ],
  },
  {
    heading: "5. Online payment security",
    blocks: [
      {
        p: "Online card, bank, and wallet payments are processed by the enabled third-party payment provider. Its terms, privacy policy, authentication, limits, settlement, and dispute procedures also apply.",
      },
      {
        p: "Fashion Palette does not store full card numbers, card security codes, payment PINs, or online-banking credentials. Our systems may store the provider name, transaction reference, payment status, amount, currency, and masked account or card information necessary to administer the order.",
      },
      {
        p: "Payment API keys and merchant credentials must be stored only on the server as protected secrets. They must never appear in public source code, browser code, public repositories, screenshots, analytics, logs accessible to customers, or ordinary email.",
      },
    ],
  },
  {
    heading: "6. Bank and wallet transfer instructions",
    blocks: [
      {
        p: "Use only account or wallet instructions displayed securely at checkout or sent from an official @fashionpalette.pk address or the official WhatsApp number listed in this Policy.",
      },
      {
        p: "Include the order number with the payment and retain the transaction receipt. An order may remain pending until cleared funds are verified. Fashion Palette is not responsible for funds sent to an incorrect recipient because the customer used unofficial, altered, or fraudulent instructions.",
      },
      {
        p: "If you receive suspicious payment instructions, do not pay. Contact orders@fashionpalette.pk independently.",
      },
    ],
  },
  {
    heading: "7. Pricing, errors, and duplicate charges",
    blocks: [
      {
        p: "We take reasonable steps to keep prices and totals accurate. If a clear pricing, discount, tax, stock, or technical error is discovered before acceptance, we may contact you for approval of the correct amount or cancel and refund the affected order.",
      },
      { p: "If you believe you were charged twice or charged the wrong amount:" },
      {
        ul: [
          "check whether one entry is only a temporary authorization;",
          "do not repeat the payment unless checkout clearly says it failed; and",
          "email orders@fashionpalette.pk with the order number, amount, date, provider, and a redacted screenshot that does not reveal full card or account credentials.",
        ],
      },
    ],
  },
  {
    heading: "8. Receipts",
    blocks: [
      {
        p: "After a completed sale, Fashion Palette should provide an electronic order record or receipt showing the order number, date, item description, quantity, price, discount, delivery charge, tax if any, total, payment status, and contact details.",
      },
      {
        p: "Keep the receipt and order emails for delivery, return, warranty, and dispute purposes.",
      },
    ],
  },
  {
    heading: "9. Cancellations and refunds",
    blocks: [
      {
        p: "Cancellation is available only before Fashion Palette sends the second stock-confirmation / processing email, as explained in the Returns & Refunds Policy.",
      },
      {
        p: "Approved refunds are normally initiated within 7–10 business days after eligibility and any required inspection are complete. Refunds are sent to the original method where technically available, or by an agreed bank transfer, JazzCash, or Easypaisa transfer.",
      },
      {
        p: "The bank, card network, wallet, or payment provider may require additional posting time. International exchange-rate differences and provider fees are outside Fashion Palette’s control.",
      },
    ],
  },
  {
    heading: "10. Chargebacks and disputes",
    blocks: [
      {
        p: "Contact support@fashionpalette.pk promptly if there is a payment or order problem. We will investigate in good faith.",
      },
      {
        p: "If you start a chargeback or provider dispute, we may submit relevant evidence, including order details, terms accepted, communications, payment status, tracking, and proof of delivery. While the provider controls an active dispute, we may be unable to issue a separate refund. Duplicate recovery for the same transaction is not permitted.",
      },
      {
        p: "Fraudulent use of a payment method, false chargeback evidence, or deliberate misuse may lead to cancellation, account restriction, disclosure to the payment provider or lawful authorities, and other lawful action.",
      },
    ],
  },
  {
    heading: "11. Taxes",
    blocks: [
      {
        p: "Prices and any Pakistan tax charged by Fashion Palette will be shown at checkout or on the receipt where applicable. International import duties, VAT, sales tax, customs, brokerage, and clearance fees are normally imposed by the destination and are the recipient’s responsibility under the Shipping & Delivery Policy.",
      },
      {
        p: "Nothing in this Policy is tax advice. Customers should consult the destination authority or a qualified adviser about international import costs.",
      },
    ],
  },
  {
    heading: "12. Contact",
    blocks: [
      {
        ul: [
          "Order and payment enquiries: orders@fashionpalette.pk",
          "Payment dispute or refund support: support@fashionpalette.pk",
          "Telephone / WhatsApp: 0327-6796087",
          "Business location: People’s Colony, Faisalabad, Punjab, Pakistan",
        ],
      },
      {
        p: "This Policy forms part of the Terms & Conditions and does not limit any non-excludable consumer or payment right.",
      },
    ],
  },
];

export default function PaymentPage() {
  return (
    <PolicyLayout
      title="Payment Policy"
      effectiveDate="28 July 2026"
      intro={intro}
      sections={sections}
    />
  );
}
