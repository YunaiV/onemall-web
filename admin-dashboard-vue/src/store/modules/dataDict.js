import { listSimpleDataDicts } from '@/api/datadict/datadict'

const state = {
  /**
   * 数据字典 MAP
   * key：数据字典大类枚举值 enumValue
   * value：数据字典小类数值 {value: '', displayName: ''} 的数组
   */
  dataDicts: {}
}

const mutations = {
  SET_DATA_DICTS: (state, dataDicts) => {
    state.dataDicts = dataDicts
  }
}

const actions = {
  loadDataDicts({ commit }) {
    listSimpleDataDicts().then(response => {
      // 设置数据
      const dataDictMap = {}
      response.data.forEach(dataDict => {
        // 获得 enumValue 层级
        const enumValueObj = dataDictMap[dataDict.enumValue]
        if (!enumValueObj) {
          dataDictMap[dataDict.enumValue] = []
        }
        // 处理 value 层级
        dataDictMap[dataDict.enumValue].push({
          value: dataDict.value,
          displayName: dataDict.displayName
        })
      })
      // 存储到 Store 中
      commit('SET_DATA_DICTS', dataDictMap)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
