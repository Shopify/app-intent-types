# `application/alert-rule`

Sidekick intent type for creating or opening an **alert rule** — an app-owned, standing rule that watches store events (an order is paid, a variant hits low stock, a checkout over $500 is created, a refund is issued) and notifies the merchant's own team over the app's delivery channels.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/alert-rule.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/alert-rule.json)

## When to register an intent for this type

Register an `application/alert-rule` intent when your app owns alert rules that a merchant configures: **when** a store event happens, **if** it matches filters, **notify** these people over these channels, **at most** this often. The artifact is the rule, not a single message — an alert rule keeps watching after it is saved.

Typical examples:
- A **store-notifications app** registering `create` so "email me and the warehouse when any variant of the Summer collection drops below 5 units" opens its alert editor pre-filled with the event, filters, and recipients.
- A **high-value order alert app** registering `create` so "ping me on Slack whenever an order over $1,000 is paid" lands in its rule editor.
- Any alerting app registering `edit` so "pause the checkout alert" or "add ops@example.com to my low-stock alert" opens that rule, pre-filled with the change, for the merchant to review and save.

The merchant reviews and saves in your UI. Sidekick hands off the request; it does not create the rule itself.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open alert rule"
description = "Open or edit a store event alert"
handle = "open-alert-rule"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/alerts/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/alert-rule"
  action = "edit"
  schema = "./alert-rule-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./alert-rule-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the alert rule to open, for example gid://application/alert-rule/1013.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/alert-rule.json",
    "type": "object",
    "properties": {
      "event": {
        "type": "string",
        "description": "Store event the alert watches, such as orders/paid"
      },
      "recipients": {
        "type": "string",
        "description": "Who to notify, extracted from the merchant's sentence"
      }
    }
  }
}
```

`value` carries the alert rule being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the GID and substitutes the bare tail into the `{id}` placeholder, so `/alerts/{id}` opens as `/alerts/1013`. For `create`, omit `value` — there is no alert rule to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The alert rule ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI. Apps should list the event keys and channels they accept in their tool instructions.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `name` — merchant-facing rule name, such as "Large paid orders"
- `enabled` — whether the rule is active (lets "pause the checkout alert" map to `edit`)
- `events` — store events the rule watches: Shopify webhook topic names where one exists (`orders/paid`, `refunds/create`), app-defined keys otherwise
- `filters` — which events fire the alert (product, collection, or location scoping; amount thresholds; inventory thresholds)
- `recipients` — who to notify, per channel (`email`, `sms`, `slack`, `telegram`, `teams`, `push`, `webhook`, or app-defined)
- `throttle` — at most N notifications per hour/day/week/month
- `schedule` — deliver only at these days, times, and time zone

## Common pitfalls

- **Waiting for an `open` action.** There isn't one, and there won't be. `edit` *is* the open contract: it navigates the merchant to your `url` with the rule's identifier substituted, and nothing forces that page to be an editor. It can be your read-only rule view.
- **Expecting a `pause`, `test`, or `send` action.** Every `application/*` type supports exactly `create` and `edit`. Pausing, resuming, and testing are operations on a rule that is already open, so declare them in `tools.json` and register them from the route with `shopify.tools.register`. Pausing is also just an `edit` that stages the rule with `enabled: false`.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/alert-rule"` and `uri: "gid://application/alert-rule/1013"`, or "open it" has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Putting secrets in the schema or prefill.** Webhook signing secrets, bearer tokens, and bot tokens belong in your app's backend — never in `inputSchema`, prefill values, or resource links. A Slack webhook URL or chat handle as a merchant-visible recipient is fine; its credentials are not.
- **Treating the intent as a webhook or as the notification itself.** It isn't either. The type is the standing rule the merchant configures; delivery happens in your app when a matching event fires, and your UI is responsible for review and confirmation before anything is saved.

## Related types

- **[`application/email`](./application-email.md)** and **[`application/campaign`](./application-campaign.md)** — for creating one message or a marketing send to customers. An alert rule is a standing configuration whose recipients are the merchant's own team; email is only one of its channels.
- **[`application/ticket`](./application-ticket.md)** — for support conversations with a customer. An alert rule notifies your team; it is not a conversation.
- **[`application/optimization-plan`](./application-optimization-plan.md)** — for an app-owned plan of improvements. Both are app-owned configurations, but a plan is reviewed and acted on; a rule runs on its own.

## Discussion history

Proposed in [RFC #46](https://github.com/Shopify/app-intent-types/discussions/46) — create and edit store event alerts for the merchant's team.
