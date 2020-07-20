import request from '@/utils/request'

export function pageErrorCode(data) {
  return request({
    url: '/management-api/error-code/page',
    method: 'get',
    params: data
  })
}

export function createErrorCode(data) {
  return request({
    url: '/management-api/error-code/create',
    method: 'post',
    params: data
  })
}

export function updateErrorCode(data) {
  return request({
    url: '/management-api/error-code/update',
    method: 'post',
    params: data
  })
}

export function deleteErrorCode(errorCodeId) {
  return request({
    url: '/management-api/error-code/delete',
    method: 'post',
    params: {
      errorCodeId: errorCodeId
    }
  })
}
