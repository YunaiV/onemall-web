<template>
  <div class="app-container">
    <!--搜索栏 -->
    <el-form ref="errorCodeListQueryForm" :model="errorCodeListQuery" :inline="true">
      <el-form-item label="分组" prop="name">
        <el-input v-model="errorCodeListQuery.group" placeholder="请输入分组" clearable size="small" style="width: 240px" />
      </el-form-item>
			<el-form-item label="错误码" prop="code">
				<el-input v-model="errorCodeListQuery.code" placeholder="请输入错误码" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item label="错误提示" prop="message">
				<el-input v-model="errorCodeListQuery.message" placeholder="请输入错误提示" clearable size="small" style="width: 240px" />
			</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="errorCodeListQueryFormSubmit">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="errorCodeListQueryFormReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['system:error-code:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 错误码列表 -->
    <el-table v-loading="errorCodeListLoading" :data="errorCodeList" row-key="id">
      <el-table-column prop="group" label="分组" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="code" label="错误码" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="message" label="错误提示" width="400" :show-overflow-tooltip="true" />
      <el-table-column prop="type" :formatter="formatTypeTableColumn" label="类型" width="100" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
						v-permission="['system:role:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdateClick(scope.row)"
          >修改</el-button>
          <el-button
						v-permission="['system:role:delete']"
            type="text"
            size="mini"
            icon="el-icon-delete"
            @click="handleDeleteClick(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 错误码列表的分页 -->
    <pagination
      v-show="errorCodeListTotal > 0"
      :total="errorCodeListTotal"
      :page.sync="errorCodeListQuery.pageNo"
      :limit.sync="errorCodeListQuery.pageSize"
      @pagination="getErrorCodeList"
    />

    <!-- 错误码添加与修改表单 -->
    <el-dialog
      v-loading="errorCodeFormLoading"
      :title="errorCodeFormTitle"
      :visible.sync="errorCodeFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="errorCodeForm" :model="errorCodeForm" :rules="errorCodeFormRule" label-width="80px">
        <el-row>
					<el-col :span="24">
						<el-form-item label="分组" prop="name">
							<el-input v-model="errorCodeForm.group" placeholder="请输入分组" />
						</el-form-item>
					</el-col>
          <el-col :span="24">
            <el-form-item label="错误码" prop="name">
              <el-input v-model="errorCodeForm.code" placeholder="请输入错误码" />
            </el-form-item>
          </el-col>
					<el-col :span="24">
						<el-form-item label="错误提示" prop="name">
							<el-input v-model="errorCodeForm.message" placeholder="请输入错误码" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="memo">
							<el-input v-model="errorCodeForm.memo" placeholder="请输入备注" />
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
import { pageErrorCode, createErrorCode, updateErrorCode, deleteErrorCode } from '@/api/errorCode/errorCode'
import { getDataDictName, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { ErrorCodeTypeEnum } from '@/utils/constants'

export default {
  name: 'ErrorCodeList',
  components: { Pagination },
  data() {
    return {
      // 错误码列表
      errorCodeList: [],
      // 错误码总数
      errorCodeListTotal: 0,
      // 进度条
      errorCodeListLoading: true,
      // 查询条件
      errorCodeListQuery: {
			  pageNo: 1,
        pageSize: 10,
        name: undefined,
        code: undefined,
				message: undefined
      },

      // 错误码添加与修改表单
      errorCodeForm: {},
      // 校验规则
      errorCodeFormRule: {
        group: [
          { required: true, message: '分组不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '错误码不能为空', trigger: 'blur' }
        ],
        message: [
          { required: true, message: '错误提示不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      errorCodeFormVisible: false,
      // 标题
      errorCodeFormTitle: '',
      // 进度条
      errorCodeFormLoading: false,

      ErrorCodeTypeEnum: ErrorCodeTypeEnum
    }
  },
  created() {
    this.getErrorCodeList()
  },
  methods: {
    // 加载错误码列表
    getErrorCodeList() {
      this.errorCodeListLoading = true
      pageErrorCode(this.errorCodeListQuery).then(response => {
        // 取消加载中
        this.errorCodeListLoading = false
        // 设置数据
        this.errorCodeList = response.data.list
        this.errorCodeListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.errorCodeListLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.errorCodeFormVisible = true
      this.errorCodeFormTitle = '添加错误码'
      // 重置表单
      this.resetForm('errorCodeForm')
			this.errorCodeForm = {}
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.errorCodeFormVisible = true
      this.errorCodeFormTitle = '修改错误码'
      // 重置表单
      this.resetForm('errorCodeForm')
      // 设置修改的表单
      this.errorCodeForm = row
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['errorCodeForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.errorCodeFormLoading = true

        // 更新
        if (this.errorCodeForm.id) {
          updateErrorCode(this.errorCodeForm).then(() => {
            // 取消加载中
            this.errorCodeFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.errorCodeFormVisible = false
            // 重新加载错误码列表
            this.getErrorCodeList()
          }).catch(() => {
            // 取消加载中
            this.errorCodeFormLoading = false
          })
          // 新增
        } else {
          createErrorCode(this.errorCodeForm).then(() => {
            // 取消加载中
            this.errorCodeFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.errorCodeFormVisible = false
            // 重新加载错误码树
            this.getErrorCodeList()
          }).catch(() => {
            // 取消加载中
            this.errorCodeFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.errorCodeFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的错误码?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteErrorCode(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载错误码列表
          this.getErrorCodeList()
        })
      })
    },
    // 搜索表单提交
    errorCodeListQueryFormSubmit() {
		  // 重置到第一页
      this.errorCodeListQuery.pageNo = 1
      // 加载错误码列表
      this.getErrorCodeList()
    },
    // 搜索表单重置
    errorCodeListQueryFormReset() {
		  // 重置表单
      this.resetForm('errorCodeListQueryForm')
      // 加载错误码列表
      this.getErrorCodeList()
    },
    // 列表渲染（类型列）
    formatTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.ERROR_CODE_TYPE, row.type)
    }
  }
}

</script>

<style scoped>

</style>
