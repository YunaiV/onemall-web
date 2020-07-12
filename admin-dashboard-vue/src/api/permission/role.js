import request from '@/utils/request'

export function pageRole(data) {
  return request({
    url: '/management-api/role/page',
    method: 'get',
    params: data
  })
}

export function createRole(data) {
  return request({
    url: '/management-api/role/create',
    method: 'post',
    params: data
  })
}

export function updateRole(data) {
  return request({
    url: '/management-api/role/update',
    method: 'post',
    params: data
  })
}

export function deleteRole(roleId) {
  return request({
    url: '/management-api/role/delete',
    method: 'post',
    params: {
      roleId: roleId
    }
  })
}
