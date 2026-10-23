# `application/legal-page`

Sidekick intent type for creating or editing an app-managed **legal or privacy page**, such as a regional policy, privacy-request page, or withdrawal page.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/legal-page.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/legal-page.json)

## When to register an intent for this type

Register an `application/legal-page` intent when your app manages pages whose content exists to meet a privacy or consumer-protection requirement, and it has the specialist capabilities those pages need, such as generating regional policies or handling privacy requests.

Typical examples:

- A privacy app registering `create` so Sidekick can hand off "create the missing data request pages for my EU customers".
- A privacy app registering `create` for "add a Do Not Sell or Share page for California".
- A consumer-law app registering `edit` so Sidekick can open "the withdrawal page for my German customers" for changes.

The intent opens your app's UI. It does not publish or change a live page by itself; use tools in the opened page for review, confirmation, and publishing.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2025-04"

[[extensions]]
name = "Manage legal pages"
handle = "manage-legal-pages"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/legal-pages/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/legal-page"
    action = "edit"
    schema = "./legal-page-schema.json"
```

Register `create` separately when your app supports creating a new legal page. A create intent opens a new-page route and omits the top-level `value` because there is no existing page to identify.

## Example: the input schema

`./legal-page-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The legal page ID to edit",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/legal-page.json",
    "type": "object",
    "properties": {
      "regions": {
        "type": "array",
        "description": "Regions the page applies to, such as EU or US-CA",
        "items": { "type": "string" }
      },
      "regulations": {
        "type": "array",
        "description": "Laws the page covers, such as GDPR or CCPA",
        "items": { "type": "string" }
      }
    }
  }
}
```

`value` is the identity of the existing legal page for `edit`. Because it maps to the `{id}` URL parameter, it declares `fieldName: "id"`. The value is a string supplied by the app; it does not need to be a Shopify GID.

For `create`, use the same shape but omit `value`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/legal-page.json",
    "type": "object",
    "properties": {
      "regions": { "type": "array", "items": { "type": "string" } },
      "regulations": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The legal page ID, used when editing an existing page. |
| `surface` | `"storefront"` \| `"customer-account"` | Where the page appears. |
| `title` | string | The page title. |
| `sections` | array of `{type, heading, body}` | The page's content sections, in display order. `type` names the kind of section, such as `hero`, `faq`, or `rich_text`. `body` is plain text. |

The surface is a field rather than part of the type name, so one type describes legal pages on any supported surface.

`additionalProperties: true` allows apps to pass app-specific fields through their local `inputSchema`. Fields such as `page_type`, `regions`, `regulations`, `locale`, and `published` are not standardized by this type yet; an app may define the fields it needs without treating them as part of the canonical contract.

## Common pitfalls

- **Putting the page ID in `inputSchema`.** Use the top-level `value` for the existing page's identity. Do not add a parallel `pageId` property.
- **Including `value` for `create`.** A new page has no existing identity, so create omits `value`.
- **Declaring `required` in `inputSchema`.** Sidekick collects missing fields from the merchant and rejects required fields at deploy time.
- **Publishing during navigation.** `create` and `edit` open the app UI; they do not publish or change a live page without merchant review and confirmation.
- **Registering without legal or privacy capabilities.** Being able to display legal text isn't enough. Register this type when your app can fulfill the request, for example by generating a regional policy or handling privacy requests.
- **Using `application/faq` as a stand-in.** FAQ entries are questions and answers with no legal or regional meaning. Use this type for legal and privacy pages.

## Related types

- **[`application/faq`](./application-faq.md)** — question-and-answer entries shown to shoppers; use this when the content is an FAQ rather than a legal or privacy page.
- **`application/page`** (proposed RFC: [#17](https://github.com/Shopify/app-intent-types/pull/17)) — general pages whose content and layout an app authors and maintains, such as pages from a page builder.

## Discussion history

- Original proposal: [#41 — Legal page intent type](https://github.com/Shopify/app-intent-types/discussions/41)
