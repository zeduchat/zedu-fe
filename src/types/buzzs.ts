export interface OrgBuzz {
  buzz_id: string;
  buzz_code: string;
  channel_id: string;
  channel_type: string;
  host_id: string;
  org_id: string;
  status: string;
  participant_count: number;
  buzz_type: string;
  created_at: string;
  started_at: string;
  ended_at: string | null;
}

export interface BuzzsPagination {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_items: number;
}

export type BuzzsFilter = "all" | "active" | "ended";
