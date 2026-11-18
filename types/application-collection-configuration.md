# `application/collection-configuration`

Sidekick intent type for creating or editing an app-owned **collection configuration** — a saved merchandising setup that controls how products are arranged, pinned, grouped, promoted, or demoted within a Shopify collection.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-configuration.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-configuration.json)

## When to register an intent for this type

Register an `application/collection-configuration` intent when your app owns a saved merchandising setup that a merchant creates, opens, and edits. Collection sorting, product-pinning, and collection automation apps are typical providers.

Typical examples:

- "Keep new arrivals at the top of Summer Sale and move sold-out products to the bottom" opens a new configuration for that collection with the rules staged.
- "Group products by brand, then sort each group by sales" opens your editor with the grouping pre-filled.
- "Open my merchandising setup for Shoes" opens that existing configuration.

The artifact is the app-owned setup, not the target collection or a single reorder. A Shopify [Collection GID](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection) identifies the collection the setup affects, not the setup itself.

`create` opens a new-configuration workflow. `edit` opens an existing configuration for review or changes. Neither action activates rules or reorders products by itself; the merchant reviews and confirms in your app.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Manage collection merchandising"
description = "Open or edit a collection's merchandising setup"
handle = "manage-collection-configuration"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/collection-configurations/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/collection-configuration"
  action = "edit"
  schema = "./collection-configuration-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both; point `create` at a new-configuration page, such as `/collection-configurations/new`, because a new setup has no ID yet.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./collection-configuration-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned collection configuration to open, for example gid://application/collection-configuration/12",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/collection-configuration.json",
    "type": "object",
    "properties": {
      "collection_id": {
        "type": "string",
        "description": "The Shopify Collection GID the configuration applies to, for example gid://shopify/Collection/456"
      }
    }
  }
}
```

`value` carries the existing configuration's identity for `edit`. With `mapTo: "param"` and `fieldName: "id"`, Sidekick substitutes the identifier's bare tail into the `{id}` placeholder, so `gid://application/collection-configuration/12` opens `/collection-configurations/12`. It's an app-owned identifier, not a Shopify resource GID. Don't add a second configuration ID to `inputSchema`. For `create`, omit `value` — the new configuration has no identity yet.

`collection_id` is an example of an app-declared prefill field. It names the target collection and stays separate from the configuration's identity.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The app-owned collection configuration ID. Used for `edit` actions, passed in top-level `value`. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions/categories/rfc) to push for any of these):

- `collection_id` — the Shopify Collection GID the configuration affects
- `goal` — the outcome the merchant wants, such as "surface new arrivals"
- `instructions` — natural-language merchandising instructions
- `starts_at` / `ends_at` — when the configuration takes effect and when it's restored

## Common pitfalls

- **Confusing the configuration with the collection.** The configuration is app-owned. A Collection GID identifies the collection it affects, not the configuration.
- **Duplicating identity.** Use top-level `value` for an existing setup, not a parallel `configurationId` or `data.id`.
- **Using an edit URL for create.** A new setup has no existing ID. Use a new-configuration route and omit `value`.
- **Treating navigation as execution.** Don't reorder products, activate automation, or change a schedule just because Sidekick opened your app.
- **Treating prefill as authority.** Check shop and staff access and the target collection, reload current state, and show the effect before confirmation. Another app may change the same collection.
- **Inventing extra action verbs.** Sorting, pinning, activating, and scheduling are operations inside your app or its tools, not new intent actions.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/collection-configuration"` and a stable `uri` for the configuration.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, including for nested properties. Collect missing information in your app.

## Related types

- **[`application/campaign`](./application-campaign.md)** — coordinated marketing campaigns. A campaign can drive traffic to a collection, but it doesn't arrange the products in it.
- **[`application/optimization-plan`](./application-optimization-plan.md)** — a plan of proposed improvements the merchant reviews. A collection configuration is the saved setup that keeps applying.
- **[`shopify/product`](./shopify-product.md)** — imports Shopify products into an app workflow. It doesn't configure how a collection arranges them.

## Discussion history

- [RFC #21](https://github.com/Shopify/app-intent-types/discussions/21) originally proposed `application/collection-merchandising`. This entry uses `application/collection-configuration` to name the saved setup the app keeps for a collection.
