import { emailTemplateRepository } from '@/repositories/EmailTemplateRepository';
import { auditLogService } from '@/services/AuditLogService';
import type { EmailTemplate } from '@/types/database';

export class EmailTemplateService {
  async getTemplates(): Promise<EmailTemplate[]> {
    return emailTemplateRepository.getAll();
  }

  async getTemplateByKey(templateKey: string): Promise<EmailTemplate | null> {
    return emailTemplateRepository.getByKey(templateKey);
  }

  async updateTemplate(
    id: string,
    updates: {
      subject?: string;
      html_body?: string;
      is_active?: boolean;
      variables?: string[];
    },
    userContext?: { id?: string; email?: string }
  ): Promise<EmailTemplate> {
    const updated = await emailTemplateRepository.update(id, {
      ...updates,
      updated_by: userContext?.id || null,
    });

    // Record audit trail
    await auditLogService.recordAction(
      'UPDATE_EMAIL_TEMPLATE',
      'email_template',
      id,
      {
        template_key: updated.template_key,
        name: updated.name,
        subject: updated.subject,
        is_active: updated.is_active,
        edited_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );

    return updated;
  }

  async resetTemplate(
    id: string,
    templateKey: string,
    userContext?: { id?: string; email?: string }
  ): Promise<EmailTemplate> {
    const reset = await emailTemplateRepository.resetToDefault(id, templateKey, userContext?.id);

    // Record audit trail
    await auditLogService.recordAction(
      'RESET_EMAIL_TEMPLATE_DEFAULT',
      'email_template',
      id,
      {
        template_key: templateKey,
        name: reset.name,
        edited_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );

    return reset;
  }

  async toggleActive(
    id: string,
    isActive: boolean,
    templateKey: string,
    userContext?: { id?: string; email?: string }
  ): Promise<EmailTemplate> {
    const updated = await emailTemplateRepository.update(id, {
      is_active: isActive,
      updated_by: userContext?.id || null,
    });

    await auditLogService.recordAction(
      isActive ? 'ACTIVATE_EMAIL_TEMPLATE' : 'DEACTIVATE_EMAIL_TEMPLATE',
      'email_template',
      id,
      {
        template_key: templateKey,
        is_active: isActive,
        edited_by: userContext?.email || userContext?.id || 'admin',
        timestamp: new Date().toISOString(),
      },
      userContext?.id
    );

    return updated;
  }
}

export const emailTemplateService = new EmailTemplateService();
