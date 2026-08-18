export interface ThreadReplyMessage {
  id: string;
  message?: string;
  content?: string;
  channels_id: string;
  user_id: string;
  username: string;
  created_at: string;
  updated_at: string;
  thread_id: string;
  avatar_url?: string;
  default_avatar_url?: string;
  user_type?: string;
}

export interface ThreadMedia {
  id: string;
  file_name: string;
  file_type: string;
  file_link: string;
  mime_type?: string;
}

export interface ThreadMention {
  type: string;
  id: string;
}

export interface ThreadReaction {
  reaction?: string;
  reaction_count?: number;
  reaction_id?: string;
}

export interface ThreadMessage {
  thread_id: string;
  channels_id: string;
  org_id: string;
  username: string;
  event_name?: string;
  action_type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  message: string;
  user_id: string;
  channel_name: string;
  channel_type: string;
  message_count: number;
  last_reply?: string;
  avatar_url?: string;
  full_name?: string;
  email?: string;
  user_type?: string;
  current_status?: string;
  edited?: boolean;
  is_pinned?: boolean;
  is_saved?: boolean;
  is_forwarded?: boolean;
  type: string;
  state?: string;
  messages?: ThreadReplyMessage[];
  media?: ThreadMedia[];
  mentions?: ThreadMention[];
  reactions?: ThreadReaction[];
  preview_reply?: ThreadReplyMessage[];
}

export interface ThreadGroup {
  thread_id?: string;
  thread_messages: ThreadMessage[];
  channel_name: string;
  participants: string;
  channel_type?: string;
  previe_message?: string;
  preview_message?: string;
  sender_avatar_url?: string;
  sender_default_avatar_url?: string;
}

export interface ThreadsPagination {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_items: number;
}
