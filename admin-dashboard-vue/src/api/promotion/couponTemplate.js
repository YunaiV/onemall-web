import request from '@/utils/request'

// ========== 通用逻辑 =========

export function pageCouponTemplate(data) {
  return request({
    url: '/management-api/promotion/coupon-template/page',
    method: 'get',
    params: data
  })
}

export function updateCouponTemplateStatus(id, status) {
  return request({
    url: '/management-api/promotion/coupon-template/update-status',
    method: 'post',
    params: {
      id: id,
      status: status
    }
  })
}

// ========== 优惠劵模板 ==========

export function createCouponCardTemplate(data) {
  return request({
    url: '/management-api/promotion/coupon-template/create-card',
    method: 'post',
    params: data
  })
}

export function updateCouponCardTemplate(data) {
  return request({
    url: '/management-api/promotion/coupon-template/update-card',
    method: 'post',
    params: data
  })
}

