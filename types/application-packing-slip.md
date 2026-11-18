# `application/packing-slip`

Sidekick intent type for creating or opening an app-owned **packing slip** — the document that travels with a shipment and lists what is in the package.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json)

## When to register an intent for this type

Register an `application/packing-slip` intent when your document-generation, order-printing, warehouse, 3PL, or dropshipping app owns the packing slips it produces from Shopify orders or fulfillments.

Typical examples:

- "Create a packing slip for order #1001" opens your new-packing-slip workflow for that order.
- "Make a packing slip for the second fulfillment on order #1001" opens the same workflow scoped to that fulfillment.
- "Open the packing slip I created this morning" opens that existing packing slip.

`create` opens a staged workflow for a new packing slip. `edit` opens an existing packing slip for review or permitted changes. A generated document can be immutable, so an `edit` recipient can be a read-only view.

Printing and exporting aren't actions. The merchant prints or exports from inside your app's workflow, after reviewing the result. To add a print option to the Print menu on Shopify order pages, build an [admin print action extension](https://shopify.dev/docs/apps/build/admin/actions-blocks/build-admin-print-action) instead.

This type identifies one artifact: your app's packing slip. Other order documents, such as invoices, credit notes, or returns forms, have their own identities and lifecycles. A Shopify order or fulfillment can be the source of a packing slip, but the source and the packing slip remain different resources.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open packing slip"
description = "Open an app-owned packing slip for review"
handle = "open-packing-slip"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/packing-slips/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/packing-slip"
  action = "edit"
  schema = "./packing-slip-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at your new-packing-slip workflow.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./packing-slip-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned packing slip to open, for example gid://application/packing-slip/123",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json",
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "The Shopify Order GID the packing slip is created from, for example gid://shopify/Order/1001"
      }
    }
  }
}
```

`value` carries the existing packing slip's identity for `edit`. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/packing-slip/123` opens `/packing-slips/123`. It's an app-owned identifier, not a Shopify resource GID. Don't add a second packing slip ID to `inputSchema`. For `create`, omit `value` — no packing slip exists yet.

`order_id` is an example of an app-declared prefill field. It identifies the source order, never the packing slip. If you accept one, use the published [`shopify/order` GID schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/order/gid.json) as its shape.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The packing slip ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI. This type doesn't standardize source IDs, templates, destinations, page settings, locales, or batch inputs and outputs.

## Common pitfalls

- **Adding print or export actions.** `create` and `edit` are the handoffs. Printing, exporting, emailing, retrying, and deleting belong in your app's controls or tools after the workflow opens, with explicit merchant confirmation before anything is generated or sent.
- **Expecting bulk.** `application/*` types have no `+bulk` variant, and this type doesn't define a shared source-ID array or batch results. Route "packing slips for all of today's orders" through your app's own bulk flow.
- **Using one type for many documents.** Don't add a `document_kind` discriminator to cover invoices, credit notes, quotes, or returns forms. Each document has its own identity and lifecycle; invoices are [`application/invoice`](./application-invoice.md).
- **Confusing the source with the packing slip.** An Order or Fulfillment GID identifies a source, not the packing slip to open.
- **Trusting prefill as authority.** Authorize access to every referenced order and fulfillment, reload the authoritative items, quantities, and addresses, and show the result before confirmation. Packing slips contain customer data, so don't carry it in intent data.
- **Mutating on navigation.** Opening a workflow doesn't generate, print, export, or send a packing slip. Re-read the resulting state before reporting success, and don't report success when only navigation happened.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/packing-slip"` and a stable `uri` for that packing slip.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including for nested properties. Your app UI collects or verifies missing information.

## Related types

- **[`application/invoice`](./application-invoice.md)** — an app-owned accounting invoice record. An invoice bills the buyer; a packing slip lists what's in the package.
- **[`application/shipment`](./application-shipment.md)** — a package being sent, with carrier and tracking. A packing slip is the document inside it.
- **[`application/label-template`](./application-label-template.md)** — reusable label designs for products, prices, and barcodes. A packing slip is a document generated for one order or fulfillment.
- **[`shopify/order`](./shopify-order.md)** — imports Shopify orders into an app workflow. It identifies a source order, not an app-owned packing slip.

## Discussion history

- [RFC #35](https://github.com/Shopify/app-intent-types/discussions/35) originally proposed `application/order-document`, one type for several kinds of order documents. This entry covers one dedicated artifact, the packing slip, because each document has its own identity and lifecycle.
