import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/management-api/passport/login',
    method: 'post',
    params: data
  })
}

export function getInfo() {
  return request({
    url: '/management-api/admin/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

export function treeAdminMenu() {
  return request({
    url: '/management-api/resource/tree-admin-menu',
    method: 'get'
  })
}

export function listAdminPermission() {
  return request({
    url: '/management-api/resource/list-admin-permission',
    method: 'get'
  })
}
