# `application/cart-promotion`

**Proposed**, not yet supported. A Sidekick intent type for creating or editing an **app-owned conditional cart promotion**: a merchant-managed reward program that applies a benefit when a cart qualifies, such as an automatically offered gift above a threshold. The program must have its own app-owned identity and editor; a Shopify discount that the app backs with a Function is still a `shopify/Discount` resource.

- **Actions:** `create`, `edit`
- **Proposed schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json` (not published)
- **Origin:** [RFC #31](https://github.com/Shopify/app-intent-types/discussions/31), which proposed the broader `application/promotion` name. The cart qualifier makes the resource's purpose clearer and avoids conflating it with marketing campaigns.

## When to register

Register only if your app owns a persistent, independently editable program for conditional rewards in the cart. For example, “give shoppers a free tote if their cart exceeds ¥5,000 this weekend” can open the app's promotion editor with the benefit staged for merchant review. “Extend the tote promotion until Sunday” can open that same record through `edit` and stage the change. A program can coordinate an app-owned gift-line flow with a Shopify discount, but the *primary resource* identified by this intent is the program, not that discount.

Don't register this type for a single native or Function-backed Shopify discount: use the existing [`shopify/Discount` app intent](https://shopify.dev/docs/apps/build/sidekick/build-app-actions#create-and-edit-discounts-with-shopify-discount-intents) and its `gid://shopify/DiscountNode/{id}` identity instead. A shopper-accepted offer, a priced bundle with an attached gift, and a marketing send also describe different artifacts; choose the type of the thing the merchant is actually editing. This boundary still needs confirmation with the proposer and Discounts maintainers before publication.

## Example registration

In a `shopify.extension.toml`, use one registration per action and an app-owned editor route:

```toml
[[extensions]]
name = "Edit cart promotion"
handle = "edit-cart-promotion"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/cart-promotions/{id}/edit"
instructions = "./instructions.md"

[[extensions.targeting.intents]]
type = "application/cart-promotion"
action = "edit"
schema = "./cart-promotion-schema.json"
```

Register `create` separately with a static `/app/cart-promotions/new` URL, omitting `value` when no program exists. The schema file is an **app registration**, not the shared baseline:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "Stable identifier of this app's existing cart promotion",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json",
    "type": "object",
    "properties": {
      "brief": {
        "type": "string",
        "description": "Merchant's requested cart reward, to stage in the app's editor"
      }
    }
  }
}
```

`value` is the **primary existing program identity** for `edit`; it is not a Shopify Discount GID and does not belong in `inputSchema`. If an edit starts without a known ID, use a static selection route instead of `{id}`. Your app resolves the program within the current shop and authorizes it; it must not trust an ID or cart total supplied by Sidekick. The optional `brief` is only an illustration of a provider-defined prefill field.

## Draft shared baseline

The shared schema deliberately fixes only an optional identifier; app-specific benefit, conditions, schedule, and status fields can be declared by each app without freezing one rule DSL for every provider:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/cart-promotion.json",
  "title": "Cart Promotion Schema",
  "description": "An app-owned conditional cart reward, separate from a Shopify Discount resource.",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The app-owned cart promotion ID"
    }
  },
  "additionalProperties": true
}
```

| Shared field | Type | Meaning |
|---|---|---|
| `id` | optional string | App-owned program identifier. Use top-level `value` to open a specific program for edit. |

Examples of **provider-defined**, optional prefill are the merchant's natural-language brief, gift variant IDs, qualifying products/collections, thresholds, schedule, and desired status. These are not cross-app contract fields until real adopters establish shared semantics. A referenced gift variant may use `gid://shopify/ProductVariant/{id}`; that GID identifies the gift product, **not** the promotion. Never invent `gid://shopify/Promotion/{id}`.

## Common pitfalls

- `pause`, `activate`, `extend`, and `duplicate` are not additional intent actions. `edit` opens a program; any change is staged in the app's UI or performed by registered Activity tools with merchant review.
- Do not create a live financial or cart mutation merely by invoking the intent. Recheck shop/staff authorization, product eligibility, limits and current cart/discount state, and confirm before saving; make retries idempotent.
- No `required` fields in an intent `inputSchema`, including nested properties. The recipient fills in missing details with the merchant.
- If a data extension returns a program resource link, its `mimeType` should be `application/cart-promotion`, with a provider-controlled stable URI for the same program; `shopify/Discount` links keep the Shopify discount GID and MIME type.

## Related types

- [`application/campaign`](./application-campaign.md) coordinates marketing sends and channels, not a cart-qualification reward.
- [`shopify/Discount`](https://shopify.dev/docs/apps/build/sidekick/build-app-actions#create-and-edit-discounts-with-shopify-discount-intents) already supports native and app Function-backed discount flows. If the merchant's primary editable thing is the discount, do not add a second app-owned identity for it.
