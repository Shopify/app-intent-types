# `shopify/selling-plan`

Sidekick intent type for importing one or more **Shopify selling plans** into an app-provided workflow and returning Shopify SellingPlan GIDs.

- **Status:** 🧪 Proposed (beta, gated per-app)
- **Actions:** `import`, `import+bulk`
- **GID schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan/gid.json)

## When to register an intent for this type

Register a `shopify/selling-plan` intent when your app operates on an existing Shopify SellingPlan identified by a GID and produces a Shopify SellingPlan result.

Typical examples:
- A **subscriptions app** registering `import` so a merchant can ask Sidekick to open a specific selling plan and adjust its terms in the app.
- A **merchandising app** registering `import` so a merchant can apply app-specific configuration to an existing selling plan before returning the resulting SellingPlan.
- A **subscriptions operations app** registering `import+bulk` so a merchant can process several selling plans in one workflow.

Use `shopify/selling-plan` when the source and output are Shopify SellingPlan resources. If your app owns the artifact shape instead, use an `application/*` type.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-04"

[[extensions]]
name = "Manage selling plan"
description = "Take an existing Shopify selling plan and manage it in an app workflow"
handle = "manage-selling-plan"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/plans/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "shopify/selling-plan"
  action = "import"
  schema = "./selling-plan-import-schema.json"
```

Three things to notice:

1. **`type`** is the Shopify resource type from this catalog. Required.
2. **`action`** is `import` for one resource or `import+bulk` for many resources. Required.
3. **`schema`** points to a local JSON Schema file. Required. Use `shopify-intent.json` for `import` and `shopify-intent-bulk.json` for `import+bulk`.

## Example: the import schema

`./selling-plan-import-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "type": "object",
    "properties": {
      "note": {
        "type": "string",
        "description": "Merchant-provided note for the selling plan workflow."
      }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan/gid.json"
      }
    }
  }
}
```

## Fields the schema describes

A Shopify resource intent schema has a fixed shape:

| Field | Type | Notes |
|---|---|---|
| `value` | Shopify SellingPlan GID | Source selling plan passed to the app. Uses the `shopify/selling-plan` GID schema. |
| `inputSchema` | object | App-specific input fields. Do not declare `required` fields. |
| `outputSchema.properties.id` | Shopify SellingPlan GID | Result selling plan returned by `shopify.intents.response.ok`. |

For `import+bulk`, `value` is an array of SellingPlan GIDs and the output should return an array under `outputSchema.properties.ids`.

## Common pitfalls

- **Using `create` or `edit` with `shopify/selling-plan`.** Those verbs are reserved for Shopify-native Admin intents. Third-party app extensions use `import` or `import+bulk`.
- **Using the wrong meta-schema.** `import` requires `shopify-intent.json`; `import+bulk` requires `shopify-intent-bulk.json`.
- **Pointing at an application schema.** `value.$ref` must point to the SellingPlan GID schema, not an `application/*` schema.
- **Confusing `SellingPlan` with `SellingPlanGroup`.** This type resolves `gid://shopify/SellingPlan/...`. If your app operates on selling plan groups, raise that as a separate type in an [RFC discussion](../../discussions/categories/rfc).
- **Treating the URL `{id}` as a full GID.** When mapped as a `param`, Sidekick passes the bare tail ID into the URL path. Read the full GID from the intent payload if you need it.

## Related types

- **[`shopify/subscription-contract`](./shopify-subscription-contract.md)** — for importing the subscription contracts a selling plan produces.
- **[`shopify/product`](./shopify-product.md)** — for importing Shopify Product resources.
- **[`shopify/order`](./shopify-order.md)** — for importing Shopify Order resources.
