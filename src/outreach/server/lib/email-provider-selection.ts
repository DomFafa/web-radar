type ProviderRecord = {
  id: string;
  userId: string;
  provider: string;
  apiKey: string;
  isDefault: boolean;
  config: string | null;
  status: string;
};

export function parseProviderConfig(config: string | null | undefined): Record<string, any> {
  try { return config ? JSON.parse(config) : {}; } catch { return {}; }
}

export function senderDomain(senderEmail: string): string {
  return String(senderEmail || "").trim().toLowerCase().split("@").pop() || "";
}

function hasBoundDomain(provider: ProviderRecord, domain: string): boolean {
  if (provider.provider !== "mailchimp" || !domain) return false;
  const domains = parseProviderConfig(provider.config).mailchimpDomains;
  return Array.isArray(domains) && domains.some((item) => String(item?.domain || "").toLowerCase() === domain);
}

export function selectEmailProviderForSender<T extends ProviderRecord>(
  configuredProviders: T[],
  userId: string,
  senderEmail: string,
): { provider?: T; matchedDomain: boolean } {
  const active = configuredProviders.filter((provider) => provider.status === "active" && provider.userId === userId);
  const owned = active.filter((provider) => provider.userId === userId);
  const domain = senderDomain(senderEmail);
  const ownedMatches = owned.filter((provider) => hasBoundDomain(provider, domain));
  const allMatches = active.filter((provider) => hasBoundDomain(provider, domain));
  const matches = ownedMatches.length ? ownedMatches : allMatches;
  if (matches.length) {
    return { provider: matches.find((provider) => provider.isDefault) || matches[0], matchedDomain: true };
  }
  return {
    provider: owned.find((provider) => provider.isDefault)
      || owned[0]
      || active.find((provider) => provider.isDefault)
      || active[0],
    matchedDomain: false,
  };
}
