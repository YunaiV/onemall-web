import request from '@/utils/request'

export function pageSystemAccessLog(data) {
  return request({
    url: '/management-api/system-access-log/page',
    method: 'get',
    params: data
  })
}
