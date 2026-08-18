export type WebhookStatus = "active" | "inactive" | string;

export interface ChannelWebhook {
  id: string;
  event_name: string;
  webhook_name: string;
  status: WebhookStatus;
  owner_id: string;
  webhook_url: string;
  webhook_slug: string;
  channel_id: string;
  created_at: string;
  deleted_at: string;
  updated_at: string;
  webhook_history?: WebhookHistoryItem[] | null;
}

export interface WebhookHistoryItem {
  id: string;
  webhook_id: string;
  callback_id: string;
  status_code: string;
  action_type: string;
  retries: string;
  attempted: string;
}
