# `application/calendar-event`

Sidekick intent type for creating or editing an app-owned **store calendar event**, such as a workshop, class, tasting, or physical pop-up event.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`calendar-event.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json)

## When to register an intent for this type

Register this type when your app owns dated store occurrences that merchants manage in a calendar or event editor.

Typical examples:

- A calendar app registers `create` for "create a wine tasting next Saturday at 6pm."
- A workshop app registers `edit` for "change the location of tomorrow's pottery class."
- An in-store events app registers `edit` for "open the holiday pop-up event."

The intent opens your app's UI. It doesn't save, publish, cancel, sell tickets, or send invitations by itself. The merchant reviews and confirms changes in your UI or through page-level tools.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open calendar event"
description = "Open or edit a store calendar event"
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

Register `create` separately with a new-event route such as `/events/new`. For that registration, omit the schema's top-level `value`. Use `admin.app.intent.render` instead if your app fulfills the request in an Admin UI extension.

## Example: the input schema

`./calendar-event-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned event identifier, for example gid://application/calendar-event/abc-123.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/calendar-event.json",
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the store calendar event",
        "mapTo": "query_param"
      }
    }
  }
}
```

For `edit`, top-level `value` identifies the existing event. With `mapTo: "param"` and `fieldName: "id"`, the GID tail fills `{id}`, so the example opens `/events/abc-123/edit`. Don't duplicate that identity in a separate `eventId` input.

The `title` field above is an app-defined prefill field, not a shared baseline field. Declare other prefill fields in your app's schema only when your app supports them. Your app defines and validates its date/time formats, time zones, all-day boundaries, recurrence, and URL handling.

## Fields the canonical schema describes

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional calendar event ID. Existing-object routing uses top-level `value`. |

The baseline uses JSON Schema 2020-12, has no `required` fields, and sets `additionalProperties: true`. It doesn't prescribe scheduling fields or make them universally supported across apps.

## Common pitfalls

- **Treating `edit` as a mutation API.** It's also the open/navigation handoff. Saving, publishing, and cancelling belong in your recipient UI or page-level tools with merchant confirmation.
- **Declaring `required` in `inputSchema`.** All intent inputs remain optional, including nested fields. The recipient UI collects missing information.
- **Inventing a Shopify resource GID.** Keep app-owned event identity distinct from Shopify marketing attribution and activity-timeline resources. Don't label an app record `gid://shopify/CalendarEvent/...`.
- **Omitting the resource-link MIME type.** Data tools should return `mimeType: "application/calendar-event"` with a stable URI such as `gid://application/calendar-event/abc-123` so Sidekick can connect the result to the matching action. Data tools remain read-only.
- **Trusting prefill as authorization.** Resolve the event within the current store and staff permissions, reload authoritative state, and validate prefill before saving. Never put secrets or unnecessary attendee information in resource URIs.
- **Confusing the artifact with a booking or ticket purchase.** This type opens the event occurrence, not a customer's reservation, payment, or admission ticket.

## Related types

- [`application/campaign`](./application-campaign.md): marketing that promotes an event, not the scheduled occurrence itself.
- [`application/page`](./application-page.md): an authored event landing page, not the event record.
- [`application/email`](./application-email.md): an event invitation or reminder message, not the event record.
- [`application/ticket`](./application-ticket.md): a support conversation, not an event admission ticket.

## Discussion history

- Original RFC: [#56 — application/calendar-event](https://github.com/Shopify/app-intent-types/discussions/56).
