import request from "../config/request";

export function getTransaction(appId, orderId) {
  return request({
    url: '/shop-api/pay/transaction/get',
    method: 'get',
    params: {
      appId,
      orderId
    }
  });
}

export function submitTransaction(appId, orderId, payChannel) {
  return request({
    url: '/shop-api/pay/transaction/submit',
    method: 'post',
    params: {
      appId,
      orderId,
      payChannel
    }
  });
}
