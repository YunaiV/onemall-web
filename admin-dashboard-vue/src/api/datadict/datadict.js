import request from '@/utils/request'

export function listAllDataDict() {
  return request({
    url: '/management-api/data-dict/list-all',
    method: 'get'
  })
}

export function listSimpleDataDicts() {
  return request({
    url: '/management-api/data-dict/list-all-simple',
    method: 'get'
  })
}

export function createDataDict(data) {
  return request({
    url: '/management-api/data-dict/create',
    method: 'post',
    params: data
  })
}

export function updateDataDict(data) {
  return request({
    url: '/management-api/data-dict/update',
    method: 'post',
    params: data
  })
}

export function deleteDataDict(dataDictId) {
  return request({
    url: '/management-api/data-dict/delete',
    method: 'post',
    params: {
      dataDictId: dataDictId
    }
  })
}
