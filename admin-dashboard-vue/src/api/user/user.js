import request from '@/utils/request'

export function pageUser(data) {
  return request({
    url: '/management-api/user/page',
    method: 'get',
    params: data
  })
}

export function createUser(data) {
  return request({
    url: '/management-api/user/create',
    method: 'post',
    params: data
  })
}

export function updateUserInfo(data) {
  return request({
    url: '/management-api/user/update-info',
    method: 'post',
    params: data
  })
}

export function updateUserStatus(userId, status) {
  return request({
    url: '/management-api/user/update-status',
    method: 'post',
    params: {
      userId: userId,
      status: status
    }
  })
}
