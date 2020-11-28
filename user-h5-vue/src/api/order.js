import request from "../config/request";

// order

export function createOrder(params) {
  return request({
    headers: {
      'Content-Type': 'application/json',
    },
    url: '/shop-api/trade-order/create',
    method: 'post',
    data: {
      ...params,
    },
  });
}

export function getOrderPage(params) {
  return request({
    url: '/shop-api/trade-order/page',
    method: 'get',
    params: {
      ...params,
    }
  });
}

export function confirmReceiving(orderId) {
  return request({
    url: '/order-api/users/order/confirm_receiving',
    method: 'post',
    params: {
      orderId,
    }
  });
}

export function getOrderConfirmCreateOrder(skuId, quantity, couponCardId) {
  return request({
    url: '/shop-api/trade-order/confirm-create-order-info',
    method: 'get',
    params: {
      skuId,
      quantity,
      couponCardId,
    }
  });
}

export function getOrderInfo(tradeOrderId) {
  return request({
    url: '/shop-api/trade-order/get',
    method: 'get',
    params: {
      tradeOrderId,
    }
  });
}

// Cart

export function createOrderFromCart(userAddressId, couponCardId, remark) {
  return request({
    url: '/order-api/users/order/create_order_from_cart',
    method: 'post',
    params: {
      userAddressId,
      remark,
      couponCardId,
    }
  });
}

export function addCartItem(skuId, quantity) {
  return request({
    url: '/shop-api/cart/add',
    method: 'post',
    params: {
      skuId,
      quantity,
    }
  });
}

export function sumCartItemQuantity() {
  return request({
    url: '/shop-api/cart/sum-quantity',
    method: 'get',
    params: {
    }
  });
}

export function listCart() {
  return request({
    url: '/shop-api/cart/get-detail',
    method: 'get',
    params: {
    }
  });
}

export function updateCartSelected(skuIds, selected) {
  return request({
    url: '/shop-api/cart/update-selected',
    method: 'post',
    params: {
      skuIds: skuIds.join(','),
      selected,
    }
  });
}

export function getCartConfirmCreateOrder(couponCardId) {
  return request({
    url: '/order-api/users/cart/confirm_create_order',
    method: 'get',
    params: {
      couponCardId
    }
  });
}

export function getCartCalcSkuPrice(skuId) {
  return request({
    url: '/order-api/users/cart/calc_sku_price',
    method: 'get',
    params: {
      skuId,
    }
  });
}

// 物流信息

export function getOrderLogisticsInfo(params) {
  return request({
    url: '/order-api/users/order_logistics/info_order',
    method: 'get',
    params: {
      ...params,
    }
  });
}

export function getLogisticsInfo(logisticsId) {
  return request({
    url: '/order-api/users/order_logistics/info',
    method: 'GET',
    params: {
      logisticsId,
    },
  });
}


// 退货信息

export function getOrderReturnReason() {
  return request({
    url: '/order-api/users/order_return/reason',
    method: 'GET',
  });
}

export function orderReturnApply(params) {
  return request({
    headers: {
      'Content-Type': 'application/json',
    },
    url: '/order-api/users/order_return/apply',
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export function getOrderReturnInfo(orderId) {
  return request({
    url: '/order-api/users/order_return/info',
    method: 'GET',
    params: {
      orderId,
    },
  });
}
