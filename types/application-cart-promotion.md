# `application/cart-promotion`

Sidekick intent type for creating or editing an app-owned **cart promotion**: a reward program the merchant manages in your app that applies a benefit when a cart qualifies, such as a free gift above a spend threshold, a free sample with two items from a collection, or buy-one-get-one on a product line.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json)

## When to register an intent for this type

Register an `application/cart-promotion` intent when your app stores and edits a cart reward program independently of Shopify discounts: the program has its own identity in your app, its own editor, and its own conditions, benefit, and schedule. Gift-with-purchase, free-gift, BOGO, and tiered-offer apps are typical providers.

Typical examples:

- "Give a free tote bag to anyone who spends over ¥5,000 this weekend" opens your promotion editor with the gift, threshold, and dates staged for review.
- "Add a free sample when a customer buys 2 items from the Autumn collection" opens a new promotion with the condition pre-filled.
- "Extend the tote promotion until Sunday" opens that existing promotion through `edit` with the new end date staged.
- "Pause the holiday gift promotion" opens the promotion with the status change staged for confirmation.

A program can coordinate an app-managed gift line with a Shopify discount, but the resource this intent identifies is the program, not that discount. If the thing the merchant edits is a Shopify discount — including one your app backs with a Shopify Function — use the [`shopify/Discount` app intent](https://shopify.dev/docs/apps/build/sidekick/build-app-actions#create-and-edit-discounts-with-shopify-discount-intents) and its `gid://shopify/DiscountNode/{id}` identity instead.

The merchant reviews and saves in your UI. Sidekick hands off the request; it doesn't create the promotion or change any cart itself.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Edit cart promotion"
description = "Open or edit a cart reward program"
handle = "edit-cart-promotion"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/cart-promotions/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/cart-promotion"
  action = "edit"
  schema = "./cart-promotion-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at a static new-promotion page, such as `/cart-promotions/new`.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./cart-promotion-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned cart promotion to open, for example gid://application/cart-promotion/77",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Merchant-facing promotion name, such as Weekend free tote"
      }
    }
  }
}
```

`value` carries the existing promotion's identity for `edit`. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/cart-promotion/77` opens `/cart-promotions/77/edit`. It's your app's identifier, not a Shopify Discount GID, and it doesn't belong in `inputSchema` a second time. For `create`, omit `value` — there is no promotion to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The app-owned cart promotion ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions/categories/rfc) to push for any of these):

- `title` — merchant-facing promotion name
- `reward` — the benefit, such as gift product variant IDs and quantity, or a percentage or fixed amount off
- `conditions` — what qualifies a cart: subtotal, item quantity, collections, product or customer tags
- `starts_at` / `ends_at` — when the promotion runs
- `status` — active, paused, or scheduled

A gift referenced in your own fields can use its `gid://shopify/ProductVariant/{id}`. That GID identifies the gift product, not the promotion.

## Common pitfalls

- **Using this type for a Shopify discount.** If the merchant's primary editable thing is a discount, register [`shopify/Discount`](https://shopify.dev/docs/apps/build/sidekick/build-app-actions#create-and-edit-discounts-with-shopify-discount-intents) instead. Don't add a second app-owned identity for the same discount, and never invent a `gid://shopify/Promotion/{id}`.
- **Expecting `pause`, `activate`, `extend`, or `duplicate` actions.** Every `application/*` type supports exactly `create` and `edit`. `edit` opens the program; any change is staged in your UI or performed by your app's tools with merchant review.
- **Changing carts or prices on navigation.** Invoking the intent doesn't create a live promotion. Recheck the shop's access, product eligibility, limits, and current cart and discount state, and confirm with the merchant before saving. Make saves safe to retry.
- **Trusting prefill as authority.** Resolve the promotion within the current shop and authorize it yourself. Don't trust an ID, threshold, or cart total just because it arrived in the intent.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/cart-promotion"` with a stable `uri` for the program; links to Shopify discounts keep their discount GID and type.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including for nested properties. Your UI fills in missing details with the merchant.

## Related types

- **[`application/campaign`](./application-campaign.md)** — coordinated marketing sends across channels. A campaign can announce a promotion, but it isn't the cart reward.
- **[`application/loyalty-program`](./application-loyalty-program.md)** — rewards earned over time by customers. A cart promotion rewards a qualifying cart, on that order.
- **[`shopify/ProductBundle`](./shopify-productbundle.md)** — a product-backed bundle sold as one unit. A cart promotion adds a benefit to a cart that qualifies; it doesn't define a bundle.

## Discussion history

- [RFC #31](https://github.com/Shopify/app-intent-types/discussions/31) originally proposed `application/promotion`. This entry uses `application/cart-promotion` to make clear the reward applies to a qualifying cart, separate from marketing campaigns.
