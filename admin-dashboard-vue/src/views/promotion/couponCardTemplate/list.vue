<template>
	<div class="app-container">
		<!--搜索栏 -->
		<el-form ref="couponCardTemplateListQueryForm" :model="couponCardTemplateListQuery" :inline="true">
			<el-form-item label="标题" prop="title">
				<el-input v-model="couponCardTemplateListQuery.title" placeholder="请输入标题" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="couponCardTemplateListQueryFormSubmit">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="couponCardTemplateListQueryFormReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 工具栏 -->
		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button v-permission="['promotion:coupon-template:create-card']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
			</el-col>
		</el-row>

		<!-- 优惠劵模板列表 -->
		<el-table v-loading="couponCardTemplateListLoading" :data="couponCardTemplateList" row-key="id">
			<el-table-column prop="title" label="名称" width="150" :show-overflow-tooltip="true" />
			<el-table-column prop="preferentialType" :formatter="formatPreferentialTypeTableColumn" label="类型" width="150" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatPreferentialContentTableColumn" label="优惠内容" width="200" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatRangeTypeTableColumn" label="可使用商品" width="150" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatDateTypeTableColumn" label="有效期" width="250" :show-overflow-tooltip="true" />
			<el-table-column label="已领取/剩余" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.statFetchNum + ' / ' + (scope.row.total - scope.row.statFetchNum) }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="type" :formatter="formatStatusTableColumn" label="状态" width="100" />
			<el-table-column label="创建时间" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button
							v-permission="['promotion:coupon-template:update-card']"
							type="text"
							size="mini"
							icon="el-icon-edit"
							@click="handleUpdateClick(scope.row)"
					>修改
					</el-button>
					<el-button
							v-if="scope.row.status === CouponTemplateStatusEnum.ENABLE"
							v-permission="['promotion:coupon-template:update-status']"
							type="text"
							size="mini"
							icon="el-icon-video-pause"
							@click="handleStatusUpdateClick(scope.row, CouponTemplateStatusEnum.DISABLE)"
					>禁用
					</el-button>
					<el-button
							v-if="scope.row.status === CouponTemplateStatusEnum.DISABLE"
							v-permission="['promotion:coupon-template:update-status']"
							type="text"
							size="mini"
							icon="el-icon-video-play"
							@click="handleStatusUpdateClick(scope.row, CouponTemplateStatusEnum.ENABLE)"
					>开启
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 优惠劵模板列表的分页 -->
		<pagination
				v-show="couponCardTemplateListTotal > 0"
				:total="couponCardTemplateListTotal"
				:page.sync="couponCardTemplateListQuery.pageNo"
				:limit.sync="couponCardTemplateListQuery.pageSize"
				@pagination="getCouponCardTemplateList"
		/>

		<!-- 优惠劵模板添加与修改表单 -->
		<el-dialog
				v-loading="couponCardTemplateFormLoading"
				:title="couponCardTemplateFormTitle"
				:visible.sync="couponCardTemplateFormVisible"
				width="600px"
				append-to-body
				element-loading-text="提交中..."
				element-loading-spinner="el-icon-loading"
		>
			<el-form ref="couponCardTemplateForm" :model="couponCardTemplateForm" :rules="couponCardTemplateFormRule" label-width="120px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="标题" prop="title">
							<el-input v-model="couponCardTemplateForm.title" placeholder="请输入标题" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="使用说明" prop="description">
							<el-input v-model="couponCardTemplateForm.description" placeholder="请输入使用说明" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="限领次数" prop="quota">
							<el-input-number v-model="couponCardTemplateForm.quota" placeholder="请输入限领次数" :min="1" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="发放总量" prop="total">
							<el-input-number v-model="couponCardTemplateForm.total" placeholder="请输入发放总量" :min="1"/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="使用金额门槛" prop="priceAvailable">
							<el-input-number v-model="couponCardTemplateForm.priceAvailable" placeholder="请输入使用金额门槛" :min="0" :disabled="couponCardTemplateForm.id" /> 元
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="可用范围" prop="rangeType">
							<el-select v-model="couponCardTemplateForm.rangeType" placeholder="请选择可用范围" clearable>
								<el-option v-for="dict in rangeTypeDataDicts" :key="dict.value" :label="dict.displayName" :value="parseInt(dict.value)" />
							</el-select>
						</el-form-item>
					</el-col>
					<!-- TODO 芋艿：商品选择搜索，后续完成 -->
					<el-col :span="24" v-if="couponCardTemplateForm.rangeType === RangeTypeEnum.PRODUCT_INCLUDE_PART
					 		|| couponCardTemplateForm.rangeType === RangeTypeEnum.PRODUCT_EXCLUDE_PART">
						<el-form-item label="选择商品" prop="rangeValues">
							<el-input v-model="couponCardTemplateForm.rangeValues" placeholder="手动输入商品 SPU 编号，使用逗号分隔" />
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.rangeType === RangeTypeEnum.CATEGORY_INCLUDE_PART
					 		|| couponCardTemplateForm.rangeType === RangeTypeEnum.CATEGORY_EXCLUDE_PART">
						<el-form-item label="选择分类" prop="rangeValues">
							<treeselect v-model="couponCardTemplateForm.rangeValues" :options="couponCardTemplateFormProductCategoryTreeSelect" placeholder="选择选择分类"
													:multiple="true"/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="生效日期类型" prop="dateType">
							<el-select v-model="couponCardTemplateForm.dateType" placeholder="请选择生效日期类型" clearable :disabled="couponCardTemplateForm.id">
								<el-option v-for="dict in couponTemplateDateTypeDataDicts" :key="dict.value" :label="dict.displayName" :value="parseInt(dict.value)" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.dateType === CouponTemplateDateTypeEnum.FIXED_DATE">
						<el-form-item label="固定日期">
							<el-date-picker v-model="couponCardTemplateForm.validStartTime" value-format="yyyy-MM-dd" type="date" placeholder="开始时期" style="width: 200px;" />
							&nbsp;-&nbsp;
							<el-date-picker v-model="couponCardTemplateForm.validEndTime" value-format="yyyy-MM-dd" type="date" placeholder="结束时期" style="width: 200px;" />
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.dateType === CouponTemplateDateTypeEnum.FIXED_TERM">
						<el-form-item label="领取日期">
							<el-input-number v-model="couponCardTemplateForm.fixedStartTerm" placeholder="开始时期" :min="1" style="width: 200px;" />
							&nbsp;-&nbsp;
							<el-input-number v-model="couponCardTemplateForm.fixedEndTerm" placeholder="结束时期" :min="1" style="width: 200px;" />
							 天
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="优惠类型" prop="preferentialType">
							<el-select v-model="couponCardTemplateForm.preferentialType" placeholder="请选择优惠类型" clearable :disabled="couponCardTemplateForm.id">
								<el-option v-for="dict in preferentialTypeDataDicts" :key="dict.value" :label="dict.displayName" :value="parseInt(dict.value)" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.preferentialType === PreferentialTypeEnum.PRICE">
						<el-form-item label="优惠金额" prop="priceOff">
							<el-input-number v-model="couponCardTemplateForm.priceOff" placeholder="请输入优惠金额" :min="1" :disabled="couponCardTemplateForm.id" /> 元
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.preferentialType === PreferentialTypeEnum.DISCOUNT">
						<el-form-item label="折扣百分比" prop="percentOff">
							<el-input-number v-model="couponCardTemplateForm.percentOff" placeholder="请输入折扣百分比" :min="1" :disabled="couponCardTemplateForm.id" /> %
						</el-form-item>
					</el-col>
					<el-col :span="24" v-if="couponCardTemplateForm.preferentialType === PreferentialTypeEnum.DISCOUNT">
						<el-form-item label="最多优惠" prop="discountPriceLimit">
							<el-input-number v-model="couponCardTemplateForm.discountPriceLimit" placeholder="请输入最多优惠" :min="1" :disabled="couponCardTemplateForm.id" /> 元
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleFormSubmit">确 定</el-button>
				<el-button @click="handleFormCancel">取 消</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
import { pageCouponTemplate, updateCouponTemplateStatus, createCouponCardTemplate, updateCouponCardTemplate } from '@/api/promotion/couponTemplate'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'
import { treeProductCategory } from '@/api/product/productCategory'

import Pagination from '@/components/Pagination'

import { RangeTypeEnum, CouponTemplateStatusEnum, PreferentialTypeEnum, CouponTemplateDateTypeEnum, CouponTemplateTypeEnum } from '@/utils/constants'

import { parseTime } from '@/utils/index'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
	name: 'CouponTemplateCardList',
	components: { Pagination, Treeselect },
	data() {
		return {
			// 优惠劵模板列表
			couponCardTemplateList: [],
			// 优惠劵模板总数
			couponCardTemplateListTotal: 0,
			// 进度条
			couponCardTemplateListLoading: true,
			// 查询条件
			couponCardTemplateListQuery: {
				pageNo: 1,
				pageSize: 10,
				title: undefined,
				type: CouponTemplateTypeEnum.CARD
			},

			// 优惠劵模板添加与修改表单
			couponCardTemplateForm: {},
			// 校验规则
			couponCardTemplateFormRule: {
				title: [
					{ required: true, message: '标题不能为空', trigger: 'blur' }
				],
        description: [
					{ required: true, message: '使用说明不能为空', trigger: 'blur' }
				],
        quota: [
          { required: true, message: '限领次数不能为空', trigger: 'blur' }
				],
        total: [
          { required: true, message: '发放总量不能为空', trigger: 'blur' }
        ],
        priceAvailable: [
          { required: true, message: '使用金额门槛不能为空', trigger: 'blur' }
				],
        rangeType: [
          { required: true, message: '可用范围不能为空', trigger: 'change' }
				],
        dateType: [
          { required: true, message: '生效日期类型不能为空', trigger: 'change' }
				],
        preferentialType: [
          { required: true, message: '优惠类型不能为空', trigger: 'change' }
				]
			},
			// 是否可见
			couponCardTemplateFormVisible: false,
			// 标题
			couponCardTemplateFormTitle: '',
			// 进度条
			couponCardTemplateFormLoading: false,
      // 商品分类树 TreeSelect 的数据
      couponCardTemplateFormProductCategoryTreeSelect: [],

			// 枚举
			CouponTemplateStatusEnum: CouponTemplateStatusEnum,
      RangeTypeEnum: RangeTypeEnum,
      CouponTemplateDateTypeEnum: CouponTemplateDateTypeEnum,
      PreferentialTypeEnum: PreferentialTypeEnum,

      // 数据字典
      rangeTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.RANGE_TYPE),
      couponTemplateDateTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COUPON_TEMPLATE_DATE_TYPE),
      preferentialTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.PREFERENTIAL_TYPE),
		}
	},
	created() {
		this.getCouponCardTemplateList()
	},
	methods: {
		// 加载优惠劵模板列表
		getCouponCardTemplateList() {
			this.couponCardTemplateListLoading = true
			pageCouponTemplate(this.couponCardTemplateListQuery).then(response => {
				// 取消加载中
				this.couponCardTemplateListLoading = false
				// 设置数据
				this.couponCardTemplateList = response.data.list
				this.couponCardTemplateListTotal = response.data.total
			}).catch(() => {
				// 取消加载中
				this.couponCardTemplateListLoading = false
			})
		},
    // 添加弹窗
    handleAddClick(row) {
      this.couponCardTemplateFormVisible = true
      this.couponCardTemplateFormTitle = '添加优惠劵模板'
      // 重置表单
      this.couponCardTemplateForm = {}
      this.resetForm('couponCardTemplateForm')
      // 加载商品分类
      treeProductCategory().then(response => {
        this.couponCardTemplateFormProductCategoryTreeSelect = this.generateCouponCardTemplateFormProductCategoryTreeSelect(response.data)
      })
    },
		// 修改弹窗
		handleUpdateClick(row) {
			this.couponCardTemplateFormVisible = true
			this.couponCardTemplateFormTitle = '修改优惠劵模板'
			// 重置表单
			this.resetForm('couponCardTemplateForm')
			// 设置修改的表单
			this.couponCardTemplateForm = {
			  ...row,
        priceOff: row.priceOff ? row.priceOff / 100 : undefined,
        discountPriceLimit: row.discountPriceLimit ? row.discountPriceLimit : undefined,
        validStartTime: row.validStartTime ? new Date(row.validStartTime) : undefined,
        validEndTime: row.validEndTime ? new Date(row.validEndTime) : undefined,
			}
      // 加载商品分类
      treeProductCategory().then(response => {
        this.couponCardTemplateFormProductCategoryTreeSelect = this.generateCouponCardTemplateFormProductCategoryTreeSelect(response.data)
      })
    },
		// 表单提交
		handleFormSubmit() {
			this.$refs['couponCardTemplateForm'].validate(valid => {
				if (!valid) {
					return
				}
				// 设置加载中，避免重复点击
				this.couponCardTemplateFormLoading = true

				let form = {
				  ...this.couponCardTemplateForm,
          priceAvailable: this.couponCardTemplateForm.priceAvailable ? parseInt(this.couponCardTemplateForm.priceAvailable * 100) : undefined,
          // 如下字段置空，因为是根据条件设置的
          validStartTime: undefined,
          validEndTime: undefined,
          fixedStartTerm: undefined,
          fixedEndTerm: undefined,
          rangeValues: undefined,
          priceOff: undefined,
          percentOff: undefined,
          discountPriceLimit: undefined,
				}
				// dateType 相关字段
				if (this.couponCardTemplateForm.dateType === CouponTemplateDateTypeEnum.FIXED_DATE) {
          form.validStartTime = this.couponCardTemplateForm.validStartTime + ' 00:00:00'
          form.validEndTime = this.couponCardTemplateForm.validEndTime + ' 23:59:59'
				} else if (this.couponCardTemplateForm.dateType === CouponTemplateDateTypeEnum.FIXED_TERM) {
          form.fixedStartTerm = this.couponCardTemplateForm.fixedStartTerm
          form.fixedEndTerm = this.couponCardTemplateForm.fixedEndTerm
        }
				// rangeType 相关字段
				if (this.couponCardTemplateForm.rangeType === RangeTypeEnum.PRODUCT_INCLUDE_PART
							|| this.couponCardTemplateForm.rangeType === RangeTypeEnum.PRODUCT_EXCLUDE_PART) {
          form.rangeValues = this.couponCardTemplateForm.rangeValues
				} else if (this.couponCardTemplateForm.rangeType === RangeTypeEnum.CATEGORY_INCLUDE_PART
										|| this.couponCardTemplateForm.rangeType === RangeTypeEnum.CATEGORY_EXCLUDE_PART) {
				  form.rangeValues = this.couponCardTemplateForm.rangeValues
									&& this.couponCardTemplateForm.rangeValues.length > 0 ?
								this.couponCardTemplateForm.rangeValues.join(',') : undefined
				}
				// preferentialType 相关字段
				if (this.couponCardTemplateForm.preferentialType === PreferentialTypeEnum.PRICE) {
          form.priceOff = this.couponCardTemplateForm.priceOff ? parseInt(this.couponCardTemplateForm.priceOff) * 100 : undefined
        } else if (this.couponCardTemplateForm.preferentialType === PreferentialTypeEnum.DISCOUNT) {
          form.percentOff = this.couponCardTemplateForm.percentOff ? parseInt(this.couponCardTemplateForm.percentOff) : undefined
          form.discountPriceLimit = this.couponCardTemplateForm.discountPriceLimit ? parseInt(this.couponCardTemplateForm.discountPriceLimit) * 100 : undefined
				}

				// 更新
				if (this.couponCardTemplateForm.id) {
          updateCouponCardTemplate(form).then(() => {
						// 取消加载中
						this.couponCardTemplateFormLoading = false
						// 提示成功
						this.messageSuccess('修改成功')
						// 关闭表单
						this.couponCardTemplateFormVisible = false
						// 重新加载优惠劵模板列表
						this.getCouponCardTemplateList()
					}).catch(() => {
						// 取消加载中
						this.couponCardTemplateFormLoading = false
					})
				// 添加
				} else {
          createCouponCardTemplate(form).then(response => {
            // 取消加载中
            this.couponCardTemplateFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.couponCardTemplateFormVisible = false
            // 重新加载优惠劵模板列表
            this.getCouponCardTemplateList()
          }).catch(() => {
            // 取消加载中
            this.couponCardTemplateFormLoading = false
          })
				}
			})
		},
		// 表单取消
		handleFormCancel() {
			this.couponCardTemplateFormVisible = false
		},
		// 禁用/启用的弹窗
		handleStatusUpdateClick(row, status) {
			const statusText = status === CouponTemplateStatusEnum.ENABLE ? '开启' : '禁用'
			this.$confirm('确认' + statusText + '名字为"' + row.title + '"的优惠劵模板?', '提示', {
				type: 'warning',
				confirmButtonText: '确定',
				cancelButtonText: '取消'
			}).then(() => {
				updateCouponTemplateStatus(row.id, status).then(response => {
					// 提示成功
					this.messageSuccess(statusText + '成功')
					// 重新加载管理员列表
					this.getCouponCardTemplateList()
				})
			})
		},
		// 搜索表单提交
		couponCardTemplateListQueryFormSubmit() {
			// 重置到第一页
			this.couponCardTemplateListQuery.pageNo = 1
			// 加载优惠劵模板列表
			this.getCouponCardTemplateList()
		},
		// 搜索表单重置
		couponCardTemplateListQueryFormReset() {
			// 重置表单
			this.resetForm('couponCardTemplateListQueryForm')
			// 加载优惠劵模板列表
			this.getCouponCardTemplateList()
		},
    // 构建 couponCardTemplateFormProductCategoryTreeSelect 的数据
    generateCouponCardTemplateFormProductCategoryTreeSelect(tree) {
      const res = []
      tree.forEach(node => {
        // 创建当前节点
        const tmp = {
          id: node.id,
          label: node.name
        }
        res.push(tmp)
        // 递归子节点
        if (node.children) {
          const children = this.generateCouponCardTemplateFormProductCategoryTreeSelect(node.children)
          if (children && children.length > 0) {
            tmp.children = children
          }
        }
      })
      return res
    },
		// 列表渲染（类型列）
    formatPreferentialTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.PREFERENTIAL_TYPE, row.type)
    },
		// 列表渲染（优惠内容）
    formatPreferentialContentTableColumn(row) {
      let content;
      // priceAvailable;
      if (row.priceAvailable === 0) {
        content = '无门槛,';
      } else {
        content = '满 ' + row.priceAvailable / 100 + ' 元,';
      }
      if (row.preferentialType === PreferentialTypeEnum.PRICE) {
        content += '减 ' + row.priceOff / 100 + ' 元';
      } else {
        content += '打' + row.percentOff / 100.0 + '折';
        if (row.discountPriceLimit) {
          content += ', 最多减 ' + row.discountPriceLimit / 100 + ' 元';
        }
      }
      return content;
		},
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
			return getDataDictName(DATA_DICT_ENUM_VALE.COUPON_TEMPLATE_STATUS, row.status)
		},
    // 列表渲染（可使用商品）
    formatRangeTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.RANGE_TYPE, row.rangeType)
    },
		// 列表渲染（有效期）
    formatDateTypeTableColumn(row) {
      let content = getDataDictName(DATA_DICT_ENUM_VALE.COUPON_TEMPLATE_DATE_TYPE, row.dateType) + ' '
      // priceAvailable;
      if (row.dateType === CouponTemplateDateTypeEnum.FIXED_DATE) {
        content += parseTime(row.validStartTime, '{y}-{m}-{d}')
          + '~' +  parseTime(row.validEndTime, '{y}-{m}-{d}')
      } else if (row.dateType === CouponTemplateDateTypeEnum.FIXED_TERM) {
        content += row.fixedStartTerm + '-' + row.fixedEndTerm + ' 天'
      }
      return content
		}
	}
}

</script>

<style scoped>

</style>
