export interface Member {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  avatar_url: string;
  default_avatar_url: string;
  name: string;
  role: "bot" | "admin" | "owner" | "member";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  entity_type: "bot" | "user";
  online?: boolean;
}

export interface PeopleResponse {
  status: string;
  status_code: number;
  message: string;
  data: Member[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  }[];
}
