import request from '@/utils/request'

export function treeResource() {
  return request({
    url: '/management-api/resource/tree',
    method: 'get'
  })
}

export function createResource(data) {
  return request({
    url: '/management-api/resource/create',
    method: 'post',
    params: data
  })
}

// TODO 芋艿：使用表单提交，而不是 query string
export function updateResource(data) {
  return request({
    url: '/management-api/resource/update',
    method: 'post',
    params: data
  })
}

export function deleteResource(resourceId) {
  return request({
    url: '/management-api/resource/delete',
    method: 'post',
    params: {
      resourceId: resourceId
    }
  })
}
