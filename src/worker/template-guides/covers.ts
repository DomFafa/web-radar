import manifest from './covers.json';

export interface TemplateCover {
  url: string;
  sha256: string;
  width: number;
  height: number;
  contractRevision: string;
}

/** Generated from the corresponding materials demo, never another template's image. */
export const templateCovers: Readonly<Record<string, TemplateCover>> = manifest;
