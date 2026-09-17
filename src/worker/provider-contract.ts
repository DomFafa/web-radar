import type { PublicationMetadata } from './site-metadata';
import type {
  DesignPage,
  ConsultationResult,
  Draft,
  HostingTarget,
  Inquiry,
  Scene,
  ServiceStatus,
} from '../shared/model';
export interface SiteBuildInput {
  draft: Draft;
  designImages: Record<DesignPage, string>;
  referenceAssets?: Record<string, string>;
}
export interface SiteBuildResult {
  state: 'pending' | 'succeeded' | 'failed';
  files?: Record<string, string>;
  message?: string;
  progress?: string;
}
export interface MediaResult {
  body: ReadableStream<Uint8Array> | Uint8Array;
  contentType: string;
  filename: string;
  size?: number;
  testMode: boolean;
}
export interface VideoResult {
  state: 'pending' | 'succeeded' | 'failed';
  media?: MediaResult;
  message?: string;
}
export interface PublishResult {
  deploymentId: string;
  url: string;
  testMode: boolean;
}
export interface PreviousPublication {
  metadata?: PublicationMetadata;
  releaseId: string;
  files: Record<string, string>;
}
export interface ProviderSet {
  status(): ServiceStatus[];
  consult(draft: Draft, referenceUrls: string[], instructions: string): Promise<ConsultationResult>;
  script(draft: Draft): Promise<{ script: string; scenes: Scene[] }>;
  copy(draft: Draft): Promise<Draft['copy'] & { productTranslations?: Record<string, unknown> }>;
  image(
    draft: Draft,
    scene: Scene,
    instructions: string,
    referenceUrls: string[],
  ): Promise<MediaResult>;
  designImage(
    draft: Draft,
    page: DesignPage,
    instructions: string,
    references: (string | Blob)[],
  ): Promise<MediaResult>;
  siteBuild(id: string, input?: SiteBuildInput): Promise<SiteBuildResult>;
  submitVideo(
    draft: Draft,
    referenceUrls: string[],
    idempotencyKey: string,
  ): Promise<{ videoId: string }>;
  pollVideo(videoId: string): Promise<VideoResult>;
  resolveHostingTarget(projectId: string, current?: HostingTarget): Promise<HostingTarget>;
  publish(
    projectId: string,
    releaseId: string,
    files: Record<string, string>,
    previousDeploymentId?: string,
    hostingTarget?: HostingTarget,
    previous?: PreviousPublication,
    metadata?: PublicationMetadata,
  ): Promise<PublishResult>;
  email(
    inquiry: Inquiry,
    recipient: string,
    idempotencyKey: string,
  ): Promise<{ id: string; testMode: boolean }>;
}
export class ProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public uncertain = false,
    public retryAfterMs?: number,
  ) {
    super(message);
  }
}
