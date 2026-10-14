# `application/upsell`

Sidekick intent type for creating or editing an **upsell offer or offer funnel** — a merchant-facing, app-owned product offer shown to shoppers at a point in the buying journey, where they can accept or decline it.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json)

## When to register an intent for this type

Register an `application/upsell` intent when your app owns offer or funnel records that a merchant creates and later changes. A create intent can open your offer builder with optional details from the merchant's request, while an edit intent opens an existing offer or funnel in your app.

The offer or funnel is app-owned. It can reference [Shopify products and variants](https://shopify.dev/docs/api/admin-graphql/latest/objects/Product), but no Shopify product resource represents the offer, its shopper-facing presentation, or its acceptance flow. Shopify-native complementary product recommendations are separate; register this type only for offers or funnels your app owns.

Typical examples:

- A **post-purchase upsell app** registering `create` so "create a post-purchase offer for my best-selling candle with 10% off" opens a new offer builder.
- A **cart drawer app** registering `create` so "add a cart drawer offer for customers whose cart is over $50" opens its builder for the merchant to finish the setup.
- A **funnel app** registering `edit` so "change the discount on my thank-you page offer to 15%" opens that existing offer.
- An **offer app** registering `edit` so "pause my Black Friday funnel" opens the existing funnel, where an in-page tool stages the change for the merchant to save.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Create upsell"
description = "Start an upsell offer or funnel"
handle = "create-upsell"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/upsells/new"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/upsell"
  action = "create"
  schema = "./create-upsell-schema.json"

[[extensions]]
name = "Edit upsell"
description = "Open an existing upsell offer or funnel"
handle = "edit-upsell"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/upsells/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/upsell"
  action = "edit"
  schema = "./edit-upsell-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is exactly `create` or `edit`. Register at most one intent per action per app. If you support both actions, register one create intent and one edit intent, then let the merchant choose the placement and offer details in your UI.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type and must not declare `required` fields.
4. **`target`** is `admin.app.intent.link`, which hands the merchant off to a page your app renders. The create target uses a route without an ID; the edit target maps the existing offer or funnel ID into `{id}`.

## Example: the input schemas

`./create-upsell-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json",
    "type": "object"
  }
}
```

Create omits the top-level `value` because the offer does not have an ID yet. It lands on `/upsells/new`, where the merchant can finish configuring the offer or funnel.

`./edit-upsell-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The stable ID of the upsell offer or funnel to edit, for example gid://application/upsell/4417.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json",
    "type": "object"
  }
}
```

For edit, the top-level `value` identifies a stable app-owned offer or funnel. With `mapTo: "param"` and `fieldName: "id"`, a `gid://` URI's final segment is substituted into the `{id}` placeholder, so `gid://application/upsell/4417` opens `/upsells/4417`. Other strings are substituted unchanged. Do not duplicate this identity in `inputSchema`.

An app can add optional prefill properties under its own `inputSchema.properties`. Those properties remain app-defined and are not standardized as shared fields by this type.

## Canonical schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/upsell.json",
  "title": "Upsell Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The upsell ID"
    }
  },
  "additionalProperties": true
}
```

The canonical schema has no `required` fields.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The app-owned upsell offer or funnel ID. Used for `edit` actions. |

`additionalProperties: true` allows apps to declare optional, app-defined prefill fields in their local input schemas without adding those fields to the shared baseline.

## Common pitfalls

- **Registering one intent per placement or surface.** Register at most one intent for each supported action per app. Let the merchant choose the placement, products, and offer details in your provider UI.
- **Treating intents as commands.** `create` and `edit` hand the merchant off to your UI; they do not publish or pause an offer by themselves. Expose operations such as publish and pause as in-page tools declared in `tools.json` and registered with `shopify.tools.register`. Stage the change for the merchant to confirm with your own save flow, and enforce authorization in your app.
- **Forgetting the resource-link type and URI.** Return an actionable offer with `mimeType: "application/upsell"` and a stable URI such as `uri: "gid://application/upsell/4417"` so an edit intent can open the selected offer.
- **Declaring `required` in `inputSchema`.** Sidekick rejects required input fields at deploy time. Keep prefill fields optional and let the merchant complete them in your UI.
- **Applying changes during navigation.** Opening a create or edit route is not merchant confirmation. Review the staged change in your UI before saving it.

## Related types

- **[`shopify/product`](./shopify-product.md)** — use this to import a Shopify product into an app. An upsell can reference products by GID, but the offer or funnel remains an app-owned artifact.
- **[`application/campaign`](./application-campaign.md)** and **[`application/ad`](./application-ad.md)** — campaigns and ads reach audiences through marketing channels; an upsell is an offer presented during a shopper's buying journey.
- **[`application/quote`](./application-quote.md)** — a quote is a negotiated proposal between a merchant and buyer; an upsell is a shopper-facing product offer that can be accepted or declined.

## Discussion history

- Original proposal: [#32 — Add application/upsell intent type](https://github.com/Shopify/app-intent-types/pull/32)
