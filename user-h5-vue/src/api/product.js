import request from "../config/request";

export function getProductCategoryList(pid) {
  return request({
    url: '/shop-api/product-category/list',
    method: 'get',
    params: {
      pid
    }
  });
}

export function getProductSpuDetail(id) {
  return request({
    url: '/shop-api/product-spu/get-detail',
    method: 'get',
    params: {
      id,
    }
  });
}

export function collectionSpu(spuId,hasCollectionType) {
  return request({
    url: '/product-api/users/spu/collection/'+spuId+'/' + hasCollectionType,
    method: 'post'
  });
}

export function getProductSpuPage({cid, keyword, pageNo, pageSize, sortField, sortOrder}) {
  return request({
    url: '/shop-api/product-spu/page',
    method: 'get',
    params: {
      cid,
      keyword,
      pageNo: pageNo || 1,
      pageSize: pageSize || 10,
      sortField: sortField,
      sortOrder: sortOrder,
    }
  });
}

export function getProductSearchCondition({keyword}) {
  return request({
    url: '/shop-api/product-spu/search-condition',
    method: 'get',
    params: {
      keyword,
    }
  });
}
