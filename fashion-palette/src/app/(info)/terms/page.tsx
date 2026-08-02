import { Metadata } from "next";
import PolicyLayout, { PolicySection, PolicyBlock } from "@/components/info/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms & Conditions governing access to and purchases from Fashion Palette (fashionpalette.pk).",
};

const intro: PolicyBlock[] = [
  {
    p: "These Terms & Conditions (“Terms”) govern access to https://fashionpalette.pk and purchases from Fashion Palette. Please read them together with the Privacy Policy, Returns & Refunds Policy, Shipping & Delivery Policy, Payment Policy, product description, and any special terms shown before checkout.",
  },
  {
    p: "By using the Site, creating an account, or submitting an order, you agree to these Terms. If you do not agree, do not use the Site or place an order.",
  },
];

const sections: PolicySection[] = [
  {
    heading: "1. About Fashion Palette",
    blocks: [
      {
        p: "Fashion Palette is an independent multi-brand women’s fashion retailer operating from People’s Colony, Faisalabad, Punjab, Pakistan. The business is operated by Meelan Ahmad under the trading name Fashion Palette.",
      },
      {
        p: "Fashion Palette sells stock it holds or has secured for sale. It is not the manufacturer of every branded product and is not a marketplace intermediary merely connecting a customer to an unknown seller.",
      },
      {
        p: "References to “Fashion Palette,” “we,” “us,” or “our” mean this retail business. “You” means the Site user, purchaser, payer, or recipient as the context requires.",
      },
    ],
  },
  {
    heading: "2. Eligibility",
    blocks: [
      { p: "To place an order, you must:" },
      {
        ul: [
          "be at least 18 years old and legally capable of entering a binding contract, or act through a parent or legal guardian who accepts responsibility;",
          "provide accurate, current, and complete information;",
          "use an authorized payment method; and",
          "use the Site only for lawful personal or household purposes.",
        ],
      },
      {
        p: "We may refuse service, suspend an account, limit a payment method, or cancel an order where we reasonably suspect fraud, resale abuse, false information, unlawful activity, security risk, or violation of these Terms.",
      },
    ],
  },
  {
    heading: "3. Accounts",
    blocks: [
      { p: "Some features require an account. You are responsible for:" },
      {
        ul: [
          "keeping login credentials confidential;",
          "using a strong, unique password;",
          "protecting the email account and device linked to your account;",
          "ensuring account, address, and contact information remains accurate; and",
          "notifying support@fashionpalette.pk promptly of suspected unauthorized use.",
        ],
      },
      {
        p: "You are responsible for activity under your account to the extent permitted by law. We may require email verification, password reset, or additional security checks. We may suspend access to protect the customer, other users, or the Site.",
      },
    ],
  },
  {
    heading: "4. Products, authenticity, and brand relationship",
    blocks: [
      {
        p: "Fashion Palette represents products sold as branded goods on the Site as 100% original and sourced as genuine stock.",
      },
      {
        p: "Fashion Palette is an independent retailer. Unless a product page expressly says otherwise, the listing of a brand does not mean that the brand owns, operates, sponsors, endorses, or is formally affiliated with Fashion Palette.",
      },
      {
        p: "Brand names, logos, campaign images, designs, and trademarks belong to their respective owners. They are used to identify and describe genuine products offered for resale. Nothing on the Site transfers intellectual-property rights in a third-party brand to Fashion Palette or the customer.",
      },
      {
        p: "If a rights owner believes content has been used incorrectly, it may contact contact@fashionpalette.pk with the work, ownership basis, affected URL, and requested action.",
      },
    ],
  },
  {
    heading: "5. Product descriptions and visual differences",
    blocks: [
      { p: "We take reasonable steps to display accurate:" },
      {
        ul: [
          "product name and brand;",
          "components and fabric details;",
          "stitched or unstitched status;",
          "size or measurements where supplied;",
          "colour, embroidery, print, embellishment, and care information;",
          "price and availability; and",
          "photographs.",
        ],
      },
      {
        p: "Actual colour may vary slightly because of photography, lighting, screen calibration, fabric texture, dye lot, or printing. Handmade embroidery, embellishment, print placement, finishing, and packaging may also show minor variations. These normal differences are not automatically defects.",
      },
      {
        p: "A product remains eligible for an appropriate remedy if it is materially different from its description, wrong, damaged, defective, incomplete, or not genuine as represented.",
      },
      {
        p: "Read the complete description and component list before ordering. Accessories or styling items shown in photographs are included only if the description says so.",
      },
    ],
  },
  {
    heading: "6. Stock and cart",
    blocks: [
      {
        p: "Placing an item in a cart or wishlist does not reserve it. Stock can change before acceptance, and catalogue or inventory errors may occur.",
      },
      {
        p: "We may limit quantities, withdraw a listing, correct information, or refuse an order for stock, quality, security, legal, payment, pricing, or operational reasons. If an unavailable item has been prepaid, we will offer an agreed alternative or refund it.",
      },
    ],
  },
  {
    heading: "7. Prices and currency",
    blocks: [
      {
        p: "Prices are displayed in Pakistani Rupees (PKR) and may change before an order is accepted. A price change after acceptance does not alter the accepted order unless you request an agreed change.",
      },
      { p: "Discounts, coupons, and promotional prices:" },
      {
        ul: [
          "apply only during the stated period and to eligible items;",
          "may have product, customer, quantity, location, or payment restrictions;",
          "cannot normally be combined unless expressly stated;",
          "cannot be applied retrospectively after an order; and",
          "may be cancelled where a technical error, fraud, or misuse is reasonably suspected.",
        ],
      },
      {
        p: "For an international payment, the customer’s bank or payment provider controls foreign exchange and external fees. Customs and import charges are addressed in the Shipping & Delivery Policy.",
      },
    ],
  },
  {
    heading: "8. Placing an order and contract formation",
    blocks: [
      { p: "The checkout submission is your offer to buy the selected items under the terms shown." },
      { h3: "8.1 First email — acknowledgement only" },
      {
        p: "Immediately after submission, the system sends an automatic “order placed” or similar message. It confirms receipt of the request only. It does not mean that stock has been verified or that Fashion Palette has accepted the order.",
      },
      { h3: "8.2 Second email — acceptance" },
      {
        p: "Fashion Palette checks stock, price, payment, address, and order details. A binding sale contract is formed when we send the second email confirming that the order is accepted and under process.",
      },
      {
        p: "We may ask for payment, address, identity, or order verification before acceptance. We may refuse or cancel before dispatch because of:",
      },
      {
        ul: [
          "unavailable or damaged stock;",
          "a clear pricing, description, tax, or technical error;",
          "failed, reversed, incomplete, or unverifiable payment;",
          "suspected fraud, resale abuse, or security risk;",
          "an unsupported or restricted delivery destination; or",
          "a legal or regulatory restriction.",
        ],
      },
      {
        p: "If we cancel a prepaid order, we will initiate the eligible refund under the Returns & Refunds Policy.",
      },
    ],
  },
  {
    heading: "9. Cancellation by the customer",
    blocks: [
      {
        p: "You may request cancellation before the second stock-confirmation / processing email is sent. Send the order number to orders@fashionpalette.pk or WhatsApp 0327-6796087.",
      },
      {
        p: "After the second email is sent, cancellation is unavailable because stock and fulfilment have begun. This does not affect rights concerning a wrong, damaged, defective, materially misdescribed, non-genuine, or otherwise legally protected product.",
      },
    ],
  },
  {
    heading: "10. Payments",
    blocks: [
      {
        p: "Only payment methods actually displayed at checkout or officially approved for the order are accepted. Separate Payment Policy terms apply.",
      },
      {
        p: "You confirm that payment information is accurate and that you are authorized to use the method. Payment providers may conduct authentication, fraud, identity, sanctions, and security checks.",
      },
      {
        p: "Fashion Palette does not store full card numbers, card security codes, payment PINs, or online-banking credentials. Never send them through ordinary support channels.",
      },
      {
        p: "Payment authorization does not itself create order acceptance. A failed, reversed, disputed, or unverifiable payment may delay or cancel the order.",
      },
    ],
  },
  {
    heading: "11. Shipping and international orders",
    blocks: [
      { p: "The Shipping & Delivery Policy forms part of these Terms." },
      {
        p: "Within Pakistan, the standard delivery charge is PKR 500, and delivery is free when the merchandise subtotal is above PKR 10,000, unless a different valid promotion is displayed at checkout.",
      },
      {
        p: "Pakistan delivery is normally estimated at 3–7 business days after stock confirmation. Eid holidays and other high-volume or disruption periods may add 5–7 business days. Estimates are not guarantees.",
      },
      {
        p: "International delivery is limited to destinations supported by SkyNet and accepted at the time of order. The recipient is responsible for destination-country duties, tax, clearance, documents, and import compliance unless checkout expressly states otherwise.",
      },
      {
        p: "You must provide an accurate, complete, and accessible address and remain reachable. Reasonable costs caused by refusal, failed Cash on Delivery, incorrect details, missed delivery, or failure to clear customs may be charged or deducted where permitted by law.",
      },
    ],
  },
  {
    heading: "12. Custom stitching",
    blocks: [
      { p: "Fashion Palette may offer stitching for eligible unstitched products." },
      {
        p: "The customer must provide accurate and complete measurements and instructions and review any confirmation we send. Fashion Palette is not responsible for fit problems caused by incorrect, incomplete, ambiguous, or outdated customer measurements.",
      },
      {
        p: "If Fashion Palette’s stitching materially differs from the measurements and instructions we confirmed because of our error, the customer may request an eligible correction, re-stitching, replacement, or refund under the Returns & Refunds Policy.",
      },
      {
        p: "Custom-stitched items are otherwise non-returnable because they are made to the customer’s specifications, subject to non-excludable rights for fault, damage, misdescription, or our stitching error.",
      },
    ],
  },
  {
    heading: "13. Returns, exchanges, and refunds",
    blocks: [
      { p: "The Returns & Refunds Policy forms part of these Terms." },
      {
        p: "Fashion Palette does not accept change-of-mind returns. Report a wrong, missing, damaged, defective, materially misdescribed, non-genuine, or incorrectly stitched item within 48 hours of delivery, with photographs and an unboxing video where reasonably possible.",
      },
      {
        p: "Items must be complete and in original condition unless the verified defect makes that requirement unreasonable. Do not return an item without authorization.",
      },
      {
        p: "Approved refunds are normally initiated within 7–10 business days after approval and any required inspection. The original payment method is used where technically possible; otherwise an agreed bank transfer, JazzCash, or Easypaisa transfer may be used. Store credit is not substituted without the customer’s separate written agreement.",
      },
      { p: "The stated process does not limit a mandatory consumer right or remedy." },
    ],
  },
  {
    heading: "14. Care, use, and customer responsibility",
    blocks: [
      {
        p: "Follow disclosed care instructions and use suitable professional cleaning for delicate fabrics, embroidery, and embellishment. Fashion Palette is not responsible for deterioration caused by cutting, stitching, alteration, washing, dry-cleaning, ironing, storage, cosmetics, perfume, wear, accident, or misuse after delivery.",
      },
      {
        p: "This exclusion does not apply where the damage was caused by a product defect, inadequate warning, or another matter for which liability cannot lawfully be excluded.",
      },
    ],
  },
  {
    heading: "15. Site content and intellectual property",
    blocks: [
      {
        p: "The Site’s original text, layout, code, graphics, catalogue organization, Fashion Palette name, logo, and other original material are owned by or licensed to Fashion Palette.",
      },
      {
        p: "Third-party brand material remains owned by the relevant rights holder. You may browse the Site and print or save an order record for personal use. Without permission, you must not:",
      },
      {
        ul: [
          "reproduce, republish, sell, or commercially exploit Site content;",
          "scrape or harvest catalogue, price, customer, or account data;",
          "remove copyright, trademark, or attribution notices;",
          "use the Site or content to impersonate Fashion Palette or a listed brand; or",
          "use automated tools in a way that burdens, bypasses, or interferes with the Site.",
        ],
      },
    ],
  },
  {
    heading: "16. Acceptable use",
    blocks: [
      { p: "You must not:" },
      {
        ul: [
          "use the Site for fraud, money laundering, unauthorized resale schemes, abuse, or unlawful activity;",
          "attempt unauthorized access to accounts, servers, code, APIs, payment systems, or data;",
          "upload malware, spam, false evidence, or harmful material;",
          "misuse discounts, returns, Cash on Delivery, chargebacks, reviews, or support;",
          "test stolen payment credentials or another person’s identity;",
          "interfere with security, rate limits, availability, or other customers; or",
          "make a false claim of affiliation, authenticity failure, non-delivery, or defect.",
        ],
      },
      {
        p: "We may preserve evidence and take proportionate lawful action, including order cancellation, account restriction, provider reporting, or disclosure to lawful authorities.",
      },
    ],
  },
  {
    heading: "17. Reviews, messages, and customer content",
    blocks: [
      {
        p: "If the Site allows reviews, images, or other customer content, you remain responsible for it. You must have the right to submit it and must not include unlawful, infringing, deceptive, abusive, confidential, or unnecessary personal information.",
      },
      {
        p: "You grant Fashion Palette a non-exclusive, worldwide, royalty-free licence to host, reproduce, moderate, and display content you deliberately submit for publication, solely for operating and promoting the store, subject to applicable privacy law. This licence does not apply to private support evidence except as needed to investigate, fulfil legal obligations, or defend a claim.",
      },
    ],
  },
  {
    heading: "18. Third-party services and links",
    blocks: [
      {
        p: "The Site relies on or links to third-party hosting, security, email, courier, payment, analytics, social-media, and brand services. Their terms may also apply.",
      },
      {
        p: "Fashion Palette is responsible for its own obligations but does not control a third party’s independent website, system, customs decision, or service. A link is not an endorsement of all third-party content.",
      },
    ],
  },
  {
    heading: "19. Website availability and changes",
    blocks: [
      {
        p: "We aim to keep the Site accurate, secure, and available, but cannot guarantee uninterrupted or error-free operation. We may maintain, update, restrict, suspend, or withdraw features where reasonably necessary.",
      },
      {
        p: "We may correct catalogue, availability, price, policy, and technical errors. Changes to these Terms do not retroactively remove rights attached to an already accepted order unless required by law or agreed with the customer.",
      },
    ],
  },
  {
    heading: "20. Disclaimer and non-excludable rights",
    blocks: [
      {
        p: "To the extent permitted by law, the Site is provided on an “as available” basis. We do not promise that every listing will remain available or that the Site will always be uninterrupted, error-free, or compatible with every device.",
      },
      { p: "Nothing in these Terms excludes, restricts, or modifies:" },
      {
        ul: [
          "liability for fraud or fraudulent misrepresentation;",
          "liability for wilful misconduct or gross negligence where it cannot be excluded;",
          "liability for death or personal injury caused by negligence where applicable;",
          "responsibility for a defective, wrong, materially misdescribed, or non-genuine product where law imposes it; or",
          "any mandatory consumer, payment, privacy, or other legal right.",
        ],
      },
    ],
  },
  {
    heading: "21. Limitation of liability",
    blocks: [
      {
        p: "To the extent permitted by law, Fashion Palette is not liable for indirect or consequential loss that was not reasonably foreseeable when the contract was formed, including lost profit or business opportunity arising from a consumer purchase.",
      },
      {
        p: "For a claim directly concerning an order, our aggregate contractual liability will not exceed the amount paid for the affected item and its delivery, except where applicable law requires a different remedy or does not permit the limitation.",
      },
      {
        p: "Fashion Palette is not responsible for delay or failure caused solely by an event outside reasonable control, customer-provided incorrect information, or an independent third party, except to the extent our own breach, negligence, or mandatory law makes us responsible.",
      },
    ],
  },
  {
    heading: "22. Events outside reasonable control",
    blocks: [
      {
        p: "Neither party is responsible for delay or failure caused by events beyond reasonable control, including natural disaster, severe weather, epidemic, strike, transport or courier disruption, public holiday closure, war, civil disturbance, airspace or road closure, customs action, government restriction, major utility or internet failure, or widespread cyber incident.",
      },
      {
        p: "The affected party must take reasonable steps to reduce the effect. If fulfilment becomes impossible or unreasonably prolonged, Fashion Palette may cancel the affected part and refund the amount received for goods not supplied, less only lawful and disclosed non-recoverable amounts.",
      },
    ],
  },
  {
    heading: "23. Complaints and dispute resolution",
    blocks: [
      {
        p: "Contact support@fashionpalette.pk with the order number and a clear description of the complaint. We will review the relevant order, payment, product, courier, communications, and evidence and try to resolve the matter in good faith.",
      },
      {
        p: "Before court proceedings, the parties should attempt direct resolution for at least 15 days after a written complaint, unless urgent relief or applicable law allows otherwise.",
      },
      {
        p: "These Terms are governed by the laws of Pakistan. Subject to mandatory consumer jurisdiction and applicable dispute rules, the courts and competent consumer forums in Faisalabad, Punjab will have jurisdiction.",
      },
      {
        p: "Customers outside Pakistan retain any mandatory local consumer right that applies despite a contractual choice of law.",
      },
    ],
  },
  {
    heading: "24. Changes to these Terms",
    blocks: [
      {
        p: "We may update these Terms for legal, security, payment, operational, or service changes. The latest version will be posted with a revised effective date.",
      },
      {
        p: "Where a material change affects an existing account or service and additional notice is appropriate or required, we may notify customers on the Site or by email. The Terms in effect when an order is accepted normally govern that order.",
      },
    ],
  },
  {
    heading: "25. General legal provisions",
    blocks: [
      {
        ul: [
          "Entire agreement: These Terms, incorporated policies, checkout information, accepted order, and agreed written changes form the agreement for the purchase.",
          "Severability: If a provision is invalid or unenforceable, the remaining provisions continue, and the invalid provision is limited to the minimum necessary.",
          "No waiver: Delay in enforcing a right does not waive it.",
          "Assignment: You may not transfer an order or contractual right in a way that prejudices Fashion Palette without consent. Fashion Palette may transfer the business or contract to a lawful successor that assumes the relevant obligations.",
          "Headings: Headings assist reading and do not change meaning.",
          "Electronic communications: You agree that order, policy, receipt, and service communications may be provided electronically where lawful.",
        ],
      },
    ],
  },
  {
    heading: "26. Contact",
    blocks: [
      {
        ul: [
          "General and legal enquiries: contact@fashionpalette.pk",
          "Order and payment enquiries: orders@fashionpalette.pk",
          "Customer support and returns: support@fashionpalette.pk",
          "Privacy requests: privacy@fashionpalette.pk",
          "Telephone / WhatsApp: 0327-6796087",
          "Business location: People’s Colony, Faisalabad, Punjab, Pakistan",
        ],
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      effectiveDate="28 July 2026"
      intro={intro}
      sections={sections}
    />
  );
}
