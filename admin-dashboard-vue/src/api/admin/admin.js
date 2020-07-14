import request from '@/utils/request'

export function pageAdmin(data) {
  return request({
    url: '/management-api/admin/page',
    method: 'get',
    params: data
  })
}

export function createAdmin(data) {
  return request({
    url: '/management-api/admin/create',
    method: 'post',
    params: data
  })
}

export function updateAdmin(data) {
  return request({
    url: '/management-api/admin/update',
    method: 'post',
    params: data
  })
}

export function deleteAdmin(adminId) {
  return request({
    url: '/management-api/admin/delete',
    method: 'post',
    params: {
      adminId: adminId
    }
  })
}

export function updateAdminStatus(adminId, status) {
  return request({
    url: '/management-api/admin/update-status',
    method: 'post',
    params: {
      adminId: adminId,
      status: status
    }
  })
}
