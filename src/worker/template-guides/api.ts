import { Hono } from 'hono';
import type { HonoEnv } from '../env';
import { authenticate } from '../auth';
import { ApiError, errorResponse, sha256 } from '../http';
import { getTemplateGuide, templateGuides } from './catalog';
import { guideJsonSchema, outputJsonSchema } from './schema';
import { guideMarkdown } from './markdown';
import { currentMaterialsPrincipal, verifyMaterialsSecret } from '../materials-auth';
import { getMaterialsTemplate } from '../../templates/materials';
import { materialsLocales, materialsPages } from '../../shared/materials';
import { renderSite } from '../../templates';
import { materialsDemoDraft } from './materials-demo';

async function equalKey(received: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([sha256(received), sha256(expected)]);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
export function createTemplateGuidesApp() {
  const app = new Hono<HonoEnv>();
  app.onError(errorResponse);
  app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    c.header('X-Robots-Tag', 'noindex, nofollow');
    c.header('X-Content-Type-Options', 'nosniff');
    const authorization = c.req.header('Authorization') || '';
    const materialsRoute=/(^|\/)materials(?:\/|$)/.test(c.req.path);
    if(materialsRoute && c.req.header('X-Web-Radar-Secret')){
      await verifyMaterialsSecret(c.req.raw,c.env);
      await currentMaterialsPrincipal(c.env,{userId:c.req.header('X-Product-Radar-User-Id')||'',workspaceId:c.req.header('X-Product-Radar-Workspace-Id')||''});
    } else if (authorization.startsWith('Bearer wrtg_')) {
      const token = authorization.slice(7);
      const configured = c.env.TEMPLATE_GUIDES_API_KEY;
      if (
        !configured ||
        !/^wrtg_[A-Za-z0-9_-]{40,100}$/.test(token) ||
        !/^wrtg_[A-Za-z0-9_-]{40,100}$/.test(configured) ||
        !(await equalKey(token, configured))
      )
        throw new ApiError(401, 'invalid_guide_key', '模板规范访问凭据无效。');
      if(materialsRoute)await currentMaterialsPrincipal(c.env,{userId:c.req.header('X-Product-Radar-User-Id')||'',workspaceId:c.req.header('X-Product-Radar-Workspace-Id')||''});
    } else {
      const { principal } = await authenticate(c.req.raw, c.env);
      if(materialsRoute)await currentMaterialsPrincipal(c.env,principal);
      else if (principal.systemRole !== 'super_admin')
        throw new ApiError(
          403,
          'platform_admin_required',
          '仅平台管理员或模板规范只读客户端可以访问。',
        );
    }
    if (!['GET', 'HEAD'].includes(c.req.method))
      throw new ApiError(405, 'read_only', '模板规范接口只支持读取。');
    await next();
  });
  app.get('/', (c) =>
    c.json({
      schemaVersion: '1.0',
      total: templateGuides.length,
      templates: templateGuides.map((guide) => ({
        templateId: guide.templateId,
        name: guide.name,
        revision: guide.revision,
        document: `/api/internal/template-guides/${guide.templateId}`,
        markdown: `/api/internal/template-guides/${guide.templateId}?format=markdown`,
        inventory: guide.inventory,
      })),
      schema: '/api/internal/template-guides/schema',
      outputSchema: '/api/internal/template-guides/output-schema',
    }),
  );
  app.get('/schema', (c) => c.json(guideJsonSchema));
  app.get('/output-schema', (c) => c.json(outputJsonSchema));
  app.get('/materials/catalog',(c)=>c.json({schemaVersion:'wr-template-materials-v1',templates:templateGuides.map(g=>{
    const profile=getMaterialsTemplate(g.templateId);
    return {templateId:g.templateId,name:g.name,guideRevision:profile?.guideRevision??g.revision,contractRevision:profile?.contractRevision??null,thumbnailUrl:`/templates/previews/${g.templateId}.jpg`,pages:[...materialsPages],materialsReady:!!profile?.materialsReady,requirementsPath:`/api/internal/template-guides/materials/${g.templateId}`,previewPath:`/api/internal/template-guides/materials/${g.templateId}/preview`};
  })}));
  app.get('/materials/:id/preview',(c)=>{
    const profile=getMaterialsTemplate(c.req.param('id'),c.req.query('contractRevision'));
    if(!profile)throw new ApiError(404,'materials_template_not_ready','该模板尚未支持新版资料交接。');
    const page=c.req.query('page')||'home',lang=c.req.query('lang')||'en';
    if(!materialsPages.includes(page as never)||!materialsLocales.includes(lang as never))throw new ApiError(400,'invalid_preview','页面或语言无效。');
    const draft=materialsDemoDraft(profile,lang as typeof materialsLocales[number]);
    const html=renderSite(draft,{projectId:'materials-demo',lang:lang as typeof draft.languages[number],page,productId:draft.primaryProductId,assetUrl:id=>id,inquiryUrl:'',preview:true});
    return c.json({templateId:profile.templateId,contractRevision:profile.contractRevision,page,html,assetBaseUrl:c.env.APP_ORIGIN||new URL(c.req.url).origin,demo:true});
  });
  app.get('/materials/:id',(c)=>{
    const profile=getMaterialsTemplate(c.req.param('id'),c.req.query('contractRevision'));
    if(!profile)throw new ApiError(404,'materials_template_not_ready','该模板尚未支持新版资料交接。');
    return c.json(profile);
  });
  app.get('/:id', async (c) => {
    const guide = getTemplateGuide(c.req.param('id'));
    if (!guide) throw new ApiError(404, 'template_guide_not_found', '没有该模板的使用规范。');
    const format = c.req.query('format') || 'json';
    if (!['json', 'markdown'].includes(format))
      throw new ApiError(400, 'invalid_format', 'format 仅支持 json 或 markdown。');
    c.header('X-Template-Guide-Revision', guide.revision);
    c.header('X-Template-Guide-SHA256', await sha256(JSON.stringify(guide)));
    return format === 'markdown'
      ? c.body(guideMarkdown(guide), 200, { 'Content-Type': 'text/markdown; charset=utf-8' })
      : c.json(guide);
  });
  app.notFound((c) => c.json({ code: 'not_found', message: '模板规范接口不存在。' }, 404));
  return app;
}
