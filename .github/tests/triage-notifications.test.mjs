import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';

// Exercise the actual inline workflow script without dependencies or network calls.
const workflow = readFileSync(new URL('../workflows/app-intent-types-triage-notifications.yml', import.meta.url), 'utf8');
const scriptBlock = workflow.match(/^          script: \|\n((?: {12}[^\n]*\n|\s*\n)+)/m);
assert.ok(scriptBlock, 'Workflow must contain an inline script');
const script = scriptBlock[1].replace(/^ {12}/gm, '');
const now = '2026-10-22T16:00:00Z';

function discussion(overrides = {}) {
  return {
    number: 6,
    title: 'Test RFC',
    url: 'https://github.com/Shopify/app-intent-types/discussions/6',
    createdAt: '2026-10-01T12:00:00Z',
    closed: false,
    isAnswered: false,
    answerChosenAt: null,
    author: {login: 'contributor'},
    comments: {nodes: []},
    ...overrides,
  };
}

async function runWorkflow({discussions = [], pullRequests = [], eventName = 'schedule'} = {}) {
  const messages = [];
  const queries = [];
  await runInNewContext(`(async () => {\n${script}\n})()`, {
    process: {env: {
      SLACK_WEBHOOK_URL: 'https://example.invalid/webhook',
      OWNER: 'Shopify',
      REPO: 'app-intent-types',
      RFC_CATEGORY_SLUG: 'rfc',
      SLA_BUSINESS_DAYS: '5',
      MAINTAINER_LOGINS: 'adambarrus,vividviolet,Fionoble',
    }},
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : [now]));
      }
    },
    context: {eventName, payload: {}},
    core: {
      info() {},
      warning(message) { assert.fail(message); },
      setFailed(message) { assert.fail(message); },
    },
    github: {async graphql(query) {
      queries.push(query);
      if (query.includes('discussionCategories(')) {
        return {repository: {discussionCategories: {nodes: [{id: 'rfc-id', slug: 'rfc'}]}}};
      }
      if (query.includes('discussions(')) {
        return {repository: {discussions: {nodes: discussions}}};
      }
      assert.match(query, /pullRequests\(first: 50, states: OPEN/);
      return {repository: {pullRequests: {nodes: pullRequests}}};
    }},
    async fetch(url, options) {
      assert.equal(url, 'https://example.invalid/webhook');
      messages.push(JSON.parse(options.body).text);
      return {ok: true};
    },
  });
  return {messages, queries};
}

for (const eventName of ['schedule', 'workflow_dispatch']) {
  for (const isAnswered of [false, null]) {
    test(`${eventName}: reports an overdue open discussion with isAnswered=${isAnswered}`, async () => {
      const {messages, queries} = await runWorkflow({eventName, discussions: [discussion({isAnswered})]});
      assert.equal(messages.length, 1);
      assert.match(messages[0], /found 1 item/);
      assert.match(messages[0], /RFC discussion:.*#6 Test RFC/);
      const query = queries.find((value) => value.includes('discussions('));
      assert.match(query, /\bclosed\b/);
      assert.match(query, /\bisAnswered\b/);
    });
  }

  for (const [name, overrides] of [
    ['closed without an answer', {closed: true}],
    ['closed with an answer', {closed: true, isAnswered: true, answerChosenAt: now}],
    ['answered but still open', {isAnswered: true, answerChosenAt: now}],
    ['answered even without an answer timestamp', {isAnswered: true}],
    ['an accepted answer timestamp', {answerChosenAt: now}],
    ['a maintainer comment', {comments: {nodes: [{author: {login: 'FioNoble'}}]}}],
    ['not yet overdue', {createdAt: '2026-10-21T12:00:00Z'}],
  ]) {
    test(`${eventName}: skips a discussion with ${name}`, async () => {
      const {messages} = await runWorkflow({eventName, discussions: [discussion(overrides)]});
      assert.deepEqual(messages, []);
    });
  }

  test(`${eventName}: excludes resolved discussions without affecting PR reminders`, async () => {
    const basePr = {
      number: 7,
      title: 'Test proposal',
      url: 'https://github.com/Shopify/app-intent-types/pull/7',
      createdAt: '2026-10-01T12:00:00Z',
      author: {login: 'contributor'},
      comments: {nodes: []},
      reviews: {nodes: []},
    };
    const {messages} = await runWorkflow({
      eventName,
      discussions: [discussion({closed: true}), discussion({isAnswered: true})],
      pullRequests: [basePr, {...basePr, number: 8, reviews: {nodes: [
        {state: 'APPROVED', author: {login: 'adambarrus'}},
      ]}}],
    });
    assert.equal(messages.length, 1);
    assert.match(messages[0], /found 1 item/);
    assert.match(messages[0], /proposal PR:.*#7 Test proposal/);
    assert.doesNotMatch(messages[0], /RFC discussion:/);
  });
}
