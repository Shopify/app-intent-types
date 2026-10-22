# `application/comparison-table`

Sidekick intent type for creating or editing a **merchant-authored comparison table** — a table the merchant writes to set their product or brand next to alternatives: one column per item compared ("Us", "Brand X", "Brand Y", or two of the store's own products), one row per criterion (free shipping, warranty, materials, price), and a short value in each cell ("Yes", "2 years", a rating). The app renders the table on the storefront, usually through a theme app block, and one table is often shown on many products at once.

This is **not** the shopper-side "compare products" widget, where shoppers tick products and the app builds a table on the fly from catalog data — that has no merchant-authored artifact to create or edit.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/comparison-table.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/comparison-table.json)

## When to register an intent for this type

Register an `application/comparison-table` intent when your app owns a comparison-table editor and the merchant needs to land in it.

Typical examples:

- A **comparison-table builder** registering `create` so "make a comparison table for the Hydrogen snowboard: us against the two brands we usually lose to, on warranty, shipping and price" opens the editor with the outline pre-filled.
- The same app registering `edit` so "open the comparison table on my snowboards and add a row for the 2-year warranty" opens the right table for the merchant to save the change.
- A **data extension** returning search results as resource links with `mimeType: "application/comparison-table"`, so "open the second one" routes to `edit`, and "our shipping is free from today — update every table that says otherwise" can stage updates table by table.

The intent opens the app's editor with the outline. Nothing is saved or shown on the storefront until the merchant saves in the app.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open comparison table"
description = "Open or edit a merchant-authored comparison table"
handle = "open-comparison-table"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/tables/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/comparison-table"
  action = "edit"
  schema = "./comparison-table-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; both may open the same editor — `create` covers a table that doesn't exist yet.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./comparison-table-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The comparison table identifier, for example gid://application/comparison-table/466",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/comparison-table.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Merchant-facing name of the table"
      },
      "placement": {
        "type": "string",
        "description": "The kind of storefront page the table appears on",
        "enum": ["product", "collection", "home", "page"]
      },
      "columns": {
        "type": "array",
        "description": "The items compared, in display order",
        "items": {
          "type": "object",
          "properties": {
            "label": { "type": "string", "description": "Column heading, for example the brand name" },
            "product": { "type": "string", "description": "Shopify Product GID when the column is one of the store's products" }
          }
        }
      },
      "rows": {
        "type": "array",
        "description": "The criteria, in display order",
        "items": {
          "type": "object",
          "properties": {
            "label": { "type": "string", "description": "The criterion, for example 'Warranty'" },
            "cells": {
              "type": "array",
              "description": "Plain-text value for each column, in column order, for example 'Yes' or '2 years'",
              "items": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

For `create`, use the same shape but omit `value` — there is no table to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The comparison table ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `title` — a merchant-facing name for the table
- `placement` — the kind of storefront page the table appears on (`product`, `collection`, `home`, `page`); a list if one table shows on several page kinds
- `columns` — the items compared, in display order, each with a `label` and optionally the Shopify Product GID when the column is one of the store's products
- `rows` — the criteria, in display order, each with a `label` and plain-text `cells` per column

`columns` and `rows` are an outline for Sidekick to prefill, not the app's document model: templates, icons, colors, tooltips and links stay in the app. Which products or collections show the table is app-specific and belongs in each app's `inputSchema`.

## Common pitfalls

- **Building the shopper-side compare widget on this type.** If shoppers tick products and the app assembles the table on the fly from catalog data, there is no merchant-authored artifact to create or edit — this type is not it.
- **Waiting for an `open` action.** There isn't one. `edit` *is* the open contract: it navigates the merchant to your `url` with the table's identifier substituted, and nothing forces that page to be an editor.
- **Conflating the table with a page.** A comparison table has its own identity and is often reused across many product and collection pages; a page builder's comparison section is part of a single page. The two compose — a page builder can embed a table, but the table remains the artifact this type opens.
- **Confusing the table with product specifications.** A specification describes one product's own attributes; a comparison table sets several items side by side. A specification app's data can feed a table's cells, but the artifacts differ.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/comparison-table"` and the table's URI, or "open the second one" after a search has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. The pattern is "schema describes the shape, Sidekick collects the data."

## Related types

- **[`application/faq`](./application-faq.md)** — for question/answer pairs. An FAQ is a list, not a grid of items side by side.
- **[`application/quote`](./application-quote.md)** — for B2B sales quotes. A quote prices one offer; a comparison table lays several items side by side on the storefront.

## Discussion history

- Original proposal: [#50 — application/comparison-table: create and edit merchant-authored comparison tables](../../discussions/50)
