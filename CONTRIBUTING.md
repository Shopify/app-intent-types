# Contributing

Thanks for helping shape Sidekick intent types. **Partner contributions happen through [RFC discussions](../../discussions/categories/rfc), not pull requests.** Shopify's internal team is responsible for formalizing requests into PRs.

## Before you propose a change

1. **Check [`types/`](./types/)** — your type may already exist, or be close enough that an addition to an existing type is the right move.
2. **Search [Discussions](../../discussions)** — if someone has already proposed it, upvote the discussion and comment with your use case instead of opening a duplicate. Upvotes and concrete use cases help our team gauge demand and prioritize requests.
3. **Open an [RFC discussion](../../discussions/categories/rfc)** if your request isn't already covered, whether it's for a new type, an addition to an existing type, or a refinement.

## Opening an RFC discussion

Describe the request and the merchant use cases it would support. A field sketch is enough to start — you don't need a complete JSON Schema or a new file under `types/`. See [`types/application-email.md`](./types/application-email.md) or [`types/shopify-product.md`](./types/shopify-product.md) for reference examples.

Share as much of the following as you have:

- **Type and actions** — what MIME type, which supported actions you're registering for, and why. `application/*` types support `create` / `edit`; `shopify/*` resource types support `import` / `import+bulk`.
- **When to register** — the merchant intents this type captures, with concrete examples.
- **TOML example** — a real `shopify.extension.toml` block showing how an extension would register.
- **Schema sketch** — proposed fields, or a draft JSON Schema inline or linked from a Gist / branch if you have one. `application/*` intents must `$ref` the canonical application schema URL once published. `shopify/*` intents must use the published resource GID schema for `value` and `outputSchema`. `inputSchema` must not declare `required` fields.
- **Field overview** — a short table orienting readers to the major fields.
- **Common pitfalls** — anything that tripped you up while drafting.
- **Related types** — pointers to existing types this could be confused with, and why yours is distinct.

Keep schema proposals minimal. Every field becomes part of the platform-wide contract for that MIME type, not just your app's payload. Focus on fields that describe the shared merchant-facing artifact, and leave app-specific details out.

## What we look for in review

- **Real demand.** "I want this for my app" is fine; "three other apps in this category would also use this" is better.
- **Distinct shape.** If 80% of your fields overlap with an existing type, an extension to that type beats a new one.
- **Merchant-facing artifact, not internal data.** The type describes the *thing the merchant is creating or editing*, not your app's pipeline.
- **Schema hygiene.** Field names in lowercase-with-dashes or camelCase consistent with neighboring types. No `required` in `inputSchema`. URIs over raw bytes for any large content.

## Review SLA

A maintainer responds within **5 business days**. If you don't hear back in that window, comment on the discussion or ping `@shopify/sidekick-intents` and we'll triage.

Expect at least one round of schema review as we work through the proposal in the discussion.

## From discussion to catalog

For accepted proposals, Shopify's internal team opens and manages the PR to add or update the files under `types/`, linking back to the original discussion. Partners don't need to prepare or submit a PR.

Merging the PR documents the proposal — it does not automatically publish the type. Shopify will follow up in the discussion with the timeline for publishing the schema to `extensions.shopifycdn.com` and rolling out support in Sidekick.

## Code of Conduct

By participating, you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
