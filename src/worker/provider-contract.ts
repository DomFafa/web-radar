import type { Draft, HostingTarget, Inquiry, Scene, ServiceStatus } from '../shared/model';
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
  releaseId: string;
  files: Record<string, string>;
}
export interface ProviderSet {
  status(): ServiceStatus[];
  script(draft: Draft): Promise<{ script: string; scenes: Scene[] }>;
  copy(draft: Draft): Promise<Draft['copy'] & { productTranslations?: Record<string, unknown> }>;
  image(
    draft: Draft,
    scene: Scene,
    instructions: string,
    referenceUrls: string[],
  ): Promise<MediaResult>;
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
  ) {
    super(message);
  }
}
