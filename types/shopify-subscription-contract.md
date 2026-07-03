# `shopify/subscription-contract`

Sidekick intent type for importing one or more **Shopify subscription contracts** into an app-provided workflow and returning Shopify SubscriptionContract GIDs.

- **Status:** 🧪 Proposed (beta, gated per-app)
- **Actions:** `import`, `import+bulk`
- **GID schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json)

## When to register an intent for this type

Register a `shopify/subscription-contract` intent when your app operates on an existing Shopify SubscriptionContract identified by a GID and produces a Shopify SubscriptionContract result.

Typical examples:
- A **subscriptions app** registering `import` so a merchant can ask Sidekick to open a specific subscription contract and manage it (pause, resume, skip, edit) in the app.
- A **retention app** registering `import` so a merchant can start from an existing subscription contract and continue in the app's churn-prevention workflow.
- A **subscriptions operations app** registering `import+bulk` so a merchant can process several subscription contracts in one workflow.

Use `shopify/subscription-contract` when the source and output are Shopify SubscriptionContract resources. If your app owns the artifact shape instead, use an `application/*` type.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-04"

[[extensions]]
name = "Manage subscription contract"
description = "Take an existing Shopify subscription contract and manage it in an app workflow"
handle = "manage-subscription-contract"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/contracts/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "shopify/subscription-contract"
  action = "import"
  schema = "./subscription-contract-import-schema.json"
```

Three things to notice:

1. **`type`** is the Shopify resource type from this catalog. Required.
2. **`action`** is `import` for one resource or `import+bulk` for many resources. Required.
3. **`schema`** points to a local JSON Schema file. Required. Use `shopify-intent.json` for `import` and `shopify-intent-bulk.json` for `import+bulk`.

## Example: the import schema

`./subscription-contract-import-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "type": "object",
    "properties": {
      "note": {
        "type": "string",
        "description": "Merchant-provided note for the subscription contract workflow."
      }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json"
      }
    }
  }
}
```

## Fields the schema describes

A Shopify resource intent schema has a fixed shape:

| Field | Type | Notes |
|---|---|---|
| `value` | Shopify SubscriptionContract GID | Source contract passed to the app. Uses the `shopify/subscription-contract` GID schema. |
| `inputSchema` | object | App-specific input fields. Do not declare `required` fields. |
| `outputSchema.properties.id` | Shopify SubscriptionContract GID | Result contract returned by `shopify.intents.response.ok`. |

For `import+bulk`, `value` is an array of SubscriptionContract GIDs and the output should return an array under `outputSchema.properties.ids`.

## Common pitfalls

- **Using `create` or `edit` with `shopify/subscription-contract`.** Those verbs are reserved for Shopify-native Admin intents. Third-party app extensions use `import` or `import+bulk`.
- **Using the wrong meta-schema.** `import` requires `shopify-intent.json`; `import+bulk` requires `shopify-intent-bulk.json`.
- **Pointing at an application schema.** `value.$ref` must point to the SubscriptionContract GID schema, not an `application/*` schema.
- **Treating the URL `{id}` as a full GID.** When mapped as a `param`, Sidekick passes the bare tail ID into the URL path. Read the full GID from the intent payload if you need it.

## Related types

- **[`shopify/selling-plan`](./shopify-selling-plan.md)** — for importing the selling plan that defines a subscription's terms.
- **[`shopify/order`](./shopify-order.md)** — for importing Shopify Order resources.
- **[`shopify/customer`](./shopify-customer.md)** — for importing Shopify Customer resources.
