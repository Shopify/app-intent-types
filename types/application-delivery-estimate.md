# `application/delivery-estimate`

Sidekick intent type for creating or opening an app-owned delivery estimate rule: a reusable rule that a merchant authors to determine estimated delivery or dispatch dates and the message shown to buyers.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [delivery-estimate.json](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/delivery-estimate.json)

## When to register an intent for this type

Register this type when your app owns delivery estimate rules that merchants can name, target, revisit, and enable or disable independently of an order or shipment. Estimated-delivery-date and dispatch/lead-time apps can use this type.

Examples:
- “Add an estimate rule for the Furniture collection saying 5–7 business days.”
- “Change the rule for products tagged fragile to 10 days.”
- “Open the delivery estimate rule for Acme.”
- “Pause the Canada delivery estimate rule.”

`create` opens a workflow for a new rule. `edit` opens an existing rule and can stage changes, including enabling or disabling it. Neither action saves or publishes changes on its own.

The artifact is the rule, not a prediction for one order. This type doesn't configure Shopify shipping rates, delivery profiles, delivery settings, or Shop Promise.

## Example: register the intent

An edit registration in `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open delivery estimate rule"
description = "Open an app-owned delivery estimate rule"
handle = "open-delivery-estimate"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/delivery-estimates/{id}"

  [[extensions.targeting.intents]]
  type = "application/delivery-estimate"
  action = "edit"
  schema = "./delivery-estimate-schema.json"
```

Register `create` in a separate targeting block pointing at your new-rule page, such as `/delivery-estimates/new`. Its schema can omit `value`, because no rule exists yet. An app with an Admin UI extension can use the supported `admin.app.intent.render` target instead; this type doesn't require a particular presentation.

## Example: the schema

`./delivery-estimate-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned delivery estimate rule to open.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/delivery-estimate.json",
    "type": "object"
  }
}
```

For `edit`, top-level `value` carries the existing rule's identity. For example, `gid://application/delivery-estimate/123` maps to `123` in the link's `{id}` parameter. This is an app-owned URI, not a Shopify resource GID.

A data extension that returns a resource link for this rule uses `mimeType: "application/delivery-estimate"` and a matching app-owned `uri`, so Sidekick can offer to open it.

## Fields the canonical schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned rule ID. Existing-object routing uses top-level `value`; don't add a second independently interpreted edit identifier. |

The baseline is an object with `additionalProperties: true`. It doesn't require any input fields. Declare optional provider-specific prefill fields in your extending `inputSchema` and configure their mappings for your recipient. Targeting, day ranges, buyer-facing text, enabled state, stock/geographic conditions, and schedules aren't standardized by this type.

## Common pitfalls

- **Confusing a rule with a computed prediction.** This type opens the editor for a reusable app-owned rule. Reading an order's predicted arrival date belongs in data retrieval, not a new rule-creation intent.
- **Changing Shopify settings through an app-owned type.** Requests to edit shipping rates, delivery profiles, Shopify delivery settings, or Shop Promise belong to their corresponding Shopify workflows. This intent doesn't override Shopify delivery dates or confer Shop Promise branding or guarantees. Don't imply a display-precedence rule between independently rendered app and Shopify estimates.
- **Treating a target as the rule identity.** A product or collection GID can identify a provider-defined target, not the estimate rule itself. A store-wide app rule is still distinct from changing Shopify's shop-level delivery settings.
- **Adding `toggle`, `publish`, or `delete` actions.** Only `create` and `edit` are supported. Enabling/disabling or other operations happen within the recipient's workflow or its Activity tools, with appropriate review and confirmation.
- **Assuming shared date semantics.** Apps can distinguish dispatch from arrival, business from calendar days, holidays, cutoff times, and message placeholders differently. The recipient interprets its own fields and shows the merchant what will change.
- **Trusting prefill as authorization.** Re-authenticate shop/staff access, verify rule ownership and referenced targets, reload authoritative state, and require explicit merchant confirmation before changing buyer-facing behavior. Make saves safe to retry.
- **Requiring input fields.** Don't declare `required` in an intent's `inputSchema`, including nested fields. The recipient UI collects missing information.

## Related types and Shopify resources

- [`application/shipment`](./application-shipment.md) represents a post-purchase consignment, not a pre-purchase estimate rule.
- [`shopify/product`](./shopify-product.md) identifies a Shopify product; a rule may target products but isn't a product.
- [DeliveryProfile](https://shopify.dev/docs/api/admin-graphql/latest/objects/DeliveryProfile) describes shipping-rate configuration. It isn't the app-owned rule described here.
- **Settings > Shipping and delivery** and **Shop Promise** manage Shopify-owned delivery behavior. Use those workflows when the merchant's request targets them.

## Discussion history

- Original proposal: [#12, `application/delivery-rule`](../../discussions/12).
