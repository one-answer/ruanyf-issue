export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  labels: Label[];
  created_at: string;
  updated_at: string;
  html_url: string;
  user: User;
  comments: number;
  is_open_source_recommendation: boolean;
  is_tool_recommendation: boolean;
  is_website_recommendation: boolean;
  is_article_recommendation: boolean;
}

export interface CategoryMap {
  [key: string]: number;
}

export type SortOption = 'newest' | 'oldest' | 'most-commented' | 'recently-updated'; 