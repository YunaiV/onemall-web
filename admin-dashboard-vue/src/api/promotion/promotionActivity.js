import request from '@/utils/request'

export function pagePromotionActivity(data) {
  return request({
    url: '/management-api/promotion/activity/page',
    method: 'get',
    params: data
  })
}
