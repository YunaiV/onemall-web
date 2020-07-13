<template>
  <div class="app-container">
    <!--搜索栏 -->
    <el-form ref="roleListQueryForm" :model="roleListQuery" :inline="true">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="roleListQuery.name" placeholder="请输入角色名称" clearable size="small" style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="roleListQueryFormSubmit">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="roleListQueryFormReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 角色列表 -->
    <el-table v-loading="roleListLoading" :data="roleList" row-key="id">
      <el-table-column prop="name" label="名称" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="code" label="编码" width="200" :show-overflow-tooltip="true" />
      <!-- TODO 芋艿：接入数据字典 -->
      <el-table-column prop="type" label="类型" width="50" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.type === RoleTypeEnum.CUSTOM"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdateClick(scope.row)"
          >修改</el-button>
          <el-button type="text" size="mini" icon="el-icon-circle-check" @click="handleAssignRoleResourceClick(scope.row)">分配权限</el-button>
          <el-button
            v-if="scope.row.type === RoleTypeEnum.CUSTOM"
            type="text"
            size="mini"
            icon="el-icon-delete"
            @click="handleDeleteClick(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 角色列表的分页 -->
    <pagination
      v-show="roleListTotal > 0"
      :total="roleListTotal"
      :page.sync="roleListQuery.pageNo"
      :limit.sync="roleListQuery.pageSize"
      @pagination="getRoleList"
    />

    <!-- 角色添加与修改表单 -->
    <el-dialog
      v-loading="roleFormLoading"
      :title="roleFormTitle"
      :visible.sync="roleFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="roleForm" :model="roleForm" :rules="roleFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="roleForm.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="编码" prop="code">
              <el-input v-model="roleForm.code" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleFormSubmit">确 定</el-button>
        <el-button @click="handleFormCancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 角色授权表单 -->
    <el-dialog
      v-loading="assignRoleResourceFormLoading"
      title="分配权限"
      :visible.sync="assignRoleResourceFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="assignRoleResourceForm" :model="assignRoleResourceForm" :rules="assignRoleResourceFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="权限">
              <el-tree
                ref="assignRoleResourceFormResourceTree"
                :data="assignRoleResourceFormResourceTree"
                show-checkbox
                node-key="id"
                empty-text="加载权限中..."
                :props="assignRoleResourceFormResourceTreeProps"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleAssignRoleResourceFormSubmit">确 定</el-button>
        <el-button @click="handleAssignRoleResourceFormCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageRole, createRole, updateRole, deleteRole } from '@/api/permission/role'
import { treeResource } from '@/api/permission/resource'
import { listRoleResources, assignRoleResource } from '@/api/permission/permission'

import Pagination from '@/components/Pagination'

import { RoleTypeEnum } from '@/utils/constants'

export default {
  name: 'RoleList',
  components: { Pagination },
  data() {
    return {
      // 角色列表
      roleList: [],
      // 角色总数
      roleListTotal: 0,
      // 进度条
      roleListLoading: true,
      // 查询条件
      roleListQuery: {
			  pageNo: 1,
        pageSize: 10,
        name: undefined
      },

      // 角色添加与修改表单
      roleForm: {},
      // 校验规则
      roleFormRule: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      roleFormVisible: false,
      // 标题
      roleFormTitle: '',
      // 进度条
      roleFormLoading: false,

      // 角色添加与修改表单
      assignRoleResourceForm: {},
      // 校验规则
      assignRoleResourceFormRule: {},
      // 是否可见
      assignRoleResourceFormVisible: false,
      // 进度条
      assignRoleResourceFormLoading: false,
      // 资源树的数据
      assignRoleResourceFormResourceTree: [],
      // 资源树的属性
      assignRoleResourceFormResourceTreeProps: {
			  'label': 'name',
        'children': 'children'
      },

      RoleTypeEnum: RoleTypeEnum
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 加载角色列表
    getRoleList() {
      this.roleListLoading = true
      pageRole(this.roleListQuery).then(response => {
        // 取消加载中
        this.roleListLoading = false
        // 设置数据
        this.roleList = response.data.list
        this.roleListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.roleListLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.roleFormVisible = true
      this.roleFormTitle = '添加角色'
      // 重置表单
      this.resetForm('roleForm')
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.roleFormVisible = true
      this.roleFormTitle = '修改角色'
      // 重置表单
      this.resetForm('roleForm')
      // 设置修改的表单
      this.roleForm = {
        ...row,
        children: undefined // TODO 芋艿：有什么办法剔除非表单的字段
      }
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['roleForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.roleFormLoading = true

        // 更新
        if (this.roleForm.id) {
          updateRole(this.roleForm).then(() => {
            // 取消加载中
            this.roleFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.roleFormVisible = false
            // 重新加载角色列表
            this.getRoleList()
          }).catch(() => {
            // 取消加载中
            this.roleFormLoading = false
          })
          // 新增
        } else {
          createRole(this.roleForm).then(() => {
            // 取消加载中
            this.roleFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.roleFormVisible = false
            // 重新加载角色树
            this.getRoleList()
          }).catch(() => {
            // 取消加载中
            this.roleFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.roleFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的角色?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteRole(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载角色列表
          this.getRoleList()
        })
      })
    },
    // 搜索表单提交
    roleListQueryFormSubmit() {
		  // 重置到第一页
      this.roleListQuery.pageNo = 1
      // 加载角色列表
      this.getRoleList()
    },
    // 搜索表单重置
    roleListQueryFormReset() {
		  // 重置表单
      this.resetForm('roleListQueryForm')
      // 加载角色列表
      this.getRoleList()
    },
    // 分配权限弹窗
    handleAssignRoleResourceClick(row) {
      this.assignRoleResourceFormVisible = true
      // 重置表单
      this.resetForm('assignRoleResourceForm')
      // 设置表单
      this.assignRoleResourceForm.roleId = row.id
      // 获得资源树
      treeResource().then(response => {
        this.assignRoleResourceFormResourceTree = response.data
      })
      // 设置资源树的选中
      listRoleResources(row.id).then(response => {
        this.$refs.assignRoleResourceFormResourceTree.setCheckedKeys(response.data)
      })
    },
    // 表单提交
    handleAssignRoleResourceFormSubmit() {
      this.$refs['assignRoleResourceForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.assignRoleResourceFormLoading = true

        // 更新
        assignRoleResource({
          ...this.assignRoleResourceForm,
          resourceIds: this.$refs.assignRoleResourceFormResourceTree.getCheckedKeys().join(',')
        }).then(response => {
          // 取消加载中
          this.assignRoleResourceFormLoading = false
          // 提示成功
          this.messageSuccess('分配成功')
          // 关闭表单
          this.assignRoleResourceFormVisible = false
          // 重新加载角色列表
          this.getRoleList()
        }).catch(() => {
          // 取消加载中
          this.assignRoleResourceFormLoading = false
        })
      })
    },
    // 表单取消
    handleAssignRoleResourceFormCancel() {
      this.assignRoleResourceFormVisible = false
    }
  }
}

</script>

<style scoped>

</style>
