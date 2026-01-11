export interface Link {
  id: string;
  url: string;
  resource?: string;
  views: number;
  viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  url: string;
  resource?: string;
}

export interface UpdateLinkInput {
  url?: string;
  resource?: string;
}
