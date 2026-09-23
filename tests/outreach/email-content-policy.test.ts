import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { findBlockedEmailTerms } from "../../src/outreach/shared/email-content-policy";

describe("email content policy", () => {
  it("blocks the reported Guns sentence in subject, HTML and plain text", () => {
    const sentence = "We appreciate your time and support. If you have any questions, our team is here to help. Guns";
    assert.ok(findBlockedEmailTerms(sentence, "").includes("guns"));
    assert.ok(findBlockedEmailTerms("Thank you", `<p>${sentence}</p>`).includes("guns"));
    assert.ok(findBlockedEmailTerms("Thank you", "", sentence).includes("guns"));
  });

  it("blocks common English aliases, plurals and case variations", () => {
    for (const term of ["gun", "guns", "firearms", "weapons", "explosives", "drug", "drugs",
      "porn", "cryptocurrency", "cryptocurrencies", "crypto", "gambling", "casino", "casinos",
      "money laundering", "human trafficking"]) {
      assert.ok(findBlockedEmailTerms("", `<p>${term.toUpperCase()}.</p>`).includes(term), term);
    }
  });

  it("retains Chinese category checks", () => {
    for (const term of ["枪支", "毒品", "色情", "洗钱", "加密货币", "赌博", "人口贩卖"]) {
      assert.ok(findBlockedEmailTerms("", `<p>${term}</p>`).includes(term), term);
    }
  });

  it("does not match English aliases inside unrelated words", () => {
    assert.deepEqual(findBlockedEmailTerms("Thank you", "<p>begun, burgundy, drugstore, cryptography</p>"), []);
    assert.deepEqual(findBlockedEmailTerms("Thank you", "<p>We appreciate your time and support.</p>"), []);
  });
});
