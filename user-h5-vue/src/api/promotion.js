import request from "../config/request";

// Banner

export function getBannerList() {
  return request({
    url: '/promotion-api/users/banner/list',
    method: 'get',
  });
}

// Product Recommend

export function getProductRecommendList() {
  return request({
    url: '/promotion-api/users/product_recommend/list',
    method: 'get',
    params: {
    }
  });
}

// Coupon Template

export function getCouponTemplate(id) {
  return request({
    url: '/shop-api/promotion/coupon-template/get',
    method: 'get',
    params: {
      id,
    }
  });
}

export function doAddCouponCard(templateId) {
  return request({
    url: '/shop-api/promotion/coupon-card/create',
    method: 'post',
    params: {
      couponTemplateId: templateId,
    }
  });
}


// Coupon Card

export function getCouponPage(status, pageNo, pageSize) {
  return request({
    url: '/shop-api/promotion/coupon-card/page',
    method: 'get',
    params: {
      status,
      pageNo,
      pageSize
    }
  });
}
