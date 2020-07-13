import request from '@/utils/request'

export function listRoleResource(roleId) {
  return request({
    url: '/management-api/permission/list-role-resource',
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}

export function assignRoleResource(data) {
  return request({
    url: '/management-api/permission/assign-role-resource',
    method: 'post',
    params: data
  })
}

export function listAdminRoles(adminId) {
  return request({
    url: '/management-api/permission/list-admin-roles',
    method: 'get',
    params: {
      adminId: adminId
    }
  })
}

export function assignAdminRole(data) {
  return request({
    url: '/management-api/permission/assign-admin-role',
    method: 'post',
    params: data
  })
}
