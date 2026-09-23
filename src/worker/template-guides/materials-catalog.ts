import { availableMaterialsTemplateReleases } from '../../templates/materials-releases';
import { getMaterialsTemplate } from '../../templates/materials';
import { materialsPages } from '../../shared/materials';
import { sha256 } from '../http';
import { templateGuides } from './catalog';
import { templateCovers } from './covers';

/** Only bundled, validated releases are discoverable. No account data is stored here. */
export async function materialsCatalog() {
  const entries = [
    ...templateGuides.map(g => ({ templateId: g.templateId, name: g.name })),
    ...availableMaterialsTemplateReleases().map(r => ({ templateId: r.contract.templateId, name: r.name })),
  ];
  const templates = await Promise.all(entries.filter((entry, index, all) => all.findIndex(other => other.templateId === entry.templateId) === index).map(async entry => {
    const profile = getMaterialsTemplate(entry.templateId);
    const revision = profile?.contractRevision;
    const query = revision ? `?contractRevision=${encodeURIComponent(revision)}` : '';
    const candidateCover = templateCovers[entry.templateId];
    const cover = candidateCover?.contractRevision === revision ? candidateCover : undefined;
    return {
      ...entry,
      guideRevision: profile?.guideRevision,
      contractRevision: revision ?? null,
      contractSha256: profile ? await sha256(JSON.stringify(profile)) : null,
      rendererRevision: profile?.rendererRevision,
      requiredCapabilities: profile?.requiredCapabilities ?? [],
      productApplicability: profile?.productApplicability,
      materialRequirements: {
        requiresDetail: profile?.imageSlots.some(s => s.binding === 'supported' && s.role === 'detail' && (s.required || s.min > 0)) ?? false,
        requiresPackaging: profile?.imageSlots.some(s => s.binding === 'supported' && s.role === 'packaging' && s.required) ?? false,
      },
      thumbnailUrl: cover?.url ?? null,
      thumbnailRevision: cover?.sha256 ?? null,
      thumbnailWidth: cover?.width ?? null,
      thumbnailHeight: cover?.height ?? null,
      pages: profile?.pages ?? [...materialsPages],
      materialsReady: !!profile?.materialsReady,
      requirementsPath: `/api/internal/template-guides/materials/${entry.templateId}${query}`,
      previewPath: `/api/internal/template-guides/materials/${entry.templateId}/preview${query}`,
    };
  }));
  return { schemaVersion: 'wr-template-materials-v1', catalogRevision: await sha256(JSON.stringify(templates)), templates };
}

/** GET/HEAD validators use weak comparison, after the route's identity checks. */
export function matchesMaterialsEtag(value: string | undefined, etag: string): boolean {
  return !!value?.split(',').some(item => item.trim() === '*' || item.trim().replace(/^W\//, '') === etag);
}
