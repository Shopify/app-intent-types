# `application/culinary-recipe`

Sidekick intent type for creating or editing a **culinary recipe**, an app-managed set of ingredients and preparation steps for food or drink. This includes dishes, cocktails, and brewing instructions, with optional links to products used as ingredients.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/culinary-recipe.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/culinary-recipe.json)

## When to register an intent for this type

Register this type when your app owns the recipe model and editor that a merchant uses to draft or change a food or drink recipe. Recipe card apps, recipe blog apps, and meal-kit apps can share this contract.

Typical examples:

- "Write a recipe for our new chili crisp and link the jar to the chili crisp ingredient."
- "Change the servings on the banana bread recipe to 8."
- "Fix the typo in step 3 of the cold brew recipe."
- "Make a holiday version of our hot cocoa recipe." Use `create` to start a new recipe.

The type describes the recipe, not the card that displays it or the page that contains it. An app may store or publish recipe content in Shopify blog articles or metaobjects. Those are storage and publishing choices, not a dedicated Shopify Recipe resource. Use this type when the task needs your app's recipe workflow, not for ordinary article or metaobject edits.

The `culinary-` qualifier distinguishes food and drink recipes from automation recipes, production formulas, and other procedural configurations.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Edit culinary recipe"
handle = "edit-culinary-recipe"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/recipes/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/culinary-recipe"
    action = "edit"
    schema = "./recipe-edit-schema.json"

[[extensions]]
name = "Create culinary recipe"
handle = "create-culinary-recipe"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/recipes/new"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/culinary-recipe"
    action = "create"
    schema = "./recipe-create-schema.json"
```

Register one intent per action. `admin.app.intent.link` opens your existing app page. You can instead use `admin.app.intent.render` for a UI extension.

## Example: the input schema

`./recipe-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The existing recipe ID",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/culinary-recipe.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The food or drink recipe title"
      },
      "servings": {
        "type": "string",
        "description": "The yield, such as 4 servings or 12 cookies"
      }
    }
  }
}
```

Pass the existing recipe's identity as the top-level `value`, not a second ID in `inputSchema`. With `mapTo: "param"` and `fieldName: "id"`, a value of `"1042"` fills the `{id}` placeholder in `/recipes/{id}`. GID-shaped values map their final identifier segment into the URL path.

The value is an app-supported string. It doesn't need to be a Shopify GID. If an actual Shopify resource identifies the entity your editor changes, then use that identity rather than inventing a Shopify Recipe GID.

For `./recipe-create-schema.json`, omit `value` because a new recipe has no identity yet:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/culinary-recipe.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The food or drink recipe title"
      }
    }
  }
}
```

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The recipe ID. Optional in the baseline. Existing-resource identity travels as top-level `value`. |

The shared schema uses JSON Schema 2020-12 and `additionalProperties: true`. Declare optional app-specific prefill fields in your own `inputSchema.properties`. Ingredients, product associations, preparation steps, servings, timing, images, and source references aren't standardized by this baseline. Don't declare `required` fields anywhere inside the intent's `inputSchema`.

## Common pitfalls

- **Saving during navigation.** `create` and `edit` open your UI. Stage requested changes for review and explicit save before changing published storefront content.
- **Adding lifecycle actions.** Publishing, deleting, archiving, duplicating, and scaling a recipe belong in tools on the opened page, with appropriate confirmation, not additional intent actions.
- **Using a product as the recipe identity.** Ingredient products are related resources. A product GID isn't automatically the ID of the recipe that uses it.
- **Treating this as a bulk import contract.** This type defines single-recipe create and edit handoffs, not `create+bulk`.
- **Routing app-wide settings through one recipe.** Global card layout or cook-mode preferences belong in the app's settings workflow.
- **Mismatching search and action types.** Set the resource link's `mimeType` to `application/culinary-recipe` and its `uri` to the stable identity your editor accepts. Keep the MIME type consistent with the registered intent. Don't require changing an opaque URI merely to spell the type name.
- **Trusting prefill as authorization.** Your app checks access to the recipe and every linked product, reloads authoritative state, and validates changes before saving.

## Related types

- **[`application/faq`](./application-faq.md)**: question-and-answer content, not a recipe with ingredients and preparation steps.
- **[`shopify/product`](./shopify-product.md)**: imports an existing Shopify product into an app workflow. A recipe may reference products without being a product.

## Discussion history

- Based on [RFC #38](https://github.com/Shopify/app-intent-types/discussions/38), proposed by Patrick Bollenbach (`patrickbolle`) for Recipe Kit as `application/recipe`.
