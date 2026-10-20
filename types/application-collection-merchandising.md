# `application/collection-merchandising`

Sidekick intent type for creating or editing an app-owned collection merchandising configuration: a saved setup that controls how products are arranged, pinned, grouped, promoted, or demoted within a Shopify collection.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-merchandising.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-merchandising.json)

## When to register an intent for this type

Register this type when your app owns a saved merchandising setup that a merchant can create, open, and edit. Collection sorting, product-pinning, and collection automation apps can use it.

Merchant requests include:

- "Keep new arrivals at the top of Summer Sale and move sold-out products to the bottom."
- "Group products by brand, then sort each group by sales."
- "Open my merchandising setup for Shoes."

The artifact is the app-owned setup, not the target collection or a single reorder operation. A Shopify [Collection GID](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection) identifies the target collection, not the app's configuration. Changing a collection's native sort order alone doesn't require a separate app-owned artifact.

`create` opens a new-configuration workflow. `edit` opens an existing configuration for review or changes. Neither action activates rules or reorders products by itself. Use tools in the opened app for subsequent operations, with merchant review and confirmation before applying changes.

## Example: register the intent

An edit registration in `shopify.extension.toml`:

```toml
api_version = "2026-10"

[[extensions]]
name = "Manage collection merchandising"
handle = "manage-collection-merchandising"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/collection-merchandising/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/collection-merchandising"
    action = "edit"
    schema = "./collection-merchandising-edit-schema.json"
```

To register `create`, add a separate targeting block under the same extension with a new-configuration URL:

```toml
[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/collection-merchandising/new"
tools = "./tools.json"
instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/collection-merchandising"
  action = "create"
  schema = "./collection-merchandising-create-schema.json"
```

## Example: the input schema

`./collection-merchandising-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned collection merchandising configuration ID to edit",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-merchandising.json",
    "type": "object",
    "properties": {}
  }
}
```

Top-level `value` carries the existing configuration's identity and maps it to the `{id}` URL parameter. It can be an app-defined string and doesn't need to be a Shopify GID. Don't add a second configuration ID under `inputSchema.properties`.

For `create`, omit `value` because the new configuration doesn't have an identity yet.

`./collection-merchandising-create-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-merchandising.json",
    "type": "object",
    "properties": {}
  }
}
```

## Fields the schema describes

The canonical schema intentionally stays minimal:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned configuration identifier. Existing-object identity is passed through top-level `value` in an edit request. |

`additionalProperties: true` permits optional provider-specific fields. The baseline doesn't standardize a target Collection field, goals, natural-language instructions, activation dates, rotation schedules, or product-placement rules. Declare the optional context your app supports in its extending `inputSchema`, or collect it through the app's UI and tools.

If your app accepts a target collection as context, use its Shopify Collection GID. Keep that target separate from the configuration's primary identity.

## Common pitfalls

- **Confusing the configuration with the collection.** The configuration is app-owned. A Collection GID identifies the collection it affects, not a generic merchandising-configuration resource.
- **Duplicating identity.** Use top-level `value` for an existing setup, not a parallel `configurationId` or `data.id`.
- **Using an edit URL for create.** A new setup has no existing ID. Use a new-configuration route and omit `value`.
- **Adding `required` inputs.** Don't declare `required` anywhere in the intent `inputSchema`; collect missing information in the app.
- **Treating navigation as execution.** Don't reorder products, activate automation, or change a schedule merely because Sidekick opens the app.
- **Treating optional context as authority.** Check shop/staff access and the target collection, reload current state, and show the effect before confirmation. Account for another app or native sort setting changing the same collection.
- **Inventing extra action verbs.** Sorting, pinning, activation, and scheduling are recipient operations, not new intent actions.

## Related types

- [`application/campaign`](./application-campaign.md) describes coordinated marketing campaigns, not product arrangement within a collection.
- [`application/optimization-plan`](./application-optimization-plan.md) describes a plan of proposed improvements, not the saved merchandising setup that applies them.
- [`shopify/product`](./shopify-product.md) provides product-import workflows, not collection merchandising configuration.

## Discussion history

- Original proposal: [RFC #21](https://github.com/Shopify/app-intent-types/discussions/21)
