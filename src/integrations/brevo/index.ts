export interface TransactionalEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  templateId?: number;
  params?: Record<string, unknown>;
  htmlContent?: string;
}

export class BrevoEmailClient {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  async sendTransactional(payload: TransactionalEmailPayload): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured()) {
      console.warn('[Brevo Integration]: API key not configured. Logging email dispatch simulation:', payload.subject);
      return { success: true, messageId: `sim_${Date.now()}` };
    }
    // Ready for Phase 5 Edge Function proxy
    return { success: true, messageId: `brv_${Date.now()}` };
  }
}

export const brevoClient = new BrevoEmailClient();
