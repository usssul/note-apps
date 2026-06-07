export interface HighlightMedia {
  media_id: number;
  media_type: number;
  src: string;
  srcset?: string;
}

export interface SongItem {
  id: number;
  name: string;
  description: string;
  singer_list: string[];
  composer_list: string[];
  arranger_list: string[];
  lyricist_list: string[];
  producer_list: string[];
}

export interface ArticleColumn {
  article_column_id: number;
  name: string;
  description: string;
  article_column_status: number;
  thumbnail: {
    src: string;
    srcset?: string;
  };
  parent_article_column_id: number;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface MetaInfo {
  title: string;
  meta: MetaTag[];
}

export interface My903ListItem {
  desc?: string;
  title: string;
  cover: string;
  article_id: number;
  create_date: string;
}

export interface My903Detail {
  title: string;
  id: number;
  name: string;
  description: string;
  singer_list: string[];
  composer_list: string[];
  arranger_list: string[];
  lyricist_list: string[];
  producer_list: string[];
  youtube_media?: {
    media_id: number;
    yt_id: string;
  };
  cover: string;
  tags: string[];
  create_date: string;
}

export interface My903 {
  id: string;
  article_id: number;
  cover: string;
  article_type: number;
  title: string;
  display_title: number;
  article_author_id: number;
  song_id: number;
  article_highlight_type: number;
  article_highlight_media_id: number;
  thumbnail_media_id: number;
  thumbnail_height: number;
  status: number;
  schedule_ts: string;
  last_update_datetime: string;
  create_date: string;
  create_time: string;
  mod_ts: string;
  author: string;
  highlight_media: HighlightMedia;
  content: string;
  desc?: string;
  song_item: SongItem;
  tags: string[];
  thumbnail: {
    src: string;
    srcset?: string;
  };
  related_articles: any[];
  article_column: ArticleColumn;
  meta: MetaInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingerInfo {
  name: string;
  count: number;
}
