import request from '@/utils/request'

export function pageSystemExceptionLog(data) {
  return request({
    url: '/management-api/system-exception-log/page',
    method: 'get',
    params: data
  })
}

export function getSystemExceptionLog(logId) {
  return request({
    url: '/management-api/system-exception-log/get',
    method: 'get',
    params: {
      logId: logId
    }
  })
}

export function processSystemExceptionLog(logId, processStatus) {
  return request({
    url: '/management-api/system-exception-log/process',
    method: 'post',
    params: {
      logId: logId,
      processStatus: processStatus
    }
  })
}
