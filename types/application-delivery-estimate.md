# `application/delivery-estimate`

Sidekick intent type for creating or opening an app-owned **delivery estimate rule** — a reusable rule a merchant authors to decide the estimated delivery or dispatch date shown to buyers for a set of products, and the message that expresses it.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/delivery-estimate.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/delivery-estimate.json)

## When to register an intent for this type

Register an `application/delivery-estimate` intent when your app owns delivery estimate rules that merchants name, target, revisit, and enable or disable independently of any order or shipment. Estimated-delivery-date and dispatch or lead-time apps are typical providers.

Typical examples:

- "Add an estimate rule for the Furniture collection saying 5–7 business days" opens your new-rule workflow with the target and range pre-filled.
- "Change the rule for products tagged fragile to 10 days" opens that rule with the change staged.
- "Open the delivery estimate rule for Acme" opens that existing rule.
- "Pause the Canada delivery estimate rule" opens the rule with the status change staged for confirmation.

`create` opens a workflow for a new rule. `edit` opens an existing rule and can stage changes, including enabling or disabling it. Neither action saves or publishes anything on its own.

The artifact is the rule, not a prediction for one order.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open delivery estimate rule"
description = "Open or edit a delivery estimate rule"
handle = "open-delivery-estimate"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/delivery-estimates/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/delivery-estimate"
  action = "edit"
  schema = "./delivery-estimate-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at your new-rule page, such as `/delivery-estimates/new`.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./delivery-estimate-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned delivery estimate rule to open, for example gid://application/delivery-estimate/123",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/delivery-estimate.json",
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "The buyer-facing delivery text, such as Arrives in 5-7 business days"
      }
    }
  }
}
```

`value` carries the existing rule's identity for `edit`. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/delivery-estimate/123` opens `/delivery-estimates/123`. It's an app-owned identifier, not a Shopify resource GID. Don't add a second rule ID to `inputSchema`. For `create`, omit `value` — no rule exists yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The delivery estimate rule ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions/categories/rfc) to push for any of these):

- `title` — merchant-facing rule name
- `enabled` — whether the rule applies (lets "pause the Canada rule" map to `edit`)
- `target` — what the rule applies to: all products, or specific products, collections, tags, or vendors
- `estimate` — the delivery window: minimum and maximum days, and whether only business days count
- `message` — the buyer-facing delivery text, which may contain app-specific placeholders
- `availability` — conditions such as stock state or destination countries
- `active_period` — an optional window during which the rule applies

## Common pitfalls

- **Confusing a rule with a computed prediction.** This type opens the editor for a reusable rule. Reading an order's predicted arrival date is data retrieval from your app, not a new rule.
- **Treating a target as the rule's identity.** A product or collection GID can identify what a rule targets, not the rule itself. Keep targets in your own prefill fields and the rule in `value`.
- **Adding `toggle`, `publish`, or `delete` actions.** Every `application/*` type supports exactly `create` and `edit`. Enabling, disabling, and other operations happen in your workflow or your app's tools, with merchant review and confirmation.
- **Assuming shared date semantics.** Apps differ on dispatch versus arrival, business versus calendar days, holidays, cutoff times, and message placeholders. Your app interprets its own fields and shows the merchant what will change.
- **Trusting prefill as authority.** Check shop and staff access, verify rule ownership and referenced targets, reload current state, and get explicit merchant confirmation before changing what buyers see. Make saves safe to retry.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/delivery-estimate"` and a stable `uri` for the rule.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including for nested properties. Your app UI collects missing information.

## Related types

- **[`application/shipment`](./application-shipment.md)** — a package sent after purchase, with carrier and tracking. A delivery estimate rule shapes what buyers see before they buy.
- **[`application/checkout-rule`](./application-checkout-rule.md)** — rules that hide, rename, or reorder delivery and payment options at checkout. A delivery estimate rule doesn't change which options buyers get, only the dates shown.
- **[`shopify/product`](./shopify-product.md)** — imports Shopify products. A rule can target products, but it isn't a product.

## Discussion history

- [RFC #12](https://github.com/Shopify/app-intent-types/discussions/12) originally proposed `application/delivery-rule`. This entry uses `application/delivery-estimate` to name what the rule produces.
