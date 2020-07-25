import request from '@/utils/request'

export function treeProductCategory() {
  return request({
    url: '/management-api/product-category/tree',
    method: 'get'
  })
}

export function createProductCategory(data) {
  return request({
    url: '/management-api/product-category/create',
    method: 'post',
    params: data
  })
}

// TODO 芋艿：使用表单提交，而不是 query string
export function updateProductCategory(data) {
  return request({
    url: '/management-api/product-category/update',
    method: 'post',
    params: data
  })
}

export function deleteProductCategory(productCategoryId) {
  return request({
    url: '/management-api/product-category/delete',
    method: 'post',
    params: {
      productCategoryId: productCategoryId
    }
  })
}
