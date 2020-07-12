import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/management-api/passport/login',
    method: 'post',
    params: data
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

export function getInfo() {
  return request({
    url: '/management-api/passport/info',
    method: 'get'
  })
}

export function treeAdminMenu() {
  return request({
    url: '/management-api/passport/tree-admin-menu',
    method: 'get'
  })
}

export function listAdminPermission() {
  return request({
    url: '/management-api/passport/list-admin-permission',
    method: 'get'
  })
}
