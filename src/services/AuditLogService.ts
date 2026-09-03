import { auditLogRepository, type ExtendedActivityLog } from '@/repositories/AuditLogRepository';

export class AuditLogService {
  async fetchLogs(limit = 100): Promise<ExtendedActivityLog[]> {
    try {
      return await auditLogRepository.getAll(limit);
    } catch {
      return [];
    }
  }

  async recordAction(
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    try {
      await auditLogRepository.log(action, entityType, entityId, details, userId);
    } catch (err) {
      console.warn('Failed to record audit log:', err);
    }
  }
}

export const auditLogService = new AuditLogService();
