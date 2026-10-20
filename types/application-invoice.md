# `application/invoice`

Sidekick intent type for creating or opening an app-owned accounting invoice record.

- **Status:** Proposed; not yet available.
- **Actions:** `create`, `edit`.
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json), pending publication.

## When to register an intent for this type

Use this type when your invoicing, accounting, bookkeeping, or ERP app owns the invoice record and its lifecycle.

Typical merchant requests:

- “Create an invoice for order #1001.”
- “Open invoice RE-123.”
- “Review this invoice before sending it.”

`create` opens a staged workflow for a new invoice. `edit` opens an existing invoice for review or permitted changes. Final invoices can be immutable, so an `edit` recipient can provide a read-only view.

This type doesn't identify Shopify Tax VAT invoices, Shopify's bills to merchants, draft-order payment-request emails, invoice templates, or generic document-printing and export jobs. A Shopify order can be a source for an app invoice, but the order and invoice remain different resources.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open invoice"
description = "Open an app-owned accounting invoice for review"
handle = "open-invoice"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/invoices/{id}"

  [[extensions.targeting.intents]]
  type = "application/invoice"
  action = "edit"
  schema = "./invoice-schema.json"
```

Register a separate `create` block targeting your new-invoice workflow if your app supports creation. You can also use `admin.app.intent.render` for an admin UI extension recipient.

## Example: the input schema

`./invoice-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned invoice identifier to open.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json",
    "type": "object"
  }
}
```

For `edit`, pass the existing invoice's stable identifier in top-level `value`. Don't require a second invoice ID in `data`. With the example mapping, an app-owned URI such as `gid://application/invoice/123` maps its identifier tail to `/invoices/123`. It isn't a Shopify resource GID. For `create`, omit `value` because no invoice exists yet.

A data extension that returns invoice resource links should use `mimeType: "application/invoice"` and a stable `uri` identifying that invoice. The URI becomes `value` when the merchant opens it.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned invoice ID, matching the minimal application schema convention. Invocation identity still belongs in top-level `value`. |

The canonical schema has `additionalProperties: true` and no required fields. Apps can declare optional provider-specific prefill properties in their extending `inputSchema`. This type doesn't standardize source-order fields, totals, line items, recipients, invoice status, or batch inputs and outputs.

## Common pitfalls

- **Adding lifecycle actions.** `create` and `edit` are the handoffs. Sending, resending, finalizing, retrying, and deleting belong in contextual app controls or tools after the workflow opens, with explicit merchant confirmation before mutation.
- **Expecting bulk support.** This proposal doesn't add `create+bulk`, a shared source-ID array, or a batch-results contract. Don't treat `shopify/order` import as a substitute for creating app-owned invoices.
- **Confusing source and invoice identity.** An Order GID identifies a source order, not the app-owned invoice to open. Don't label an app invoice as a Shopify `TaxInvoice` or billing invoice.
- **Trusting prefill as financial authority.** Authorize access to every referenced resource, reload authoritative state, check for duplicates after uncertain results, and show document state and any usage implications before confirmation.
- **Mutating on navigation.** Opening a workflow doesn't create, finalize, send, or delete an invoice. Re-read the resulting state before reporting success, and don't report success when only navigation completed.
- **Requiring inputs.** Don't declare `required` anywhere in the intent's `inputSchema`. Your app UI collects or verifies missing information.
- **Assuming availability.** This branch is a proposal. Schema publication and platform support are required before apps can register the type.

## Related types

- [`shopify/order`](./shopify-order.md): imports Shopify orders; it doesn't identify app-owned invoices.
- [`application/quote`](./application-quote.md): a pre-order sales quote or negotiation record, not an invoice.
- [`application/email`](./application-email.md): email campaigns, not an accounting invoice or its transactional delivery.

## Discussion history

- Original proposal: [#16 — application/invoice](../../discussions/16).
