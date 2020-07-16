<template>
  <div class="app-container">
    <!--搜索栏 -->
    <el-form ref="systemExceptionLogListQueryForm" :model="systemExceptionLogListQuery" :inline="true">
      <el-form-item label="应用名" prop="applicationName">
        <el-input v-model="systemExceptionLogListQuery.applicationName" placeholder="请输入应用名" clearable size="small" style="width: 240px" />
      </el-form-item>
			<el-form-item label="用户类型" prop="userType">
				<el-select v-model="systemExceptionLogListQuery.userType" placeholder="请选择用户类型">
					<el-option v-for="dict in userTypeDataDicts" :key="dict.value" :label="dict.displayName" :value="dict.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="用户编号" prop="userId">
				<el-input v-model="systemExceptionLogListQuery.userId" placeholder="请输入用户编号" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item label="处理状态" prop="processStatus">
				<el-select v-model="systemExceptionLogListQuery.processStatus" placeholder="请选择处理状态">
					<el-option v-for="dict in processStatusDataDicts" :key="dict.value" :label="dict.displayName" :value="dict.value" />
				</el-select>
			</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="systemExceptionLogListQueryFormSubmit">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="systemExceptionLogListQueryFormReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 系统异常日志列表 -->
    <el-table v-loading="systemExceptionLogListLoading" :data="systemExceptionLogList" row-key="id">
      <el-table-column prop="applicationName" label="应用名" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="uri" label="请求地址" width="500	" :show-overflow-tooltip="true" />
      <el-table-column prop="method" label="请求方法" width="80" :show-overflow-tooltip="true" />
      <el-table-column prop="exceptionName" label="异常名" width="300" :show-overflow-tooltip="true" />
      <el-table-column prop="userId" label="用户编号" width="100" :show-overflow-tooltip="true" />
      <el-table-column prop="userType" :formatter="formatUserTypeTableColumn" label="用户类型" width="80" :show-overflow-tooltip="true" />
      <el-table-column label="异常时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.exceptionTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
			<el-table-column prop="processStatus" :formatter="formatProcessStatusTableColumn" label="处理状态" width="80" :show-overflow-tooltip="true" />
			<el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="handleViewClick(scope.row)"
          >查看</el-button>
					<el-button v-permission="['system:system-exception-log:process']" v-if="scope.row.processStatus === SystemExceptionLogProcessStatusEnum.INIT"
										 type="text" size="mini" icon="el-icon-check" @click="handleProcessClick(scope.row, SystemExceptionLogProcessStatusEnum.DONE)">已处理</el-button>
					<el-button v-permission="['system:system-exception-log:process']" v-if="scope.row.processStatus === SystemExceptionLogProcessStatusEnum.INIT"
										 type="text" size="mini" icon="el-icon-close" @click="handleProcessClick(scope.row, SystemExceptionLogProcessStatusEnum.IGNORE)">已忽略</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 系统异常日志列表的分页 -->
    <pagination
      v-show="systemExceptionLogListTotal > 0"
      :total="systemExceptionLogListTotal"
      :page.sync="systemExceptionLogListQuery.pageNo"
      :limit.sync="systemExceptionLogListQuery.pageSize"
      @pagination="getSystemExceptionLogList"
    />

		<!-- 系统异常日志查看表单 -->
		<el-dialog title="异常日志明细"
							 :visible.sync="systemExceptionLogViewFormVisible"
							 width="1280px"
							 append-to-body
		>
			<el-form ref="systemExceptionLogViewForm" :model="systemExceptionLogViewForm" label-width="120px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="应用名">{{ systemExceptionLogViewForm.applicationName }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="链路编号">{{ systemExceptionLogViewForm.traceId }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求地址">{{ systemExceptionLogViewForm.uri }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求方法">{{ systemExceptionLogViewForm.method }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求参数">{{ systemExceptionLogViewForm.queryString }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="异常名">{{ systemExceptionLogViewForm.exceptionName }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="异常堆栈"><pre v-html="systemExceptionLogViewForm.exceptionStackTrace"/> </el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="异常时间">{{ systemExceptionLogViewForm.exceptionTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户编号">{{ systemExceptionLogViewForm.userId }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户类型">{{ this.formatUserTypeString(systemExceptionLogViewForm.userType) }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户 IP">{{ systemExceptionLogViewForm.ip }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="用户 UserAgent">{{ systemExceptionLogViewForm.userAgent }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="处理状态">{{ this.formatProcessStatusString(systemExceptionLogViewForm.processStatus) }}</el-form-item>
					</el-col>
					<el-col v-if="systemExceptionLogViewForm.processStatus && systemExceptionLogViewForm.processStatus !== SystemExceptionLogProcessStatusEnum.INIT" :span="24">
						<el-form-item label="处理人">{{ systemExceptionLogViewForm.processAdmin.name }}</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="systemExceptionLogViewFormVisible = false">关 闭</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>
import { pageSystemExceptionLog, getSystemExceptionLog, processSystemExceptionLog } from '@/api/systemlog/systemExceptionLog'
import { getDataDicts, getDataDictName, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { SystemExceptionLogProcessStatusEnum } from '@/utils/constants'

export default {
  name: 'SystemExceptionLogList',
  components: { Pagination },
  data() {
    return {
      // 系统异常日志列表
      systemExceptionLogList: [],
      // 系统异常日志总数
      systemExceptionLogListTotal: 0,
      // 进度条
      systemExceptionLogListLoading: true,
      // 查询条件
      systemExceptionLogListQuery: {
			  pageNo: 1,
        pageSize: 10,
        userId: undefined,
				userType: undefined,
				applicationName: undefined,
				processStatus: undefined
      },

			// 系统异常日志查看表单
      systemExceptionLogViewForm: {},
      // 是否可见
      systemExceptionLogViewFormVisible: false,
			// 进度条
      systemExceptionLogViewFormLoading: false,

			// 枚举
      SystemExceptionLogProcessStatusEnum: SystemExceptionLogProcessStatusEnum,

      // 数据字典
      userTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.USER_TYPE),
      processStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.SYSTEM_EXCEPTION_LOG_PROCESS_STATUS)
    }
  },
  created() {
    this.getSystemExceptionLogList()
  },
  methods: {
    // 加载系统异常日志列表
    getSystemExceptionLogList() {
      this.systemExceptionLogListLoading = true
      pageSystemExceptionLog(this.systemExceptionLogListQuery).then(response => {
        // 取消加载中
        this.systemExceptionLogListLoading = false
        // 设置数据
        this.systemExceptionLogList = response.data.list
        this.systemExceptionLogListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.systemExceptionLogListLoading = false
      })
    },
    // 搜索表单提交
    systemExceptionLogListQueryFormSubmit() {
		  // 重置到第一页
      this.systemExceptionLogListQuery.pageNo = 1
      // 加载系统异常日志列表
      this.getSystemExceptionLogList()
    },
    // 搜索表单重置
    systemExceptionLogListQueryFormReset() {
		  // 重置表单
      this.resetForm('systemExceptionLogListQueryForm')
      // 加载系统异常日志列表
      this.getSystemExceptionLogList()
    },
		// 处理查看点击
    handleViewClick(row) {
      // 设置加载中，避免重复点击
      this.systemExceptionLogViewFormLoading = true
      // 设置可见
      this.systemExceptionLogViewFormVisible = true
			// 加载数据
      getSystemExceptionLog(row.id).then(response => {
        // 取消加载中
        this.systemExceptionLogViewFormLoading = false
        // 设置数据
        this.systemExceptionLogViewForm = response.data
			}).catch(() => {
			  // 取消加载中
        this.systemExceptionLogViewFormLoading = false
			})
		},
		// 处理【已处理】或者【已忽略】的点击
		handleProcessClick(row, processStatus) {
      const processStatusText = getDataDictName(DATA_DICT_ENUM_VALE.SYSTEM_EXCEPTION_LOG_PROCESS_STATUS, processStatus)
      this.$confirm('确认标记为' + processStatusText, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        processSystemExceptionLog(row.id, processStatus).then(() => {
          // 提示成功
          this.messageSuccess(processStatusText + '成功')
          // 重新加载系统异常日志列表
          this.getSystemExceptionLogList()
        })
      })
		},
    // 列表渲染（用户类型列）
    formatUserTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.USER_TYPE, row.userType);
    },
    // 列表渲染（处理状态型列）
    formatProcessStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.SYSTEM_EXCEPTION_LOG_PROCESS_STATUS, row.processStatus);
    },
    formatUserTypeString(userType) {
      return getDataDictName(DATA_DICT_ENUM_VALE.USER_TYPE, userType);
    },
    formatProcessStatusString(processStatus) {
      return getDataDictName(DATA_DICT_ENUM_VALE.SYSTEM_EXCEPTION_LOG_PROCESS_STATUS, processStatus);
    },
  }
}

</script>

<style scoped>

</style>
