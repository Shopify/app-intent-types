# `application/recipe`

Sidekick intent type for creating or editing a **recipe** — an app-owned set of ingredients and steps that a food or drink brand publishes on its store, often with its own products linked to the ingredients.

- **Status:** 🚧 Proposed
- **Actions:** `create`, `edit`
- **Schema:** `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/recipe.json` *(to be published, draft inline below)*

## When to register an intent for this type

Register an `application/recipe` intent when your app owns recipe records that a merchant writes, edits and publishes on the storefront, usually as a structured recipe card with its own data.

Many food and drink brands use recipes as their main content: a hot sauce brand shows what to cook with it, a coffee roaster shows how to brew it. Shopify has no recipe object. Blog articles are where some apps place recipes, but an article is free-form HTML, there is no `shopify/article` intent, and it has no ingredients, steps or product links. That gap is what this type covers.

Typical examples:

- A **recipe app** registering `create` so "write a recipe for our new chili crisp and link the jar to the chili crisp ingredient" opens a new recipe pre-filled from the merchant's sentence.
- A **recipe app** registering `create` so "turn this PDF from our recipe developer into a recipe" opens a new recipe with the fields Sidekick extracted from the file.
- A **recipe app** registering `edit` so "change the servings on the banana bread recipe to 8" or "fix the typo in step 3 of the cold brew recipe" opens that recipe in the editor with the change staged.
- A **meal-kit or subscription-box app** registering `create` so a merchant can ask Sidekick to draft the recipe card that ships with this week's box.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Edit recipe"
description = "Open or edit a recipe"
handle = "edit-recipe"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/recipe/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/recipe"
  action = "edit"
  schema = "./recipe-edit-schema.json"

[[extensions]]
name = "Create recipe"
description = "Create a new recipe"
handle = "create-recipe"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/recipe/create"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/recipe"
  action = "create"
  schema = "./recipe-create-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a recipe editor you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./recipe-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the recipe to edit, for example gid://application/recipe/1042.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/recipe.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Recipe title, for example Chili Crisp Noodles"
      },
      "description": {
        "type": "string",
        "description": "Short introduction shown above the recipe"
      },
      "servings": {
        "type": "string",
        "description": "For example \"4\" or \"12 cookies\""
      },
      "prep_time": {
        "type": "string",
        "description": "ISO 8601 duration, for example PT15M"
      },
      "cook_time": {
        "type": "string",
        "description": "ISO 8601 duration, for example PT1H"
      },
      "ingredients": {
        "type": "array",
        "description": "One entry per ingredient line",
        "items": {
          "type": "object",
          "properties": {
            "text": {
              "type": "string",
              "description": "The ingredient line as written, for example \"2 cups oat milk\""
            },
            "product_id": {
              "type": "string",
              "description": "GID of the store product linked to this ingredient, for example gid://shopify/Product/123"
            }
          }
        }
      },
      "instructions": {
        "type": "array",
        "description": "One entry per step, in order",
        "items": { "type": "string" }
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" }
      }
    }
  }
}
```

`value` carries the recipe being edited. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the GID and substitutes the bare tail into the `{id}` placeholder, so `/recipe/{id}` opens as `/recipe/1042`.

`./recipe-create-schema.json` uses the same `inputSchema` and omits `value`, because a new recipe has no identity yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The recipe ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

Draft canonical schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/recipe.json",
  "title": "Recipe Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The recipe ID. Used for edit actions."
    }
  },
  "additionalProperties": true
}
```

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these). Names follow [schema.org/Recipe](https://schema.org/Recipe), so apps can map them to the structured data they already output for search engines:

| Field | Type | schema.org | Notes |
|---|---|---|---|
| `title` | string | `name` | Recipe title |
| `description` | string | `description` | Short introduction |
| `ingredients` | array of `{text, product_id}` | `recipeIngredient` | One entry per ingredient line. `product_id` is an optional Shopify product GID. |
| `instructions` | array of string | `recipeInstructions` | One entry per step |
| `servings` | string | `recipeYield` | For example `"4"` or `"12 cookies"` |
| `prep_time` | string | `prepTime` | ISO 8601 duration |
| `cook_time` | string | `cookTime` | ISO 8601 duration |
| `image` | string (URI) | `image` | Main photo |
| `category` | string | `recipeCategory` | For example `Dessert` |
| `cuisine` | string | `recipeCuisine` | For example `Mexican` |
| `tags` | array of string | `keywords` | |
| `source_url` | string (URI) | `isBasedOn` | Where the recipe came from, if imported |

`product_id` on an ingredient is what makes a recipe shoppable, so it is the strongest candidate to standardize first.

## Common pitfalls

- **Waiting for a `delete` action.** Every `application/*` type supports exactly `create` and `edit`. Deleting or archiving a recipe is an operation on a recipe that is already open, so declare it in `tools.json`, register it from the editor route with `shopify.tools.register`, and confirm it in your own UI.
- **Expecting actions for `publish`, `duplicate` or `scale`.** Same answer. "Make a holiday version of our hot cocoa recipe" is `create` with the fields copied from the existing recipe, or a `duplicate` tool on the open recipe. Publishing is a tool, not an action.
- **Routing card or theme settings through this type.** "Use the compact card" or "turn on cook mode" changes how your app renders every recipe, not one recipe. That belongs in your app's settings UI, not in a recipe intent.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/recipe"` and `uri: "gid://application/recipe/1042"`, or "edit it" has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time, and this includes `required` inside the `ingredients` item schema. The pattern is "schema describes the shape, Sidekick collects the data."
- **Saving during navigation.** `create` and `edit` open your UI with the payload pre-filled. Your editor is responsible for letting the merchant review and save; nothing should go live on the storefront without that step.

## Related types

- **[`application/faq`](./application-faq.md)** — question-and-answer content. A recipe has ingredients, ordered steps and product links, which a FAQ entry cannot carry.
- **[`shopify/product`](./shopify-product.md)** — for importing an existing product into your app. Products link *into* a recipe through ingredient `product_id`; a recipe is not a product.
- **`application/page`** *(proposed)* — whole storefront pages. A recipe is structured content that apps render as a card, often inside a page or article; a page type would flatten it.

## Discussion history

- Original proposal: [#38 — application/recipe: create and edit recipes for food and drink stores](../../discussions/38)
