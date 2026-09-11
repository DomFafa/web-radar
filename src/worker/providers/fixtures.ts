import type { Draft, HostingTarget, SiteCopy } from '../../shared/model';
import type { Secrets } from '../env';
import type { ProviderSet } from '../provider-contract';
import { ProviderError } from '../provider-contract';
import { labels } from '../../templates/labels';
import { bytesFromBase64 } from './http';
import { testImageBase64, testVideoBase64 } from './fixture-data';
import { pagesProjectName } from './pages';
export function fixtureProviders(env: Secrets): ProviderSet {
  const resolveTarget = async (
    projectId: string,
    current?: HostingTarget,
  ): Promise<HostingTarget> => {
    if (current && current.accountId !== 'LOCAL_TEST')
      throw new ProviderError(
        'pages_hosting_account_missing',
        '本地测试服务不能接管真实账户的站点',
      );
    return {
      accountId: 'LOCAL_TEST',
      pagesProjectName: current?.pagesProjectName ?? (await pagesProjectName(projectId)),
    };
  };
  return {
    status: () =>
      ['text', 'image', 'agnes', 'pages', 'email'].map((name) => ({
        name,
        configured: true,
        mode: 'test',
        detail: '明确的本地测试替身；未调用真实服务',
      })),
    async script(draft) {
      const count = draft.duration === 12 ? 4 : 3;
      return {
        script: `[LOCAL TEST SCRIPT] ${draft.duration}s · ${draft.company.name} · ${draft.direction}. This is a local workflow fixture, not AI output.`,
        scenes: Array.from({ length: count }, (_, i) => ({
          id: `scene-${i + 1}`,
          description: `[LOCAL TEST STORYBOARD ${i + 1}] ${draft.products.find((p) => p.id === draft.primaryProductId)?.name ?? ''} · ${['Front view', 'Material detail', 'Side view', 'Closing view'][i]}`,
          revision: 1,
        })),
      };
    },
    async copy(draft) {
      const copy: Draft['copy'] = {};
      const subtitles = {
        en: 'Local test copy · review before publishing',
        de: 'Lokaler Texttest · vor Veröffentlichung prüfen',
        fr: 'Texte de test local · à vérifier avant publication',
        es: 'Texto de prueba local · revisar antes de publicar',
        pt: 'Texto de teste local · rever antes de publicar',
        it: 'Testo di prova locale · verificare prima di pubblicare',
      };
      const productTranslations: Record<string, unknown> = {};
      for (const lang of draft.languages) {
        copy[lang] = {
          headline: draft.company.name,
          subtitle: subtitles[lang],
          about: draft.company.description,
          cta: labels[lang].discover,
        } satisfies SiteCopy;
      }
      for (const p of draft.products)
        productTranslations[p.id] = Object.fromEntries(
          draft.languages.map((lang) => [
            lang,
            { name: p.name, description: lang === 'en' ? p.description : subtitles[lang] },
          ]),
        );
      return { ...copy, productTranslations };
    },
    async image() {
      const body = bytesFromBase64(testImageBase64);
      return {
        body,
        contentType: 'image/png',
        filename: 'LOCAL-TEST-storyboard.png',
        size: body.length,
        testMode: true,
      };
    },
    async submitVideo(draft, refs, idempotencyKey) {
      if (refs.length < (draft.duration === 12 ? 4 : 3))
        throw new ProviderError('video_references', '测试视频也要求完整分镜');
      return { videoId: `test-video-${draft.duration}-${idempotencyKey}` };
    },
    async pollVideo(videoId) {
      const duration = videoId.startsWith('test-video-12-') ? 12 : 8;
      if (!videoId.startsWith(`test-video-${duration}-`))
        throw new ProviderError('test_video_missing', '未知测试视频任务');
      const body = bytesFromBase64(testVideoBase64[duration]);
      return {
        state: 'succeeded',
        media: {
          body,
          contentType: 'video/webm',
          filename: `LOCAL-TEST-${duration}s.webm`,
          size: body.length,
          testMode: true,
        },
      };
    },
    resolveHostingTarget: resolveTarget,
    async publish(projectId, releaseId, _files, _previousId, hostingTarget) {
      if (!hostingTarget)
        throw new ProviderError(
          'pages_hosting_target_required',
          '发布前必须保存明确的本地测试托管绑定',
        );
      await resolveTarget(projectId, hostingTarget);
      return {
        deploymentId: `test-deployment-${releaseId}`,
        url: `${env.APP_ORIGIN || 'http://127.0.0.1:8788'}/public/sites/${encodeURIComponent(projectId)}`,
        testMode: true,
      };
    },
    async email(inquiry) {
      return { id: `test-email-${inquiry.id}`, testMode: true };
    },
  };
}
