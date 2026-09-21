/** Add a real registered template only to an explicitly marked, isolated test copy. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const sourceRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const root=resolve(process.argv[2]||'');
if(!process.argv[2]||root===sourceRoot||!existsSync(resolve(root,'.materials-integration-test-copy')))throw Error('Pass a separate test copy containing .materials-integration-test-copy');
const release=JSON.parse(readFileSync(resolve(sourceRoot,'tests/fixtures/materials-plugin-release.json'),'utf8'));
const patch=(path,before,after)=>{const file=resolve(root,path),source=readFileSync(file,'utf8');if(!source.includes(before))throw Error(`Expected registration marker missing in ${path}`);writeFileSync(file,source.replace(before,after));};
patch('src/templates/materials-release-registry.ts','export const additionalMaterialsReleases: readonly MaterialsTemplateRelease[] = [];',`export const additionalMaterialsReleases: readonly MaterialsTemplateRelease[] = ${JSON.stringify([release],null,2)};`);
patch('src/shared/model.ts','export type TemplateId =',`export type TemplateId =\n  | '${release.contract.templateId}'`);
patch('src/worker/domain.ts','template: z.enum([',`template: z.enum([\n    '${release.contract.templateId}',`);
console.log(JSON.stringify({templateId:release.contract.templateId,contractRevision:release.contract.contractRevision,registeredFiles:['src/templates/materials-release-registry.ts','src/shared/model.ts','src/worker/domain.ts']}));
