# `application/invoice`

Sidekick intent type for creating or opening an app-owned **accounting invoice** — the invoice record that an invoicing, accounting, bookkeeping, or ERP app keeps for a sale, with its own number, status, and lifecycle.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json)

## When to register an intent for this type

Register an `application/invoice` intent when your app owns the invoice record and its lifecycle: it numbers invoices, tracks their status, and decides what can still change after one is issued.

Typical examples:

- "Create an invoice for order #1001" opens your new-invoice workflow with that order as its source.
- "Open invoice RE-123" opens that existing invoice.
- "Review this invoice before sending it" opens the invoice for the merchant to check and send from your app.

`create` opens a staged workflow for a new invoice. `edit` opens an existing invoice for review or permitted changes. A finalized invoice can be immutable, so an `edit` recipient can be a read-only view.

A Shopify order or draft order can be the source of an app invoice, but the source and the invoice remain different resources. This type also doesn't identify invoice templates or generic document print and export jobs.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open invoice"
description = "Open an app-owned invoice for review"
handle = "open-invoice"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/invoices/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/invoice"
  action = "edit"
  schema = "./invoice-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at your new-invoice workflow.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./invoice-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned invoice to open, for example gid://application/invoice/123",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/invoice.json",
    "type": "object",
    "properties": {
      "order_id": {
        "type": "string",
        "description": "The Shopify Order GID the invoice is created from, for example gid://shopify/Order/1001"
      }
    }
  }
}
```

`value` carries the existing invoice's identity for `edit`. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/invoice/123` opens `/invoices/123`. It's an app-owned identifier, not a Shopify resource GID. Don't add a second invoice ID to `inputSchema`. For `create`, omit `value` — no invoice exists yet.

`order_id` is an example of an app-declared prefill field. It identifies the source order, never the invoice.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The invoice ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI. This type doesn't standardize source fields, totals, line items, recipients, invoice status, or batch inputs and outputs.

## Common pitfalls

- **Adding lifecycle actions.** `create` and `edit` are the handoffs. Sending, resending, finalizing, retrying, and deleting belong in your app's controls or tools after the workflow opens, with explicit merchant confirmation before anything changes.
- **Expecting bulk.** `application/*` types have no `+bulk` variant, and this type doesn't define a shared source-ID array or batch results. Route "invoice all of yesterday's paid orders" through your app's own bulk flow; `shopify/order` import isn't a substitute for creating invoices.
- **Confusing the source with the invoice.** An Order GID identifies a source order, not the invoice to open.
- **Trusting prefill as financial authority.** Authorize access to every referenced resource, reload authoritative state, check for duplicates after an uncertain result, and show the invoice's state before confirmation.
- **Mutating on navigation.** Opening a workflow doesn't create, finalize, send, or delete an invoice. Re-read the resulting state before reporting success, and don't report success when only navigation happened.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/invoice"` and a stable `uri` for that invoice, or "open it" has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including for nested properties. Your app UI collects or verifies missing information.

## Related types

- **[`application/quote`](./application-quote.md)** — a sales quote negotiated before an order exists. An invoice bills for a sale.
- **[`application/packing-slip`](./application-packing-slip.md)** — the document listing what's in a package. It doesn't bill the buyer.
- **[`application/email`](./application-email.md)** — email campaigns. Sending an invoice is part of the invoice's own workflow, not an email campaign.
- **[`shopify/order`](./shopify-order.md)** — imports Shopify orders into an app workflow. It identifies a source order, not an app-owned invoice.

## Discussion history

- Original proposal: [#16 — application/invoice](https://github.com/Shopify/app-intent-types/discussions/16)
