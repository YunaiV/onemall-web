<template>
	<div class="app-container">
		<!--搜索栏 -->
		<el-form ref="couponCardTemplateListQueryForm" :model="couponCardTemplateListQuery" :inline="true">
			<el-form-item label="标题" prop="title">
				<el-input v-model="couponCardTemplateListQuery.nickname" placeholder="请输入标题" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="couponCardTemplateListQueryFormSubmit">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="couponCardTemplateListQueryFormReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 工具栏 -->

		<!-- 错误码列表 -->
		<el-table v-loading="couponCardTemplateListLoading" :data="couponCardTemplateList" row-key="id">
			<el-table-column prop="title" label="名称" width="150" :show-overflow-tooltip="true" />
			<el-table-column prop="preferentialType" :formatter="formatPreferentialTypeTableColumn" label="类型" width="150" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatPreferentialContentTableColumn" label="优惠内容" width="200" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatRangeTypeTableColumn" label="可使用商品" width="150" :show-overflow-tooltip="true" />
			<el-table-column :formatter="formatDateTypeTableColumn" label="有效期" width="200" :show-overflow-tooltip="true" />
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
							v-permission="['system:admin:update']"
							type="text"
							size="mini"
							icon="el-icon-edit"
							@click="handleUpdateClick(scope.row)"
					>修改
					</el-button>
					<el-button
							v-if="scope.row.status === CouponTemplateStatusEnum.ENABLE"
							v-permission="['system:admin:update-status']"
							type="text"
							size="mini"
							icon="el-icon-video-pause"
							@click="handleStatusUpdateClick(scope.row, CouponTemplateStatusEnum.DISABLE)"
					>禁用
					</el-button>
					<el-button
							v-if="scope.row.status === CouponTemplateStatusEnum.DISABLE"
							v-permission="['system:admin:update-status']"
							type="text"
							size="mini"
							icon="el-icon-video-play"
							@click="handleStatusUpdateClick(scope.row, CouponTemplateStatusEnum.ENABLE)"
					>开启
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 错误码列表的分页 -->
		<pagination
				v-show="couponCardTemplateListTotal > 0"
				:total="couponCardTemplateListTotal"
				:page.sync="couponCardTemplateListQuery.pageNo"
				:limit.sync="couponCardTemplateListQuery.pageSize"
				@pagination="getCouponCardTemplateList"
		/>

		<!-- 错误码添加与修改表单 -->
		<el-dialog
				v-loading="userFormLoading"
				:title="userFormTitle"
				:visible.sync="userFormVisible"
				width="600px"
				append-to-body
				element-loading-text="提交中..."
				element-loading-spinner="el-icon-loading"
		>
			<el-form ref="userForm" :model="userForm" :rules="userFormRule" label-width="80px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="昵称" prop="nickname">
							<el-input v-model="userForm.nickname" placeholder="请输入分组" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="手机" prop="mobile">
							<el-input v-model="userForm.mobile" placeholder="请输入手机号" />
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
import { updateUserInfo } from '@/api/user/user'
import { pageCouponTemplate, updateCouponTemplateStatus } from '@/api/promotion/couponTemplate'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { CouponTemplateStatusEnum, PreferentialTypeEnum, CouponTemplateDateTypeEnum } from '@/utils/constants'

import { parseTime } from '@/utils/index'

export default {
	name: 'CouponTemplateCardList',
	components: { Pagination },
	data() {
		return {
			// 错误码列表
			couponCardTemplateList: [],
			// 错误码总数
			couponCardTemplateListTotal: 0,
			// 进度条
			couponCardTemplateListLoading: true,
			// 查询条件
			couponCardTemplateListQuery: {
				pageNo: 1,
				pageSize: 10,
				title: undefined
			},

			// 错误码添加与修改表单
			userForm: {},
			// 校验规则
			userFormRule: {
				nickname: [
					{ required: true, message: '分组不能为空', trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '手机不能为空', trigger: 'blur' }
				]
			},
			// 是否可见
			userFormVisible: false,
			// 标题
			userFormTitle: '',
			// 进度条
			userFormLoading: false,

			CouponTemplateStatusEnum: CouponTemplateStatusEnum,

			// 数据字典
			commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
		}
	},
	created() {
		this.getCouponCardTemplateList()
	},
	methods: {
		// 加载错误码列表
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
		// 修改弹窗
		handleUpdateClick(row) {
			this.userFormVisible = true
			this.userFormTitle = '修改错误码'
			// 重置表单
			this.resetForm('userForm')
			// 设置修改的表单
			this.userForm = row
		},
		// 表单提交
		handleFormSubmit() {
			this.$refs['userForm'].validate(valid => {
				if (!valid) {
					return
				}
				// 设置加载中，避免重复点击
				this.userFormLoading = true

				// 更新
				if (this.userForm.id) {
					updateUserInfo(this.userForm).then(() => {
						// 取消加载中
						this.userFormLoading = false
						// 提示成功
						this.messageSuccess('修改成功')
						// 关闭表单
						this.userFormVisible = false
						// 重新加载错误码列表
						this.getCouponCardTemplateList()
					}).catch(() => {
						// 取消加载中
						this.userFormLoading = false
					})
				}
			})
		},
		// 表单取消
		handleFormCancel() {
			this.userFormVisible = false
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
			// 加载错误码列表
			this.getCouponCardTemplateList()
		},
		// 搜索表单重置
		couponCardTemplateListQueryFormReset() {
			// 重置表单
			this.resetForm('couponCardTemplateListQueryForm')
			// 加载错误码列表
			this.getCouponCardTemplateList()
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
