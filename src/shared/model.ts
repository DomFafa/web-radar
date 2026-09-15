export interface Principal {
  userId: string;
  authSubject: string;
  email: string;
  displayName: string;
  systemRole: 'super_admin' | 'user';
  workspaceId: string;
  workspaceRole: 'admin' | 'member';
  workspaceName: string;
}
export interface ProductSnapshot {
  source: 'product-radar';
  id: string;
  sourceProjectId: string;
  workflow: 'create' | 'build';
  version: string;
  name: string;
  description: string;
  material: string;
  dimensions: string;
  seriesName: string;
  designDirection: string;
  conditions: Record<string, unknown>;
  image: { sourceProductId: string; contentType: string | null };
  factsOrigin: 'generated-concept';
}
export type Language = 'en' | 'de' | 'fr' | 'es' | 'pt' | 'it';
export type TemplateId = 'natural' | 'technology' | 'explorer';
export interface Product {
  id: string;
  name: string;
  description: string;
  material: string;
  dimensions: string;
  imageAssetId?: string;
  source?: ProductSnapshot;
  translations?: Partial<Record<Language, { name: string; description: string }>>;
}
export interface Company {
  name: string;
  email: string;
  contactName: string;
  type: 'trader' | 'factory';
  description: string;
  facebook: string;
  instagram: string;
  x: string;
  logoAssetId?: string;
}
export interface SiteCopy {
  headline: string;
  subtitle: string;
  about: string;
  cta: string;
}
export interface Scene {
  id: string;
  description: string;
  imageAssetId?: string;
  revision: number;
}
export type BaseDesignPage = 'home' | 'catalog' | 'detail' | 'about' | 'contact';
export type DesignPage = BaseDesignPage | `extra-${string}`;
export interface PlannedPage {
  id: DesignPage;
  label: string;
  purpose: string;
  content: Partial<
    Record<Language, { title: string; sections: { heading: string; body: string }[] }>
  >;
}
export interface SiteBrief {
  summary: string;
  audience: string;
  goal: string;
  visualDirection: string;
  layout: string;
  brandColor: string;
  keep: string[];
  avoid: string[];
  pages: PlannedPage[];
  copy: Partial<Record<Language, SiteCopy>>;
  productTranslations: Record<
    string,
    Partial<Record<Language, { name: string; description: string }>>
  >;
}
export interface ConsultationQuestion {
  id: string;
  prompt: string;
  reason: string;
  options: string[];
}
export type ConsultationResult =
  { question: Omit<ConsultationQuestion, 'id'> } | { brief: SiteBrief };
export interface SiteConsultation {
  revision: number;
  answers: { questionId: string; question: string; answer: string }[];
  question?: ConsultationQuestion;
  brief?: SiteBrief;
  revisionContext?: { brief: SiteBrief; instructions: string };
  confirmed?: boolean;
  jobId?: string;
}
export interface SiteDesign {
  revision: number;
  pageIds?: DesignPage[];
  pages: Partial<Record<DesignPage, { imageAssetId?: string; jobId?: string }>>;
  homeConfirmedAssetId?: string;
  confirmedKey?: string;
  build?: { jobId: string; artifactKey?: string };
}
export interface Draft {
  company: Company;
  products: Product[];
  primaryProductId: string;
  category: string;
  country: string;
  languages: Language[];
  template: TemplateId;
  brandColor: string;
  copy: Partial<Record<Language, SiteCopy>>;
  duration: 8 | 12;
  direction: string;
  script: string;
  scriptRevision: number;
  scriptConfirmedRevision?: number;
  scenes: Scene[];
  storyboardRevision: number;
  storyboardConfirmedRevision?: number;
  heroAssetId?: string;
  posterAssetId?: string;
  heroAccepted: boolean;
  siteDesign?: SiteDesign;
  consultation?: SiteConsultation;
}
export interface HostingTarget {
  accountId: string;
  pagesProjectName: string;
}
export interface Project {
  id: string;
  ownerId: string;
  workspaceId: string;
  name: string;
  version: number;
  draft: Draft;
  createdAt: string;
  updatedAt: string;
  publishedReleaseId?: string;
  previousReleaseId?: string;
  offline: boolean;
  siteUrl?: string;
  hostingTarget?: HostingTarget;
}
export interface Asset {
  id: string;
  projectId: string;
  key: string;
  contentType: string;
  size: number;
  filename: string;
  origin: 'upload' | 'import' | 'generated' | 'test';
  createdAt: string;
}
export type JobKind =
  'consultation' | 'script' | 'copy' | 'image' | 'video' | 'site-build' | 'publish' | 'email';
export type JobStatus = 'queued' | 'running' | 'unknown' | 'succeeded' | 'failed';
export interface Job {
  id: string;
  projectId: string;
  userId: string;
  kind: JobKind;
  status: JobStatus;
  requestId: string;
  input: Record<string, unknown>;
  inputVersion: number;
  createdAt: string;
  updatedAt: string;
  upstreamId?: string;
  resultAssetId?: string;
  error?: string;
  attempts: number;
  testMode: boolean;
}
export interface Quota {
  userId: string;
  imageLimit: number;
  videoLimit: number;
  imageUsed: number;
  videoUsed: number;
  imageReserved: number;
  videoReserved: number;
}
export interface Release {
  hostingTarget?: HostingTarget;
  id: string;
  projectId: string;
  draftVersion: number;
  draft: Draft;
  createdAt: string;
  status: 'pending' | 'succeeded' | 'failed';
  deploymentId?: string;
  url?: string;
  error?: string;
  testMode: boolean;
}
export interface Inquiry {
  id: string;
  projectId: string;
  requestId: string;
  name: string;
  email: string;
  company: string;
  message: string;
  productId?: string;
  siteUrl: string;
  createdAt: string;
  emailStatus: 'queued' | 'sent' | 'failed' | 'unknown';
  emailAttempts: number;
  emailError?: string;
}
export interface ProjectDetail {
  project: Project;
  assets: Asset[];
  jobs: Job[];
  releases: Release[];
  quota: Quota;
}
export interface ServiceStatus {
  name: string;
  configured: boolean;
  mode: 'live' | 'test' | 'unconfigured';
  detail: string;
}
