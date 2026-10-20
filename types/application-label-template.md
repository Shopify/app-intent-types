# `application/label-template`

Sidekick intent type for creating or opening a **reusable label design** owned by your app: a product, price, barcode, QR, or hangtag label template.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/label-template.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/label-template.json)

## When to register an intent for this type

Register this type when your app lets merchants create and edit saved label designs. The artifact is the reusable layout, not a printed label or a print job.

Typical examples:

- “Create a 2×1 price label template with a barcode.”
- “Open my hangtag template and make the barcode larger.”
- “Create a QR label design for product packaging.”

This type doesn't cover purchasing carrier shipping labels, creating invoice records, designing order-document templates, generating documents from orders, or running a batch print job. If the merchant only says “print labels” or “edit my template,” clarify what they want to print or which saved design they mean rather than assuming they want to create a label template.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Edit label template"
description = "Open a saved product, barcode, price, QR, or hangtag label design"
handle = "edit-label-template"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/label-templates/{id}"

  [[extensions.targeting.intents]]
  type = "application/label-template"
  action = "edit"
  schema = "./label-template-schema.json"
```

Register one intent per supported action. For `create`, use a target that opens a new design workflow and a schema without `value`; no existing template is selected yet. You can also use `admin.app.intent.render` for an admin UI extension.

## Example: the input schema

`./label-template-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned label template identifier to open or edit.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/label-template.json",
    "type": "object"
  }
}
```

The top-level `value` identifies the saved template. With the mapping above, its identifier fills `{id}` in your app's URL. An app-owned template identifier isn't a Shopify Product or ProductVariant GID: those resources can supply data for a preview, but they aren't the design being edited.

## Fields the schema describes

The canonical schema is deliberately small:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned label template ID, following the application schema convention. |

The baseline uses JSON Schema 2020-12, has no `required` fields, and sets `additionalProperties: true`. In your intent registration, use top-level `value` for the primary edit identity; you don't need to duplicate it in `inputSchema.properties`.

Suggested names, dimensions, units, design elements, symbology, and preview bindings are provider-specific. Declare optional fields in your app's extending `inputSchema` only when your editor can use them. There is no shared geometry, resource binding, or `kind` enum in the canonical schema.

## Common pitfalls

- **Treating a template as a print run.** “Print labels for these products” doesn't create or edit a reusable design. Printing and batch selection belong in a separately supported workflow or tools exposed by the opened app, not a new action on this type.
- **Using a carrier shipment as a placeholder.** Product and barcode label designs aren't shipment records or purchased carrier labels.
- **Adding a `print`, `save`, or `open` action.** This type supports only `create` and `edit`; `edit` also opens an existing design. In-page operations belong in app controls or registered tools.
- **Sending the full design in the URL.** Keep handoff hints compact. Use the app's editor and tools for design content rather than transporting raw geometry or large batches in query parameters.
- **Trusting identifiers or prefill.** Authenticate the shop and staff member, authorize access to the selected template and any referenced Shopify resources, and reload authoritative state. A GID alone doesn't grant access.
- **Saving or printing on invocation.** Open a reviewable workflow. Show the design and require explicit merchant confirmation before saving, printing, or starting chargeable work.
- **Requiring input fields.** Don't declare `required` in an intent's `inputSchema`. The app's UI must handle missing information.
- **Returning an unrelated resource link.** Use `mimeType: "application/label-template"` and a stable app-owned template URI in data-tool resource links so a later “open it” can resolve to the same saved design.

## Related types

- **[`application/shipment`](./application-shipment.md)** — shipment records and carrier-label workflows, not product-label designs.
- **[`shopify/product`](./shopify-product.md)** — imports Shopify products. Printing labels for products that already exist isn't a product import, and a Product GID doesn't identify a label template.

## Discussion history

- Original proposal: [#13 — Printable label design apps](../../discussions/13).
