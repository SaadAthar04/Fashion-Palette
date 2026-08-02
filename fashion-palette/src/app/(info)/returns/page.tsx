import { Metadata } from "next";
import PolicyLayout, { PolicySection, PolicyBlock } from "@/components/info/PolicyLayout";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "When Fashion Palette accepts a return, exchange, correction, replacement, or refund, and how to report a problem.",
};

const intro: PolicyBlock[] = [
  {
    p: "This Policy explains when Fashion Palette will accept a return, exchange, correction, replacement, or refund. It applies to purchases made through https://fashionpalette.pk.",
  },
  {
    p: "Please inspect your order promptly after delivery. For the fastest investigation, report an eligible problem within 48 hours of delivery and keep the item, components, tags, packaging, courier label, and supporting evidence.",
  },
];

const sections: PolicySection[] = [
  {
    heading: "1. Eligible problems",
    blocks: [
      { p: "Subject to inspection and verification, a remedy may be available if:" },
      {
        ul: [
          "the item delivered is materially different from the item ordered;",
          "the wrong design, colour, size, quantity, or component was sent;",
          "the item arrived damaged;",
          "the item has a material manufacturing defect not disclosed before purchase;",
          "a required component listed in the product description is missing;",
          "the product is materially misdescribed or not genuine as represented; or",
          "custom stitching performed by Fashion Palette materially differs from the measurements we confirmed because of our stitching error.",
        ],
      },
      {
        p: "The appropriate remedy may be a correction, re-stitching, replacement, exchange, partial refund, or full refund, depending on the problem, available stock, location, cost, and applicable law.",
      },
    ],
  },
  {
    heading: "2. Cases that are not normally eligible",
    blocks: [
      { p: "We do not accept a return, exchange, or refund merely because:" },
      {
        ul: [
          "you changed your mind;",
          "the item is no longer needed;",
          "the order was placed by mistake but was not cancelled before acceptance;",
          "you dislike the item after delivery;",
          "you selected the wrong product, size, colour, or stitching option;",
          "a correctly supplied ready-to-wear item does not fit as preferred;",
          "a small colour difference results from lighting, photography, screen settings, dye lot, fabric texture, or printing, and the product is not materially misdescribed;",
          "there is a minor variation in embroidery placement, handmade work, embellishment, print alignment, or packaging that is normal for the product;",
          "you damaged the item by wearing, cutting, stitching, altering, washing, dry-cleaning, ironing, storing, or handling it incorrectly;",
          "the item shows perfume, cosmetics, marks, odour, wear, or misuse;",
          "you failed to follow disclosed care instructions; or",
          "the request is fraudulent, abusive, unsupported, or concerns an item not purchased from Fashion Palette.",
        ],
      },
      {
        p: "This section does not exclude a remedy for a material defect, wrong item, misdescription, authenticity problem, or other right that applicable law does not allow us to exclude.",
      },
    ],
  },
  {
    heading: "3. Condition of returned items",
    blocks: [
      {
        p: "Unless the nature of the verified defect makes a requirement unreasonable, a returned item must be:",
      },
      {
        ul: [
          "complete, with every component originally received;",
          "unused, unworn, unwashed, uncut, unstitched, and unaltered;",
          "in its original condition;",
          "accompanied by its tags, brand packaging, accessories, invoice/order number, and courier packaging where available; and",
          "packed safely for return transport.",
        ],
      },
      {
        p: "“Complete” means the full product and all components that were actually delivered. If your complaint is that a listed component was missing on arrival, identify that missing component in the original report.",
      },
      {
        p: "We may reject or reduce a refund where the customer’s handling has caused loss in value, except where doing so would conflict with applicable law.",
      },
    ],
  },
  {
    heading: "4. Unstitched, ready-to-wear, sale, and custom-stitched items",
    blocks: [
      { h3: "4.1 Unstitched fabric" },
      {
        p: "Unstitched items cannot be returned after being cut, stitched, washed, marked, or altered, unless the verified issue existed on delivery and the alteration was reasonably necessary to discover it or applicable law requires a remedy.",
      },
      { h3: "4.2 Ready-to-wear" },
      {
        p: "Ready-to-wear items must remain unworn, unwashed, unaltered, and complete. Ordinary fit preference is not a defect where the correct item and disclosed measurements were supplied.",
      },
      { h3: "4.3 Sale or promotional items" },
      {
        p: "A sale or promotional item is subject to the same protection for a verified wrong, damaged, defective, materially misdescribed, or non-genuine product. A sale price does not create a change-of-mind right. Any special final-sale restriction must be clearly displayed before purchase and remains subject to mandatory law.",
      },
      { h3: "4.4 Custom stitching" },
      {
        p: "Customers are responsible for the accuracy and completeness of measurements and instructions they submit or approve. A custom-stitched item is not eligible merely because incorrect customer measurements were supplied, the customer’s body measurements changed, or the requested style fits differently from personal preference.",
      },
      {
        p: "Fashion Palette is responsible where our stitching materially fails to follow the measurements and instructions we confirmed. We may first offer a reasonable alteration or re-stitching remedy before a replacement or refund, where appropriate.",
      },
    ],
  },
  {
    heading: "5. How to report a problem",
    blocks: [
      { p: "Within 48 hours of delivery, email support@fashionpalette.pk with:" },
      {
        ul: [
          "your order number;",
          "the purchaser’s name and contact number;",
          "the affected item and a clear description of the problem;",
          "clear photographs of the item, defect, tags, packaging, and courier label;",
          "an unedited unboxing video showing the sealed parcel being opened, where reasonably possible; and",
          "for a stitching issue, photographs showing the garment laid flat with the relevant measurements visible.",
        ],
      },
      {
        p: "You may also notify us on WhatsApp at 0327-6796087, but email is recommended because it preserves the complete evidence and timeline.",
      },
      {
        p: "Do not send the item back until Fashion Palette issues written return instructions or a return authorization. An unauthorized parcel may be refused, delayed, or returned to you.",
      },
      {
        p: "Evidence must be genuine and relate to the delivered order. We may ask for additional photographs, video, measurements, packaging, proof of purchase, or a courier inspection. The absence of an unboxing video may affect what can be verified, but it will not override a right that cannot legally be excluded.",
      },
    ],
  },
  {
    heading: "6. Review and approval",
    blocks: [
      {
        p: "We will review the order record, product listing, evidence, stock, courier information, and any stitching instructions. We may:",
      },
      {
        ul: [
          "approve a return;",
          "approve a replacement, exchange, correction, or re-stitching;",
          "offer a partial or full refund;",
          "request additional information; or",
          "explain in writing why the request is not eligible.",
        ],
      },
      {
        p: "Approval to send an item back is not final refund approval. Returned items remain subject to inspection.",
      },
    ],
  },
  {
    heading: "7. Return delivery cost",
    blocks: [
      {
        p: "For a verified wrong, damaged, defective, materially misdescribed, or incorrectly stitched item caused by Fashion Palette, we will arrange or reimburse a reasonable authorized return method where practicable.",
      },
      {
        p: "Do not use an expensive or unapproved service without written agreement. Costs arising from an unauthorized return method, incorrect address, missed collection, customer-caused damage, or an ineligible request may be the customer’s responsibility where permitted by law.",
      },
      {
        p: "For an international order, contact us before taking any action. Depending on the evidence and destination, we may resolve an eligible problem without requiring an international return, or provide specific SkyNet/local-courier instructions.",
      },
    ],
  },
  {
    heading: "8. Replacements and exchanges",
    blocks: [
      {
        p: "An approved replacement or exchange depends on stock availability. If the same item is unavailable, we may offer:",
      },
      {
        ul: [
          "another item agreed with you, with any price difference paid or refunded;",
          "a repair, correction, or re-stitching;",
          "a partial refund that you accept; or",
          "a full refund for the eligible item.",
        ],
      },
      {
        p: "Replacement delivery timing begins after approval and, where required, receipt or collection of the original item.",
      },
    ],
  },
  {
    heading: "9. Refunds",
    blocks: [
      {
        p: "After an eligible return is received and passes inspection, or after we approve a refund without return, we will normally initiate the refund within 7–10 business days.",
      },
      {
        p: "Refund timing after initiation may also depend on the bank, wallet, card network, or payment provider. We cannot control their posting or foreign-exchange processing time.",
      },
      { p: "Refunds are made:" },
      {
        ul: [
          "to the original payment method where technically available; or",
          "by an agreed bank transfer, JazzCash, or Easypaisa transfer where an original-method refund is unavailable or the order was paid by Cash on Delivery.",
        ],
      },
      {
        p: "Fashion Palette does not issue store credit in place of an approved monetary refund unless the customer separately requests and agrees to it in writing.",
      },
      {
        p: "For an international payment, the refund is based on the PKR amount approved by Fashion Palette. Your bank or payment provider may use a different exchange rate or charge fees. Those external conversion differences and fees are outside our control.",
      },
      {
        p: "Original shipping, customs duties, import taxes, clearance charges, and payment-provider fees are not normally refundable unless the verified problem was caused by Fashion Palette, the charge is recoverable, or applicable law requires otherwise.",
      },
    ],
  },
  {
    heading: "10. Order cancellation",
    blocks: [
      {
        p: "Immediately after an order is placed, the system sends an automatic acknowledgement. This first message only means that we received the order request.",
      },
      {
        p: "Fashion Palette then checks stock and order details. You may request cancellation before we send the second email confirming that the order is accepted and under process. Send the order number to orders@fashionpalette.pk or WhatsApp 0327-6796087.",
      },
      {
        p: "Once the second confirmation / processing email has been sent, the order cannot be cancelled. This cancellation cut-off does not affect a remedy for a wrong, damaged, defective, materially misdescribed, or otherwise legally protected item.",
      },
      {
        p: "Fashion Palette may cancel before dispatch because of stock unavailability, a material pricing or listing error, failed or reversed payment, suspected fraud, delivery restrictions, or another lawful operational reason. If we cancel a prepaid order, we will initiate the refund under this Policy.",
      },
    ],
  },
  {
    heading: "11. Refused, unclaimed, or undeliverable orders",
    blocks: [
      {
        p: "If a customer refuses a correct order, repeatedly misses delivery, supplies an incorrect address, fails to pay Cash on Delivery, or fails to pay destination customs charges, we may recover or deduct reasonable outward, return, customs, payment, and handling costs where permitted by law. Repeated misuse may lead to limits on Cash on Delivery or future orders.",
      },
    ],
  },
  {
    heading: "12. Payment disputes and chargebacks",
    blocks: [
      {
        p: "Please contact support@fashionpalette.pk before starting a bank or wallet dispute so we have an opportunity to investigate.",
      },
      {
        p: "If a chargeback or payment dispute is already active, the payment provider controls the process and may prevent us from issuing a separate direct refund. We may submit the order acknowledgement, acceptance, messages, product evidence, payment record, tracking, and proof of delivery to the provider. We will not issue two refunds for the same transaction.",
      },
    ],
  },
  {
    heading: "13. Contact",
    blocks: [
      {
        ul: [
          "Returns and support: support@fashionpalette.pk",
          "Order cancellation: orders@fashionpalette.pk",
          "General enquiries: contact@fashionpalette.pk",
          "Telephone / WhatsApp: 0327-6796087",
          "Business location: People’s Colony, Faisalabad, Punjab, Pakistan",
        ],
      },
      {
        p: "Nothing in this Policy excludes a statutory warranty, remedy, liability, or consumer right that cannot lawfully be excluded.",
      },
    ],
  },
];

export default function ReturnsPage() {
  return (
    <PolicyLayout
      title="Returns & Refunds"
      effectiveDate="28 July 2026"
      intro={intro}
      sections={sections}
    />
  );
}
