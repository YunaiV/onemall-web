import { login, logout, getInfo } from '@/api/passport/passport'
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  // 管理员信息
  name: '',
  avatar: '',
  // 认证信息
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken()
}

const mutations = {
  // 管理员信息
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  // 认证信息
  SET_ACCESS_TOKEN: (state, accessToken) => {
    state.accessToken = accessToken
  },
  SET_REFRESH_TOKEN: (state, refreshToken) => {
    state.refreshToken = refreshToken
  }
}

const actions = {

  // 管理员登陆
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // 发起登录请求
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        // 设置访问令牌到 Store 中
        commit('SET_ACCESS_TOKEN', data.accessToken)
        commit('SET_REFRESH_TOKEN', data.refreshToken)
        // 设置访问令牌到 Cookie 中
        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        // 返回
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获得管理员信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response
        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        // 返回
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_ACCESS_TOKEN', '')
      commit('SET_REFRESH_TOKEN', '')
      removeToken()
      resolve()
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
