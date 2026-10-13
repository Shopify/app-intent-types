# `application/bundle`

Sidekick intent type for creating or editing a **bundle**: an app-owned offer that sells a group of products together at a bundle price, often as packs the shopper fills ("pick 3 or 6"), sometimes with a subscription or a free gift.

- **Status:** Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/bundle.json` (to be published)

Also called: product bundle, build-your-own box, mix and match, kit, multipack, volume pack, subscription box, gift set.

## When to register an intent for this type

Register an `application/bundle` intent when your app owns bundle definitions that a merchant creates and edits: which products go in, how many the shopper picks, and what the bundle costs. This is the shape shared by bundle builders, build-your-own box apps, subscription box apps, kit and multipack apps, and gift set builders.

The bundle itself is yours. The product the shopper buys usually exists in Shopify, but the rules around it do not. Shopify's native bundles (`productBundleCreate`, components on a variant) cover fixed components at a fixed price. Bundle apps add what has no Shopify object:

- shopper choice: packs, sections, minimums and maximums;
- pricing rules: price per pack, percentage off, sum of the items;
- subscriptions with discounts that change over time;
- rewards such as a free gift at a given pack size;
- how the bundle becomes cart lines and is grouped at checkout.

That gap is what this type covers. Merchants describe bundles in one sentence, which is what Sidekick is good at:

- A **bundle builder** registering `create` so "make a starter kit with the shampoo, conditioner and brush for $49" opens a new bundle pre-filled with those products and that price.
- A **build-your-own box app** registering `edit` so "add the new hazelnut blend to my coffee box" opens that box with the product staged for review.
- A **subscription box app** registering `create` so "a monthly box of 6 coffees, 10% off when they subscribe" opens a new box with the pack size and the subscription discount filled in.

## Example: register the intent

In your extension's `shopify.extension.toml`, one block per action:

```toml
[[extensions]]
name = "Edit bundle"
description = "Open a bundle in the bundle editor to change its products, packs, pricing, subscription or gifts"
handle = "edit-bundle"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/bundles/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/bundle"
  action = "edit"
  schema = "./bundle-edit-schema.json"

[[extensions]]
name = "Create bundle"
description = "Start a new bundle from the products, pack sizes and price the merchant describes"
handle = "create-bundle"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/bundles/create"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/bundle"
  action = "create"
  schema = "./bundle-create-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields**: Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to the editor you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./bundle-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the bundle to open, for example gid://application/bundle/51.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/bundle.json",
    "type": "object",
    "properties": {
      "products": {
        "type": "array",
        "description": "Products to add to the bundle",
        "items": {
          "type": "object",
          "properties": {
            "product_id": { "type": "string", "description": "Product GID" },
            "variant_ids": { "type": "array", "items": { "type": "string" }, "description": "Variant GIDs the shopper may pick; all variants when omitted" },
            "quantity": { "type": "integer", "minimum": 1, "description": "How many of this product a fixed bundle contains" }
          }
        }
      },
      "brief": {
        "type": "string",
        "description": "The merchant's request in their own words"
      }
    }
  }
}
```

`value` carries the bundle being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the bare tail of the GID into `{id}`, so `/bundles/{id}/edit` opens as `/bundles/51/edit`. For `create`, omit `value`: there is no bundle to open yet.

## Draft canonical schema

What `application/bundle.json` would hold, following `application/quote`: only the identifier is fixed, every other field is the app's.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/bundle.json",
  "title": "Bundle",
  "description": "An app-owned bundle: products sold together at a bundle price, often as packs the shopper fills.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The bundle ID, for edit actions."
    }
  },
  "additionalProperties": true
}
```

## Fields the schema describes

**What the canonical schema captures:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The bundle ID. Used for `edit` actions. |

`additionalProperties: true`, following `application/quote`: declare your own prefill fields in your `inputSchema.properties`, as in the example above.

**Common fields proposed for inclusion**, the model bundle apps share ("products, grouped into what the shopper picks, sold at a bundle price"):

| Field | Type | Notes |
|---|---|---|
| `title` | string | The bundle's name |
| `kind` | string | `fixed`, `build_your_own`, or an app-defined value |
| `products` | array of `{product_id, variant_ids, quantity}` | Products in the bundle, or the pool the shopper picks from |
| `packs` | array of `{size, min_size, price}` | Pack sizes the shopper can fill, for example 3 or 6 |
| `pricing` | `{type, value}` | `type` is `items`, `percentage` or `fixed` |
| `subscription` | `{plans: [{interval, interval_count, discount}]}` | Optional, for bundles sold on subscription |
| `rewards` | array of `{product_id, variant_id, offer}` | Free gifts or discounted add-ons, for example a gift at 6 items |
| `brief` | string | The merchant's own words |

Field names are snake_case, matching the neighbouring types.

## Common pitfalls

- **Expecting `duplicate`, `preview`, `publish` or `pause` actions.** Every `application/*` type supports exactly `create` and `edit`. Those verbs are operations on a bundle that is already open: declare them in `tools.json` and register them from the editor route with `shopify.tools.register`. They run while the merchant is on the page and stage into your own review UI. "Duplicate my coffee box" opens the box with `edit`, then calls your `duplicate_bundle` tool.
- **Saving straight from the intent.** The intent navigates the merchant into your editor with the payload pre-filled. Stage the change as an unsaved edit the merchant reviews and saves; a bundle change reprices products on a live storefront.
- **Using `shopify/product` for the bundle.** The bundle's product is a Shopify product, but importing it does not carry the packs, pricing rules or rewards. Keep `shopify/product` for importing products *into* a bundle; the bundle itself is `application/bundle`.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/bundle"` and `uri: "gid://application/bundle/51"`.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including `required` nested inside `products` or `packs`.

## Related types

- **[`shopify/product`](./shopify-product.md)**: for importing existing products. A bundle *contains* products and usually *is sold as* one, but its rules are app-owned.
- **`shopify/Discount`**: a discount applies to what is already in the cart. A bundle defines what goes into the cart and at what price; a bundle app may create a discount to price it, but the merchant edits the bundle, not the discount.
- **`application/upsell`** (proposed in [#32](https://github.com/Shopify/app-intent-types/pull/32)): a rule-triggered offer shown during the buying journey. A bundle is the product offer itself, sold on its own page; an upsell may *offer* a bundle, but they are different artifacts.
- **[`application/campaign`](./application-campaign.md)** and **[`application/ad`](./application-ad.md)**: promote things that already exist, such as a bundle.

Names considered and rejected: `application/kit` (too narrow), `application/box` (implies subscription boxes), `application/product-bundle` (longer without being clearer).

## Discussion history

- Original proposal: [#34: application/bundle](https://github.com/Shopify/app-intent-types/discussions/34)
