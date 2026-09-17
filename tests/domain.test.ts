import { describe, expect, it } from 'vitest';
import {
  defaultDraft,
  assertSiteIntakeReady,
  canManage,
  editDraft,
  assertReadyForVideo,
  assertPublishable,
  validateDraft,
  DomainError,
} from '../src/worker/domain';
import type { Principal, Project } from '../src/shared/model';

const owner: Principal = {
  userId: 'owner',
  authSubject: 'owner',
  email: 'owner@example.com',
  displayName: 'Owner',
  systemRole: 'user',
  workspaceId: 'workspace',
  workspaceRole: 'member',
  workspaceName: 'Test',
};
const project = (): Project => ({
  id: 'project',
  ownerId: owner.userId,
  workspaceId: owner.workspaceId,
  name: 'Site',
  version: 1,
  draft: defaultDraft(),
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  offline: true,
});
function readyDraft() {
  const d = defaultDraft();
  d.company = {
    ...d.company,
    name: 'Actual Company',
    email: 'sales@example.com',
    contactName: 'Jane',
  };
  d.products = [
    {
      id: 'product',
      name: 'Real product',
      description: 'Provided description',
      material: '',
      dimensions: '',
      imageAssetId: 'product-image',
    },
  ];
  d.primaryProductId = 'product';
  d.country = 'Germany';
  d.script = 'Show the product';
  d.scriptRevision = 2;
  d.scriptConfirmedRevision = 2;
  d.scenes = [1, 2, 3].map((x) => ({
    id: `s${x}`,
    description: `Scene ${x}`,
    revision: 1,
    imageAssetId: `image${x}`,
  }));
  d.storyboardRevision = 2;
  d.storyboardConfirmedRevision = 2;
  d.heroAssetId = 'video';
  d.heroAccepted = true;
  d.copy = {
    en: {
      headline: 'Company',
      subtitle: 'Provided products',
      about: 'Company information',
      cta: 'Contact',
    },
  };
  return d;
}

describe('domain authorization and approval invariants', () => {
  it('allows creator, current workspace admin and platform admin but denies unrelated members', () => {
    const p = project();
    expect(canManage(p, owner)).toBe(true);
    expect(canManage(p, { ...owner, userId: 'member' })).toBe(false);
    expect(canManage(p, { ...owner, userId: 'admin', workspaceRole: 'admin' })).toBe(true);
    expect(
      canManage(p, { ...owner, userId: 'admin', workspaceId: 'other', workspaceRole: 'admin' }),
    ).toBe(false);
    expect(
      canManage(p, { ...owner, userId: 'root', systemRole: 'super_admin', workspaceId: 'other' }),
    ).toBe(true);
  });
  it('rejects over 20 products and duplicate product identities', () => {
    const d = defaultDraft();
    d.products = Array.from({ length: 21 }, (_, i) => ({
      id: String(i),
      name: 'Product',
      description: '',
      material: '',
      dimensions: '',
    }));
    expect(() => validateDraft(d)).toThrow(DomainError);
    d.products = d.products.slice(0, 2);
    d.products[1].id = d.products[0].id;
    expect(() => validateDraft(d)).toThrow(DomainError);
  });
  it('invalidates approvals when video inputs change and refuses client forged revisions', () => {
    const old = readyDraft(),
      incoming = structuredClone(old);
    incoming.duration = 12;
    incoming.scriptConfirmedRevision = 999;
    incoming.storyboardConfirmedRevision = 999;
    incoming.scriptRevision = 999;
    const next = editDraft(old, incoming);
    expect(next.scriptRevision).toBe(3);
    expect(next.scriptConfirmedRevision).toBeUndefined();
    expect(next.storyboardConfirmedRevision).toBeUndefined();
    expect(next.heroAccepted).toBe(false);
  });
  it('keeps confirmations when only contact email or copy changes', () => {
    const old = readyDraft(),
      incoming = structuredClone(old);
    incoming.company.email = 'new@example.com';
    incoming.copy.en!.headline = 'Revised headline';
    const next = editDraft(old, incoming);
    expect(next.scriptConfirmedRevision).toBe(old.scriptConfirmedRevision);
    expect(next.storyboardConfirmedRevision).toBe(old.storyboardConfirmedRevision);
    expect(next.heroAccepted).toBe(true);
  });
  it('requires exact currently confirmed script and complete 3 or 4 image storyboards', () => {
    const d = readyDraft();
    expect(() => assertReadyForVideo(d)).not.toThrow();
    d.duration = 12;
    expect(() => assertReadyForVideo(d)).toThrow();
    d.scenes.push({ id: 's4', description: 'Fourth', revision: 1, imageAssetId: 'image4' });
    expect(() => assertReadyForVideo(d)).not.toThrow();
    d.storyboardConfirmedRevision = 1;
    expect(() => assertReadyForVideo(d)).toThrow();
  });
  it('allows uploaded and accepted hero without AI confirmations but requires complete translated copy', () => {
    const d = readyDraft();
    d.script = '';
    d.scenes = [];
    d.scriptConfirmedRevision = undefined;
    d.storyboardConfirmedRevision = undefined;
    expect(() => assertPublishable(d)).not.toThrow();
    d.languages = ['en', 'de'];
    expect(() => assertPublishable(d)).toThrow();
    d.copy.de = { ...d.copy.en! };
    d.products[0].translations = { de: { name: 'Produkt', description: 'Beschreibung' } };
    expect(() => assertPublishable(d)).not.toThrow();
  });
});

it('publishes with omitted unknown company facts and translated empty product descriptions', () => {
  const d = readyDraft();
  d.company.description = '';
  d.copy.en!.about = '';
  d.products[0].description = '';
  d.languages = ['en', 'de'];
  d.copy.de = { ...d.copy.en! };
  d.products[0].translations = { de: { name: 'Produkt', description: '' } };
  expect(() => assertPublishable(d)).not.toThrow();
});

 it('allows an omitted business contact while retaining name and email intake requirements', () => {
   const draft=readyDraft();draft.company.contactName='';
   expect(()=>assertSiteIntakeReady(draft)).not.toThrow();
   expect(()=>assertSiteIntakeReady({...draft,company:{...draft.company,name:''}})).toThrow();
   expect(()=>assertSiteIntakeReady({...draft,company:{...draft.company,email:'invalid'}})).toThrow();
 });

it('identifies invalid fields and limits without echoing entered content',()=>{
 const draft=defaultDraft();draft.cloneConfig={instructions:'private-value'.repeat(500)};
 expect(()=>validateDraft(draft)).toThrow('品牌定制与微调指令最多允许 5000 个字符');
 try{validateDraft(draft);}catch(error){expect((error as Error).message).not.toContain('private-value');}
});
