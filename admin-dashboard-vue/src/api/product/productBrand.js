import request from '@/utils/request'

export function pageProductBrand(data) {
  return request({
    url: '/management-api/product-brand/page',
    method: 'get',
    params: data
  })
}

export function createProductBrand(data) {
  return request({
    url: '/management-api/product-brand/create',
    method: 'post',
    params: data
  })
}

// TODO 芋艿：使用表单提交，而不是 query string
export function updateProductBrand(data) {
  return request({
    url: '/management-api/product-brand/update',
    method: 'post',
    params: data
  })
}

export function deleteProductBrand(productBrandId) {
  return request({
    url: '/management-api/product-brand/delete',
    method: 'post',
    params: {
      productBrandId: productBrandId
    }
  })
}
