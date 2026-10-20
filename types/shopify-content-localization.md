# `shopify/content-localization`

Intent type for opening a translation editor to add or revise localized Shopify store content.

- **Status:** ✅ Supported
- **Actions:** `edit`
- **Input baseline:** [`shopify/content-localization.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/content-localization.json)
- **GID schema:** [`shopify/shop/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/shop/gid.json)

## When to register an intent for this type

Register `shopify/content-localization` when your app translates or adapts content stored on Shopify resources, such as products, collections, pages, policies, or theme content.

Typical requests include:

- "Translate my store content into French."
- "Review the German translations."
- "Update the Spanish translation of this product."

`edit` opens the localization workflow, including adding translations that don't exist yet. It doesn't mean that the request already identifies an individual translation, and it doesn't authorize saving or publishing changes. This type doesn't support `create`, `import`, or a separate `publish` action.

Use an appropriate `application/*` type when your app owns the artifact being created or edited. This type describes Shopify content localization, not arbitrary app-owned interface messages, translation job records, or currency conversion.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Localize store content"
description = "Translate and review Shopify store content"
handle = "localize-content"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/localize"

[[extensions.targeting.intents]]
type = "shopify/content-localization"
action = "edit"
schema = "./content-localization-schema.json"
```

Use an editor URL that works even when the caller doesn't supply a locale or a specific content item. Collect missing context in your app. Add tools and instructions when your embedded app supports in-page interactions, following [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

## Example: the extension intent schema

`./content-localization-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/shop/gid.json"
  },
  "inputSchema": {
    "type": "object",
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/content-localization.json",
    "properties": {
      "locale": {
        "type": "string",
        "mapTo": "query_param"
      }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/shop/gid.json"
      }
    }
  }
}
```

The shared baseline contains only an optional `locale` string and permits additional properties. The example maps `locale` to the query string. Set `fieldName` if your app uses a different query parameter name. Don't declare required input fields.

## Identity and provider-specific inputs

| Field | Contract |
|---|---|
| `value` | Optional Shop GID, such as `gid://shopify/Shop/123`. Reference `shopify/shop/gid.json` when declaring it. A whole-store invocation can omit it. |
| `inputSchema.locale` | Optional language code, such as `fr`. The app collects it when missing. |
| Other input properties | Optional provider-defined context, such as target content, fields, markets, or batches. Not shared baseline fields. |
| `outputSchema.properties.id` | Declare a reference to `shopify/shop/gid.json`, matching the Shop identity. |

The Shop GID identifies the store whose content is being localized. It isn't the GID of a product or an individual translation. Don't duplicate the Shop identity in a second input ID. If your app needs a specific target resource, then describe that separately in your extending schema and authorize access to it.

The GraphQL Admin API's [`Translation`](https://shopify.dev/docs/api/admin-graphql/latest/objects/Translation) object has no standalone GID. A [`TranslatableResource`](https://shopify.dev/docs/api/admin-graphql/latest/objects/TranslatableResource) exposes the GID of the underlying resource. Don't invent a `Translation` or `TranslatableResource` GID for this intent.

## Common pitfalls

- **Using `create` to add a missing translation.** Register `edit` to open the editor for existing Shopify store content, whether or not the requested locale has translations yet.
- **Using an application meta-schema.** Use `shopify-intent.json`, reference the content-localization baseline from `inputSchema`, and declare the Shop GID reference in `outputSchema`.
- **Passing a Product GID as the primary `value`.** This intent uses the Shop GID. Target content belongs in your provider-defined input context.
- **Treating a broad request as a known batch.** Resolve the selected content, locales, cost, and supported operations before starting work. Don't silently choose the first product.
- **Treating invocation as permission to write or publish.** Validate access and current source content, stage changes for review, and obtain confirmation before translation writes, publication, or charges. Keep these operations and job progress in the app's workflow.
- **Assuming the shared baseline guarantees batching or progress tools.** These are provider capabilities, not shared fields or new intent actions. Test registration, discovery, and invocation with your app before shipping.

## Related types

- **[`shopify/product`](./shopify-product.md)** — for an app-provided product import workflow, not translating content on existing Shopify resources.
- **[`application/email`](./application-email.md)** — for composing or editing an email artifact, not a placeholder type for translation apps.
- **[`application/faq`](./application-faq.md)** — for creating or editing FAQ content rather than opening a Shopify content localization editor.

## Discussion history

- [#24 — application/translation intent type for translation apps](../../discussions/24) describes the merchant need that this existing contract addresses.
