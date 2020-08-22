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
  IGNORE: 2 // 已忽略
}

/**
 * 错误码的类型枚举
 */
export const ErrorCodeTypeEnum = {
  AUTO_GENERATION: 1, // 自动生成
  MANUAL_OPERATION: 2 // 手动处理
}

/**
 * 优惠类型枚举
 */
export const PreferentialTypeEnum = {
  PRICE: 1, // 减价
  DISCOUNT: 2 // 打折
}

/**
 * 可用范围的类型枚举
 */
export const RangeTypeEnum = {
  ALL: 10, // 所有可用
  PRODUCT_INCLUDE_PART: 20, // 部分商品可用，或指定商品可用
  PRODUCT_EXCLUDE_PART: 21, // 部分商品不可用，或指定商品不可用
  CATEGORY_INCLUDE_PART: 30, // 部分分类可用，或指定分类可用
  CATEGORY_EXCLUDE_PART: 31, // 部分分类不可用，或指定分类不可用
}

/**
 * 优惠劵（码）模板的时间类型的枚举
 */
export const CouponTemplateDateTypeEnum = {
  FIXED_DATE: 1, // 固定日期
  FIXED_TERM: 2, // 领取日期
}

/**
 * 优惠劵（码）模板的状态的枚举
 */
export const CouponTemplateStatusEnum = {
  ENABLE: 1, // 生效中
  DISABLE: 2, // 已失效
}

/**
 * 优惠劵（码）模板的类型的枚举
 */
export const CouponTemplateTypeEnum = {
  CARD: 1, // 优惠劵
  CODE: 2, // 折扣卷
}

/**
 * 促销活动类型枚举
 */
export const PromotionActivityTypeEnum = {
  TIME_LIMITED_DISCOUNT: 1, // 限时折扣
  FULL_PRIVILEGE: 2, // 满减送
}

/**
 * 匹配类型枚举
 */
export const MeetTypeEnum = {
  PRICE: 1, // 金额
  QUANTITY: 2 // 数量
}

/**
 * 促销活动状态枚举
 */
export const PromotionActivityStatusEnum = {
  WAIT: 10, // 未开始
  RUN: 20, // 进行中
  END: 30, // 已结束
  INVALID: 40, // 已撤销
  DELETED: 50, // 已删除
}
