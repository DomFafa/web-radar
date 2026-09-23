export const BLOCKED_EMAIL_TERMS = [
  "枪支", "枪械", "武器", "炸弹", "爆炸物",
  "毒品", "海洛因", "可卡因", "大麻",
  "色情", "淫秽", "成人内容", "儿童色情",
  "洗钱", "加密货币", "虚拟货币",
  "赌博", "博彩", "赌场",
  "人口贩卖", "人口走私",
  "违反美国政策", "违反欧盟政策", "违反中国政策",
  "规避美国制裁", "规避欧盟制裁", "规避中国监管",
  "gun", "guns", "firearm", "firearms", "weapon", "weapons", "explosive", "explosives",
  "drug", "drugs", "heroin", "cocaine", "marijuana",
  "porn", "pornography", "adult content", "child porn", "child pornography",
  "money laundering", "cryptocurrency", "cryptocurrencies", "crypto", "crypto currency", "crypto currencies",
  "gambling", "casino", "casinos", "human trafficking", "sex trafficking",
  "sanctions evasion", "export control evasion", "regulatory evasion",
  "evade us sanctions", "evade eu sanctions", "evade chinese regulations",
] as const;

function plainEmailContent(subject: unknown, bodyHtml: unknown, bodyText?: unknown): string {
  return `${String(subject || "")} ${String(bodyHtml || "").replace(/<[^>]*>/g, " ")} ${String(bodyText || "")}`
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function findBlockedEmailTerms(subject: unknown, bodyHtml: unknown, bodyText?: unknown): string[] {
  const content = plainEmailContent(subject, bodyHtml, bodyText);
  return BLOCKED_EMAIL_TERMS.filter((term) => {
    const normalized = term.toLowerCase();
    if (/^[a-z0-9 ]+$/.test(normalized)) {
      return new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ +/g, "\\s+")}\\b`, "i").test(content);
    }
    return content.includes(normalized);
  });
}

export function blockedEmailMessage(matches: string[]): string {
  return `邮件内容包含违禁词：${matches.join("、")}。请修改邮件主题或正文后再发送。`;
}
