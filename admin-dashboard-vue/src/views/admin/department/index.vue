<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
					<el-button v-permission="['system:department:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 部门树 -->
    <el-table v-loading="departmentTreeLoading" :data="departmentTree" row-key="id">
      <el-table-column prop="name" label="名称" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="sort" label="排序" width="50" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
						v-permission="['system:department:create']"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click="handleAddClick(scope.row)"
          >新增</el-button>
          <el-button v-permission="['system:department:update']" type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
          <el-button v-permission="['system:department:delete']" type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 部门添加与修改表单 -->
    <el-dialog
      v-loading="departmentFormLoading"
      :title="departmentFormTitle"
      :visible.sync="departmentFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="departmentForm" :model="departmentForm" :rules="departmentFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级部门" prop="pid">
              <treeselect v-model="departmentForm.pid" :options="departmentFormDepartmentTreeSelect" :show-count="true" placeholder="选择父部门" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="departmentForm.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="departmentForm.sort" controls-position="right" />
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
import { treeDepartment, createDepartment, updateDepartment, deleteDepartment } from '@/api/admin/department'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'DepartmentList',
  components: { Treeselect },
  data() {
    return {
      // 部门树
      departmentTree: [],
      // 进度条
      departmentTreeLoading: true,

      // 部门添加与修改表单
      departmentForm: {},
      // 校验规则
      departmentFormRule: {
        pid: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      departmentFormVisible: false,
      // 标题
      departmentFormTitle: '',
      // 部门树 TreeSelect 的数据
      departmentFormDepartmentTreeSelect: [],
      departmentFormLoading: false
    }
  },
  created() {
    this.getDepartmentTree()
  },
  methods: {
    // 加载部门树
    getDepartmentTree() {
      this.departmentTreeLoading = true
      treeDepartment().then(response => {
        // 取消加载中
        this.departmentTreeLoading = false
        // 设置数据
        this.departmentTree = response.data
        this.departmentFormDepartmentTreeSelect = [{
          id: 0,
          label: '根节点'
        }, ...this.generateDepartmentFormDepartmentTreeSelect(this.departmentTree)]
      }).catch(() => {
        // 取消加载中
        this.departmentTreeLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.departmentFormVisible = true
      this.departmentFormTitle = '添加部门'
      // 重置表单
      this.resetForm('departmentForm')
      // 设置 pid，如果有传递的话
      if (row) {
        this.departmentForm.pid = row.id
      }
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.departmentFormVisible = true
      this.departmentFormTitle = '修改部门'
      // 重置表单
      this.resetForm('departmentForm')
      // 设置修改的表单
      this.departmentForm = {
        ...row,
        children: undefined // TODO 芋艿：有什么办法剔除非表单的字段
      }
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['departmentForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.departmentFormLoading = true

        // 更新
        if (this.departmentForm.id) {
          updateDepartment(this.departmentForm).then(response => {
            // 取消加载中
            this.departmentFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.departmentFormVisible = false
            // 重新加载部门树
            this.getDepartmentTree()
          }).catch(() => {
            // 取消加载中
            this.departmentFormLoading = false
          })
          // 新增
        } else {
          createDepartment(this.departmentForm).then(response => {
            // 取消加载中
            this.departmentFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.departmentFormVisible = false
            // 重新加载部门树
            this.getDepartmentTree()
          }).catch(() => {
            // 取消加载中
            this.departmentFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.departmentFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的部门?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteDepartment(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载部门树
          this.getDepartmentTree()
        })
      })
    },
    // 构建 departmentFormDepartmentTreeSelect 的数据
    generateDepartmentFormDepartmentTreeSelect(tree) {
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
          const children = this.generateDepartmentFormDepartmentTreeSelect(node.children)
          if (children && children.length > 0) {
            tmp.children = children
          }
        }
      })
      return res
    }
  }
}
</script>
