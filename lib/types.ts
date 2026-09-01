export interface LinkRecord {
  slug: string;
  destination_url: string;
  clicks: number;
  created_at: string;
}

export interface LinkInput {
  destination_url: string;
  slug?: string;
}

export interface LinkUpdate {
  destination_url?: string;
  slug?: string;
}

export interface LinkStats {
  total_clicks: number;
  by_source: Record<string, number>;
  by_device: Record<string, number>;
  by_browser: Record<string, number>;
  by_os: Record<string, number>;
  daily_clicks: { date: string; clicks: number }[];
}
