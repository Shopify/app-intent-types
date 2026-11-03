# `application/upsell`

Sidekick intent type for creating or editing an **upsell** — an app-owned product offer that a shopper sees at a specific point in the buying journey and chooses to accept or decline. Upsell apps commonly chain several of these into a *funnel*.

- **Status:** 🚧 Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json` *(pending publication — draft inline below)*

**Also known as:** upsell, cross-sell, downsell, add-on, order bump, upgrade offer, "frequently bought together", complementary product, product recommendation widget, one-click upsell, post-purchase offer, pre-purchase / pop-up offer, in-cart offer, cart drawer offer, checkout offer, thank-you page offer, upsell funnel, offer flow.

## When to register an intent for this type

Register an `application/upsell` intent when your app owns offer records that a merchant builds, targets, publishes and pauses — and you can take a partially-specified offer (a product, a placement, a discount) and either (a) open a new offer builder pre-filled from the merchant's sentence, or (b) navigate to an existing offer.

The offer itself is yours. It points at [products and variants](https://shopify.dev/docs/api/admin-graphql/latest/objects/Product) and renders on storefront and checkout surfaces, but the offer that binds them together has no Shopify object behind it. There is no `Upsell` type in the Admin API, and nothing represents "show this product, to these carts, at this placement, and fall back to a cheaper one if they decline." That gap is what this type covers.

Typical examples:

- A **post-purchase upsell app** registering `create` so "create a post-purchase upsell for my best-selling candle with 10% off" opens a new offer pre-filled with the product and the discount.
- A **cart drawer app** registering `create` for "add a cart drawer upsell for customers whose cart is over $50."
- A **funnel app** registering `edit` so "change the discount on my thank-you page offer to 15%" opens that offer rather than the app's dashboard.
- A **pre-purchase / pop-up offer app** registering `edit` for "pause my Black Friday funnel" (where `status` is a field on the offer, not a separate action).
- A **"frequently bought together" app** registering `create` for "show a matching phone case on the product page for all iPhone cases."

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open upsell"
description = "Create or edit an upsell offer"
handle = "open-upsell"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/funnels/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/upsell"
  action = "edit"
  schema = "./upsell-schema.json"
```

Five things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both — `create` and `edit` usually want different landing routes.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead (API version 2026-04 or later).
5. **`tools`** is not optional in practice. Sidekick only invokes intents that have tools — if `tools` isn't set, or `tools.json` is empty, the intent isn't registered at all.

Budget for the app-wide ceiling while you plan: **5 intents and 20 tools per app**, with the tool limit shared across data and action extensions. An upsell app registering `create` and `edit` spends two of its five intents, so decide early whether one `edit` intent covers every placement or whether each surface deserves its own.

## Example: the input schema

`./upsell-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the upsell to open, for example gid://application/upsell/4417.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Merchant-facing name of the offer or funnel"
      },
      "status": {
        "type": "string",
        "enum": ["active", "inactive"],
        "description": "Target status. The merchant confirms the change in the app."
      },
      "placements": {
        "type": "array",
        "description": "Where the shopper sees the offer",
        "items": {
          "type": "string",
          "enum": [
            "product_page",
            "pre_purchase",
            "cart_drawer",
            "in_checkout",
            "post_purchase",
            "thank_you"
          ]
        }
      },
      "trigger": {
        "type": "object",
        "description": "Which carts the offer applies to",
        "properties": {
          "conditions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "subject": { "type": "string", "description": "product, collection, tag, cart_total, country" },
                "operator": { "type": "string", "description": "in, not_in, gte, lte" },
                "value": { "description": "Shopify GIDs, tags or codes as strings, or a number for cart subjects" }
              },
              "additionalProperties": true
            }
          }
        },
        "additionalProperties": true
      },
      "offers": {
        "type": "array",
        "description": "The offered products, in the order shown",
        "items": {
          "type": "object",
          "properties": {
            "role": {
              "type": "string",
              "description": "App-specific slot: upsell, downsell, addon, cross_sell"
            },
            "products": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "product_id": { "type": "string", "description": "Shopify product GID" },
                  "variant_ids": {
                    "type": "array",
                    "items": { "type": "string" },
                    "description": "Shopify variant GIDs"
                  }
                },
                "additionalProperties": true
              }
            },
            "discount": {
              "type": "object",
              "properties": {
                "type": { "type": "string", "description": "percentage, fixed_amount, compare_at_price, none" },
                "value": { "type": "number", "minimum": 0 }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        }
      },
      "brief": {
        "type": "string",
        "description": "The merchant's request in their own words, for anything the fields can't express"
      }
    }
  }
}
```

`value` carries the offer being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the GID and substitutes the bare tail into the `{id}` placeholder, so `/funnels/{id}/edit` opens as `/funnels/4417/edit`. For `create`, omit `value` — there is no offer to open yet.

## Draft canonical schema

Following the shape the published `application/*` schemas use today — the identifier only, with `additionalProperties: true` — so prefill fields live in each app's own `inputSchema.properties` as above:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json",
  "title": "Upsell Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The upsell ID"
    }
  },
  "additionalProperties": true
}
```

No `required` fields, per the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The upsell ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these) — the fields shared across the upsell category, and the strongest candidates for promotion into the canonical schema once real usage confirms them:

| Field | Type | Notes |
|---|---|---|
| `name` | string | Merchant-facing name of the offer or funnel. |
| `status` | string | Whether the offer is running. `active` / `inactive` is the minimal pair, and carries "pause my Black Friday funnel" as an `edit`. Apps with a richer lifecycle — drafts, scheduled, archived — define their own values instead. |
| `placements` | array of string | Where the shopper sees the offer: `product_page`, `cart`, `cart_drawer`, `pre_purchase`, `in_checkout`, `post_purchase`, `thank_you`, `order_status`. An array — a funnel routinely spans several surfaces. |
| `trigger.conditions[]` | array of object | `{ subject, operator, value }`, the "which carts" rule. Common subjects: `product`, `collection`, `tag`, `cart_total`, `country`. |
| `offers[]` | array of object | `{ role, products[{ product_id, variant_ids }], discount{ type, value } }`, in the order shown. Products are Shopify GIDs. |
| `brief` | string | The merchant's request in their own words, for anything the fields can't express. |

App-specific concerns stay in each app's `inputSchema`: a funnel app's `offers[].show_when` (show a downsell after a decline), a cart app's `reward_bar`, a widget app's `widget_style`, a split-testing app's `traffic` split.

## Common pitfalls

- **Modeling the funnel instead of the offer — or vice versa.** Apps differ on whether the merchant-facing artifact is one offer or a chained funnel. Keep `placements` and `offers` arrays so both fit, and don't assume a one-to-one mapping between an intent and a database row.
- **Assuming a single placement.** "Create an upsell for my candle" rarely names a surface, and many apps show the same offer pre-purchase *and* post-purchase. Treat `placements` as a set the merchant narrows in your UI.
- **Expecting actions for `publish`, `pause`, or `duplicate`.** Those verbs are operations on an offer that is already open, so declare them in `tools.json` and register them from the route with `shopify.tools.register`. Carrying "pause it" as an `edit` with `status: "inactive"` is the navigation half of the same request.
- **Registering several intents on the same `type:action` without `matchValue`.** This category has more installed competitors per store than most — merchants run a post-purchase app and a cart drawer app side by side. `matchValue` narrows a field to a specific value during disambiguation; without it Sidekick has every candidate to choose from. If you register one intent per placement, pin each with `matchValue` on `placements`.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/upsell"` and `uri: "gid://application/upsell/4417"`, or "open it" has nothing to invoke.

## What this type is not

Two boundaries worth drawing, because merchants use the words interchangeably:

- **An offer the shopper accepts, not a reward that applies by itself.** If the cart qualifies and the benefit lands automatically, that isn't an upsell — an upsell is presented, and the shopper can decline it. The decline path is why `offers[]` is ordered and why a downsell follows a rejected offer.
- **A product added in context, not a product set priced as one unit.** An upsell offers something alongside what the shopper is already buying, at a specific moment in the journey. A fixed or build-your-own set sold as a single item is a different artifact with different pricing.
