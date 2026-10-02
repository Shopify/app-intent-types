# `application/optimization-plan`

Sidekick intent type for creating or editing an **optimization plan** — an app-owned set of proposed improvements that a merchant reviews before applying.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/optimization-plan.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/optimization-plan.json)

## When to register an intent for this type

Register an `application/optimization-plan` intent when your app owns a durable plan of proposed improvements across areas such as SEO, accessibility, conversion, or merchandising.

Typical examples:

- An optimization app registering `create` so Sidekick can open a new plan builder with suggestions from the merchant's request.
- An optimization app registering `edit` so Sidekick can open an existing plan for review and refinement.

The intent opens your app's UI. It does not apply or publish improvements by itself; use tools in the opened page for review, confirmation, and any subsequent changes.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2025-04"

[[extensions]]
name = "Manage optimization plans"
handle = "manage-optimization-plans"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/optimization-plans/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/optimization-plan"
    action = "edit"
    schema = "./optimization-plan-schema.json"
```

Register `create` separately when your app supports creating a new plan. A create intent opens a new-plan route and omits the top-level `value` because there is no existing plan to identify.

## Example: the input schema

`./optimization-plan-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The optimization plan ID to edit",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/optimization-plan.json",
    "type": "object",
    "properties": {
      "domain": {
        "type": "string",
        "description": "The area of the merchant's business the plan addresses"
      },
      "scope": {
        "type": "string",
        "description": "The part of the merchant's experience the plan covers"
      }
    }
  }
}
```

`value` is the identity of the existing plan for `edit`. Because it maps to the `{id}` URL parameter, it declares `fieldName: "id"`. The value is a string supplied by the app; it does not need to be a Shopify GID.

For `create`, use the same shape but omit `value`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/optimization-plan.json",
    "type": "object",
    "properties": {
      "domain": { "type": "string" },
      "scope": { "type": "string" }
    }
  }
}
```

## Fields the schema describes

The canonical schema intentionally captures only the plan identity today:

| Field | Type | Notes |
|---|---|---|
| `id` | string | The optimization plan ID, used when editing an existing plan. |

`additionalProperties: true` allows apps to pass app-specific fields through their local `inputSchema`. Fields such as `title`, `status`, `summary`, and `items` are not standardized by this type yet; an app may define the fields it needs without treating them as part of the canonical contract.

## Common pitfalls

- **Putting the plan ID in `inputSchema`.** Use the top-level `value` for the existing plan's identity. Do not add a parallel `planId` property.
- **Including `value` for `create`.** A new plan has no existing identity, so create omits `value`.
- **Declaring `required` in `inputSchema`.** Sidekick collects missing fields from the merchant and rejects required fields at deploy time.
- **Applying changes during navigation.** `create` and `edit` open the app UI; they do not apply, publish, or otherwise commit improvements without merchant review and confirmation.
- **Using a broad neighboring type.** [`application/campaign`](./application-campaign.md) is for coordinated marketing campaigns, while [`shopify/*`](../README.md#shopify-resource-intents) types operate on Shopify resources. Neither is a substitute for an app-owned optimization plan.

## Related types

- **[`application/campaign`](./application-campaign.md)** — a coordinated marketing campaign with channels, audiences, or schedules; a plan can cover broader improvement work.
- **[`application/ad`](./application-ad.md)** — a paid advertising creative; use this when the merchant is creating or editing one ad rather than a plan of improvements.

## Discussion history

- Original proposal: [#15 — Optimization plan intent type](https://github.com/Shopify/app-intent-types/discussions/15)
