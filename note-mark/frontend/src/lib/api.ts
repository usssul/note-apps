import type { My903ListItem, My903Detail, PaginatedResponse, SingerInfo } from '@/types/my903';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

interface ListApiData {
  data: My903ListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const emptyPaginatedResponse: PaginatedResponse<My903ListItem> = {
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export async function getMy903List(params: {
  page?: number;
  limit?: number;
  tag?: string;
}): Promise<PaginatedResponse<My903ListItem>> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.tag) searchParams.set('tag', params.tag);

    const response = await fetch(`${API_BASE_URL}/my903/list?${searchParams}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return { ...emptyPaginatedResponse, page: params.page || 1, limit: params.limit || 20 };
    }
    const result: ApiResponse<ListApiData> = await response.json();
    if (result.code === 200 && result.data) {
      return {
        list: result.data.data,
        total: result.data.total,
        page: result.data.page,
        limit: result.data.limit,
        totalPages: result.data.pages,
      };
    }
    return { ...emptyPaginatedResponse, page: params.page || 1, limit: params.limit || 20 };
  } catch (error) {
    console.error('Failed to fetch my903 list:', error);
    return { ...emptyPaginatedResponse, page: params.page || 1, limit: params.limit || 20 };
  }
}

export async function getMy903Detail(articleId: number): Promise<My903Detail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/my903/detail/${articleId}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    const result: ApiResponse<My903Detail> = await response.json();
    if (result.code === 200 && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch my903 detail:', error);
    return null;
  }
}

export async function getSingerList(): Promise<SingerInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/my903/singer_list`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }
    const result: ApiResponse<SingerInfo[]> = await response.json();
    if (result.code === 200 && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch singer list:', error);
    return [];
  }
}

export async function getStatistics(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/my903/statistics`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return 0;
    }
    const result: ApiResponse<number> = await response.json();
    if (result.code === 200) {
      return result.data || 0;
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    return 0;
  }
}
