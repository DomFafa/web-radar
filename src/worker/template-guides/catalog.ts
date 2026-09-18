import { guideSchema, guideIds, type TemplateGuide } from './schema';
import guide0 from './documents/corpox-ai-agency.json';
import guide1 from './documents/corpox-consulting.json';
import guide2 from './documents/crafto-corporate.json';
import guide3 from './documents/digital-marketing.json';
import guide4 from './documents/fintech-platform.json';
import guide5 from './documents/juno-toys.json';
import guide6 from './documents/porto-accounting.json';
import guide7 from './documents/saas-automation.json';
import guide8 from './documents/senseng-clean.json';
import guide9 from './documents/senseng-video.json';
import guide10 from './documents/senseng-candy.json';
import guide11 from './documents/senseng-wonder.json';
import guide12 from './documents/senseng-arcade.json';
import guide13 from './documents/senseng-nature.json';
import guide14 from './documents/senseng-minimal.json';

const documents = [
  guide0,
  guide1,
  guide2,
  guide3,
  guide4,
  guide5,
  guide6,
  guide7,
  guide8,
  guide9,
  guide10,
  guide11,
  guide12,
  guide13,
  guide14,
].map((value) => guideSchema.parse(value));
export const templateGuides: readonly TemplateGuide[] = guideIds.map((id) => {
  const matches = documents.filter((guide) => guide.templateId === id);
  if (matches.length !== 1) throw new Error(`Expected one template guide for ${id}`);
  return matches[0];
});
export function getTemplateGuide(id: string): TemplateGuide | undefined {
  return templateGuides.find((guide) => guide.templateId === id);
}
