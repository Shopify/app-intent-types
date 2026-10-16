# `application/experiment`

Sidekick intent type for creating or editing an **experiment** — an app-owned controlled test that splits storefront visitors between a control and one or more variations, then measures the difference in outcomes.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/experiment.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/experiment.json)

## When to register an intent for this type

Register an `application/experiment` intent when your app runs A/B or multivariate tests on what storefront visitors see, such as prices, themes, content, shipping, or checkout.

Typical examples:

- An A/B testing app registering `create` so Sidekick can open a new test builder with details from the merchant's request, such as "Create a +10% price test on my best-selling product, 50/50 split, for two weeks."
- An A/B testing app registering `edit` so Sidekick can open an existing test when the merchant asks to change its traffic split, rename a variation, or pause or end it.

The intent opens your app's UI. It does not launch, change, or end a test by itself; use tools in the opened page for review, confirmation, and any subsequent changes.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2025-04"

[[extensions]]
name = "Manage experiments"
handle = "manage-experiments"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/experiments/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/experiment"
    action = "edit"
    schema = "./experiment-schema.json"
```

Register `create` separately when your app supports creating a new experiment. A create intent opens a new-experiment route and omits the top-level `value` because there is no existing experiment to identify.

## Example: the input schema

`./experiment-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The experiment ID to edit",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/experiment.json",
    "type": "object",
    "properties": {
      "test_type": {
        "type": "string",
        "description": "What the experiment varies, such as price, theme, or shipping"
      },
      "traffic_split": {
        "type": "string",
        "description": "How traffic is divided across variations, such as 50/50"
      }
    }
  }
}
```

`value` is the identity of the existing experiment for `edit`. Because it maps to the `{id}` URL parameter, it declares `fieldName: "id"`. The value is a string supplied by the app; it does not need to be a Shopify GID.

For `create`, use the same shape but omit `value`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/experiment.json",
    "type": "object",
    "properties": {
      "test_type": { "type": "string" },
      "traffic_split": { "type": "string" }
    }
  }
}
```

## Fields the schema describes

The canonical schema intentionally captures only the experiment identity today:

| Field | Type | Notes |
|---|---|---|
| `id` | string | The experiment ID, used when editing an existing experiment. |

`additionalProperties: true` allows apps to pass app-specific fields through their local `inputSchema`. Fields such as `name`, `status`, `variations`, traffic split, schedule, and metrics are not standardized by this type yet, because apps model variations and lifecycles differently. An app may define the fields it needs without treating them as part of the canonical contract.

## Common pitfalls

- **Putting the experiment ID in `inputSchema`.** Use the top-level `value` for the existing experiment's identity. Do not add a parallel `experimentId` property.
- **Including `value` for `create`.** A new experiment has no existing identity, so create omits `value`.
- **Declaring `required` in `inputSchema`.** Sidekick collects missing fields from the merchant and rejects required fields at deploy time.
- **Changing a live test during navigation.** A running test changes what visitors see. `create` and `edit` open the app UI; launching, changing the split, pausing, or ending a test needs merchant review and confirmation. Ending a test should not apply the winning variation unless the merchant confirms it.
- **Registering changes without a control.** A scheduled launch, a time-limited sale, or a one-off change with no control group isn't an experiment.
- **Using it for a test inside another type.** Testing an email subject line or an ad creative belongs to that artifact's type, such as [`application/email`](./application-email.md) or [`application/ad`](./application-ad.md).
- **Using it for Shopify Rollouts.** [Rollouts](https://help.shopify.com/en/manual/markets/rollouts) are managed in Shopify admin. Use this type only for experiments your app runs.

## Related types

- **[`application/optimization-plan`](./application-optimization-plan.md)** — a set of proposed improvements the merchant reviews before applying; an experiment measures a change against a control.
- **[`application/campaign`](./application-campaign.md)** — a coordinated marketing campaign sent to an audience, with no control group or traffic split.

## Discussion history

- Original proposal: [#22 — application/experiment intent type for controlled A/B tests](https://github.com/Shopify/app-intent-types/discussions/22)
