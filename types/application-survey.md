# `application/survey`

Sidekick intent type for creating or opening a **survey**: an app-owned questionnaire that collects attribution, satisfaction, or research feedback from shoppers.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json)

## When to register an intent for this type

Register `application/survey` when your app owns questionnaires that merchants create and manage. The survey definition is the artifact, not an individual shopper's response or a report of the results.

Typical examples:

- A **post-purchase survey app** registering `create` for "create a survey asking customers how they heard about us."
- An **attribution app** registering `edit` for "add a TikTok option to my 'how did you hear about us' survey."
- A **customer feedback app** registering `create` for "set up an NPS survey on the order status page."
- A **retail survey app** registering `edit` for "open the in-store survey so I can pause it."

The app owns the survey's questions, placements, status, and scheduling. A survey can appear after checkout, in-store, or on an app-owned surface without changing its intent type. A signup form whose primary job is collecting subscribers is a different artifact; don't classify a form as a survey just because both collect input.

## Example: register an edit intent

For an embedded app with an existing survey page, add an admin link to `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open survey"
description = "Open or edit a customer survey"
handle = "open-survey"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/surveys/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/survey"
  action = "edit"
  schema = "./survey-edit-schema.json"
```

`./survey-edit-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The app-owned survey identifier to open.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The app-owned survey name."
      },
      "placements": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Placements supported by this app."
      }
    }
  }
}
```

`value` identifies the survey. With `mapTo: "param"` and `fieldName: "id"`, a value such as `gid://application/survey/123` fills `{id}` with `123`. Keep survey identifiers app-owned; don't invent a Shopify survey GID or duplicate the survey identifier in `inputSchema.properties`.

`name` and `placements` above are examples of this app's optional prefill, not shared survey fields. Your app declares the fields and supported values it understands. Your route must validate the input, authorize the survey for the current shop and staff member, reload it from your own storage, and stage changes for merchant review.

## Example: register a create intent

Use a separate creation route that doesn't need an existing identifier:

```toml
[[extensions]]
name = "Create survey"
description = "Start a customer survey for merchant review"
handle = "create-survey"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/surveys/new"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/survey"
  action = "create"
  schema = "./survey-create-schema.json"
```

For `survey-create-schema.json`, use the same `inputSchema` as the edit example and omit the top-level `value`. Creation has no existing survey to open, and its URL must not depend on an unmapped `{id}`.

Both examples include `tools` and `instructions`. Declare contextual operations in `tools.json` and bind their handlers at runtime with `shopify.tools.register` from the opened route. For example, a tool can stage a question change while the survey is open; it shouldn't just duplicate navigation to the survey page.

For a UI-extension recipient, use `admin.app.intent.render` with API version `2026-04` or later. Read the request's `value` and `data` through the extension API instead of treating URL mappings as UI-extension transport. See [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions) for recipient setup, tools, and instructions.

## Canonical schema

The shared baseline is deliberately minimal:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/survey.json",
  "title": "Survey Schema",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The survey ID"
    }
  },
  "additionalProperties": true
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Optional app-owned survey ID, matching other application baselines. The edit invocation's primary identity belongs in top-level `value`. |

There are no required fields. `additionalProperties: true` keeps app-specific prefill extensible; it doesn't standardize those fields or guarantee that every provider supports them.

Fields that apps can describe in their own `inputSchema.properties` include `name`, `status`, `placements`, `questions`, `success_message`, `starts_at`, and `ends_at`. Question kinds, answer options, branching, targeting, translations, and scheduling remain provider-owned. Propose shared fields separately after establishing common semantics across apps.

## Common pitfalls

- **Treating `edit` as an immediate mutation.** It's also the open/navigation handoff. Your app owns authorization, preview, and merchant confirmation before publishing, pausing, or deleting anything.
- **Adding actions such as `read`, `delete`, `publish`, or `pause`.** This type supports only `create` and `edit`. Reading results belongs in app data tools; operations on the open survey belong in contextual tools and the app's workflow.
- **Forgetting the resource-link `mimeType`.** A data extension that returns a survey should use `mimeType: "application/survey"` and its app-owned survey URI, such as `gid://application/survey/123`. Matching the resource link to the intent type enables the "open it" handoff.
- **Declaring `required` inside intent `inputSchema`.** Don't require fields at any nested schema location. Tool input schemas are different and can use `required`.
- **Assuming a shared question-edit protocol.** The canonical baseline doesn't define question or option shapes. If your app exposes question editing, define stable question identity and replacement-versus-patch behavior in your own schema and tools.
- **Freezing placements globally.** Placements and delivery channels vary by app. Declare your supported values locally rather than assuming a shared three-surface enum.
- **Passing shopper answers as survey prefill.** This handoff describes the questionnaire. Keep response analytics and unnecessary customer PII out of its identifiers, URLs, and payloads.

## Related types

- **[`application/review`](./application-review.md)**: a product review or merchant reply, not the questionnaire used to collect feedback.
- **[`application/faq`](./application-faq.md)**: published questions and answers that shoppers read, rather than a form they answer.
- **[`application/campaign`](./application-campaign.md)**: can distribute an invitation to a survey; the campaign and questionnaire remain separate artifacts.

## Discussion history

- Original proposal: [#14: Add application/survey intent type](https://github.com/Shopify/app-intent-types/pull/14).
