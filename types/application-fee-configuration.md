# `application/fee-configuration`

Sidekick intent type for creating or opening an app-owned **fee configuration**: the setup that adds a fee or surcharge to a buyer's cart or checkout, such as a handling fee, a cash-on-delivery surcharge, or a paid option the buyer chooses.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/fee-configuration.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/fee-configuration.json)

## When to register an intent for this type

Register an `application/fee-configuration` intent when your app owns the fees it applies: what each fee is called, how it's priced, when it applies, and whether the buyer chooses it. This is the shape shared by fee, surcharge, handling-fee, and paid-add-on apps.

The configuration is the artifact, not a charge. Your app holds its conditions, buyer-facing options, and pricing logic, and the merchant changes them in your app. A configuration produces the fees a buyer then sees on a cart, checkout, or order.

Typical examples:

- "Create a $5 handling fee" opens your fee editor with the name and amount pre-filled.
- "Add cart choices for payment: bank transfer free, cash on delivery $5" opens a new fee with two priced options staged.
- "Apply this fee only to credit-card payments" opens the existing fee with the condition staged.
- "Only charge the export fee for orders shipping to Estonia" opens that fee with the destination condition staged.

`create` opens your fee editor pre-filled from the merchant's sentence. `edit` opens an existing fee configuration, optionally with proposed changes staged. In both cases the merchant reviews the configuration and saves it in your app.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open fee"
description = "Open or edit a fee or surcharge"
handle = "open-fee-configuration"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/fees/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/fee-configuration"
  action = "edit"
  schema = "./fee-configuration-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at your new-fee page, such as `/fees/new`.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./fee-configuration-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The fee configuration to open, for example gid://application/fee-configuration/42",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/fee-configuration.json",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The fee name buyers see, for example Handling fee"
      },
      "scope": {
        "type": "string",
        "enum": ["product", "cart"],
        "description": "Whether the fee applies to product lines or once per cart"
      },
      "options": {
        "type": "array",
        "description": "Priced choices, for example a free option and a $5 option",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "price_type": { "type": "string", "enum": ["fixed", "percent"] },
            "amount": { "type": "number", "minimum": 0 }
          }
        }
      }
    }
  }
}
```

`value` carries the fee configuration being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/fee-configuration/42` opens as `/fees/42`. It's an app-owned identifier, not a Shopify resource GID. Don't add a second fee ID to `inputSchema`. For `create`, omit `value` — there is no fee configuration to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The fee configuration ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions/categories/rfc) to push for any of these):

- `name` — the fee name buyers see
- `scope` — whether the fee applies per product line or once per cart
- `options` — priced choices, each with a title, a fixed or percent price type, and an amount
- `input_type` — how the buyer chooses: checkbox, radio, or applied automatically
- Conditions such as payment methods or shipping destination countries, each with include or exclude matching

## Common pitfalls

- **Charging on navigation.** Opening `create` or `edit` doesn't activate a fee. Activating, pausing, or deleting a fee changes what buyers pay, so keep those steps behind explicit merchant confirmation in your app.
- **Trusting prefill as authority.** Re-check the shop's plan, your app's entitlements, and fee ownership on your side. When a requested condition isn't available — for example, a checkout-only condition on a plan that doesn't support it — explain why and offer an alternative instead of failing silently.
- **Applying surcharges where they aren't permitted.** Payment-method surcharge rules vary by payment provider and region. Your app is responsible for applying fees only where they're allowed.
- **Waiting for `toggle` or `publish` actions.** Every `application/*` type supports exactly `create` and `edit`. Turning a fee on or off is a status change inside your workflow or an app tool, not a separate action.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/fee-configuration"` and a stable `uri`, or "open it" has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. Your app UI collects missing settings and validates combinations.

## Related types

- **[`application/product-fee`](./application-product-fee.md)** — fees attached to a specific product, such as bottle deposits or eco fees. A fee configuration applies to carts by your app's own conditions; it isn't a product's fee setup.
- **[`application/checkout-rule`](./application-checkout-rule.md)** — app-owned rules that hide, rename, or reorder checkout options. A checkout rule changes what the buyer can choose; a fee configuration changes what the buyer pays.
- **[`shopify/product`](./shopify-product.md)** — imports Shopify products. A product GID can describe what a fee applies to, but it doesn't identify the fee configuration.

## Discussion history

- [RFC #37](https://github.com/Shopify/app-intent-types/discussions/37) originally proposed `application/fee`. This entry uses `application/fee-configuration` to name the setup a merchant configures rather than the charge it produces.
