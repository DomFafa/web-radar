import type { DesignPage, JobStatus, Language } from './model';

/** Server-to-server v1 responses. No draft, credential or provider account is exposed. */
export interface ProjectPublication {
  status: 'idle' | JobStatus;
  phase: 'idle' | 'queued' | 'preparing_media' | 'deploying' | 'recovering' | 'complete' | 'failed';
  jobId?: string;
  releaseId?: string;
  inputVersion?: number;
  url?: string;
  error?: string;
  retryable: boolean;
  updatedAt?: string;
  /** Prepared image variants, not overall deployment completion. */
  mediaProgress?: { completed: number; total: number };
}
export interface ProjectServiceStatus {
  schemaVersion: 'wr-project-service-v1';
  projectId: string;
  projectVersion: number;
  /** Content comparison against the active published snapshot; independent of record version. */
  hasUnpublishedChanges: boolean;
  publishedVersion?: number;
  name: string;
  template: string;
  languages: Language[];
  pages: DesignPage[];
  products: { id: string; name: string }[];
  primaryProductId: string;
  publication: ProjectPublication;
  /** Currently active publication, which can differ from the requested job. */
  publishedUrl?: string;
  previewEndpoint: string;
  publishEndpoint: string;
  statusEndpoint: string;
}
export interface ProjectServicePreview {
  schemaVersion: 'wr-project-service-v1';
  projectId: string;
  projectVersion: number;
  html: string;
  /** Fixed first-party interactions only; never extracted from submitted HTML. */
  runtime: string;
  page: DesignPage;
  lang: Language;
  productId?: string;
  proxyBasePath: string;
  assetBaseUrl: string;
}
