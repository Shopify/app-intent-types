# `application/quote`

Sidekick intent type for creating or opening a **quote** — an app-owned sales quote or proposal that a merchant negotiates with a buyer before it becomes an order.

- **Status:** ✅ Supported
- **Actions:** `create`, `edit`
- **Schema:** [`https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/quote.json`](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/quote.json)

## When to register an intent for this type

Register an `application/quote` intent when your app owns quote records that a merchant creates, sends, negotiates, and eventually converts into an order. This is the shape shared by request-a-quote (RFQ), hide-price, and B2B negotiation apps.

The quote itself is yours. Shopify models the *agreed* commercial terms (companies, catalogs, payment terms) and the *conversion* (draft orders and orders), but it has no object for the negotiation in between: rounds, offers and counters, expiry, accept or decline. That gap is what this type covers.

Typical examples:
- A **B2B quote app** registering `edit` so "open quote QW-1013" takes the merchant straight to that quote.
- An **RFQ app** registering `create` so "start a quote for Acme at $12,000" opens a new quote pre-filled from the merchant's sentence.
- A **wholesale app** registering `edit` so a merchant can ask Sidekick to pull up the quote a buyer just countered, then work it in your UI.

## Example: register the intent

In your extension's `shopify.extension.toml`:

```toml
[[extensions]]
name = "Open quote"
description = "Open or edit a B2B quote"
handle = "open-quote"
type = "admin_link"

  [[extensions.targeting]]
  target = "admin.app.intent.link"
  url = "/quotes/{id}"
  tools = "./tools.json"
  instructions = "./instructions.md"

  [[extensions.targeting.intents]]
  type = "application/quote"
  action = "edit"
  schema = "./quote-schema.json"
```

Four things to notice:

1. **`type`** is the MIME type from this catalog. Required.
2. **`action`** is `create` or `edit`. Required. Register one block per action if you support both.
3. **`schema`** points to a local JSON Schema file. Required. It must `$ref` the canonical schema for this type, and it **must not declare `required` fields** — Sidekick collects missing fields from the merchant before invoking your extension.
4. **`target`** is `admin.app.intent.link` to navigate the merchant to a page you already render, or `admin.app.intent.render` to render an admin UI extension inline instead.

## Example: the input schema

`./quote-schema.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The GID of the quote to open, for example gid://application/quote/1013.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/quote.json",
    "type": "object",
    "properties": {
      "company": {
        "type": "string",
        "description": "Company name or GID the quote belongs to (B2B)",
        "mapTo": "query_param",
        "fieldName": "company"
      },
      "total": {
        "type": "string",
        "description": "Proposed total in shop currency"
      },
      "message": {
        "type": "string",
        "description": "Note to the buyer"
      }
    }
  }
}
```

`value` carries the quote being acted on. With `mapTo: "param"` and `fieldName: "id"`, Sidekick strips the GID and substitutes the bare tail into the `{id}` placeholder, so `/quotes/{id}` opens as `/quotes/1013`. For `create`, omit `value` — there is no quote to open yet.

## Fields the schema describes

**What the canonical schema captures today:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | The quote ID. Used for `edit` actions. |

`additionalProperties: true` — declare your own prefill fields in your `inputSchema.properties`, as in the example above. Sidekick won't validate them, but they are how a merchant's sentence reaches your UI.

**Fields commonly proposed for inclusion** (open an [RFC discussion](../../discussions/categories/rfc) to push for any of these):

- `buyer_email` — the buyer the quote is addressed to
- `company` — company name or GID, for B2B quotes
- `total` — proposed total in shop currency
- `message` — note to the buyer
- `expires_at` — when the offer lapses

## Common pitfalls

- **Waiting for an `open` action.** There isn't one, and there won't be. `edit` *is* the open contract: it navigates the merchant to your `url` with the quote's identifier substituted, and nothing forces that page to be an editor. It can be your read-only quote view.
- **Expecting actions for `send`, `counter`, or `convert`.** Every `application/*` type supports exactly `create` and `edit`. Those verbs aren't navigation targets, they're operations on a quote that is already open, so declare them in `tools.json` and register them from the route with `shopify.tools.register`. They run while the merchant is on the page and stage into your own confirm UI.
- **Forgetting the resource-link `mimeType`.** A search result only becomes actionable when the `mimeType` on the resource link your data extension returns matches the intent `type`. Return `mimeType: "application/quote"` and `uri: "gid://application/quote/1013"`, or "open it" has nothing to invoke.
- **Declaring `required` in your `inputSchema`.** Sidekick rejects the extension at deploy time. The pattern is "schema describes the shape, Sidekick collects the data."
- **Treating the intent as a webhook.** It isn't. Sidekick navigates the merchant into your UI with the payload pre-filled, and your UI is responsible for review and confirmation before anything is sent, countered, or converted.

## Related types

- **[`shopify/order`](./shopify-order.md)** — for importing an existing Shopify order into your app. A converted quote produces a Shopify order or draft order, but the quote itself stays app-owned; these are different objects at different points in the lifecycle.
- **[`application/ticket`](./application-ticket.md)** — for support conversations. A quote negotiation looks conversational but is a commercial artifact with its own totals and lifecycle, so don't overload this type.

## Discussion history

- Original proposal: [#5 — Application/quote intent type for quote & negotiation apps](../../discussions/5)
