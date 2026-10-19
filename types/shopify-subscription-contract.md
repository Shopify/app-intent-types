# `shopify/subscription-contract`

Sidekick intent type for opening an existing Shopify subscription contract in its managing app to review or stage changes.

- **Status:** ✅ Supported
- **Actions:** `edit`
- **Input baseline:** [`shopify/subscription-contract.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract.json)
- **GID schema:** [`shopify/subscription-contract/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json)
- **RFC:** [#7](https://github.com/Shopify/app-intent-types/pull/7)

## When to register an intent for this type

Register this type when your app manages existing [Shopify SubscriptionContract](https://shopify.dev/docs/api/admin-graphql/latest/objects/SubscriptionContract) resources. A contract is one customer's ongoing agreement, not the offer that shoppers select on a product page.

Typical merchant requests:

- “Open this customer's subscription.”
- “Pause Jane's subscription.”
- “Skip the next delivery on this contract.”
- “Resume this subscription.”

`edit` opens the contract workflow. Pause, resume, and skip belong in the app's editing tools, not separate intent actions. Stage the proposed change and obtain merchant confirmation before applying it. Merely opening the contract must not change its status, charge a customer, or generate an order.

This type doesn't support contract creation, imports, or bulk editing.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-10"

[[extensions]]
name = "Edit subscription contract"
handle = "edit-subscription-contract"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/app/contracts/{id}"

  [[extensions.targeting.intents]]
  type = "shopify/subscription-contract"
  action = "edit"
  schema = "./subscription-contract-edit-schema.json"
```

## Example: the edit schema

`./subscription-contract-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract.json",
    "type": "object"
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

The shared baseline is an extensible object with no prescribed business fields. Declare optional app-specific inputs alongside `inputSchema.$ref`. Keep the existing contract's identity in `value`, not a second ID field in `inputSchema`. Don't declare `required` fields in `inputSchema`. Core doesn't require a `value` declaration. When an edit request doesn't identify a contract, your app must resolve and authorize the contract before applying changes.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `value` | SubscriptionContract GID | Optional. Pass a known existing contract, such as `gid://shopify/SubscriptionContract/123`. Otherwise, resolve it in the app before applying changes. |
| `inputSchema` | object | References the contract baseline. Additional optional inputs belong to the app. |
| `outputSchema.properties.id` | SubscriptionContract GID | Contract returned through `shopify.intents.response.ok({id: contractGid})` after the workflow succeeds. |

## Common pitfalls

- **Using `create`, `import`, or `import+bulk`.** Only `edit` is supported for this type.
- **Using a selling plan GID.** A customer's agreement has a `SubscriptionContract` identity, not a `SellingPlan` or `SellingPlanGroup` identity.
- **Using the application meta-schema.** Use `shopify-intent.json`, reference the contract input baseline, and return the matching GID.
- **Sending a contract to an arbitrary subscription app.** Route to the app managing that contract. The app must authenticate the shop and staff member, reload the contract, and enforce its resource permissions. The GraphQL Admin API's own-subscription-contract scopes don't grant access to another app's contracts.
- **Treating handoff as a billing command.** Billing, cancellation, and fulfillment changes need app-side authorization and explicit merchant confirmation before execution.
- **Reading a mapped path parameter as a full GID.** `mapTo: "param"` passes the bare tail ID into `{id}`. Use the intent request when you need the full GID.

## Related types

- **[`shopify/selling-plan-group`](./shopify-selling-plan-group.md)** — creates or edits the offer and its purchase options, not an individual customer's agreement.
- **[`shopify/order`](./shopify-order.md)** — imports Shopify orders, not a subscription contract.
