import type { Draft } from './model';

export function validProductDisplayGroups(
  groups: string[][],
  products: Draft['products'],
): boolean {
  const ids = new Set(products.map((product) => product.id)),
    seen = new Set<string>();
  for (const group of groups) {
    if (group.length < 2) return false;
    for (const id of group) {
      if (!ids.has(id) || seen.has(id)) return false;
      seen.add(id);
    }
  }
  return true;
}

export function displayProducts(draft: Draft): Draft['products'] {
  const groups = draft.productDisplayGroups || [];
  if (!validProductDisplayGroups(groups, draft.products)) return draft.products;
  const aliases = new Set(groups.flatMap((group) => group.slice(1)));
  return draft.products.filter((product) => !aliases.has(product.id));
}

/** A source revision may remove products. Never reinterpret a partial group. */
export function retainedProductDisplayGroups(
  previous: Draft | undefined,
  products: Draft['products'],
): string[][] | undefined {
  const groups = previous?.productDisplayGroups?.filter((group) =>
    validProductDisplayGroups([group], products),
  );
  return groups?.length && validProductDisplayGroups(groups, products)
    ? groups.map((group) => [...group])
    : undefined;
}
