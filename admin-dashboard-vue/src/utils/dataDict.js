/**
 * Created by 芋道源码
 *
 * 数据字典工具类
 */

import store from '@/store'

export const DATA_DICT_ENUM_VALE = {
  COMMON_STATUS: 'common_status',
  RESOURCE_TYPE: 'resource_type',
  ROLE_TYPE: 'role_type',
  USER_TYPE: 'user_type'
}

/**
 * 获取 enumValue 对应的数据字典数组
 *
 * @param enumValue 大类枚举值
 * @returns {*|Array} 数据字典数组
 */
export function getDataDicts(enumValue) {
  return store.getters.data_dicts[enumValue] || []
}

export function getDataDictName(enumValue, value) {
  // 获取 enumValue 对应的数据字典数组
  const dataDicts = getDataDicts(enumValue)
  if (!dataDicts || dataDicts.length === 0) {
    return ''
  }
  // 获取 value 对应的展示名
  value = value + ''; // 强制转换成字符串，因为 DataDict 小类数值，是字符串
  for (const dataDict of dataDicts) {
    if (dataDict.value === value) {
      return dataDict.displayName
    }
  }
  return ''
}
