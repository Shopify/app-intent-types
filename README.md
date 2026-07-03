# Sidekick app extensions intent types

Public catalog and proposal venue for **Sidekick app intent types** — the MIME-typed schemas that Shopify apps register to declare "I can create, edit, or import a thing of this shape."

If you're building a Shopify app and the type you need to register an intent for doesn't exist yet, **this is the place to ask for it.**

> Sidekick is Shopify's AI-powered merchant assistant. When a merchant asks Sidekick to do something ("draft a back-in-stock email", "create a return"), Sidekick looks for an installed app that has registered an intent matching the action. Intent types are the contract that lets Sidekick discover and route to the right app. See [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions) for the full developer guide.

## What's here

- **[`types/`](./types/)** — every intent type Shopify currently supports, one file per type, with the JSON Schema URL, supported actions, and example use cases.
- **[Discussions](../../discussions)** — open conversations about intent design, early-stage proposals, and questions. Use this before a formal PR.
- **Pull requests** — formal proposals for new types, additions to existing types, and refinements. See [How to propose a new type](#how-to-propose-a-new-type) below.

## Currently supported types

This list mirrors the supported types documented in [Build an app action](https://shopify.dev/docs/apps/build/sidekick/build-app-actions).

### `application/*` intents

Use `application/*` intents when your app owns the data shape. Each type supports both `create` and `edit` actions.

| Type | Description | Actions | Schema |
|---|---|---|---|
| [`application/ad`](./types/application-ad.md) | Ad campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/ad.json) |
| [`application/campaign`](./types/application-campaign.md) | Marketing campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/campaign.json) |
| [`application/email`](./types/application-email.md) | Email campaigns | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/email.json) |
| [`application/faq`](./types/application-faq.md) | FAQ management | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/faq.json) |
| [`application/loyalty-program`](./types/application-loyalty-program.md) | Loyalty programs | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/loyalty-program.json) |
| [`application/return`](./types/application-return.md) | Returns management | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/return.json) |
| [`application/review`](./types/application-review.md) | Product reviews | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/review.json) |
| [`application/shipment`](./types/application-shipment.md) | Shipment tracking | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/shipment.json) |
| [`application/ticket`](./types/application-ticket.md) | Support tickets | `create`, `edit` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/ticket.json) |

### `shopify/*` resource intents

Use `shopify/*` intents when your app operates on a Shopify resource identified by a GID. Each type supports both `import` and `import+bulk` actions.

| Type | Description | Actions | GID schema |
|---|---|---|---|
| [`shopify/customer`](./types/shopify-customer.md) | Shopify customers | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/customer/gid.json) |
| [`shopify/order`](./types/shopify-order.md) | Shopify orders | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/order/gid.json) |
| [`shopify/product`](./types/shopify-product.md) | Shopify products | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/product/gid.json) |
| [`shopify/selling-plan`](./types/shopify-selling-plan.md) | Shopify selling plans 🧪 | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/selling-plan/gid.json) |
| [`shopify/subscription-contract`](./types/shopify-subscription-contract.md) | Shopify subscription contracts 🧪 | `import`, `import+bulk` | [schema](https://extensions.shopifycdn.com/shopifycloud/schemas/v1/shopify/subscription-contract/gid.json) |

## How to propose a new type

There are two paths, depending on how settled your idea is.

### Path 1 — Start with a Discussion (recommended for new ideas)

If you're not sure the type makes sense, what shape it should be, or whether something close to it already exists, **open an [RFC discussion](../../discussions/categories/rfc)** first. We'd rather sketch with you in a thread than have you spend hours on a PR that needs to start over.

A good RFC discussion answers:
1. **What type are you proposing?** (e.g. `application/invoice`)
2. **What do merchants ask Sidekick to do that needs it?** Real-world examples beat hypotheticals.
3. **What apps would register intents for it?** Yours, plus any others you can think of.
4. **What fields does it need?** A sketch of the schema is enough — full JSON Schema can come later.
5. **Anything close in the existing list?** If `application/ticket` covers most of what `application/invoice` would, say so.

### Path 2 — Open a Pull Request

Once the shape is settled (either through discussion or because the type is obvious), open a PR adding a file under `types/`. Use [`types/application-email.md`](./types/application-email.md) as the template.

A type proposal PR should include:

- A new file under `types/` describing the type, actions, schema, and example use cases. Use `application-{name}.md` for app-owned shapes and `shopify-{resource}.md` for Shopify resource intents.
- A draft JSON Schema (inline in the PR or linked from a Gist) that conforms to the [Sidekick schema requirements](https://shopify.dev/docs/apps/build/sidekick/build-app-actions). Critically, **`inputSchema` must not declare `required` fields** — Sidekick fills missing fields via UI before invoking your extension.
- A short rationale: who's asking for this, what problem it unblocks, and any prior art.

We'll review and either merge, request changes, or move it back to a discussion if more shaping is needed.

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

- A Shopify maintainer responds to discussions and PRs within **5 business days**.
- For PRs, expect at least one round of schema review before merge.
- Merging this repo doesn't automatically ship the type — Shopify still has to publish the schema to `extensions.shopifycdn.com` and roll it out to Sidekick. We'll comment on the PR with the rollout timeline.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

The content in this repository is licensed under [CC BY 4.0](./LICENSE.md) (Creative Commons Attribution 4.0 International).
