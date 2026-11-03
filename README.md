# Sidekick app extensions intent types

Public catalog and proposal venue for **Sidekick app intent types** — the MIME-typed schemas that Shopify apps register to declare "I can create, edit, or import a thing of this shape."

If you're building a Shopify app and the type you need to register an intent for doesn't exist yet, **this is the place to ask for it.**

> Sidekick is Shopify's AI-powered merchant assistant. When a merchant asks Sidekick to do something ("draft a back-in-stock email", "create a return"), Sidekick looks for an installed app that has registered an intent matching the action. Intent types are the contract that lets Sidekick discover and route to the right app. See [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions) for the full developer guide.

## What's here

- **[`types/`](./types/)** — every intent type Shopify currently supports, one file per type, with the JSON Schema URL, supported actions, and example use cases.
- **[Discussions](../../discussions)** — where partners propose new types, request additions to existing types, suggest refinements, and ask questions. See [How to propose a new type](#how-to-propose-a-new-type) below.
- **Pull requests** — opened by Shopify's internal team to formalize requests from discussions and update the catalog.

## Currently supported types

This list mirrors the supported types documented in [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

### `application/*` intents

Use `application/*` intents when your app owns the data shape. Each type supports both `create` and `edit` actions.

| Type | Description | Actions | Schema |
|---|---|---|---|
| [`application/ad`](./types/application-ad.md) | Ad campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/ad.json) |
| [`application/campaign`](./types/application-campaign.md) | Marketing campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/campaign.json) |
| [`application/checkout-rule`](./types/application-checkout-rule.md) | App-owned checkout customization rules | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/checkout-rule.json) |
| [`application/email`](./types/application-email.md) | Email campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/email.json) |
| [`application/experiment`](./types/application-experiment.md) | Experiments and A/B tests | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/experiment.json) |
| [`application/faq`](./types/application-faq.md) | FAQ management | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/faq.json) |
| [`application/legal-page`](./types/application-legal-page.md) | Legal and privacy pages | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/legal-page.json) |
| [`application/loyalty-program`](./types/application-loyalty-program.md) | Loyalty programs | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/loyalty-program.json) |
| [`application/optimization-plan`](./types/application-optimization-plan.md) | Optimization plans | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/optimization-plan.json) |
| [`application/page`](./types/application-page.md) | App-managed pages, such as page builders | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/page.json) |
| [`application/quote`](./types/application-quote.md) | Sales quotes & negotiation | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/quote.json) |
| [`application/return`](./types/application-return.md) | Returns management | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/return.json) |
| [`application/review`](./types/application-review.md) | Product reviews | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/review.json) |
| [`application/shipment`](./types/application-shipment.md) | Shipment tracking | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/shipment.json) |
| [`application/ticket`](./types/application-ticket.md) | Support tickets | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/ticket.json) |
| [`application/visitor-restriction`](./types/application-visitor-restriction.md) | Visitor access rules | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/visitor-restriction.json) |

### `shopify/*` resource intents

Use `shopify/*` intents when your app operates on Shopify-owned resources. Supported actions and GID contracts vary by type; use the actions and schema references listed in each entry.

| Type | Description | Actions | GID schema |
|---|---|---|---|
| [`shopify/customer`](./types/shopify-customer.md) | Shopify customers | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/customer/gid.json) |
| [`shopify/OnlineStoreTheme`](./types/shopify-onlinestoretheme.md) | Online store themes | `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/onlinestoretheme/gid.json) |
| [`shopify/order`](./types/shopify-order.md) | Shopify orders | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/order/gid.json) |
| [`shopify/product`](./types/shopify-product.md) | Shopify products | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json) |

## How to propose a new type

**Open an [RFC discussion](../../discussions/categories/rfc), not a pull request.** This is the contribution path for partners, whether you're sharing an early idea or a fully shaped proposal. Shopify's internal team is responsible for formalizing requests into PRs.

Before starting a new discussion, check the existing types and discussions to see whether your use case is already covered. If a discussion covers your request, upvote it and add your use case instead of opening a duplicate. Upvotes and concrete use cases help our team gauge demand and prioritize requests.

A good RFC discussion answers:
1. **What type are you proposing?** (e.g. `application/invoice`)
2. **What do merchants ask Sidekick to do that needs it?** Real-world examples beat hypotheticals.
3. **What apps would register intents for it?** Yours, plus any others you can think of.
4. **What fields does it need?** A sketch of the schema is enough — full JSON Schema can come later.
5. **Anything close in the existing list?** If `application/ticket` covers most of what `application/invoice` would, say so.

If you already have a draft JSON Schema, include it in the discussion or link to it. It should conform to the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions). Critically, **`inputSchema` must not declare `required` fields** — Sidekick fills missing fields via UI before invoking your extension. A complete schema isn't required to start the conversation.

Keep schemas minimal: every field becomes part of the platform-wide contract for that MIME type, so focus on broadly useful fields rather than app-specific details.

### What happens next

We'll review the request and work with you in the discussion to refine it. For accepted proposals, Shopify's internal team opens the PR to add or update the files under `types/`, linking back to the discussion. Partners don't need to prepare or submit a PR.

## What we're looking for

**Good candidates:**
- Types with a clear, recurring merchant intent ("send a customer a $thing") that multiple apps would plausibly handle.
- Things distinct enough from existing types that overloading one of those would be confusing.
- Schemas that describe the *user-facing artifact*, not your app's internal representation.

**Less good candidates:**
- Types that only one app would ever register for — ask yourself whether this is really an intent type or just an API for your app.
- Types that fragment an existing one. If `application/email` could carry your "transactional email" use case with an optional field, that's usually better than a new type.
- App-internal workflow steps. Intents are merchant-facing actions, not internal pipeline stages.

## What this repo isn't for

- **Bug reports about Sidekick or your extension's behavior** — file those through the [Partner Dashboard](https://partners.shopify.com/) or the [Shopify Community forum](https://community.shopify.com/c/shopify-apps/ct-p/shopify-apps).
- **Help debugging your `shopify.extension.toml`** — open a [Help discussion](../../discussions/categories/help).
- **Sidekick product feedback** ("Sidekick should do X") — those go to the same channels as bug reports above.

## Review process

- A Shopify maintainer responds to discussions within **5 business days**.
- Expect at least one round of schema review as we work through the proposal in the discussion.
- Merging a PR doesn't automatically ship the type — Shopify still has to publish the schema to `extensions.shopifycdn.com` and roll it out to Sidekick. We'll share the rollout timeline in the discussion.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

The content in this repository is licensed under [CC BY 4.0](./LICENSE.md) (Creative Commons Attribution 4.0 International).
