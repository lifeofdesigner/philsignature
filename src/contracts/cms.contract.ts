import type { CmsContent } from '@/types/database';

export interface CmsSectionResponseContract {
  success: boolean;
  key: string;
  data: CmsContent | null;
}

export interface CmsUpsertResponseContract {
  success: boolean;
  key: string;
  data?: CmsContent;
  message: string;
}
