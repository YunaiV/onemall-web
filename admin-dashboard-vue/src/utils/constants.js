/**
 * Created by 芋道源码
 *
 * 枚举类
 */

/**
 * 全局通用状态枚举
 */
export const CommonStatusEnum = {
  ENABLE: 1, // 开启
  DISABLE: 2 // 禁用
}

/**
 * 资源的类型枚举
 */
export const ResourceTypeEnum = {
  MENU: 1, // 菜单
  BUTTON: 2 // 按钮
}

/**
 * 角色的类型枚举
 */
export const RoleTypeEnum = {
  SYSTEM: 1, // 内置角色
  CUSTOM: 2 // 自定义角色
}

/**
 * 系统异常日志的处理状态枚举
 */
export const SystemExceptionLogProcessStatusEnum = {
  INIT: 0, // 未处理
  DONE: 1, // 已处理
  IGNORE: 2, // 已忽略
}


/**
 * 错误码的类型枚举
 */
export const ErrorCodeTypeEnum = {
  AUTO_GENERATION: 1, // 自动生成
  MANUAL_OPERATION: 2 // 手动处理
}
