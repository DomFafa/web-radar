import assert from "node:assert/strict";
import { test } from "vitest";
import { domainKey, filterDomains, upsertDomain } from "../../src/outreach/client/lib/sending-domains";

const domains = [
  { providerId: "first", domain: "example.com", verified: false },
  { providerId: "second", domain: "example.com", verified: false },
];

test("default shows all accounts and selection filters locally", () => {
  assert.deepEqual(filterDomains(domains, ""), domains);
  assert.deepEqual(filterDomains(domains, "second"), [domains[1]]);
  assert.deepEqual(filterDomains(domains, "missing"), []);
});

test("updates and deletion target the account even for identical domains", () => {
  const updated = { ...domains[0], verified: true };
  assert.deepEqual(upsertDomain(domains, updated), [updated, domains[1]]);
  assert.deepEqual(domains.filter((item) => domainKey(item) !== domainKey(domains[0])), [domains[1]]);
  const added = { ...domains[0], providerId: "third" };
  assert.deepEqual(upsertDomain(domains, added), [added, ...domains]);
});
