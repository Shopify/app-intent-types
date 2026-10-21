# Contributing

Thanks for proposing a Sidekick intent type. This doc describes the workflow.

## Before you open a PR

1. **Check [`types/`](./types/)** — your type may already exist, or be close enough that an addition to an existing type is the right move.
2. **Search [Discussions](../../discussions)** — someone may have proposed it already.
3. **If still unclear, open an [RFC discussion](../../discussions/categories/rfc).** A 5-minute thread can save a 5-hour PR.

## Opening a PR

A type-proposal PR adds **one file** under `types/`, named for the intent type. Use `application-{name}.md` for app-owned shapes or `shopify-{resource}.md` for Shopify resource intents. Use [`types/application-email.md`](./types/application-email.md) or [`types/shopify-product.md`](./types/shopify-product.md) as templates.

The file should cover:

- **Type and actions** — what MIME type, which supported actions you're registering for, and why. `application/*` types support `create` / `edit`; `shopify/*` resource actions are type-specific. Customer, order, and product types support `import` / `import+bulk`; `shopify/InventoryTransfer` supports `create` / `edit`.
- **When to register** — the merchant intents this type captures, with concrete examples.
- **TOML example** — a real `shopify.extension.toml` block showing how an extension would register.
- **Schema** — either inline JSON Schema in a fenced block or a link to a Gist / branch. `application/*` intents must `$ref` the canonical application schema URL once published. `shopify/*` intents must use the published resource GID schema for `value` and `outputSchema`. Must not declare `required` fields.
- **Field overview** — a short table orienting readers to the major fields.
- **Common pitfalls** — anything that tripped you up while drafting.
- **Related types** — pointers to existing types this could be confused with, and why yours is distinct.

## What we look for in review

- **Real demand.** "I want this for my app" is fine; "three other apps in this category would also use this" is better.
- **Distinct shape.** If 80% of your fields overlap with an existing type, an extension to that type beats a new one.
- **Merchant-facing artifact, not internal data.** The type describes the *thing the merchant is creating or editing*, not your app's pipeline.
- **Schema hygiene.** Field names in lowercase-with-dashes or camelCase consistent with neighboring types. No `required` in `inputSchema`. URIs over raw bytes for any large content.

## Review SLA

A maintainer responds within **5 business days**. If you don't hear back in that window, comment on the PR or ping `@shopify/sidekick-intents` and we'll triage.

Expect at least one round of schema review before merge. Merging the PR documents the proposal — it does not automatically publish the type. Shopify will follow up with the timeline for publishing the schema to `extensions.shopifycdn.com` and rolling out support in Sidekick.

## CLA

Shopify uses a Contributor License Agreement. The CLA bot will comment on your PR with the link the first time you contribute. You only need to sign once.

## Code of Conduct

By participating, you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
