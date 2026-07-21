# `application/translation`

Sidekick intent type for creating or editing a **translation** of merchant-facing content for a target locale.

- **Status:** 🟡 Proposed
- **Actions:** `create`, `edit`
- **Proposed schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/translation.json`

## When to register an intent for this type

Register an `application/translation` intent when your app lets a merchant create, review, or update localized content. The translation can refer to a Shopify resource, such as a product or policy, or to content owned by the app.

Typical examples:

- A **localization app** registering `create` for "translate my product descriptions into French."
- A **translation editor** registering `edit` for "review the Spanish translations for my online store."
- A **content app** registering `edit` for "update the German translation of our shipping policy."

This type represents the translated content, not an asynchronous translation job or permission to publish without merchant confirmation.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Manage translations"
description = "Open the translation editor so the merchant can review and manage localized content."
handle = "manage-translations"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/translations"

[[extensions.targeting.intents]]
type = "application/translation"
action = "edit"
schema = "./translation-schema.json"
```

Three things to notice:

1. **`type`** identifies a translation as the merchant-facing artifact.
2. **`action`** is `create` for a new translation or `edit` for reviewing or updating translated content.
3. **`schema`** points to a local intent schema that references the canonical translation schema. It must not declare required input fields.

## Example: the extension intent schema

`./translation-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/translation.json",
    "type": "object"
  }
}
```

## Proposed canonical schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/translation.json",
  "title": "Translation Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The app-specific translation ID. Used for edit actions."
    },
    "resourceId": {
      "type": "string",
      "description": "The Shopify GID or app-specific ID of the content being translated."
    },
    "resourceType": {
      "type": "string",
      "description": "The type of content being translated, such as product, collection, policy, or theme."
    },
    "key": {
      "type": "string",
      "description": "The field or content key being translated, such as title, description, or body_html."
    },
    "sourceLocale": {
      "type": "string",
      "description": "The source locale as a BCP 47 language tag."
    },
    "targetLocale": {
      "type": "string",
      "description": "The target locale as a BCP 47 language tag."
    },
    "sourceContent": {
      "type": "string",
      "description": "The original content to translate."
    },
    "translatedContent": {
      "type": "string",
      "description": "The translated content to create, review, or update."
    },
    "marketId": {
      "type": "string",
      "description": "An optional Shopify Market GID when the translation is market-specific."
    }
  },
  "additionalProperties": true
}
```

The schema intentionally has no required fields. Sidekick can route a broad request to a translation editor with only the intent type, while more specific requests can carry resource, locale, and content context.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | App-specific translation ID for an existing translation. |
| `resourceId` | string | Shopify GID or app-specific content ID. |
| `resourceType` | string | Merchant-facing content type. |
| `key` | string | Field or content key within the resource. |
| `sourceLocale` | string | Source BCP 47 locale. |
| `targetLocale` | string | Target BCP 47 locale. |
| `sourceContent` | string | Original content. |
| `translatedContent` | string | Proposed or existing translation. |
| `marketId` | string | Optional Shopify Market GID. |

## Common pitfalls

- **Treating the intent as permission to auto-publish.** The merchant should review and confirm changes in the app before they are saved or published.
- **Modeling a background job instead of translated content.** Progress, batching, and vendor-specific job IDs belong to the app, not the shared intent type.
- **Assuming a single store-wide locale.** Preserve source and target locale context, and include a market when the content is market-specific.
- **Conflating translation with the source artifact.** Use `application/email`, `application/faq`, or another artifact type when Sidekick is creating the original content. Use `application/translation` when the merchant's goal is localization.

## Related types

- **[`application/email`](./application-email.md)** — for composing the original email rather than translating it.
- **[`application/faq`](./application-faq.md)** — for creating the original FAQ entry rather than translating it.

## Discussion history

- Original proposal: this document.
- Schema publication: pending review and rollout by Shopify.
