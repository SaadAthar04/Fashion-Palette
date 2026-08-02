import { Metadata } from "next";
import PolicyLayout, { PolicySection, PolicyBlock } from "@/components/info/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fashion Palette collects, uses, discloses, and protects your personal information.",
};

const intro: PolicyBlock[] = [
  {
    p: "Fashion Palette respects your privacy. This Privacy Policy explains what personal information we collect through https://fashionpalette.pk (the “Site”), how we use and disclose it, how long we keep it, and the choices available to you.",
  },
  {
    p: "For this Policy, “Fashion Palette,” “we,” “us,” and “our” refer to the Fashion Palette retail business operated by Meelan Ahmad from People’s Colony, Faisalabad, Punjab, Pakistan.",
  },
];

const sections: PolicySection[] = [
  {
    heading: "1. Scope",
    blocks: [
      { p: "This Policy applies when you:" },
      {
        ul: [
          "browse or search the Site;",
          "create or use an account;",
          "join a wishlist or newsletter;",
          "place, pay for, receive, cancel, return, or discuss an order;",
          "request custom stitching;",
          "contact us by email, form, telephone, WhatsApp, or social media; or",
          "otherwise interact with our online store and customer-support services.",
        ],
      },
      {
        p: "Third-party websites, payment pages, courier services, social platforms, and other external services have their own privacy practices. Their policies apply when you use their services.",
      },
    ],
  },
  {
    heading: "2. Information we collect",
    blocks: [
      { h3: "2.1 Information you provide" },
      { p: "Depending on how you use the Site, we may collect:" },
      {
        ul: [
          "your name, email address, telephone or WhatsApp number;",
          "shipping and billing address, city, province, postal code, and country;",
          "account login information, password hash, preferences, and wishlist;",
          "order details, product choices, sizes, stitching measurements, special instructions, and correspondence;",
          "payment method, payment status, transaction reference, and limited billing information supplied by the payment provider;",
          "refund details, such as a bank account or JazzCash/Easypaisa number, when needed to issue an approved refund;",
          "photographs, videos, unboxing evidence, measurements, and other material submitted for a support or return request;",
          "marketing preferences and newsletter subscription status; and",
          "any other information you choose to include in a message or form.",
        ],
      },
      {
        p: "Please provide only information that is accurate and necessary. If you provide another person’s delivery or contact information, you confirm that you are authorized to do so.",
      },
      { h3: "2.2 Information collected automatically" },
      { p: "When you use the Site, our systems and service providers may automatically collect:" },
      {
        ul: [
          "IP address and approximate location derived from it;",
          "browser, device, operating-system, language, and screen information;",
          "pages viewed, searches, clicks, referral source, session times, cart activity, and error logs;",
          "cookie identifiers and similar technical data; and",
          "security events, login history, fraud signals, and rate-limit information.",
        ],
      },
      { h3: "2.3 Information from other parties" },
      { p: "We may receive information from:" },
      {
        ul: [
          "payment providers about authorization, success, failure, reversal, refund, or suspected fraud;",
          "PostEx, SkyNet, or another courier about dispatch, tracking, delivery attempts, proof of delivery, customs, or return status;",
          "email, hosting, security, analytics, advertising, and communications providers;",
          "a person who places an order for you or names you as the recipient; and",
          "lawful public authorities or dispute-resolution bodies.",
        ],
      },
      {
        p: "We do not intentionally collect full card numbers, card security codes, online-banking passwords, or payment PINs. Do not send such information to us by email, form, WhatsApp, or social media.",
      },
    ],
  },
  {
    heading: "3. How we use information",
    blocks: [
      { p: "We may use personal information to:" },
      {
        ul: [
          "create and maintain your account;",
          "receive, verify, accept, fulfil, deliver, and track orders;",
          "check stock, confirm prices, prevent duplicate orders, and provide receipts;",
          "process or verify payments, refunds, cancellations, disputes, and chargebacks;",
          "perform requested stitching and follow the measurements and instructions you submit;",
          "communicate by email, telephone, SMS, or WhatsApp about order, payment, delivery, account, return, or support matters;",
          "investigate incorrect, missing, damaged, defective, fraudulent, or disputed orders;",
          "provide customer service and maintain a record of agreed resolutions;",
          "secure the Site, detect misuse, enforce limits, and protect customers, staff, and the business;",
          "troubleshoot, measure, maintain, and improve the Site, catalogue, search, checkout, and services;",
          "comply with accounting, tax, consumer-protection, payment, recordkeeping, legal, and regulatory obligations;",
          "establish, exercise, or defend legal claims; and",
          "send marketing messages where you have opted in or where otherwise permitted by applicable law.",
        ],
      },
      {
        p: "Where applicable law requires a legal basis, we rely on one or more of the following: performing a contract or taking steps at your request; complying with law; protecting vital or legitimate interests; preventing fraud and securing our services; and your consent.",
      },
    ],
  },
  {
    heading: "4. Payments",
    blocks: [
      {
        p: "Payment transactions are processed by the payment method or authorized payment provider shown at checkout. The provider may collect card, wallet, bank, identity, device, and transaction information directly under its own privacy policy and security controls.",
      },
      {
        p: "Fashion Palette does not store full card numbers, card security codes, payment PINs, or online-banking credentials. We may retain a payment status, reference, provider name, masked account or card information, amount, currency, and fraud or refund information needed to administer the order.",
      },
      {
        p: "If we collect bank or mobile-wallet details solely to make a refund, access is limited to staff who need them. We retain those details only for the refund, accounting, fraud-prevention, dispute, and legal period reasonably required.",
      },
    ],
  },
  {
    heading: "5. When we disclose information",
    blocks: [
      { p: "We disclose personal information only where reasonably necessary, including to:" },
      {
        ul: [
          "hosting and security providers, such as Hostinger and Cloudflare, that host, transmit, protect, cache, back up, or secure the Site and email;",
          "payment providers, banks, wallet operators, card networks, and fraud-prevention partners that authorize, settle, reverse, or investigate transactions;",
          "delivery providers, including PostEx for Pakistan deliveries and SkyNet for supported international destinations, together with their local delivery and customs partners;",
          "communications providers, including email, telephone, SMS, WhatsApp, and customer-support tools;",
          "professional advisers, insurers, auditors, accountants, lawyers, and technology contractors bound by appropriate duties;",
          "analytics or advertising providers, but only where those tools are actually enabled and subject to the cookie choices and applicable law;",
          "public authorities, courts, regulators, payment dispute bodies, or law-enforcement agencies where disclosure is legally required or reasonably necessary to protect rights and safety; and",
          "a successor or proposed successor in a lawful sale, reorganization, financing, or transfer of the business, subject to appropriate confidentiality measures.",
        ],
      },
      {
        p: "We do not sell your personal information for money. We do not permit service providers to use order information for their own unrelated marketing merely because they help us fulfil an order.",
      },
    ],
  },
  {
    heading: "6. International processing",
    blocks: [
      {
        p: "Fashion Palette serves customers in Pakistan and selected international destinations. Our service providers or their systems may process information in Pakistan or other countries. Those countries may have privacy rules different from those in your country.",
      },
      {
        p: "Where appropriate, we use contractual, organizational, access-control, and provider-security measures intended to protect information during cross-border processing. Mandatory privacy rights in your country continue to apply where the law says they do.",
      },
    ],
  },
  {
    heading: "7. Cookies and similar technologies",
    blocks: [
      { p: "The Site may use:" },
      {
        ul: [
          "strictly necessary cookies for login, cart, checkout, security, load balancing, and requested features;",
          "preference cookies to remember language, display, or account choices;",
          "analytics cookies to understand aggregate use and improve the Site; and",
          "advertising cookies or pixels, if enabled, to measure campaigns or show relevant advertising.",
        ],
      },
      {
        p: "You can delete or block cookies through your browser. Blocking necessary cookies may prevent login, cart, checkout, or other core features from working.",
      },
      {
        p: "Where consent is required, non-essential cookies should not be activated until the customer makes the relevant choice. The cookie notice and this Policy must be updated if the developer adds or removes analytics, advertising, session-recording, or similar tools.",
      },
    ],
  },
  {
    heading: "8. Marketing choices",
    blocks: [
      {
        p: "We may send marketing emails or messages if you subscribe or otherwise consent, or where applicable law permits. Transactional communications about an order, account, security, delivery, return, or refund are not marketing.",
      },
      {
        p: "You may unsubscribe through the link in a marketing email or contact us. We may retain a minimal suppression record so that we respect the opt-out. Unsubscribing from marketing does not stop necessary service messages.",
      },
    ],
  },
  {
    heading: "9. Data retention",
    blocks: [
      {
        p: "We keep personal information only for as long as reasonably necessary for the purpose collected, including to:",
      },
      {
        ul: [
          "maintain your active account and provide requested services;",
          "fulfil orders, returns, refunds, warranties, and customer support;",
          "maintain transaction, accounting, tax, courier, fraud, and audit records;",
          "comply with payment-provider, legal, and regulatory requirements; and",
          "resolve disputes and enforce agreements.",
        ],
      },
      {
        p: "Retention periods vary by record and jurisdiction. When information is no longer needed, we take reasonable steps to delete, de-identify, or securely archive it. Backups may retain data for a limited period before routine deletion.",
      },
    ],
  },
  {
    heading: "10. Security",
    blocks: [
      {
        p: "We use reasonable administrative, technical, and organizational safeguards appropriate to the nature of the information. These may include encryption in transit, password hashing, access controls, staff permissions, security headers, rate limiting, logging, backups, and restricted server-side secrets.",
      },
      {
        p: "No internet service is completely secure. You are responsible for using a strong, unique password, protecting access to your email and device, and notifying us promptly if you suspect unauthorized account activity. Fashion Palette will never ask you to send a card PIN, card security code, account password, or one-time login code through ordinary support messages.",
      },
    ],
  },
  {
    heading: "11. Your choices and requests",
    blocks: [
      { p: "Subject to applicable law and necessary verification, you may ask us to:" },
      {
        ul: [
          "confirm whether we hold personal information about you;",
          "provide access to or a copy of information you supplied;",
          "correct inaccurate or incomplete information;",
          "delete information no longer required;",
          "close your account;",
          "withdraw consent where processing relies on consent;",
          "object to or opt out of direct marketing; or",
          "explain a significant privacy concern.",
        ],
      },
      {
        p: "Some requests may be limited where we must retain information for an order, refund, fraud investigation, legal obligation, security, or dispute. We may request information reasonably needed to verify your identity and protect the account.",
      },
      {
        p: "Send privacy requests to privacy@fashionpalette.pk. We will respond within a reasonable period and as required by applicable law.",
      },
    ],
  },
  {
    heading: "12. Children and contractual capacity",
    blocks: [
      {
        p: "The Site is intended for customers who are legally capable of entering a purchase contract. A person under 18, or otherwise lacking legal capacity, may browse the Site only with the involvement of a parent or legal guardian. Orders for a minor must be placed and accepted by an adult who takes responsibility for the order and information supplied.",
      },
      {
        p: "We do not knowingly use the Site to solicit personal information directly from children. If a parent or guardian believes a child submitted information without appropriate involvement, contact privacy@fashionpalette.pk.",
      },
    ],
  },
  {
    heading: "13. Third-party links and social media",
    blocks: [
      {
        p: "The Site may link to brand, courier, payment, social-media, or other third-party services. A link does not mean we control that service. Review the third party’s terms and privacy policy before providing information to it.",
      },
      {
        p: "Messages sent through a public social-media comment may be visible to others. Use email or private support channels for order and privacy matters, and never post payment credentials publicly.",
      },
    ],
  },
  {
    heading: "14. Changes to this Policy",
    blocks: [
      {
        p: "We may update this Policy to reflect changes in law, technology, providers, or business practices. The current version will be posted on this page with a revised effective date. Where a change is material and notice is appropriate or legally required, we may provide an additional notice on the Site or by email.",
      },
    ],
  },
  {
    heading: "15. Contact us",
    blocks: [
      {
        ul: [
          "Privacy requests: privacy@fashionpalette.pk",
          "General enquiries: contact@fashionpalette.pk",
          "Telephone / WhatsApp: 0327-6796087",
          "Business location: People’s Colony, Faisalabad, Punjab, Pakistan",
        ],
      },
      {
        p: "Nothing in this Policy limits any privacy or consumer right that cannot lawfully be limited.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      effectiveDate="28 July 2026"
      intro={intro}
      sections={sections}
    />
  );
}
