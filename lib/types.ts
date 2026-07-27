export interface LinkRecord {
  slug: string;
  destination_url: string;
  clicks: number;
}

export interface LinkStats {
  total_clicks: number;
  by_source: Record<string, number>;
}
