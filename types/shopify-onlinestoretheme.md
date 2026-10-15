# `shopify/OnlineStoreTheme`

Sidekick intent type for editing an existing **Shopify online store theme** in an app-provided editor.

- **Status:** ✅ Supported
- **Actions:** `edit`
- **Input schema:** [`shopify/onlinestoretheme.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme.json)
- **GID schema:** [`shopify/onlinestoretheme/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme/gid.json)

## When to register an intent for this type

Register a `shopify/OnlineStoreTheme` intent when your app edits an existing Shopify theme's source files, such as Liquid sections and snippets, CSS or JavaScript assets, and template JSON.

Typical examples:

- A theme customization app opening the selected theme to adjust a collection's product-grid spacing.
- A theme code editor opening the selected theme to change its header layout.
- A theme maintenance app opening the selected theme to review leftover integration code before removing it.

The resource is the Shopify theme, identified by `gid://shopify/OnlineStoreTheme/{id}`. Your app provides the editor; an app conversation or session is not the resource. This isn't an intent for editing one page's content or creating a new theme.

The intent opens your app's UI. It doesn't apply or publish changes by itself. Preview the changes and obtain merchant confirmation before applying them to a live theme.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-10"

[[extensions]]
name = "Edit online store theme"
description = "Open an existing Shopify theme in the app's editor"
handle = "edit-online-store-theme"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/themes/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "shopify/OnlineStoreTheme"
  action = "edit"
  schema = "./theme-edit-schema.json"
```

Use `edit` to open the existing theme. Starting an app session or preparing a preview copy doesn't make the intent a `create` action.

## Example: the intent schema

`./theme-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme.json",
    "type": "object"
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme/gid.json"
      }
    }
  }
}
```

The shared input baseline is an object with `additionalProperties: true` and no standardized properties. It doesn't define a prompt, mode, conversation, or second theme identifier. The existing theme's identity belongs in top-level `value`.

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `value` | Shopify OnlineStoreTheme GID | The existing theme the merchant wants to edit. |
| `inputSchema` | object | References the theme baseline. Don't declare `required` fields. |
| `outputSchema.properties.id` | Shopify OnlineStoreTheme GID | The theme whose edit the merchant completed, returned through `shopify.intents.response.ok`. |

With `mapTo: "param"` and `fieldName: "id"`, a value of `gid://shopify/OnlineStoreTheme/123` fills `{id}` with `123`. The app route receives the bare ID, not the full GID.

## Common pitfalls

- **Using an app conversation as the resource.** `value` is a Shopify theme GID, not an app task or conversation ID. Keep session state inside your app.
- **Adding a `create` action to start a conversation.** This type supports only `edit`. Creating an app session isn't creating a Shopify theme.
- **Treating the intent as authorization.** Theme-file writes still require the appropriate access scope and a Shopify exemption. See [`themeFilesUpsert`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/themeFilesUpsert). Intent registration grants neither.
- **Silently targeting the live theme.** Confirm which theme the merchant selected. Distinguish the selected theme from any internal preview copy, and don't apply changes to a different theme without confirmation.
- **Returning a conversation ID as the result.** Return an `OnlineStoreTheme` GID for the completed theme edit, not a chat identifier or an unfinished preview.
- **Applying changes during navigation.** Opening the editor must not silently mutate or publish the live theme. Stage changes in the app and obtain merchant confirmation.

## Related types

- **[`application/optimization-plan`](./application-optimization-plan.md)** — an app-owned plan of proposed improvements, rather than the Shopify theme being edited.

## Discussion history

- Original proposal: [#9 — Theme code editing apps](https://github.com/Shopify/app-intent-types/discussions/9).
