import request from '@/utils/request'

export function pageProductRecommend(data) {
  return request({
    url: '/management-api/promotion/product-recommend/page',
    method: 'get',
    params: data
  })
}

export function createProductRecommend(data) {
  return request({
    url: '/management-api/promotion/product-recommend/create',
    method: 'post',
    params: data
  })
}

export function updateProductRecommend(data) {
  return request({
    url: '/management-api/promotion/product-recommend/update',
    method: 'post',
    params: data
  })
}

export function deleteProductRecommend(productRecommendId) {
  return request({
    url: '/management-api/promotion/product-recommend/delete',
    method: 'post',
    params: {
      productRecommendId: productRecommendId
    }
  })
}
