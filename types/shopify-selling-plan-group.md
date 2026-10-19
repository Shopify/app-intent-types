# `shopify/selling-plan-group`

Sidekick intent type for creating or editing a Shopify selling plan group in an app's editor.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Input baseline:** [`shopify/selling-plan-group.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan-group.json)
- **GID schema:** [`shopify/selling-plan-group/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan-group/gid.json)
- **RFC:** [#7](https://github.com/Shopify/app-intent-types/pull/7)

## When to register an intent for this type

Register this type when your app provides an editor for a [Shopify SellingPlanGroup](https://shopify.dev/docs/api/admin-graphql/latest/objects/SellingPlanGroup). The group is the offer associated with products and variants. Its child `SellingPlan` objects define the billing, delivery, and pricing options.

Typical merchant requests:

- “Add a subscribe-and-save offer to my coffee beans.”
- “Add an every-two-months option to my existing coffee plan.”
- “Change the discount on my monthly subscription offer.”

Use `create` to open a new group workflow, and `edit` to open an existing group. Stage changes for the merchant to review and confirm. Invoking an intent doesn't itself publish the offer or change billing terms.

This type identifies the Shopify group, not an individual child selling plan, an app-local configuration with no Shopify group identity, or a customer's subscription contract.

## Example: register the edit intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-10"

[[extensions]]
name = "Edit subscription offer"
handle = "edit-subscription-offer"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/app/plans/{id}"

  [[extensions.targeting.intents]]
  type = "shopify/selling-plan-group"
  action = "edit"
  schema = "./selling-plan-group-edit-schema.json"
```

Register `create` on a new-group route. A create invocation normally omits the resource value because the group doesn't exist yet. The `value` declaration is optional registration metadata, so a schema can also be shared across create and edit. Both actions reference the same input baseline and return a SellingPlanGroup GID.

## Example: the edit schema

`./selling-plan-group-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan-group/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan-group.json",
    "type": "object"
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan-group/gid.json"
      }
    }
  }
}
```

The shared baseline is an extensible object with no prescribed business fields. Add optional app-specific prefill fields alongside `inputSchema.$ref`. Don't declare `required` fields in `inputSchema` or add a second resource ID there. Core doesn't require a `value` declaration. When an edit request doesn't identify a group, your app must resolve and authorize the group before applying changes.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `value` | SellingPlanGroup GID | Optional. Pass a known existing group for `edit`, such as `gid://shopify/SellingPlanGroup/123`. A new-group invocation normally omits it. |
| `inputSchema` | object | References the group baseline. Additional optional inputs belong to the app. |
| `outputSchema.properties.id` | SellingPlanGroup GID | Group returned through `shopify.intents.response.ok({id: groupGid})` after the workflow succeeds. |

## Common pitfalls

- **Confusing a group with a plan.** `gid://shopify/SellingPlan/123` identifies a child option, not the group. Use `gid://shopify/SellingPlanGroup/123` for this type.
- **Treating this as an import.** This type supports `create` and `edit`, not `import` or `import+bulk`.
- **Dropping hyphens from the type.** Use `shopify/selling-plan-group`, not `shopify/SellingPlanGroup`. Case-insensitive lookup doesn't remove hyphens.
- **Using the application meta-schema.** Use `shopify-intent.json`, with the matching input baseline and output GID reference.
- **Treating a GID as authorization.** Authenticate the shop and staff member, reload authoritative state, and check your app's permission to change the group. A type registration doesn't grant resource access.
- **Changing an offer when the editor opens.** Stage billing, pricing, and product-association changes and obtain merchant confirmation before applying them.
- **Reading a mapped path parameter as a full GID.** `mapTo: "param"` passes the bare tail ID into `{id}`. Use the intent request when you need the full GID.

## Related types

- **[`shopify/subscription-contract`](./shopify-subscription-contract.md)** — edits one customer's existing agreement, not the offer available to shoppers.
- **[`shopify/product`](./shopify-product.md)** — imports Shopify products, not an existing selling plan group.
