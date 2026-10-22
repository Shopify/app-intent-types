# `application/product-specification`

Sidekick intent type for creating or editing a product's **structured specification data** — the app-owned descriptive data about one product that Shopify's product object does not model: fabric composition with percentages, care instructions, fit and model measurements, size-chart data, construction, sustainability and origin. The same shape fits other verticals such as nutrition and allergens, electronics specifications, material and dimension sheets, and compliance data.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-specification.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-specification.json)

## When to register an intent for this type

Register an `application/product-specification` intent when your app owns a per-product specification editor: the specification data lives in your app, with your validation and review step, and the merchant needs to land in that editor for a named product.

Typical examples:

- A **product specification app** registering `edit` so "open the specification for the green kurta" takes the merchant straight to that product's specification in the app's editor.
- A **fashion product data app** registering `create` so "set the fabric on the Banarasi silk saree to 70% silk, 30% zari" opens a specification editor for a product that has none yet, with the change pre-filled for the merchant to review and save.
- A **size-chart or product-attribute app** registering `edit` so "fill in the missing model size" opens the right record for that product.

The intent opens your app's UI. It never writes the data by itself: any change is staged in your form and the merchant reviews and saves it there. Bulk work ("add dry-clean care to all my sarees") stays in your app's own bulk flow — this type opens one product's editor per invocation.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open product specification"
description = "Open or edit a product's structured specification"
handle = "open-product-specification"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/specifications/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/product-specification"
  action = "edit"
  schema = "./product-specification-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; both may open the same page — `create` covers a product that has no specification yet.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./product-specification-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The Shopify Product GID of the product whose specification is opened, for example gid://shopify/Product/123456",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-specification.json",
    "type": "object",
    "properties": {
      "focus": {
        "type": "string",
        "description": "The part of the specification to focus on, such as fabric or care"
      }
    }
  }
}
```

`value` identifies the product being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the identifier and substitutes the bare tail into the `{id}` placeholder, so `/specifications/{id}` opens the editor for that product. A specification has no identity apart from its product, so apps commonly carry the product's identifier here — many use the Shopify Product GID, but the value is a string supplied by the app. If your app keeps one specification record per product type, declare optional prefill fields (for example `category_id`) in your own `inputSchema` so the merchant's sentence can name which record to open; without them, your app decides which record to show.

For `create`, use the same shape but omit `value` — there is no specification to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The product specification ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `title` — a name for the specification record
- `category` — the product category the specification describes
- `attributes` — a structured list of specification attributes

## Common pitfalls

- **Waiting for an `open` action.** There isn't one. `edit` *is* the open contract: it navigates the merchant to your `url` with the product's identifier substituted, and nothing forces that page to be an editor.
- **Expecting bulk.** `application/*` types have no `+bulk` variant. Route "apply this to all my sarees" through your app's own bulk flow.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/product-specification"` and the product's URI, or "fix the first one" after an audit has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Storing the data in Shopify instead of your editor.** Product metafields can hold specification values, but they don't provide your editor, validation, or review step. Register this type so the merchant lands where the data is actually maintained — and write metafields from your editor if that is where the values belong.

## Related types

- **[`shopify/product`](./shopify-product.md)** — for importing one or more Shopify products into an app workflow and returning Product GIDs. A specification app writes its own data instead of producing a product.
- **[`application/review`](./application-review.md)** — for product reviews. Customer opinions about a product are a different artifact from its specification data.

## Discussion history

- Original proposal: [#45 — application/product-specification — create and edit a product's structured specification data](../../discussions/45)
