# `application/storefront-page`

Sidekick intent type for composing or editing a **storefront page** — a merchant-authored page of content and layout that an app builds and publishes to the online store.

- **Status:** 🚧 Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-page.json` *(pending publication — draft inline below)*

## When to register an intent for this type

Register an `application/storefront-page` intent when your app can take a partially-specified page — a goal, an audience, some products to feature, a rough section outline — and either (a) build a new page or (b) open an existing one for modification in your app's editor.

Typical examples:

- A **page builder** registering `create` so Sidekick can hand off "build me a landing page for the summer collection launch" to the app's editor with the collection and a section outline pre-filled.
- A **page builder** registering `edit` for "add a testimonials section to my Black Friday page", where Sidekick deep-links into the existing page.
- A **template / theme-section app** registering `create` for "make a comparison page for these three products", where the app owns the layout and publishes to a template suffix.
- A **CRO / landing-page app** registering `create` for "spin up a landing page for this ad campaign" — the destination step after an [`application/ad`](./application-ad.md) intent.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-07"

[[extensions]]
name = "build-page"
handle = "build-page"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/editor/{id}"
  tools = "./tools.json"

  [[extensions.targeting.intents]]
  type = "application/storefront-page"
  action = "create"
  schema = "./storefront-page-schema.json"
```

Three things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register the same extension twice (one block per action) if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type once published, and it **must not declare `required` fields** — Sidekick will collect missing fields from the merchant before invoking your extension.

The `admin.app.intent.link` target suits this type better than `admin.app.intent.render`: page building is long-running and highly visual, so navigating the merchant into the app's own editor beats rendering a focused surface inline. Apps that can do a meaningful subset of page editing in a compact UI can use the render target instead — the intent declaration is identical.

## Example: the input schema

`./storefront-page-schema.json` (once the canonical schema is published):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-page.json"
}
```

## Draft canonical schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-page.json",
  "title": "Storefront Page Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The page ID. Used for edit actions."
    },
    "title": {
      "type": "string",
      "description": "The page title, as the merchant would name it"
    },
    "handle": {
      "type": "string",
      "description": "The URL slug for the page"
    },
    "page_type": {
      "type": "string",
      "description": "The storefront surface the page targets",
      "enum": ["home", "product", "collection", "blog_post", "page", "password"],
      "default": "page"
    },
    "goal": {
      "type": "string",
      "description": "What the merchant wants the page to accomplish, in their own words"
    },
    "sections": {
      "type": "array",
      "description": "Rough content outline. Apps map these onto their own section libraries.",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Loose section hint, for example hero, features, testimonials, faq, cta"
          },
          "heading": {
            "type": "string",
            "description": "The section heading"
          },
          "body": {
            "type": "string",
            "description": "The section body copy"
          },
          "media_url": {
            "type": "string",
            "format": "uri",
            "description": "An image or video to use in the section"
          }
        },
        "additionalProperties": true
      }
    },
    "products": {
      "type": "array",
      "description": "Product GIDs to feature on the page",
      "items": { "type": "string" }
    },
    "collections": {
      "type": "array",
      "description": "Collection GIDs to feature on the page",
      "items": { "type": "string" }
    },
    "status": {
      "type": "string",
      "description": "Whether the page is published to the storefront",
      "enum": ["draft", "published"],
      "default": "draft"
    },
    "seo": {
      "type": "object",
      "description": "SEO overrides, where they differ from the page title",
      "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

No `required` fields, per the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The page ID. Used for `edit` actions. |
| `title` | string | Page title as the merchant would name it. |
| `handle` | string | URL slug. |
| `page_type` | string | Storefront surface the page targets. See the vocabulary below. |
| `goal` | string | What the merchant wants the page to accomplish, in their words — "launch the summer collection", "explain our return policy". The field Sidekick can fill most reliably from a merchant's prompt. |
| `sections` | array of object | Rough content outline: `type`, `heading`, `body`, `media_url`. `type` is a loose hint, not a closed enum. |
| `products` | array of string | Product GIDs to feature on the page. |
| `collections` | array of string | Collection GIDs to feature on the page. |
| `status` | string | `draft` or `published`. |
| `seo` | object `{title, description}` | SEO overrides where they differ from `title`. |

`additionalProperties: true` — apps may pass extra fields, but Sidekick won't validate them.

### `page_type` vocabulary

Aligned to Shopify storefront surfaces rather than to any app's internal taxonomy:

`home` · `product` · `collection` · `blog_post` · `page` · `password`

`page` is the default and covers standalone pages including landing pages. Apps that distinguish "landing page" from "regular page" internally can keep doing so — that distinction is an app concern, and collapsing it here keeps the type from fragmenting.

**Fields deliberately left out**, since they describe an app's document model rather than the merchant-facing artifact: element and component trees, style objects, breakpoint definitions, theme or template file bindings, and revision history.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `locale` — for merchants running multi-language storefronts
- `template_suffix` — where the app publishes to an Online Store 2.0 template rather than a standalone page
- `brand_voice` — a tone hint many builders already accept
- `reference_url` — an existing page the merchant wants matched in style

## Common pitfalls

- **Declaring `required` in your `inputSchema`.** Sidekick will reject the extension at registration time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Treating the intent as a build API.** It isn't — Sidekick navigates the merchant into your app with the intent payload pre-filled. Page generation is slow and subjective, so the merchant reviews and confirms in your editor before anything is published.
- **Modeling your own document format in the schema.** Two page builders will never agree on a component tree. They can agree on "a page titled X, for surface Y, featuring products Z, roughly these sections."
- **Registering both `create` and `edit` against one handler** when `edit` needs to load an existing page and `create` doesn't. Sharing is fine; branch on `action` when the flows diverge.

## Related types

- **[`application/faq`](./application-faq.md)** — when the page *is* an FAQ, register that instead. An FAQ has a question-and-answer shape; a page has a section-outline shape.
- **[`application/campaign`](./application-campaign.md)** — a page is frequently a campaign's *destination*, not the campaign itself, and most pages have no campaign behind them. The two compose rather than overlap.
- **[`shopify/product`](./shopify-product.md)** — for "build something from this product", where the product GID is the whole payload. It covers product-anchored pages but can't express a page with no single anchoring resource (an About page, a campaign landing page, a multi-product comparison), and carries no page-level intent.
- **`application/theme-edit-task`** *(proposed in discussions)* — for editing theme *code*. That type targets the theme's source; this one targets a merchant-authored page.

## Discussion history

- Original proposal: *(this PR)*
- Schema v1 published: *(pending)*
