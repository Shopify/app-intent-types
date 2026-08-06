# `application/survey`

Sidekick intent type for creating or editing a **survey** — a structured set of questions an app shows to shoppers (post-purchase, on the order status page, at POS, or via a link) to collect attribution, satisfaction, or research data on the merchant's behalf.

- **Status:** 🚧 Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json` *(pending publication — draft inline below)*

## When to register an intent for this type

Register an `application/survey` intent when your app can take a partially-specified survey — a name, one or more questions, and where it should run — and either (a) create a new survey or (b) modify an existing one in your app's UI.

Typical examples:

- A **post-purchase survey app** registering `create` so Sidekick can hand off "create a survey asking customers how they heard about us" to your survey builder.
- An **attribution app** registering `edit` for "add a TikTok option to my 'how did you hear about us' survey."
- A **CX / NPS app** registering `create` for "set up an NPS survey on the order status page."
- A **retail app** registering `edit` for "pause the in-store survey during the holiday rush" (where `status` is a field on the survey, not a separate type).

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2025-04"

[[extensions]]
name = "manage-survey"
handle = "manage-survey"
type = "ui_extension"

  [[extensions.targeting]]
  module = "./src/ManageSurvey.tsx"
  target = "admin.intent.render"

  [[extensions.targeting.intents]]
  type = "application/survey"
  action = "create"
  schema = "./survey-schema.json"
```

Three things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register the same extension twice (one block per action) if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type once published, and it **must not declare `required` fields** — Sidekick will collect missing fields from the merchant before invoking your extension.

## Example: the input schema

`./survey-schema.json` (once the canonical schema is published):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json"
}
```

## Draft canonical schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json",
  "title": "Survey",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The survey ID. Used for edit actions."
    },
    "name": {
      "type": "string",
      "description": "Internal name of the survey, shown to the merchant."
    },
    "status": {
      "type": "string",
      "enum": ["draft", "active", "paused"],
      "description": "Whether the survey is currently shown to shoppers."
    },
    "placements": {
      "type": "array",
      "description": "Where the survey is shown.",
      "items": {
        "type": "string",
        "enum": ["thank_you", "order_status", "pos", "link"]
      }
    },
    "questions": {
      "type": "array",
      "description": "Ordered list of questions.",
      "items": {
        "type": "object",
        "properties": {
          "prompt": {
            "type": "string",
            "description": "The question text shown to the shopper."
          },
          "type": {
            "type": "string",
            "enum": ["single_select", "multi_select", "short_text", "long_text", "rating", "nps", "dropdown"],
            "description": "Question kind. Determines which other fields apply."
          },
          "options": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Answer choices for select and dropdown types."
          },
          "allow_other": {
            "type": "boolean",
            "description": "Whether a free-text 'Other' choice is appended to select types."
          }
        },
        "additionalProperties": true
      }
    },
    "success_message": {
      "type": "string",
      "description": "Message shown to the shopper after submitting."
    },
    "starts_at": {
      "type": "string",
      "format": "date-time",
      "description": "When the survey starts running. Omit for immediately."
    },
    "ends_at": {
      "type": "string",
      "format": "date-time",
      "description": "When the survey stops running. Omit for no end date."
    }
  },
  "additionalProperties": true
}
```

No `required` fields, per the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The survey ID. Used for `edit` actions. |
| `name` | string | Merchant-facing survey name. |
| `status` | string | `draft`, `active`, or `paused`. |
| `placements` | array of string | Where it runs: `thank_you`, `order_status`, `pos`, `link`. |
| `questions` | array of object | Ordered questions: `prompt`, `type`, `options`, `allow_other`. |
| `success_message` | string | Post-submission thank-you message. |
| `starts_at` / `ends_at` | string (date-time) | Optional scheduling window. |

`additionalProperties: true` — apps may pass extra fields, but Sidekick won't validate them.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `audience` — targeting rules (first-time vs returning customers, order value thresholds, products purchased)
- `branching` — conditional display of a question based on a prior answer (`show_if: { question, answer }`)
- `language` / `translations` — localized prompts and options
- `incentive` — discount or gift offered for completion
- `channels.email` — email-delivered surveys, distinct from on-site placements

## Common pitfalls

- **Declaring `required` in your `inputSchema`.** Sidekick will reject the extension at registration time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Modeling responses instead of the survey.** This type describes the questionnaire the merchant is creating — the artifact. Shopper *responses* are your app's data; don't try to round-trip them through the intent.
- **Conflating a survey with a single review request.** A one-question "rate this product" flow that produces a public product review is [`application/review`](./application-review.md), not a survey. Surveys collect private, structured feedback for the merchant.
- **Placement-specific assumptions.** Checkout-based placements (`thank_you`, `order_status`) are governed by Shopify's checkout policies (e.g. no third-party branding). Keep the schema placement-agnostic and enforce surface rules in your app.

## Related types

- **[`application/review`](./application-review.md)** — public, product-scoped, single-rating artifacts. A survey is private, merchant-scoped, and multi-question. ~None of the fields overlap beyond `id`.
- **[`application/faq`](./application-faq.md)** — published content shoppers read; a survey is a form shoppers answer. Opposite data direction.
- **[`application/campaign`](./application-campaign.md)** — a survey may be *distributed* by a campaign, but the questionnaire itself has a distinct shape (questions, placements, response handling).

## Discussion history

- Original proposal: *(this PR)*
- Schema v1 published: *(pending)*
