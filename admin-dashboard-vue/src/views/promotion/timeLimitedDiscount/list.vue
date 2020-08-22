<template>
	<div class="app-container">
		<!--搜索栏 -->
		<el-form ref="timeLimitedDiscountListQueryForm" :model="timeLimitedDiscountListQuery" :inline="true">
			<el-form-item label="标题" prop="title">
				<el-input v-model="timeLimitedDiscountListQuery.title" placeholder="请输入标题" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="timeLimitedDiscountListQueryFormSubmit">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="timeLimitedDiscountListQueryFormReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 工具栏 -->
		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button v-permission="['promotion:coupon-template:create-card']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
			</el-col>
		</el-row>

		<!-- 限时折扣活动列表 -->
		<el-tabs v-model="activeName" style="margin-top:15px;" type="border-card" @tab-click="handleTabClick">
			<el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
				<keep-alive>
					<el-table v-loading="timeLimitedDiscountListLoading" :data="timeLimitedDiscountList" row-key="id">
						<el-table-column prop="title" label="活动名称" width="150" :show-overflow-tooltip="true" />
						<el-table-column label="活动时间" align="center">
							<template slot-scope="scope">
								<span>
									{{ scope.row.startTime | parseTime('{y}-{m}-{d}') }}
									&nbsp;至&nbsp;
									{{ scope.row.endTime | parseTime('{y}-{m}-{d}') }}
								</span>
							</template>
						</el-table-column>
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
							</template>
						</el-table-column>
					</el-table>
				</keep-alive>
			</el-tab-pane>
		</el-tabs>


		<!-- 限时折扣活动列表的分页 -->
		<pagination
				v-show="timeLimitedDiscountListTotal > 0"
				:total="timeLimitedDiscountListTotal"
				:page.sync="timeLimitedDiscountListQuery.pageNo"
				:limit.sync="timeLimitedDiscountListQuery.pageSize"
				@pagination="getTimeLimitedDiscountList"
		/>

	</div>
</template>

<script>
import { pagePromotionActivity } from '@/api/promotion/promotionActivity'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { MeetTypeEnum, PreferentialTypeEnum, PromotionActivityTypeEnum, PromotionActivityStatusEnum } from '@/utils/constants'

export default {
	name: 'TimeLimitedDiscountList',
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

			// 限时折扣活动列表
			timeLimitedDiscountList: [],
			// 限时折扣活动总数
			timeLimitedDiscountListTotal: 0,
			// 进度条
			timeLimitedDiscountListLoading: true,
			// 查询条件
			timeLimitedDiscountListQuery: {
				pageNo: 1,
				pageSize: 10,
				title: undefined,
				statuses: undefined,
				activityType: PromotionActivityTypeEnum.TIME_LIMITED_DISCOUNT
			},

			// 枚举
      // MeetTypeEnum: MeetTypeEnum,

      // 数据字典
      // rangeTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.RANGE_TYPE),
		}
	},
	created() {
		this.getTimeLimitedDiscountList()
	},
	methods: {
	  // tab 选项点击
    handleTabClick() {
      // 设置查询 statuses 条件
			let statuses = []
			switch(this.activeName) {
				case "WAIT":
				  statuses.push(PromotionActivityStatusEnum.WAIT)
					break
				case "RUN":
          statuses.push(PromotionActivityStatusEnum.RUN)
          break
        case "END":
          statuses.push(PromotionActivityStatusEnum.END)
          break
        case "INVALID":
          statuses.push(PromotionActivityStatusEnum.INVALID)
          break
				default:
          statuses.push(PromotionActivityStatusEnum.WAIT, PromotionActivityStatusEnum.RUN,
            PromotionActivityStatusEnum.END, PromotionActivityStatusEnum.INVALID)
			}
			this.timeLimitedDiscountListQuery.statuses = statuses.join(',')
      this.getTimeLimitedDiscountList()
		},
		// 加载限时折扣活动列表
		getTimeLimitedDiscountList() {
			this.timeLimitedDiscountListLoading = true
			pagePromotionActivity(this.timeLimitedDiscountListQuery).then(response => {
				// 取消加载中
				this.timeLimitedDiscountListLoading = false
				// 设置数据
				this.timeLimitedDiscountList = response.data.list
				this.timeLimitedDiscountListTotal = response.data.total
			}).catch(() => {
				// 取消加载中
				this.timeLimitedDiscountListLoading = false
			})
		},
    // 添加弹窗
    handleAddClick(row) {
      alert('正在开发中')
    },
		// 修改弹窗
		handleUpdateClick(row) {
      alert('正在开发中')
    },
		// 搜索表单提交
		timeLimitedDiscountListQueryFormSubmit() {
			// 重置到第一页
			this.timeLimitedDiscountListQuery.pageNo = 1
			// 加载限时折扣活动列表
			this.getTimeLimitedDiscountList()
		},
		// 搜索表单重置
		timeLimitedDiscountListQueryFormReset() {
			// 重置表单
			this.resetForm('timeLimitedDiscountListQueryForm')
			// 加载限时折扣活动列表
			this.getTimeLimitedDiscountList()
		},
	}
}

</script>

<style scoped>

</style>
