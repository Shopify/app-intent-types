# `application/storefront-popup`

Sidekick intent type for creating or opening an **app-managed storefront popup or signup form** — a visitor-facing configuration that a merchant maintains in an app.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-popup.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-popup.json)

## When to register an intent for this type

Register this type when your app owns a storefront popup that collects a visitor's contact details, announces an offer, or encourages a signup. This includes modal popups, slide-ins, bars, and full-screen or embedded signup forms when they are variants of the same app-managed artifact.

Examples:

- “Create a welcome popup that offers 10% off for new email subscribers.”
- “Open my cart-page exit popup.”
- “Change the headline on my newsletter signup form.”
- “Stage a change to show this popup only on the Sale collection.”

`create` opens your app's new-popup workflow. `edit` opens an existing popup or signup form and can stage changes for review. The merchant confirms changes in your app before they affect visitors.

This type describes the storefront artifact, not an Admin dialog or the presentation of the intent itself. It doesn't represent a product-upsell funnel, an access-control rule, a full storefront page, or a visitor's form submission.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Create storefront popup"
description = "Create a storefront popup or embedded signup form"
handle = "create-storefront-popup"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/popups/new"

    [[extensions.targeting.intents]]
    type = "application/storefront-popup"
    action = "create"
    schema = "./create-popup-schema.json"

[[extensions]]
name = "Edit storefront popup"
description = "Open or edit an existing storefront popup or signup form"
handle = "edit-storefront-popup"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/popups/{id}"

    [[extensions.targeting.intents]]
    type = "application/storefront-popup"
    action = "edit"
    schema = "./edit-popup-schema.json"
```

The example uses separate URLs and schema files for the two actions. You can also use `admin.app.intent.render` for a focused admin UI extension.

## Example: schemas

`./create-popup-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-popup.json",
    "type": "object"
  }
}
```

`./edit-popup-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned identifier of the popup or signup form to open.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/storefront-popup.json",
    "type": "object"
  }
}
```

For `edit`, top-level `value` carries the existing object's identifier into the `{id}` URL placeholder. Don't duplicate it in `inputSchema.properties.id`. For `create`, omit `value` because the object doesn't exist yet.

## Fields the canonical schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned storefront popup or signup-form identifier. |

The canonical schema permits `additionalProperties: true`. Declare optional prefill fields in your app's own `inputSchema.properties` when useful. Content, triggers, targeting, incentives, and activation status aren't standardized fields in this baseline. Don't declare `required` in an intent's `inputSchema`; your UI can gather missing information.

## Common pitfalls

- **Treating the intent as publication.** Invocation opens the editor. Saving or publishing remains an explicitly confirmed app workflow. Don't report a staged draft as live.
- **Adding `toggle` or `publish` actions.** Use `edit` to open a popup and stage an activation or scheduling change. This type adds only `create` and `edit`.
- **Choosing the type by appearance alone.** A product-offer funnel doesn't become a signup-popup artifact because it appears in a modal. Select the type by what the merchant is editing.
- **Using the wrong identifier.** A customer, discount, theme, marketing activity, or form submission isn't the popup configuration. Use your app's popup identifier; don't invent a `gid://shopify/Popup` identifier.
- **Passing captured personal data in prefill URLs.** This intent edits the form configuration, not submitted visitor records. Authenticate the merchant and authorize access to the popup in your app.
- **Assuming every trigger works on every surface.** Declare only capabilities your app actually supports. A storefront popup type doesn't grant new checkout placement or script permissions.
- **Forgetting resource-link typing.** When a data tool links to an existing popup, use `mimeType: "application/storefront-popup"` and the same stable resource identity your edit handler accepts.

## Related types

- [`application/email`](./application-email.md) — the message delivered to an inbox, not the signup surface collecting an address.
- [`application/campaign`](./application-campaign.md) — a coordinated marketing campaign, not one storefront popup configuration.
- [`application/ad`](./application-ad.md) — an advertisement managed by your app, not an on-site signup form.

## Discussion history

- [RFC #39](../../discussions/39) originally proposed `application/popup`. This entry uses `application/storefront-popup` to make the surface explicit.
