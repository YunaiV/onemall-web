import { treeAdminMenu, listAdminPermission } from '@/api/passport/passport'
import { constantRoutes } from '@/router'
import { generateMenuRoutes } from '@/router/index'

const state = {
  routes: [],
  addRoutes: [],
  permissions: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise((resolve, reject) => {
      // 请求后端，获得菜单树
      treeAdminMenu().then(response => {
        const { data } = response
        // 生成菜单对应的动态路由
        const accessedRoutes = generateMenuRoutes(data)
        // 存储到 Store 中
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  },
  listAdminPermission({ commit }) {
    return new Promise((resolve, reject) => {
      listAdminPermission().then(response => {
        const { data } = response
        commit('SET_PERMISSIONS', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
