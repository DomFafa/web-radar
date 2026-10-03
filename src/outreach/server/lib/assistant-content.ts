import { parseFragment, serialize } from 'parse5';

/** A small allowlist for generated and chat-edited email content. */
export function safeAssistantHtml(html: string): string {
  const fragment = parseFragment(html);
  const allowed = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'blockquote']);
  function clean(parent: any) {
    parent.childNodes = (parent.childNodes || []).flatMap((node: any) => {
      if (node.nodeName === '#text') return [node];
      if (['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'math'].includes(node.tagName)) return [];
      clean(node);
      if (!allowed.has(node.tagName)) return node.childNodes || [];
      node.attrs = node.tagName === 'a' ? (node.attrs || []).filter((attr: any) => attr.name === 'href' && /^(https?:\/\/|mailto:)/i.test(attr.value.trim())) : [];
      return [node];
    });
  }
  clean(fragment);
  return serialize(fragment);
}
