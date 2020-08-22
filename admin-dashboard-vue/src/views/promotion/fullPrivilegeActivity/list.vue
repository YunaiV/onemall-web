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
		<el-tabs v-model="activeName" style="margin-top:15px;" type="border-card" @tab-click="handleTabClick">
			<el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
				<keep-alive>
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
				</keep-alive>
			</el-tab-pane>
		</el-tabs>


		<!-- 优惠劵模板列表的分页 -->
		<pagination
				v-show="couponCardTemplateListTotal > 0"
				:total="couponCardTemplateListTotal"
				:page.sync="couponCardTemplateListQuery.pageNo"
				:limit.sync="couponCardTemplateListQuery.pageSize"
				@pagination="getCouponCardTemplateList"
		/>

	</div>
</template>

<script>
import { pageCouponTemplate, updateCouponTemplateStatus, createCouponCardTemplate, updateCouponCardTemplate } from '@/api/promotion/couponTemplate'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'
import { treeProductCategory } from '@/api/product/productCategory'

import Pagination from '@/components/Pagination'

import { RangeTypeEnum, CouponTemplateStatusEnum, PreferentialTypeEnum, CouponTemplateDateTypeEnum, CouponTemplateTypeEnum } from '@/utils/constants'

import { parseTime } from '@/utils/index'

export default {
	name: 'FullPrivilegeActivityList',
	components: { Pagination },
	data() {
		return {
		  // Tab 选项
      tabMapOptions: [
        { label: '所有活动', key: 'ALL' },
        { label: '未开始', key: 'WAIT' },
        { label: '进行中', key: 'RUN' },
        { label: '已结束', key: 'END' },
        { label: '已撤销', key: 'INVALID' }
      ],
      activeName: 'ALL',

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
	  // tab 选项点击
    handleTabClick() {
      this.getCouponCardTemplateList()
		},
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

    },
		// 修改弹窗
		handleUpdateClick(row) {

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
