# `application/checkout-rule`

Sidekick intent type for creating or opening an app-owned checkout customization rule, such as a rule that hides, reorders, or renames payment methods or delivery options, or validates a checkout.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/checkout-rule.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/checkout-rule.json)

## When to register an intent for this type

Register this type when your app owns rules that merchants configure in your app's builder and your app manages their implementation through Shopify Functions.

Typical examples:

- "Hide Cash on Delivery for orders above 50,000 PKR" opens a new rule with the merchant's condition prefilled.
- "Rename the online payment option to JazzCash" opens your rule builder with the requested change.
- "Open my cash-on-delivery rule" opens that existing rule in your app.
- "Disable my payment rule for wholesale customers" opens the rule with a change staged for merchant confirmation.

The rule is the merchant-facing object your app owns, not the Function code or an installed Shopify customization. Your app might implement several rules through one customization or coordinate several customizations for a rule. Don't require a one-to-one mapping.

Shopify's [`PaymentCustomization`](https://shopify.dev/docs/api/admin-graphql/latest/objects/PaymentCustomization), [`DeliveryCustomization`](https://shopify.dev/docs/api/admin-graphql/latest/objects/DeliveryCustomization), and [`Validation`](https://shopify.dev/docs/api/admin-graphql/latest/objects/Validation) objects identify installed Function-backed resources. Use this intent for the app-owned rule, not as a generic editor for those resources or every Shopify Function API.

## Example: register the intents

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Create checkout rule"
description = "Create an app-owned payment, delivery, or checkout validation rule"
handle = "create-checkout-rule"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/rules/new"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/checkout-rule"
  action = "create"
  schema = "./checkout-rule-schema.json"

[[extensions]]
name = "Edit checkout rule"
description = "Open or edit an app-owned checkout customization rule"
handle = "edit-checkout-rule"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/rules/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/checkout-rule"
  action = "edit"
  schema = "./checkout-rule-schema.json"
```

`create` opens a new rule and usually omits `value`. `edit` opens an existing rule identified by `value`; it also covers read-only viewing. Use separate destination routes when creating and editing need different URLs.

## Example: the input schema

`./checkout-rule-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned rule reference, for example gid://application/checkout-rule/123.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/checkout-rule.json",
    "type": "object",
    "properties": {
      "condition": {
        "type": "string",
        "description": "The merchant's condition, such as cart total above 50000 PKR. The app interprets it and stages a preview.",
        "mapTo": "query_param"
      },
      "enabled": {
        "type": "boolean",
        "description": "Requested rule state. Omission leaves the state unchanged; the merchant confirms any change.",
        "mapTo": "query_param"
      }
    }
  }
}
```

`value` identifies the rule, not the payment method or delivery option it targets. It doesn't have to be a Shopify GID. With `mapTo: "param"` and `fieldName: "id"`, an app-owned reference such as `gid://application/checkout-rule/123` supplies `123` to `/rules/{id}`. A plain string rule ID also works. Don't require a duplicate rule identifier in `inputSchema.properties`.

## Fields the schema describes

The canonical schema contains only:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned rule identifier. Use top-level `value` to identify the rule for `edit`. |

`additionalProperties: true` lets your app declare optional prefill fields in its own `inputSchema.properties`. The example's `condition` and `enabled` fields are app-declared, not part of the shared baseline. Targets, operations, labels, positions, and other configuration also remain app-owned. Don't declare `required` fields.

## Common pitfalls

- **Adding a `toggle` action.** Only `create` and `edit` are supported. Stage a requested state through an optional app-declared field on `edit`, or through a tool registered while the rule is open. Omitting the state must not toggle the rule.
- **Using the wrong identity.** A `ShopifyFunction` ID identifies an implementation. A Shopify customization or validation GID identifies an installed resource. Neither necessarily identifies the individual app rule. Disabling a shared customization can affect several rules.
- **Treating the intent as a mutation API.** Prefill or stage the change, reload the rule's current state, authorize access, and require merchant confirmation before saving. Your app owns the translation into underlying Function-backed resources.
- **Assuming an Admin settings extension is required.** This intent opens your app-owned flow. It doesn't require an existing checkout settings UI extension.
- **Forgetting the resource-link `mimeType`.** Return `mimeType: "application/checkout-rule"` and the app's rule URI from your data extension so "open it" can resolve to `edit`.
- **Using this type for unrelated Function configuration.** Discount authoring, fees, and cart transformations aren't checkout customization rules merely because they also use Shopify Functions.

## Related types

- **[`application/shipment`](./application-shipment.md)** describes a post-purchase consignment. This type configures checkout behavior before an order exists.

## Discussion history

- Original proposal: [#8 — Checkout-rule intent type](https://github.com/Shopify/app-intent-types/discussions/8).
