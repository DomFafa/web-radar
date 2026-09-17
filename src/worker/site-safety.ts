import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import { interactionScript } from './site-runtime';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const forbidden = new Set([
  'script',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'base',
  'applet',
  'template',
  'foreignobject',
  'annotation-xml',
  'animate',
  'set',
  'animatemotion',
  'animatetransform',
]);
const urls = new Set(['href', 'src', 'action', 'formaction', 'poster', 'xlink:href']);

/** Parse HTML instead of relying on regexes that miss entities or malformed markup. */
export function sanitizeGeneratedHtml(html: string, inquiryUrl: string): string {
  const document = parse(html);
  const visit = (node: Node) => {
    if (!('childNodes' in node)) return;
    node.childNodes = node.childNodes.filter((child) => {
      if (!('tagName' in child)) return true;
      const tag = child.tagName.toLowerCase();
      if (forbidden.has(tag)) return false;
      if (tag === 'meta' && child.attrs.some((a) => a.name.toLowerCase() === 'http-equiv'))
        return false;
      if (
        tag === 'link' &&
        child.attrs.some(
          (a) =>
            a.name === 'rel' &&
            /(?:stylesheet|preload|prefetch|modulepreload|import)/i.test(a.value),
        )
      )
        return false;
      child.attrs = child.attrs.filter((attribute) => {
        const name = attribute.name.toLowerCase();
        if (
          /^on/i.test(name) ||
          ['srcdoc', 'srcset', 'ping', 'integrity', 'nonce', 'formaction', 'formtarget'].includes(
            name,
          )
        )
          return false;
        if (urls.has(name)) {
          const value = attribute.value.replace(/[\u0000-\u0020\u007f]/g, '');
          if (/^(?:javascript|vbscript|file|blob):/i.test(value) || value.startsWith('//'))
            return false;
          if (
            /^data:/i.test(value) &&
            !(tag === 'img' && /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value))
          )
            return false;
        }
        return true;
      });
      if (tag === 'a' && child.attrs.some(a => a.name === 'target' && a.value === '_blank')) {
        const rel = new Set((child.attrs.find(a => a.name === 'rel')?.value ?? '').split(/\s+/).filter(Boolean));
        rel.add('noopener'); rel.add('noreferrer');
        child.attrs = child.attrs.filter(a => a.name !== 'rel');
        child.attrs.push({name:'rel',value:[...rel].join(' ')});
      }
      if (tag === 'form') {
        child.attrs = child.attrs.filter((a) => !['action', 'method'].includes(a.name));
        child.attrs.push(
          { name: 'action', value: inquiryUrl },
          { name: 'method', value: 'post' },
          { name: 'data-wr-inquiry', value: '' },
        );
      }
      visit(child);
      return true;
    });
  };
  visit(document);
  const rendered = serialize(document);
  return rendered.replace('</body>', `${interactionScript}</body>`);
}
