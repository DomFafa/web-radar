type OwnedDomain = { providerId: string; domain: string };

// A domain can belong to multiple sending accounts.
export const domainKey = (domain: OwnedDomain) => JSON.stringify([domain.providerId, domain.domain]);

export function filterDomains<T extends OwnedDomain>(domains: T[], providerId: string): T[] {
  return providerId ? domains.filter((domain) => domain.providerId === providerId) : domains;
}

export function upsertDomain<T extends OwnedDomain>(domains: T[], domain: T): T[] {
  const index = domains.findIndex((item) => domainKey(item) === domainKey(domain));
  return index < 0 ? [domain, ...domains] : domains.map((item, position) => position === index ? domain : item);
}
