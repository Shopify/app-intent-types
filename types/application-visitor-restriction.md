# `application/visitor-restriction`

Sidekick intent type for creating or opening a **visitor restriction** — an app-owned rule that a merchant uses to control visitor access.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/visitor-restriction.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/visitor-restriction.json)

## When to register an intent for this type

Register an `application/visitor-restriction` intent when your app owns access rules that merchants create and review in your UI. Storefront-protection, country-blocking, and IP-blocking apps can use this type without presenting their rules as Shopify customer records or platform security settings.

Typical examples:
- A **country-blocking app** registering `create` so "block visitors from Canada" opens its rule builder with the country prefilled for review.
- An **IP-blocking app** registering `create` so "allowlist our office IP 198.51.100.7" stages a rule in the app, subject to the app's own allowlist semantics.
- A **storefront-protection app** registering `edit` so "open my Canada restriction" opens the existing rule identified by the app's search result.

The type identifies the rule, not its enforcement mechanism. Register only capabilities your app implements. Storefront access, checkout validation, and identity-based blocking aren't interchangeable: an app that supports one doesn't necessarily support the others. An allow rule applies within your app's rule system; it doesn't override Shopify's security controls.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open visitor restriction"
description = "Open or edit a visitor access rule"
handle = "open-visitor-restriction"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/visitor-restrictions/{id}"

  [[extensions.targeting.intents]]
  type = "application/visitor-restriction"
  action = "edit"
  schema = "./visitor-restriction-schema.json"
```

For `create`, register a separate targeting entry with `action = "create"`, a creation URL such as `/visitor-restrictions/new`, and a schema that omits `value`. A new rule doesn't have an identity yet. Don't use an existing-rule URL with an unresolved `{id}` placeholder for creation.

## Example: the input schema

`./visitor-restriction-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The existing visitor restriction ID, for example gid://application/visitor-restriction/123.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/visitor-restriction.json",
    "type": "object",
    "properties": {
      "subjectType": {
        "type": "string",
        "enum": ["country", "ip"],
        "description": "The visitor attribute this app can match."
      },
      "subjectValue": {
        "type": "string",
        "description": "An ISO 3166-1 alpha-2 country code or IP address to prefill for merchant review."
      },
      "disposition": {
        "type": "string",
        "enum": ["block", "allow"],
        "description": "The requested rule behavior; the merchant must review and confirm before saving."
      }
    }
  }
}
```

`value` identifies the existing rule, not the country or IP that the rule matches. With `mapTo: "param"` and `fieldName: "id"`, the example GID supplies `123` to `/visitor-restrictions/{id}`. The matched subject is separate optional prefill in `subjectValue`.

The extra fields above belong to this example app's schema. They aren't shared fields in the canonical schema, and other apps can support different inputs. No input field is required: the app collects missing information in its UI.

## Fields the schema describes

The canonical schema is deliberately minimal:

| Field | Type | Notes |
|---|---|---|
| `id` | string | The app-owned visitor restriction ID. The edit registration carries the existing identity in top-level `value`, not a second input ID. |

`additionalProperties: true` lets your app describe optional prefill fields in `inputSchema.properties`.

| Example app field | Purpose |
|---|---|
| `subjectType` | The kind of attribute your app can match, such as country or IP. |
| `subjectValue` | The proposed match value, distinct from the rule's identity. |
| `disposition` | The requested block or allow behavior within your app. |
| `scope` | An enforcement surface, only if your app supports it and explains its limits. |
| `reason` | An optional merchant-facing note. |

Only expose email matching if your app can enforce it at the intended surface. Don't infer that an email rule can identify an anonymous storefront visitor. The shared schema doesn't define an `all` scope, precedence between rules, or a default block/allow operation.

## Common pitfalls

- **Using the matched subject as `value`.** Two rules can match the same subject. Return a stable rule URI from search with `mimeType: "application/visitor-restriction"`, such as `gid://application/visitor-restriction/123`, so `edit` opens the intended rule.
- **Adding `block`, `allow`, or `toggle` actions.** Use `create` to stage a new rule or `edit` to open an existing one. Changes happen in the app's workflow, not through new action verbs.
- **Applying a rule on navigation.** Opening an intent must not save or enable a rule. Show the subject, effective scope, and consequences for review, then require explicit merchant confirmation. Reload and authorize existing rules for the current shop and staff member before changing them.
- **Promising universal enforcement.** Don't silently substitute storefront filtering for checkout enforcement, apply unsupported scopes, or suggest an app allowlist bypasses Shopify protections. Show unsupported requests in your UI rather than reporting success.
- **Putting personal data in URLs.** Use an opaque rule ID in the path, not an email or IP address. Avoid transporting sensitive subjects in query strings or copying them into analytics and logs.
- **Requiring prefill.** Don't declare `required` anywhere in `inputSchema`. Validate values and collect missing details in your app before confirmation.

## Related types

- **[`shopify/customer`](./shopify-customer.md)** imports an existing Shopify customer into an app. A visitor restriction is an app-owned rule, not a customer record.
- **[Proposed `application/checkout-rule` RFC](../../discussions/8)** covers checkout customization rules, including payment/delivery presentation and validation. Distinguish visitor access rules from payment or delivery customization; the checkout-rule proposal isn't a supported type in this catalog.

## Discussion history

- Original proposal: [#6 — Visitor restriction intent type](../../discussions/6).
