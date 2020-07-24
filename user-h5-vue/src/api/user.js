import request from "../config/request";

export function GetFavoritePage(pageNo, pageSize) {
  return request({
    url: '/user-api/users/favorite/page',
    method: 'get',
    params: {pageNo, pageSize}
  })
}

export function DelFavorite(spuId) {
  return request({
    url: '/user-api/users/favorite/remove',
    method: 'DELETE',
    params: {spuId}
  })
}

export function hasUserSpuFavorite(spuId) {
  return request({
    url: '/user-api/users/favorite/hasUserFavorite',
    method: 'get',
    params: {spuId}
  })
}


export function GetCoupon(data) {
  return request({
    url: '/User/GetCoupon',
    method: 'Post',
    params: {data}
  })
}

export function ExchangeCoupon(code) {
  return request({
    url: '/User/ExchangeCoupon',
    method: 'Post',
    params: {code: code}
  })
}

export function userInfo() {
  return request({
    url: '/user-api/user/info',
    method: 'get',
  });
}

export function doUserUpdateNickname(nickname) {
  return request({
    url: '/user-api/users/user/update_nickname',
    method: 'post',
    params: {
      nickname,
    }
  });
}

export function passportLoginBySms(mobile, code) {
  return request({
    url: '/user-api/passport/login-by-sms',
    method: 'post',
    params: {
      mobile,
      code,
    }
  });
}

export function passportSendSmsCode(mobile, scene) {
  return request({
    url: '/user-api/passport/send-sms-code',
    method: 'post',
    params: {
      mobile,
      scene
    }
  });
}


// -------------------------- address

export function listUserAddressList() {
  return request({
    url: '/user-api/user-address/list',
    method: 'get',
  })
}

export function getUserAddress(userAddressId) {
  return request({
    url: '/user-api/user-address/get',
    method: 'get',
    params: {userAddressId}
  })
}

export function getDefaultAddress() {
  return request({
    url: '/user-api/user-address/get-default',
    method: 'get',
  })
}

export function updateUserAddress(data) {
  return request({
    url: '/user-api/user-address/update',
    method: 'POST',
    params: data
  })
}

export function createUserAddress(data) {
  return request({
    url: '/user-api/user-address/create',
    method: 'POST',
    params: data
  })
}

export function deleteUserAddress(userAddressId) {
  return request({
    url: '/user-api/user-address/delete',
    method: 'POST',
    params: {userAddressId}
  })
}
