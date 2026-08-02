import { Metadata } from "next";
import PolicyLayout, { PolicySection, PolicyBlock } from "@/components/info/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "Order processing, delivery charges, tracking, international shipping, and customer responsibilities.",
};

const intro: PolicyBlock[] = [
  {
    p: "This Policy explains order processing, delivery charges, tracking, delays, international shipping, and customer responsibilities for orders placed through https://fashionpalette.pk.",
  },
];

const sections: PolicySection[] = [
  {
    heading: "1. Order acknowledgement and stock confirmation",
    blocks: [
      {
        p: "The automatic email sent immediately after checkout only acknowledges that we received your order request. It is not final acceptance and does not guarantee stock.",
      },
      {
        p: "Fashion Palette checks stock, price, payment, address, and order details. The order is accepted when we send the second email confirming that it is accepted and under process. If an item is unavailable or the order cannot be accepted, we will contact you and refund any eligible prepaid amount.",
      },
    ],
  },
  {
    heading: "2. Pakistan delivery",
    blocks: [
      { h3: "2.1 Charges" },
      {
        ul: [
          "A flat delivery charge of PKR 500 applies to Pakistan orders.",
          "Delivery is free when the merchandise subtotal is above PKR 10,000, after discounts and before any customs or international charges.",
          "Any different promotional delivery offer must be clearly shown at checkout and applies only for its stated period.",
        ],
      },
      { h3: "2.2 Timing" },
      {
        p: "Pakistan orders are normally processed, dispatched, and delivered within an estimated 3–7 business days after stock confirmation, depending on the destination, order type, payment verification, and courier operations.",
      },
      {
        p: "During Eid holidays, major launches, high-volume periods, public holidays, severe weather, regional disruption, or courier backlogs, delivery may require an additional 5–7 business days.",
      },
      {
        p: "Custom stitching or another made-to-order service requires extra production time. The estimated stitching and delivery period should be communicated before or after measurement confirmation. The normal delivery estimate begins only when the custom work is complete and dispatched.",
      },
      { h3: "2.3 Courier" },
      {
        p: "Fashion Palette normally uses PostEx for delivery within Pakistan, but may use another suitable courier where operationally necessary.",
      },
    ],
  },
  {
    heading: "3. International delivery",
    blocks: [
      { h3: "3.1 Available destinations" },
      {
        p: "International delivery is offered only to destinations supported by SkyNet and accepted by Fashion Palette at the time of order. Availability can change because of courier, customs, sanctions, service-area, security, payment, or legal restrictions.",
      },
      {
        p: "If a destination is not available at checkout, contact orders@fashionpalette.pk before placing an order. A manual enquiry is not a guarantee that delivery can be offered.",
      },
      { h3: "3.2 International charges and timing" },
      {
        p: "International shipping charges depend on destination, parcel weight and size, courier pricing, and any special handling. The charge or quotation must be accepted before dispatch.",
      },
      {
        p: "International transit times vary by country, local courier, customs, public holidays, security checks, and regional conditions. Any estimate provided by Fashion Palette or SkyNet is an estimate rather than a guaranteed delivery date.",
      },
      {
        p: "International orders must be prepaid using an online payment method actually displayed or approved for the order. Cash on Delivery is not available internationally unless Fashion Palette expressly confirms otherwise in writing.",
      },
      { h3: "3.3 Customs, duties, and import rules" },
      { p: "Unless checkout expressly says otherwise, the recipient is responsible for:" },
      {
        ul: [
          "import duties, sales tax, VAT, customs charges, brokerage, storage, handling, and clearance fees;",
          "providing identification or documents requested by customs or the courier;",
          "checking that the item may lawfully be imported into the destination; and",
          "accepting and paying for the shipment promptly.",
        ],
      },
      {
        p: "Fashion Palette does not control destination-country charges and cannot confirm them in advance. Customs may open, inspect, delay, detain, or reject a parcel.",
      },
      {
        p: "If a parcel is refused, abandoned, returned, or destroyed because the recipient does not complete clearance, pay charges, provide documents, or comply with import rules, any refund is limited to the amount recoverable after deducting reasonable outbound shipping, return shipping, customs, storage, payment, and handling costs, subject to applicable law.",
      },
    ],
  },
  {
    heading: "4. Address and contact information",
    blocks: [
      { p: "The customer must provide a complete and accurate:" },
      {
        ul: [
          "recipient name;",
          "delivery address and postal code;",
          "city, province/state, and country;",
          "reachable telephone or WhatsApp number; and",
          "email address.",
        ],
      },
      {
        p: "Review this information before submitting the order. Contact orders@fashionpalette.pk immediately if a correction is needed. We cannot guarantee a change after stock confirmation or dispatch.",
      },
      {
        p: "Fashion Palette is not responsible for a delay, failed delivery, loss, or extra charge caused by incorrect, incomplete, outdated, or inaccessible delivery information supplied by the customer, except to the extent applicable law provides otherwise.",
      },
    ],
  },
  {
    heading: "5. Tracking and delivery updates",
    blocks: [
      {
        p: "After dispatch, we normally provide a PostEx, SkyNet, or local-partner tracking code by email and/or WhatsApp. Tracking events are supplied by the courier and may not update in real time.",
      },
      {
        p: "Customers should monitor tracking, remain reachable, and follow reasonable courier instructions. Fashion Palette does not offer live map tracking.",
      },
    ],
  },
  {
    heading: "6. Delivery attempts, refusal, and return to sender",
    blocks: [
      {
        p: "The courier may make one or more delivery attempts according to its rules. If a parcel cannot be delivered because the recipient is unavailable, refuses a correct order, does not pay Cash on Delivery, provides an incorrect address, or does not complete customs clearance, it may be returned to Fashion Palette or otherwise handled under courier/customs rules.",
      },
      {
        p: "Before any re-dispatch, the customer may be required to pay outstanding delivery, return, customs, and re-delivery costs. Repeated refused or unclaimed Cash on Delivery orders may result in prepaid-only service or order refusal.",
      },
    ],
  },
  {
    heading: "7. Inspection and damage in transit",
    blocks: [
      {
        p: "Inspect the parcel promptly. If the outer package appears opened, crushed, wet, resealed, or materially damaged:",
      },
      {
        ul: [
          "record its condition before opening;",
          "make an unedited unboxing video where reasonably possible;",
          "keep the courier label and packaging; and",
          "report the issue to support@fashionpalette.pk within 48 hours of delivery.",
        ],
      },
      {
        p: "Follow the Returns & Refunds Policy for a wrong, missing, damaged, defective, or materially misdescribed item. Do not send a parcel back without written instructions.",
      },
    ],
  },
  {
    heading: "8. Delays outside reasonable control",
    blocks: [
      {
        p: "Delivery may be delayed by weather, natural disaster, epidemic, strikes, public holidays, Eid closures, courier disruption, road or airspace closure, conflict, civil disturbance, customs, government action, payment review, cyber incident, or another event outside reasonable control.",
      },
      {
        p: "We will take reasonable steps to communicate a material known delay and help trace a delayed parcel. Delivery estimates are not guarantees, and Fashion Palette is not responsible for delay caused solely by events outside its reasonable control, except where applicable law requires otherwise.",
      },
    ],
  },
  {
    heading: "9. Split shipments and availability",
    blocks: [
      {
        p: "Where operationally necessary, an order may be delivered in more than one parcel. We will not charge an additional domestic shipping fee merely because we choose to split an accepted order. International or customer-requested split shipping may require additional charges disclosed in advance.",
      },
      {
        p: "Placing an item in the cart does not reserve stock. If a stock error is discovered before acceptance, we may remove the item or cancel the order. If discovered after payment, we will offer an available alternative or refund the unavailable item.",
      },
    ],
  },
  {
    heading: "10. Risk and proof of delivery",
    blocks: [
      {
        p: "Responsibility for physical loss or damage remains with Fashion Palette until delivery to the address or recipient provided, subject to customer-caused delivery failure and applicable law.",
      },
      {
        p: "Courier tracking, recipient signature, delivery photograph, one-time code, or other courier proof may be used as evidence of delivery. If tracking says delivered but the parcel cannot be located, notify support@fashionpalette.pk promptly so we can ask the courier to investigate.",
      },
    ],
  },
  {
    heading: "11. Contact",
    blocks: [
      {
        ul: [
          "Order and delivery enquiries: orders@fashionpalette.pk",
          "Delivery problem or return: support@fashionpalette.pk",
          "Telephone / WhatsApp: 0327-6796087",
          "Business location: People’s Colony, Faisalabad, Punjab, Pakistan",
        ],
      },
      {
        p: "This Policy forms part of the Terms & Conditions. Mandatory consumer rights in the customer’s jurisdiction continue to apply.",
      },
    ],
  },
];

export default function ShippingPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery"
      effectiveDate="28 July 2026"
      intro={intro}
      sections={sections}
    />
  );
}
