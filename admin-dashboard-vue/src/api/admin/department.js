import request from '@/utils/request'

export function treeDepartment() {
  return request({
    url: '/management-api/department/tree',
    method: 'get'
  })
}

export function createDepartment(data) {
  return request({
    url: '/management-api/department/create',
    method: 'post',
    params: data
  })
}

export function updateDepartment(data) {
  return request({
    url: '/management-api/department/update',
    method: 'post',
    params: data
  })
}

export function deleteDepartment(departmentId) {
  return request({
    url: '/management-api/department/delete',
    method: 'post',
    params: {
      departmentId: departmentId
    }
  })
}
