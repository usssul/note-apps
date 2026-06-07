import request from '@/api/request';

/** 获取小红书笔记列表 */
export function getXhsListApi(params: {
  page?: number
  limit?: number
  keyword?: string
  nickname?: string
  title?: string
} = {}) {
  return request({
    url: '/xhs/list',
    method: 'get',
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.nickname && { nickname: params.nickname }),
      ...(params.title && { title: params.title }),
    },
  });
}

/** 获取单条笔记详情 */
export function getXhsDetailApi(noteId: string) {
  return request({
    url: `/xhs/note/${noteId}`,
    method: 'get',
  });
}

/** 获取笔记总数统计 */
export function getXhsStatisticsApi() {
  return request({
    url: '/xhs/statistics',
    method: 'get',
  });
}
