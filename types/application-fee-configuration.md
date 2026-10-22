# `application/fee-configuration`

Sidekick intent type for creating or opening an app-owned **fee configuration**: the setup that adds a fee or surcharge to a buyer's cart or checkout, such as a handling fee, a cash-on-delivery surcharge, or a paid option the buyer chooses.

- **Status:** Proposed; not yet available.
- **Actions:** `create`, `edit`.
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/fee-configuration.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/fee-configuration.json), pending publication.

## When to register an intent for this type

Register an `application/fee-configuration` intent when your app owns the fees it applies: what each fee is called, how it's priced, when it applies, and whether the buyer chooses it. This is the shape shared by fee, surcharge, handling-fee, and paid-add-on apps.

The fee configuration is yours. Your app holds its conditions, buyer-facing options, and pricing logic, and the merchant changes them in your app. A configuration is not a charge: it produces the fees a buyer sees on a cart, checkout, or order.

Typical merchant requests:

- "Create a $5 handling fee."
- "Add cart choices for payment: bank transfer free, cash on delivery $5."
- "Apply this fee only to credit-card payments."
- "Only charge the export fee for orders shipping to Estonia."

`create` opens your fee editor pre-filled from the merchant's sentence. `edit` opens an existing fee configuration, optionally with proposed changes staged for review. In both cases the merchant reviews the configuration and saves it in your app.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open fee"
description = "Open or edit a fee configuration"
handle = "open-fee-configuration"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/fees/{id}"

  [[extensions.targeting.intents]]
  type = "application/fee-configuration"
  action = "edit"
  schema = "./fee-configuration-schema.json"
```

Register a separate `create` block that targets your new-fee workflow. You can also use `admin.app.intent.render` to render an admin UI extension recipient instead.

## Example: the input schema

`./fee-configuration-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The fee configuration to open, for example gid://application/fee-configuration/42.",
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
            "priceType": { "type": "string", "enum": ["fixed", "percent"] },
            "amount": { "type": "number", "minimum": 0 }
          }
        }
      }
    }
  }
}
```

For `edit`, pass the existing fee configuration's stable identifier in top-level `value`. Don't add a second fee ID to `inputSchema`. With the example mapping, `gid://application/fee-configuration/42` opens as `/fees/42`. It's an app-owned identifier, not a Shopify resource GID. For `create`, omit `value`, because there is no fee configuration to open yet.

A data extension that returns fee configurations as resource links should use `mimeType: "application/fee-configuration"` and a stable `uri`, so that "open it" can invoke `edit`.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned fee configuration ID, matching the minimal application schema convention. Invocation identity belongs in top-level `value`. |

The canonical schema has `additionalProperties: true` and no required fields. Declare your own optional prefill fields in your `inputSchema.properties`, as in the example above. Conditions such as payment methods, shipping destinations, or products, and buyer-input styles such as checkboxes or radio choices, are app-specific and aren't standardized by this type yet.

## Common pitfalls

- **Charging on navigation.** Opening `create` or `edit` doesn't activate a fee. Activating, pausing, or deleting a fee changes what buyers pay, so keep those steps behind explicit merchant confirmation in your app.
- **Trusting prefill as authority.** Re-check the shop's plan, your app's entitlements, and fee ownership on your side. Explain when a requested condition isn't available, for example a checkout-only feature on a plan that doesn't support it, and offer an alternative instead of failing silently.
- **Payment-method surcharges.** Surcharging rules vary by payment processor and region. Your app is responsible for applying fees only where they're permitted.
- **Waiting for `toggle` or `publish` actions.** Every `application/*` type supports exactly `create` and `edit`. Turning a fee on or off is a status change inside your workflow or an app tool, not a separate action.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. Your app UI collects missing settings and validates combinations.
- **Assuming availability.** This type is a proposal. Schema publication and platform support are required before apps can register it.

## Related types

- [`shopify/product`](./shopify-product.md): imports Shopify products. A product GID can identify what a fee applies to, but it doesn't identify the fee configuration.

## Discussion history

- Original proposal: [#37 — application/fee](../../discussions/37), renamed to `application/fee-configuration` to name the artifact a merchant sets up rather than the charge it produces.
