# Virtual Try-On — Feasibility Brief (Phase 2, B6)

**Status:** Discovery only. Per the Phase 2 brief, virtual try-on is **P2** —
"feasibility first, not immediate full build" and it **must not block the COD
launch**. No code has been written; this document is for client sign-off before
any proof-of-concept (POC) is approved.

---

## 1. What "virtual try-on" actually means here

Showing a garment on a body/model image so a shopper can preview fit/look. It is
**not** a frontend toggle — it needs an image pipeline or a third-party service,
prepared product assets, privacy controls, performance testing, and an accuracy
disclaimer.

Three interaction models (client to choose one for the POC):

| Model | How it works | Pros | Cons |
|-------|--------------|------|------|
| **A. Preset models** | Garment previewed on a small set of fixed model photos | No customer photos → simplest privacy; predictable quality | Not personalised; needs per-garment asset prep |
| **B. Model selector** | Customer picks a body type/skin tone from presets | Feels personalised; still no uploads | More assets; still not "them" |
| **C. Customer photo upload** | Customer uploads a photo; garment is composited on | Most personal | Heaviest privacy/consent burden; most variable quality; highest cost |

**Recommendation for the POC:** start with **A (preset models)** on 5–10 suitable
unstitched/stitched products. It de-risks privacy entirely and proves quality and
cost before considering uploads.

## 2. Vendor / technology options (to price during POC)

- **Third-party try-on APIs** (e.g. diffusion-based garment-transfer services):
  fastest to integrate, per-image or per-call pricing, quality varies by garment
  type (loose/unstitched drape is harder than fitted RTW).
- **Self-hosted open models** (e.g. virtual try-on diffusion models): no per-call
  fee but needs a GPU host (ongoing cost + ops) and ML maintenance.
- **Manual/art-directed compositing** (studio shots of garments on models): not
  "virtual" but highest quality and zero runtime cost/privacy risk; good baseline
  to compare against.

Deliverable of the POC: a short comparison of **cost per image/call, processing
time, supported garment types, mobile-browser support, and output quality** for
the chosen model.

## 3. Privacy & consent (mandatory if Model C is chosen)

If customer photos are ever uploaded, the store must:
- Obtain **explicit, specific consent** before upload.
- Clearly state **retention** and delete inputs **and** outputs automatically
  after a stated period.
- **Never** use uploads for training or marketing without separate permission.
- Keep processing compliant with the existing Privacy Policy (update it first).

Model A/B avoid all of the above — a strong reason to start there.

## 4. Product & performance requirements

- Per-garment asset prep (clean cut-outs / consistent lighting) — real effort per
  SKU; not all garments are suitable (heavy embellishment, sheer fabrics).
- **Label every generated preview as a visual estimate** — colour, fit, scale and
  drape may differ from the physical product.
- Lazy-load the feature; it must not slow the product page.
- **Graceful fallback:** if the service fails or a product is incompatible, the
  normal product page stays fully usable. Try-on is additive, never required.

## 5. Proposed POC plan (only if approved)

1. Client picks interaction model (A/B/C) and 5–10 candidate products.
2. Integrate one vendor behind a feature flag on those products only.
3. Measure cost, speed, mobile support, and quality against an agreed threshold.
4. Review privacy/consent (if Model C) with the client and update policies.
5. Go/no-go decision before any wider rollout.

**DONE WHEN:** the POC meets an agreed quality, privacy, speed and cost threshold
and the client explicitly approves wider development.

## 6. Open questions for the client

- Which interaction model (A preset models / B model selector / C photo upload)?
- Which 5–10 products should the POC cover?
- Is there budget for a paid try-on API, or should we prioritise the zero-runtime-cost
  studio-compositing baseline first?
- Acceptable monthly cost ceiling and target processing time?
