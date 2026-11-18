# `application/product-fee`

Sidekick intent type for the **fees a product carries**: the mandatory charges an app attaches to a product, such as bottle and container deposits (Pfand, CRV), recycling and eco fees, tariffs, and handling fees.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-fee.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product-fee.json)

## When to register an intent for this type

Register an `application/product-fee` intent when your app attaches fees to products and can open one product's fee setup with a change pre-filled: which fees the product carries, how many units of each, and on which variants.

The artifact is the product's fee setup, not the fee itself. In this category a fee is usually a Shopify product, created once and attached to many products: creating one is [`shopify/product`](./shopify-product.md) with `import`, and changing its amount happens in Shopify's product editor. This type covers attaching fees to a product, which is app-owned data about that product.

Typical examples:

- "Add the 0.25 € deposit to the cola cans" opens a deposit app's fee setup for that product, with the deposit pre-filled on all its variants.
- "The 12-pack needs the crate deposit and twelve bottle deposits" stages two fees on one variant in a single hand-off.
- "Put the recycling fee on the new TV, two per item" works the same way in a fees app.
- "Remove the deposit from the gift set" opens the gift set's fee setup with the removal staged.

The merchant reviews and saves in your UI. Sidekick hands off the request; it doesn't attach the fee itself.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Product fees"
description = "Add, change, or remove the deposits and fees a product carries"
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
2. **`action`** is `create` or `edit`. Required. Register one block per action. Both open the same product's page: `create` when the product carries no fee yet, `edit` when it already does.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./product-fee-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The Shopify Product GID of the product whose fee setup is opened, for example gid://shopify/Product/123",
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

`value` is the Shopify Product GID of the product whose fee setup is opened. A fee setup has no identity apart from its product, so the product identifies it. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the GID's bare tail into the `{id}` placeholder, so `gid://shopify/Product/123` opens `/fees/123`. `create` uses the same schema and also passes the Product GID in `value`: the product already exists, it just carries no fee yet. Without a filled `value`, the `{id}` placeholder isn't substituted.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The product whose fee setup is edited, as a Shopify Product GID. Pass it in top-level `value` for `edit`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions/categories/rfc) to push for any of these):

- `fees` — array of `{fee_id, quantity}`: the fees to add or change, as a patch. Fees not listed stay as they are, and `quantity: 0` removes one. For deposit apps, `fee_id` is the GID of the deposit product.
- `variant_ids` — limit the change to these variants. Omitted means every variant, the common case (one deposit across all flavours or sizes).
- `product_ids` — attach one fee to several products in one hand-off ("put the deposit on all my cans"). Today that's your app's own bulk flow.
- `kind` on a fee entry (`deposit`, `eco_fee`, `tariff`, `handling`) — a routing hint when the merchant names the kind of fee but not the fee.

The fee's own name, amount, currency, tax treatment, and cart display belong to the fee, not to a product's fee setup, so they aren't part of this type.

## Common pitfalls

- **Reading `fees` as the complete list.** Treat it as a patch: an empty list changes nothing, and a fee is removed only by an explicit `quantity: 0`.
- **Sending the fee's amount here.** "Change the crate deposit to 3.30" edits the fee, not a product's fee setup. When the fee is a Shopify product, that's the product editor.
- **Using a different identity for the same setup.** `value` is the Product GID for `edit`. Don't add a second fee-setup ID under `inputSchema.properties`.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `uri: "gid://shopify/Product/123"` and `mimeType: "application/product-fee"`, or "remove it" has nothing to invoke.
- **Omitting `fieldName` on `value`.** On `admin.app.intent.link` targets, a `value` mapped to `param` or `query_param` always needs one: unlike an `inputSchema` property, it has no key to fall back to.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Treating the intent as a write API.** Sidekick opens your page with the change pre-filled and the merchant saves. Show the product's complete current fee setup, not only the change.

## Related types

- **[`shopify/product`](./shopify-product.md)** — imports Shopify products into an app workflow. It can create the fee product itself; it doesn't attach a fee to another product.
- **[`application/fee-configuration`](./application-fee-configuration.md)** — a fee or surcharge your app applies to a cart or checkout by its own conditions, such as a handling fee or a cash-on-delivery surcharge. A product fee is attached to a specific product and travels with it.
- **[`application/product-specification`](./application-product-specification.md)** — another type for app-owned data about one product, identified by that product. It describes the product; it doesn't add charges.

## Discussion history

- Original proposal: [PR #25 — Add application/product-fee intent type](https://github.com/Shopify/app-intent-types/pull/25)
