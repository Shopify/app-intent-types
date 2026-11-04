# `application/product-fee`

Sidekick intent type for the **fees a product carries**: mandatory charges an app attaches to a product, such as bottle and container deposits (Pfand, CRV), recycling and eco fees, tariffs and handling fees.

- **Status:** 🚧 Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-fee.json` *(pending publication, draft inline below)*

## When to register an intent for this type

Register an `application/product-fee` intent when your app attaches fees to products and can open a product's fee setup with a change pre-filled: which fees the product carries, how many units of each, on which variants.

The fee itself is a separate resource. In this category it is usually a Shopify product, created once and attached to many products, so creating one is `shopify/product` with `import` and changing its amount is Shopify's native product editor. What the catalog cannot express is attaching it to a product. That is this type.

Typical examples:

- "Add the 0.25 € deposit to the cola cans": a deposit app opens the product's fee setup with the deposit pre-filled on all ten flavour variants, one Save.
- "The 12-pack needs the crate deposit and twelve bottle deposits": two fees on one variant in a single hand-off.
- "Put the recycling fee on the new TV, two per item": a fees app, same shape.
- "Remove the deposit from the gift set".

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-07"

[[extensions]]
name = "Product fees"
description = "Add, change or remove the deposits and fees a product carries"
handle = "product-fees"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/fees/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/product-fee"
  action = "edit"
  schema = "./product-fee-schema.json"

  [[extensions.targeting.intents]]
  type = "application/product-fee"
  action = "create"
  schema = "./product-fee-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Both open the same page: `create` when the product carries no fee yet, `edit` when it does. One block per action.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema once published and **must not declare `required` fields**; Sidekick collects missing fields from the merchant first.
4. **`target`** is `admin.app.intent.link` to navigate to the product's fee page you already render, or `admin.app.intent.render` to render a compact editor inline. The intent declaration is the same.

## Example: the input schema

`./product-fee-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "GID of the product whose fee setup is edited, for example gid://shopify/Product/123.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-fee.json",
    "type": "object",
    "properties": {
      "fees": {
        "type": "array",
        "description": "Fees to add or change on this product. Fees not listed stay as they are.",
        "items": {
          "type": "object",
          "properties": {
            "fee_id": {
              "type": "string",
              "description": "The fee to add or change, for example the GID of a deposit product"
            },
            "quantity": {
              "type": "integer",
              "description": "Units of the fee per unit of the product; 0 removes the fee",
              "minimum": 0
            }
          }
        }
      },
      "variant_ids": {
        "type": "array",
        "description": "Apply the change to these variants only. Omitted means every variant.",
        "items": { "type": "string" }
      }
    }
  }
}
```

`value` is the Shopify Product GID of the product whose fee setup is edited; the setup has no identity of its own. With `mapTo: "param"` and `fieldName: "id"`, `/fees/{id}` opens as `/fees/123`. `create` uses the same schema, because attaching a fee needs the product either way; if `value` is absent, the page lets the merchant pick one.

## Draft canonical schema

Identity only, like the published `application/quote` and `application/optimization-plan` schemas. Apps declare their pre-fill fields in their own `inputSchema.properties`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-fee.json",
  "title": "Product Fee Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The product whose fee setup is edited, as a Shopify Product GID"
    }
  },
  "additionalProperties": true
}
```

No `required` fields, per the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

## Fields the schema describes

**What the canonical schema captures:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The product whose fee setup is edited, as a Shopify Product GID. Travels as `value`. |

`additionalProperties: true`. Recommended names for the app-declared pre-fill fields, so the category shares one vocabulary:

| Field | Type | Notes |
|---|---|---|
| `fees` | array of `{fee_id, quantity}` | Fees to add or change. A patch, not the full list: fees not mentioned stay as they are, `quantity: 0` removes one. `fee_id` is the fee as the app knows it, for deposit apps the GID of the deposit product. |
| `variant_ids` | array of string | Limit the change to these variants. Omitted means every variant, the common case (one deposit across all flavours or sizes). |

**Fields deliberately left out**, because they belong to the fee, not to the product's fee setup: the fee's name, amount, currency and tax treatment, and how it is displayed in cart and checkout.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `product_ids`, to attach one fee to several products in one hand-off ("put the deposit on all my cans"). Today that is the app's own bulk flow.
- `kind` on a fee entry (`deposit`, `eco_fee`, `tariff`, `handling`), a routing hint when the merchant names the kind but not the fee.

## Common pitfalls

- **Reading `fees` as the complete list.** It is a patch: `fees: []` changes nothing, and a fee is removed only by an explicit `quantity: 0`.
- **Sending the fee's amount here.** "Change the crate deposit to 3.30" edits the fee, not a product's fee setup: the native product editor when the fee is a Shopify product, `shopify/product` with `import` to create a new one.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time.
- **Treating the intent as a write API.** Sidekick opens your page with the change pre-filled and the merchant saves. Show the product's complete current setup, not only the change.
- **Forgetting the resource-link `mimeType`.** Return a product's fee setup from your data extension as `uri: "gid://shopify/Product/123"`, `mimeType: "application/product-fee"`, current fees in `_meta`. That is what makes "open it" and "remove it" invokable.
- **Omitting `fieldName` on `value`.** On `admin.app.intent.link` targets a `value` mapped to `param` or `query_param` always needs one; unlike an `inputSchema` property it has no key to fall back to.

## Related types

- **[`shopify/product`](./shopify-product.md)**: `import` creates the fee product itself, Shopify's native admin intents edit it. Neither attaches a fee to another product: apps get no `edit` on Shopify resources, and a fee setup is app-owned data on the product.
- **`application/bundle`** *(proposed in [discussion #23](../../discussions/23))* composes products into a priced set. A fee is a charge on top of a product.
- **`application/delivery-rule`** and **`application/checkout-rule`** *(proposed in discussions [#12](../../discussions/12) and [#8](../../discussions/8))* are targeted rules with conditions. A product fee is a charge, and its target is one product.

## Discussion history

- Original proposal: *(this PR)*
- Schema v1 published: *(pending)*
