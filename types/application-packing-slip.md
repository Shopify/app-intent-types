# `application/packing-slip`

Sidekick intent type for creating or opening an app-owned **packing slip** — the document that travels with a shipment and lists what is in the package.

- **Status:** Proposed; not yet available.
- **Actions:** `create`, `edit`.
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json), pending publication.

## When to register an intent for this type

Use this type when your document-generation, order-printing, warehouse, 3PL, or dropshipping app owns the packing slips it produces from Shopify orders or fulfillments.

Typical merchant requests:

- “Create a packing slip for order #1001.”
- “Make a packing slip for the second fulfillment on order #1001.”
- “Open the packing slip I created this morning.”

`create` opens a staged workflow for a new packing slip. `edit` opens an existing packing slip for review or permitted changes. A generated document can be immutable, so an `edit` recipient can provide a read-only view.

Printing and exporting aren't actions. The merchant prints or exports from inside your app's workflow, after reviewing the result. To add a print option directly to Shopify's Print menu on order pages, build an [admin print action extension](https://shopify.dev/docs/apps/build/admin/actions-blocks/build-admin-print-action) instead.

This type identifies one artifact: a packing slip. It doesn't identify Shopify's built-in packing slips, packing slip templates, or other order documents such as invoices, credit notes, or returns forms. Those are different artifacts with different lifecycles and should be proposed as their own types. A Shopify order or fulfillment can be a source for an app packing slip, but the source and the packing slip remain different resources.

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

  [[extensions.targeting.intents]]
  type = "application/packing-slip"
  action = "edit"
  schema = "./packing-slip-schema.json"
```

Register a separate `create` block targeting your new-packing-slip workflow if your app supports creation. You can also use `admin.app.intent.render` for an admin UI extension recipient.

## Example: the input schema

`./packing-slip-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned packing slip identifier to open.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/packing-slip.json",
    "type": "object"
  }
}
```

For `edit`, pass the existing packing slip's stable identifier in top-level `value`. Don't require a second packing slip ID in `data`. With the example mapping, an app-owned URI such as `gid://application/packing-slip/123` maps its identifier tail to `/packing-slips/123`. It isn't a Shopify resource GID. For `create`, omit `value` because no packing slip exists yet.

A data extension that returns packing slip resource links should use `mimeType: "application/packing-slip"` and a stable `uri` identifying that packing slip. The URI becomes `value` when the merchant opens it.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned packing slip ID, matching the minimal application schema convention. Invocation identity still belongs in top-level `value`. |

The canonical schema has `additionalProperties: true` and no required fields. Apps can declare optional provider-specific prefill properties in their extending `inputSchema`. To reference a source order in one of them, use the published [`shopify/order` GID schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/order/gid.json). This type doesn't standardize source IDs, document kinds, templates, destinations, page settings, locales, or batch inputs and outputs.

## Common pitfalls

- **Adding print or export actions.** `create` and `edit` are the handoffs. Printing, exporting, emailing, retrying, and deleting belong in contextual app controls or tools after the workflow opens, with explicit merchant confirmation before anything is generated or sent.
- **Expecting bulk support.** This proposal doesn't add `create+bulk`, a shared source-ID array, or a batch-results contract. Don't treat `shopify/order` import as a substitute for creating app-owned packing slips.
- **Using one type for many documents.** Don't add a `document_kind` discriminator to cover invoices, credit notes, quotes, or returns forms. Each artifact has its own identity and lifecycle.
- **Confusing source and packing slip identity.** An Order or Fulfillment GID identifies a source, not the app-owned packing slip to open.
- **Trusting prefill as authority.** Authorize access to every referenced order and fulfillment, reload authoritative items, quantities, and addresses, and show the result before confirmation. Packing slips contain customer data, so don't carry it in intent data.
- **Mutating on navigation.** Opening a workflow doesn't generate, print, export, or send a packing slip. Re-read the resulting state before reporting success, and don't report success when only navigation completed.
- **Requiring inputs.** Don't declare `required` anywhere in the intent's `inputSchema`. Your app UI collects or verifies missing information.
- **Assuming availability.** This branch is a proposal. Schema publication and platform support are required before apps can register the type.

## Related types

- [`shopify/order`](./shopify-order.md): imports Shopify orders; it doesn't identify app-owned packing slips.
- [`application/shipment`](./application-shipment.md): a package being sent, with carrier and tracking, not the document inside it.

## Discussion history

- Original proposal: [#35 — application/order-document](../../discussions/35), narrowed here to a single dedicated artifact.
