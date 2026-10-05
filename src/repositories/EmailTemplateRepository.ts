import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/types/database';
import { DEFAULT_EMAIL_TEMPLATES } from '@/features/admin/emails/emailTemplateDefaults';

export class EmailTemplateRepository {
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_key', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as EmailTemplate[];
  }

  async getByKey(templateKey: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as EmailTemplate) || null;
  }

  async update(
    id: string,
    updates: {
      subject?: string;
      html_body?: string;
      is_active?: boolean;
      variables?: string[];
      updated_by?: string | null;
    }
  ): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as EmailTemplate;
  }

  async resetToDefault(id: string, templateKey: string, updatedBy?: string | null): Promise<EmailTemplate> {
    const defaultConfig = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === templateKey);
    if (!defaultConfig) {
      throw new Error(`Default template configuration not found for key: ${templateKey}`);
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update({
        subject: defaultConfig.subject,
        html_body: defaultConfig.html_body,
        variables: defaultConfig.variables,
        is_active: true,
        updated_by: updatedBy || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as EmailTemplate;
  }
}

export const emailTemplateRepository = new EmailTemplateRepository();
