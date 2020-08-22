<template>
  <div class="app-container">
    <!--搜索栏 -->
    <el-form ref="userListQueryForm" :model="userListQuery" :inline="true">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="userListQuery.nickname" placeholder="请输入昵称" clearable size="small" style="width: 240px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="userListQuery.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in commonStatusDataDicts" :key="dict.value" :label="dict.displayName" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="userListQueryFormSubmit">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="userListQueryFormReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->

    <!-- 错误码列表 -->
    <el-table v-loading="userListLoading" :data="userList" row-key="id">
      <el-table-column prop="nickname" label="昵称" width="150" :show-overflow-tooltip="true" />
      <el-table-column prop="mobile" label="手机" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="会员卡" width="100" :show-overflow-tooltip="true" />
      <el-table-column label="累积交易次数" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="累计交易额" width="100" :show-overflow-tooltip="true" />
      <el-table-column label="积分" width="100" :show-overflow-tooltip="true" />
      <el-table-column label="会员标签" width="100" :show-overflow-tooltip="true" />
      <el-table-column label="备注" width="100" :show-overflow-tooltip="true" />
      <el-table-column prop="type" :formatter="formatStatusTableColumn" label="状态" width="100" />
      <el-table-column label="注册时间" align="center">
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
            v-if="scope.row.status === CommonStatusEnum.ENABLE"
            v-permission="['system:admin:update-status']"
            type="text"
            size="mini"
            icon="el-icon-video-pause"
            @click="handleStatusUpdateClick(scope.row, CommonStatusEnum.DISABLE)"
          >禁用
          </el-button>
          <el-button
            v-if="scope.row.status === CommonStatusEnum.DISABLE"
            v-permission="['system:admin:update-status']"
            type="text"
            size="mini"
            icon="el-icon-video-play"
            @click="handleStatusUpdateClick(scope.row, CommonStatusEnum.ENABLE)"
          >开启
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 错误码列表的分页 -->
    <pagination
      v-show="userListTotal > 0"
      :total="userListTotal"
      :page.sync="userListQuery.pageNo"
      :limit.sync="userListQuery.pageSize"
      @pagination="getUserList"
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
import { pageUser, updateUserInfo, updateUserStatus } from '@/api/user/user'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      // 错误码列表
      userList: [],
      // 错误码总数
      userListTotal: 0,
      // 进度条
      userListLoading: true,
      // 查询条件
      userListQuery: {
			  pageNo: 1,
        pageSize: 10,
        nickname: undefined,
        status: undefined
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

      CommonStatusEnum: CommonStatusEnum,

      // 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 加载错误码列表
    getUserList() {
      this.userListLoading = true
      pageUser(this.userListQuery).then(response => {
        // 取消加载中
        this.userListLoading = false
        // 设置数据
        this.userList = response.data.list
        this.userListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.userListLoading = false
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
            this.getUserList()
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
      const statusText = status === CommonStatusEnum.ENABLE ? '开启' : '禁用'
      this.$confirm('确认' + statusText + '名字为"' + row.nickname + '"的会员?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        updateUserStatus(row.id, status).then(response => {
          // 提示成功
          this.messageSuccess(statusText + '成功')
          // 重新加载管理员列表
          this.getUserList()
        })
      })
    },
    // 搜索表单提交
    userListQueryFormSubmit() {
		  // 重置到第一页
      this.userListQuery.pageNo = 1
      // 加载错误码列表
      this.getUserList()
    },
    // 搜索表单重置
    userListQueryFormReset() {
		  // 重置表单
      this.resetForm('userListQueryForm')
      // 加载错误码列表
      this.getUserList()
    },
    // 列表渲染（类型列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.type)
    }
  }
}

</script>

<style scoped>

</style>
