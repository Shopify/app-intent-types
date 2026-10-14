# `application/page`

Sidekick intent type for creating or editing a **page** whose content and layout are authored and maintained in an app, such as a page builder.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/page.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/page.json)

## When to register an intent for this type

Register an `application/page` intent when your app builds and maintains pages, such as landing pages, campaign pages, or About pages, and the merchant needs to return to your app to change them.

Typical examples:

- A page builder app registering `create` so Sidekick can hand off "build me a landing page for the summer collection launch" to a new page in your builder.
- A page builder app registering `edit` so Sidekick can open an existing page for "add a testimonials section to my Black Friday page".

Your app may publish the result as a Shopify page, but its sections and layout still live in your app, and Shopify's page editor can't change them. Register `edit` so Sidekick routes those changes back to your app.

The intent opens your app's UI. It does not publish or change a live page by itself; use tools in the opened page for review, confirmation, and publishing.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2025-04"

[[extensions]]
name = "Manage pages"
handle = "manage-pages"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/pages/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/page"
    action = "edit"
    schema = "./page-schema.json"
```

Register `create` separately when your app supports creating a new page. A create intent opens a new-page route and omits the top-level `value` because there is no existing page to identify.

## Example: the input schema

`./page-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The page ID to edit",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/page.json",
    "type": "object",
    "properties": {
      "template": {
        "type": "string",
        "description": "The page builder template to start from"
      }
    }
  }
}
```

`value` is the identity of the existing page for `edit`. Because it maps to the `{id}` URL parameter, it declares `fieldName: "id"`. The value is a string supplied by the app; it does not need to be a Shopify GID.

For `create`, use the same shape but omit `value`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/page.json",
    "type": "object",
    "properties": {
      "template": { "type": "string" }
    }
  }
}
```

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The page ID, used when editing an existing page. |
| `surface` | `"storefront"` \| `"customer-account"` | Where the page appears. |
| `title` | string | The page title. |
| `sections` | array of `{type, heading, body}` | The page's content sections, in display order. `type` names the kind of section, such as `hero`, `faq`, or `rich_text`. `body` is plain text. |

The surface is a field rather than part of the type name, so one type describes pages on any supported surface.

`sections` is a content outline that Sidekick can pre-fill from the merchant's request. It is not your app's document model: component trees, styles, breakpoints, and layout stay in your app.

`additionalProperties: true` allows apps to pass app-specific fields through their local `inputSchema`. Fields such as `handle`, `goal`, `products`, `status`, and `seo` are not standardized by this type yet; an app may define the fields it needs without treating them as part of the canonical contract.

## Common pitfalls

- **Putting the page ID in `inputSchema`.** Use the top-level `value` for the existing page's identity. Do not add a parallel `pageId` property.
- **Including `value` for `create`.** A new page has no existing identity, so create omits `value`.
- **Declaring `required` in `inputSchema`.** Sidekick collects missing fields from the merchant and rejects required fields at deploy time.
- **Publishing during navigation.** `create` and `edit` open the app UI; they do not publish or change a live page without merchant review and confirmation.
- **Sending rich text or markup in `body`.** `body` is plain text. Keep formatting and layout in your app.
- **Registering for an FAQ.** When the page is a set of questions and answers, use [`application/faq`](./application-faq.md).

## Related types

- **[`application/faq`](./application-faq.md)** — question-and-answer entries; use this when the merchant is creating or editing an FAQ rather than a page.
- **[`application/campaign`](./application-campaign.md)** — a coordinated marketing campaign with channels, audiences, or schedules; a page is often a campaign's destination, but most pages have no campaign behind them.
- **`application/legal-page`** (proposed RFC: [#41](https://github.com/Shopify/app-intent-types/discussions/41)) — legal and privacy pages that need specialist capabilities, such as regional policy generation or privacy-request handling.

## Discussion history

- Original proposal: [#17 — Page builder intent type](https://github.com/Shopify/app-intent-types/pull/17)
