import { guideSchema, guideIds, type TemplateGuide } from './schema';
import guide0 from './documents/corpox-ai-agency.json';
import guide7 from './documents/saas-automation.json';
import guide8 from './documents/senseng-clean.json';
import guide9 from './documents/senseng-video.json';
import guide10 from './documents/senseng-candy.json';
import guide11 from './documents/senseng-wonder.json';
import guide12 from './documents/senseng-arcade.json';
import guide13 from './documents/senseng-nature.json';
import guide14 from './documents/senseng-minimal.json';
import guideUniversalBanner from './documents/universal-trade-banner.json';
import guideUniversalVideo from './documents/universal-showcase-video.json';
import guideToysBanner from './documents/toys-figure-banner.json';
import guideToysVideo from './documents/toys-interactive-video.json';
import guidePlushBanner from './documents/plush-cushion-banner.json';
import guidePlushVideo from './documents/plush-living-video.json';
import guideApparelBanner from './documents/apparel-fabric-banner.json';
import guideApparelVideo from './documents/apparel-runway-video.json';
import guideFootwearBanner from './documents/footwear-craft-banner.json';
import guideFootwearVideo from './documents/footwear-kinetic-video.json';

const documents = [
  guide0,
  guide7,
  guide8,
  guide9,
  guide10,
  guide11,
  guide12,
  guide13,
  guide14,
  guideUniversalBanner,
  guideUniversalVideo,
  guideToysBanner,
  guideToysVideo,
  guidePlushBanner,
  guidePlushVideo,
  guideApparelBanner,
  guideApparelVideo,
  guideFootwearBanner,
  guideFootwearVideo,
].map((value) => guideSchema.parse(value));
export const templateGuides: readonly TemplateGuide[] = guideIds.map((id) => {
  const matches = documents.filter((guide) => guide.templateId === id);
  if (matches.length !== 1) throw new Error(`Expected one template guide for ${id}`);
  return matches[0];
});
export function getTemplateGuide(id: string): TemplateGuide | undefined {
  return templateGuides.find((guide) => guide.templateId === id);
}
