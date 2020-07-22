<template>
  <div class="app-container">
    <!--搜索栏 -->
    <el-form ref="systemAccessLogListQueryForm" :model="systemAccessLogListQuery" :inline="true">
      <el-form-item label="应用名" prop="applicationName">
        <el-input v-model="systemAccessLogListQuery.applicationName" placeholder="请输入应用名" clearable size="small" style="width: 240px" />
      </el-form-item>
			<el-form-item label="用户类型" prop="userType">
				<el-select v-model="systemAccessLogListQuery.userType" placeholder="请选择用户类型" clearable>
					<el-option v-for="dict in userTypeDataDicts" :key="dict.value" :label="dict.displayName" :value="dict.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="用户编号" prop="userId">
				<el-input v-model="systemAccessLogListQuery.userId" placeholder="请输入用户编号" clearable size="small" style="width: 240px" />
			</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="systemAccessLogListQueryFormSubmit">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="systemAccessLogListQueryFormReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 系统访问日志列表 -->
    <el-table v-loading="systemAccessLogListLoading" :data="systemAccessLogList" row-key="id">
      <el-table-column prop="applicationName" label="应用名" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="uri" label="请求地址" width="500	" :show-overflow-tooltip="true" />
      <el-table-column prop="method" label="请求方法" width="80" :show-overflow-tooltip="true" />
      <el-table-column prop="errorCode" label="响应结果码" width="100" :show-overflow-tooltip="true" />
      <el-table-column prop="userId" label="用户编号" width="100" :show-overflow-tooltip="true" />
      <el-table-column prop="userType" :formatter="formatUserTypeTableColumn" label="用户类型" width="80" :show-overflow-tooltip="true" />
      <el-table-column label="请求时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="handleViewClick(scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 系统访问日志列表的分页 -->
    <pagination
      v-show="systemAccessLogListTotal > 0"
      :total="systemAccessLogListTotal"
      :page.sync="systemAccessLogListQuery.pageNo"
      :limit.sync="systemAccessLogListQuery.pageSize"
      @pagination="getSystemAccessLogList"
    />

		<!-- 系统访问日志查看表单 -->
		<el-dialog title="访问日志明细"
							 :visible.sync="systemAccessLogViewFormVisible"
							 width="600px"
							 append-to-body
		>
			<el-form ref="systemAccessLogViewForm" :model="systemAccessLogViewForm" label-width="100px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="应用名">{{ systemAccessLogViewForm.applicationName }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="链路编号">{{ systemAccessLogViewForm.traceId }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求地址">{{ systemAccessLogViewForm.uri }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求方法">{{ systemAccessLogViewForm.method }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求参数">{{ systemAccessLogViewForm.queryString }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="响应错误码">{{ systemAccessLogViewForm.errorCode }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="响应提示">{{ systemAccessLogViewForm.errorMessage }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="开始时间">{{ systemAccessLogViewForm.startTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="响应时长">{{ systemAccessLogViewForm.responseTime }} 毫秒</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户编号">{{ systemAccessLogViewForm.userId }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户类型">{{ this.formatUserTypeString(systemAccessLogViewForm.userType) }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户 IP">{{ systemAccessLogViewForm.ip }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户 UserAgent">{{ systemAccessLogViewForm.userAgent }}</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="systemAccessLogViewFormVisible = false">关 闭</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>
import { pageSystemAccessLog } from '@/api/systemlog/systemAccessLog'
import { getDataDicts, getDataDictName, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

export default {
  name: 'SystemAccessLogList',
  components: { Pagination },
  data() {
    return {
      // 系统访问日志列表
      systemAccessLogList: [],
      // 系统访问日志总数
      systemAccessLogListTotal: 0,
      // 进度条
      systemAccessLogListLoading: true,
      // 查询条件
      systemAccessLogListQuery: {
			  pageNo: 1,
        pageSize: 10,
        userId: undefined,
				userType: undefined,
				applicationName: undefined
      },

			// 系统访问日志查看表单
      systemAccessLogViewForm: {},
      // 是否可见
      systemAccessLogViewFormVisible: false,

      // 数据字典
      userTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.USER_TYPE)
    }
  },
  created() {
    this.getSystemAccessLogList()
  },
  methods: {
    // 加载系统访问日志列表
    getSystemAccessLogList() {
      this.systemAccessLogListLoading = true
      pageSystemAccessLog(this.systemAccessLogListQuery).then(response => {
        // 取消加载中
        this.systemAccessLogListLoading = false
        // 设置数据
        this.systemAccessLogList = response.data.list
        this.systemAccessLogListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.systemAccessLogListLoading = false
      })
    },
    // 搜索表单提交
    systemAccessLogListQueryFormSubmit() {
		  // 重置到第一页
      this.systemAccessLogListQuery.pageNo = 1
      // 加载系统访问日志列表
      this.getSystemAccessLogList()
    },
    // 搜索表单重置
    systemAccessLogListQueryFormReset() {
		  // 重置表单
      this.resetForm('systemAccessLogListQueryForm')
      // 加载系统访问日志列表
      this.getSystemAccessLogList()
    },
    handleViewClick(row) {
      // 设置可见
      this.systemAccessLogViewFormVisible = true
			// 设置数据
			this.systemAccessLogViewForm = row
		},
    // 列表渲染（用户类型列）
    formatUserTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.USER_TYPE, row.userType);
    },
    formatUserTypeString(userType) {
      return getDataDictName(DATA_DICT_ENUM_VALE.USER_TYPE, userType);
    }
  }
}

</script>

<style scoped>

</style>
