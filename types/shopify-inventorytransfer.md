# `shopify/InventoryTransfer`

Sidekick intent type for creating and editing **Shopify inventory transfers between locations** through an app-provided workflow.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Input baseline:** [`shopify/inventorytransfer.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/inventorytransfer.json)
- **GID schema:** [`shopify/inventorytransfer/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/inventorytransfer/gid.json)
- **RFC:** [Discussion #26](https://github.com/Shopify/app-intent-types/discussions/26)

## When to register an intent for this type

Register when your app creates or edits the Shopify [`InventoryTransfer`](https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryTransfer) resource, not a separate app-owned stock movement record.

Example merchant requests:

- "Create a transfer from the warehouse to the downtown store."
- "Open this inventory transfer in my inventory app."
- "Edit the draft transfer to the downtown store."

`create` opens a staged workflow for a new transfer. `edit` opens an existing transfer for review or changes. Neither action alone confirms shipment, receipt, or cancellation.

## Example: register the intent

Use separate URLs for create and edit. The create URL doesn't need a resource ID; the edit URL maps the primary `value` into `{id}`.

```toml
api_version = "2026-04"

[[extensions]]
name = "Manage inventory transfers"
handle = "inventory-transfers"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/transfers/new"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "shopify/InventoryTransfer"
    action = "create"
    schema = "./transfer-create.json"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/transfers/{id}"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "shopify/InventoryTransfer"
    action = "edit"
    schema = "./transfer-edit.json"
```

## Example: the schema

`./transfer-create.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/inventorytransfer.json",
    "type": "object"
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/inventorytransfer/gid.json"
      }
    }
  }
}
```

For `./transfer-edit.json`, use the same schema and add this top-level `value` declaration:

```json
{
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/inventorytransfer/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  }
}
```

This is an addition to the full schema, not a standalone registration file. For an invocation, `value` carries the full `gid://shopify/InventoryTransfer/<id>`; URL `param` mapping substitutes only the tail identifier.

## Fields the schema describes

| Field | Meaning |
|---|---|
| Top-level `value` | Optional primary InventoryTransfer GID; use it to identify the existing transfer for edit. |
| `inputSchema` | Minimal object baseline. Add optional provider-specific fields alongside the `$ref`; no shared prefill fields are prescribed. |
| `outputSchema.properties.id` | Declare the matching InventoryTransfer GID schema and return the resulting Shopify transfer ID on success. |

Don't duplicate the primary identity in `inputSchema.id`. Missing information is collected in the app UI; intent input fields must not be required.

## Common pitfalls

- **Using `shopify/transfer` or `shopify/inventory-transfer`.** Use `shopify/InventoryTransfer` to match the Shopify resource. Lookup is case-insensitive, but adding a hyphen changes the type.
- **Using import, bulk, or cancel actions.** This type supports only `create` and `edit`. Keep other operations in the opened workflow, with explicit merchant confirmation.
- **Using an app-owned string or a shipment GID as the transfer identity.** Use the actual Shopify InventoryTransfer GID.
- **Copying the GraphQL object into `inputSchema`.** It is an output resource model, not the intent's optional prefill contract.
- **Trusting prefill as authority.** Authorize the shop, staff, and referenced resources; reload current transfer state and validate transitions before mutation. See the GraphQL Admin API's [create](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryTransferCreate), [edit](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryTransferEdit), and [cancel](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryTransferCancel) requirements. Creating a transfer requires idempotency handling on supported API versions.
- **Treating workflow dismissal as transfer cancellation.** Closing the intent without saving doesn't cancel a persisted Shopify transfer.

## Related types

- [`application/shipment`](./application-shipment.md) describes app-owned shipment workflows, not the Shopify inventory-transfer resource.
- [`shopify/product`](./shopify-product.md) describes Product import workflows. Products and transfers have distinct resource identities and actions.
