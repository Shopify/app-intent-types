# `shopify/ProductBundle`

Sidekick intent type for creating or editing a **Product-backed bundle** in an app's bundle editor. It identifies bundle composition separately from general Product editing, while using the backing Shopify Product's GID as the resource identity.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Input baseline:** [`shopify/productbundle.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/productbundle.json)
- **Identity and output schema:** [`shopify/product/gid.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json)

## When to register an intent for this type

Register this type when your app creates or edits bundles with a backing Shopify Product:

- A bundle builder registering `create` so "make a starter kit with the shampoo, conditioner, and brush" opens its bundle creation flow.
- A bundle editor registering `edit` so "add the new hazelnut blend to my coffee bundle" opens that Product's bundle configuration.
- A multipack app registering `create` so "make a three-pack of these candles" opens a draft for the merchant to review.

`edit` targets bundle composition, such as included components and quantities. It doesn't mean taking over the entire Product editor. General merchandising changes are a separate workflow.

This contract requires a backing Product identity. An app-owned offer or configuration without a backing Product doesn't fit merely because the app calls it a bundle. Subscriptions, cart promotions, and recommendations aren't automatically Product bundles either.

## Example: register the intents

In `shopify.extension.toml`, use one registration for each supported action:

```toml
[[extensions]]
name = "Create bundle"
description = "Start a Product-backed bundle in the bundle editor"
handle = "create-bundle"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/bundles/new"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "shopify/ProductBundle"
  action = "create"
  schema = "./bundle-create-schema.json"

[[extensions]]
name = "Edit bundle"
description = "Open a Product-backed bundle to change its components"
handle = "edit-bundle"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/bundles/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "shopify/ProductBundle"
  action = "edit"
  schema = "./bundle-edit-schema.json"
```

An app can register both actions. Each is a different action/type pair; the normal per-app intent limit still applies.

## Example: create schema

`./bundle-create-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/productbundle.json",
    "type": "object"
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json"
      }
    }
  }
}
```

Omit `value` when creating a new bundle. After the merchant saves successfully, return the backing Product GID in the intent response's `id`.

## Example: edit schema

`./bundle-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify-intent.json",
  "value": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/productbundle.json",
    "type": "object"
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "id": {
        "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json"
      }
    }
  }
}
```

For edit, the optional `value` identifies the backing Product, for example `gid://shopify/Product/123`. The path mapping uses its tail ID for `{id}`, as with other Shopify resource intents. Read the full GID from the intent payload when you need it. If an invocation doesn't identify a bundle, your app must resolve or ask the merchant to select it before editing.

## Shared fields and app-specific inputs

| Field | Meaning |
|---|---|
| `value` | Optional backing Product GID for an existing bundle. Omit it for create. |
| `inputSchema` | References the ProductBundle baseline and can declare optional app-specific prefill fields. |
| `outputSchema.properties.id` | References the Product GID schema for the saved bundle's backing Product. |

The input baseline is an object with `additionalProperties: true` and no standardized fields. Declare only the optional inputs your app understands in its own `inputSchema.properties`, together with their transport mappings. Don't put the primary resource identity in a second input `id` field.

The shared contract doesn't prescribe packs, pricing, subscription, or reward fields. An app may describe optional inputs for its own editor without making them requirements for every bundle app.

## Common pitfalls

- **Inventing a bundle GID.** Use `gid://shopify/Product/123`, not `gid://shopify/ProductBundle/123`. A `ProductBundleOperation` GID identifies an asynchronous API operation, not the bundle to edit or return after completion.
- **Using the application meta-schema.** Both actions use `shopify-intent.json`, with the ProductBundle baseline under `inputSchema` and Product GID references for identity/output.
- **Mixing spelling and schema paths.** Declare `shopify/ProductBundle`; type lookup is case-insensitive. The schema URL is lowercase `shopify/productbundle.json`, not `shopify/product-bundle.json`.
- **Declaring required inputs.** Don't declare `required` in `inputSchema`, including nested schemas. The editor collects missing information.
- **Treating a Product GID as authorization.** Recheck shop/staff access, bundle ownership, current components, and prices in your app. A Product GID alone doesn't prove that the Product is a bundle your app can edit.
- **Saving on invocation.** Stage changes for merchant review. Don't report success until the app has completed the requested work; resolve asynchronous creation before returning the resulting Product GID.
- **Adding more intent verbs.** Duplicate, preview, publish, and pause belong in the app's reviewed workflow or tools, not new actions on this type. Neither `import` nor `import+bulk` is supported here.
- **Returning the wrong search-result type.** A link to a bundle should use `mimeType: "shopify/ProductBundle"` with its backing Product GID as the URI. A generic Product link doesn't convey bundle-editing semantics.

## Related types

- **[`shopify/product`](./shopify-product.md)**: imports Products into an app-provided workflow. ProductBundle creates or edits bundle composition instead of overloading that import contract or the generic Product editor.
- **[`application/campaign`](./application-campaign.md)**: creates or edits marketing campaigns that may promote a bundle, not the bundle itself.

## Discussion history

- [Bundle RFC](https://github.com/Shopify/app-intent-types/discussions/34), originally proposed as `application/bundle`.
