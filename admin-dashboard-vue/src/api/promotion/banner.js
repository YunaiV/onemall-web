import request from '@/utils/request'

export function pageBanner(data) {
  return request({
    url: '/management-api/promotion/banner/page',
    method: 'get',
    params: data
  })
}

export function createBanner(data) {
  return request({
    url: '/management-api/promotion/banner/create',
    method: 'post',
    params: data
  })
}

export function updateBanner(data) {
  return request({
    url: '/management-api/promotion/banner/update',
    method: 'post',
    params: data
  })
}

export function deleteBanner(bannerId) {
  return request({
    url: '/management-api/promotion/banner/delete',
    method: 'post',
    params: {
      bannerId: bannerId
    }
  })
}
