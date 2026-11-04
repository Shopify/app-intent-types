# `application/calendar-event`

Sidekick intent type for creating or editing a **store calendar event** — an app-owned dated occurrence such as a workshop, class, pop-up, tasting, or in-store event that a merchant manages in a calendar app.

- **Status:** 📝 Proposed
- **Actions:** `create`, `edit`
- **Schema:** *(to be published at `https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json` after acceptance)*
- **RFC:** [#56](https://github.com/Shopify/app-intent-types/discussions/56)

## When to register an intent for this type

Register an `application/calendar-event` intent when your app owns calendar event records that a merchant creates and edits in your UI, and Sidekick should be able to hand off natural-language requests into that UI.

Typical examples:

- A **store calendar app** registering `create` so Sidekick can hand off "add a wine tasting next Saturday at 6pm" into the new-event form.
- A **workshops / classes app** registering `edit` so "update the location on tomorrow's pottery class" opens that event for the merchant to confirm.
- A **pop-up / events app** registering both actions so merchants can create and refine in-store events without leaving Sidekick's flow until they land in your editor.

The intent opens your app's UI. It does not create or mutate the event by itself; the merchant reviews and confirms in your UI (or via page-level tools you register on that route).

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
api_version = "2026-01"

[[extensions]]
name = "Open calendar event"
description = "Create or edit a store calendar event"
handle = "open-calendar-event"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/events/{id}/edit"
  tools = "./tools.json"
  instructions = "./instructions.md"

    [[extensions.targeting.intents]]
    type = "application/calendar-event"
    action = "edit"
    schema = "./calendar-event-schema.json"
```

Register `create` separately when your app supports creating a new event. A create intent opens a new-event route (for example `/events/new`) and omits the top-level `value` because there is no existing event to identify.

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type once published, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./calendar-event-schema.json` for `edit`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the calendar event to edit, for example gid://application/calendar-event/abc-123.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Event title"
      },
      "description": {
        "type": "string",
        "description": "Event description"
      },
      "start": {
        "type": "string",
        "description": "Start as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
      },
      "end": {
        "type": "string",
        "description": "End as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
      },
      "all_day": {
        "type": "boolean",
        "description": "Whether the event is all-day"
      },
      "location": {
        "type": "string",
        "description": "Venue or place text"
      },
      "external_url": {
        "type": "string",
        "description": "Optional ticket or info URL"
      }
    }
  }
}
```

`value` carries the event being edited. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the GID and substitutes the bare tail into the `{id}` placeholder, so `/events/{id}/edit` opens as `/events/abc-123/edit`.

For `create`, omit `value`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Event title"
      },
      "description": {
        "type": "string",
        "description": "Event description"
      },
      "start": {
        "type": "string",
        "description": "Start as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
      },
      "end": {
        "type": "string",
        "description": "End as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
      },
      "all_day": {
        "type": "boolean",
        "description": "Whether the event is all-day"
      },
      "location": {
        "type": "string",
        "description": "Venue or place text"
      },
      "external_url": {
        "type": "string",
        "description": "Optional ticket or info URL"
      }
    }
  }
}
```

## Proposed canonical schema

Draft JSON Schema for the published type (no `required` fields):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "id": {
      "type": "string",
      "description": "The calendar event ID. Used for edit actions."
    },
    "title": {
      "type": "string",
      "description": "Event title"
    },
    "description": {
      "type": "string",
      "description": "Event description"
    },
    "start": {
      "type": "string",
      "description": "Start as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
    },
    "end": {
      "type": "string",
      "description": "End as ISO 8601 datetime, or YYYY-MM-DD when all_day is true"
    },
    "all_day": {
      "type": "boolean",
      "description": "Whether the event lasts the whole day"
    },
    "location": {
      "type": "string",
      "description": "Venue or place text"
    },
    "external_url": {
      "type": "string",
      "description": "Optional https URL for tickets or more information"
    }
  }
}
```

## Fields the schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | The event ID. Used for `edit` actions. |
| `title` | string | Event title. |
| `description` | string | Event description. Apps decide whether they store plain text or HTML. |
| `start` | string | Start time. Prefer ISO 8601; allow `YYYY-MM-DD` for all-day events. |
| `end` | string | End time. Same formats as `start`. |
| `all_day` | boolean | All-day event flag. |
| `location` | string | Human-readable venue or place. |
| `external_url` | string | Optional ticket / info link. |

`additionalProperties: true` — apps may pass extra fields (tags, color, calendar id, product links), but Sidekick won't validate them as part of the canonical contract.

**Fields commonly proposed for inclusion** (extend this RFC or open a follow-up to push for any of these):

- `timezone` — IANA timezone when the shop's default is not enough
- `status` — draft vs published
- `capacity` / `ticket_url` — for ticketed workshops
- `recurrence` — RRULE or structured recurrence (often paid / advanced; may belong as optional later)

## Common pitfalls

- **Declaring `required` in `inputSchema`.** Sidekick collects missing fields from the merchant and rejects required fields at deploy time.
- **Treating the intent as a write API.** Sidekick navigates into your UI with a prefilled payload. Your UI (or page-level tools) must let the merchant review and confirm before anything is saved.
- **Putting the event ID only in `inputSchema`.** Use the top-level `value` for the existing event's identity on `edit`. Do not add a parallel `eventId` property instead of `value`.
- **Including `value` for `create`.** A new event has no existing identity, so create omits `value`.
- **Reusing `application/campaign`.** A marketing campaign with channels and segments is not the same as a single dated store event on a calendar.
- **Mutating from a data tool.** Data extensions stay read-only. Mutations belong on action intents with merchant confirmation.

## Related types

- **[`application/campaign`](./application-campaign.md)** — coordinated marketing with channels, audiences, or schedules. Use that when the artifact is a campaign, not a calendar event.
- **[`application/page`](./application-page.md)** — authored page content/layout. An event may *link* to a page, but editing the event is not editing the page.
- **[`application/email`](./application-email.md)** — composing an outbound email. Event reminder emails are emails; the event record itself is not.

## Discussion history

- Original RFC: [#56 — application/calendar-event intent type](https://github.com/Shopify/app-intent-types/discussions/56)
