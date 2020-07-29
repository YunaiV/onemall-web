import request from '@/utils/request'

export function pageProductAttrKey(data) {
  return request({
    url: '/management-api/product-attr/key/page',
    method: 'get',
    params: data
  })
}

export function createProductAttrKey(data) {
  return request({
    url: '/management-api/product-attr/key/create',
    method: 'post',
    params: data
  })
}

export function updateProductAttrKey(data) {
  return request({
    url: '/management-api/product-attr/key/update',
    method: 'post',
    params: data
  })
}

export function listProductAttrValues(data) {
  return request({
    url: '/management-api/product-attr/value/list',
    method: 'get',
    params: data
  })
}

export function createProductAttrValue(data) {
  return request({
    url: '/management-api/product-attr/value/create',
    method: 'post',
    params: data
  })
}

export function updateProductAttrValue(data) {
  return request({
    url: '/management-api/product-attr/value/update',
    method: 'post',
    params: data
  })
}
