<template>
	<div class="app-container">
		<el-form :inline="true">
			<el-form-item>
				<el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
			</el-form-item>
		</el-form>

		<!-- 资源树 -->
		<el-table v-loading="resourceTreeLoading" :data="resourceTree" row-key="id">
			<el-table-column prop="name" label="名称" width="200" :show-overflow-tooltip="true"/>
			<el-table-column label="图标" align="center" width="100">
				<template slot-scope="scope">
					<svg-icon :icon-class="scope.row.icon"/>
				</template>
			</el-table-column>
			<!-- TODO 芋艿：接入数据字典 -->
			<el-table-column prop="type" label="类型"width="50"/>
			<el-table-column prop="sort" label="排序" width="50" />
			<el-table-column prop="route" label="前端路由" width="100" :show-overflow-tooltip="true"/>
			<el-table-column prop="view" label="前端组件" width="200" :show-overflow-tooltip="true"/>
			<el-table-column prop="permission" label="权限标识" width="200" :show-overflow-tooltip="true"/>
			<el-table-column label="创建时间" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="text" size="mini" icon="el-icon-plus" @click="handleAddClick(scope.row)"
										 v-if="scope.row.type === ResourceTypeEnum.MENU">新增</el-button>
					<el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
					<el-button type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!-- 资源添加与修改表单 -->
		<el-dialog :title="resourceFormTitle" :visible.sync="resourceFormVisible" width="600px" append-to-body
							 v-loading="resourceFormLoading" element-loading-text="提交中..." element-loading-spinner="el-icon-loading">
			<el-form ref="resourceForm" :model="resourceForm" :rules="resourceFormRule" label-width="80px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="上级权限" prop="pid">
							<treeselect v-model="resourceForm.pid" :options="resourceFormResourceTreeSelect" :show-count="true" placeholder="选择父权限" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="类型" prop="type">
							<el-radio-group v-model="resourceForm.type">
								<!-- TODO 芋艿：数据字典  -->
								<el-radio :label="1">菜单</el-radio>
								<el-radio :label="2">按钮</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="名称" prop="name">
							<el-input v-model="resourceForm.name" placeholder="请输入名称" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="排序" prop="sort">
							<el-input-number v-model="resourceForm.sort" controls-position="right" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="权限标识" prop="permission">
							<el-input v-model="resourceForm.permission" placeholder="请权限标识" maxlength="255" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="菜单图标" prop="icon" v-if="resourceForm.type === ResourceTypeEnum.MENU">
							<el-input v-model="resourceForm.icon" placeholder="请输入图标" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="前端路由" prop="route" v-if="resourceForm.type === ResourceTypeEnum.MENU">
							<el-input v-model="resourceForm.route" placeholder="请输入前端路由" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="前端组件" prop="view"v-if="resourceForm.type === ResourceTypeEnum.MENU">
							<el-input v-model="resourceForm.view" placeholder="请输入组件路径" />
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
import { treeResource, createResource, updateResource, deleteResource } from '@/api/permission/resource'

import { ResourceTypeEnum } from '@/utils/constants'

import Treeselect from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
  name: 'ResourceList',
  components: { Treeselect },
  data() {
    return {
      // 资源树
			resourceTree: [],
			// 进度条
			resourceTreeLoading: true,

			// 资源添加与修改表单
			resourceForm: {},
			// 校验规则
      resourceFormRule: {
        type: [
          { required: true, message: "类型不能为空", trigger: "change" }
        ],
        pid: [
          { required: true, message: "上级权限不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        sort: [
          { required: true, message: "排序不能为空", trigger: "blur" }
        ],
        route: [
          { required: true, message: "前端路由不能为空", trigger: "blur" }
        ],
			},
			// 是否可见
      resourceFormVisible: false,
			// 标题
      resourceFormTitle: '',
			// 资源树 TreeSelect 的数据
      resourceFormResourceTreeSelect: [],
      resourceFormLoading: false,

			// 枚举
      ResourceTypeEnum: ResourceTypeEnum
    }
  },
  created() {
    this.getResourceTree()
  },
  methods: {
    // 加载资源树
    getResourceTree() {
      this.resourceTreeLoading = true
      treeResource().then(response => {
        this.resourceTree = response.data
        this.resourceTreeLoading = false
        this.resourceFormResourceTreeSelect = [{
          id: 0,
          label: '根节点'
				}, ...this.generateResourceFormResourceTreeSelect(this.resourceTree)]
      })
    },
		// 添加弹窗
    handleAddClick(row) {
      this.resourceFormVisible = true
      this.resourceFormTitle = '添加权限'
			// 重置表单
      this.resetForm("resourceForm")
			// 设置 pid，如果有传递的话
      if (row) {
        this.resourceForm.pid = row.id
      }
		},
		// 修改弹窗
    handleUpdateClick(row) {
      this.resourceFormVisible = true
      this.resourceFormTitle = '修改权限'
      // 重置表单
      this.resetForm("resourceForm")
      // 设置修改的表单
      this.resourceForm = row;
		},
		// 表单提交
    handleFormSubmit() {
      this.$refs["resourceForm"].validate(valid => {
        if (!valid) {
          return
				}
        // 设置加载中，避免重复点击
        this.resourceFormLoading = true

        // 更新
        if (this.resourceForm.id) {
          updateResource(this.resourceForm).then(response => {
            // 取消加载中
            this.resourceFormLoading = false
            if (response.code === 0) {
              // 提示成功
              this.messageSuccess("修改成功")
              // 取消加载中
              this.resourceFormVisible = false
              // 重新加载资源树
              this.getResourceTree()
            }
          }).catch(() => {
            // 取消加载中
            this.resourceFormLoading = false
          })
				// 新增
        } else {
          createResource(this.resourceForm).then(response => {
            // 取消加载中
            this.resourceFormLoading = false
            if (response.code === 0) {
              // 提示成功
              this.messageSuccess("新增成功")
              // 取消加载中
              this.resourceFormVisible = false
							// 重新加载资源树
              this.getResourceTree()
            }
          }).catch(() => {
						// 取消加载中
            this.resourceFormLoading = false
					})
        }
      })
		},
		// 表单取消
		handleFormCancel() {
      this.resourceFormVisible = false
		},
		// 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的权限?', "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(() => {
        deleteResource(row.id).then(response => {
          if (response.code === 0) {
            // 提示成功
            this.messageSuccess("删除成功")
            // 重新加载资源树
            this.getResourceTree()
          }
        })
      })
    },
		// 构建 resourceFormResourceTreeSelect 的数据
    generateResourceFormResourceTreeSelect(tree) {
      const res = []
      tree.forEach(node => {
        // 只有菜单类型的权限，才可以使用
        if (node.type !== ResourceTypeEnum.MENU) {
          return
				}
        // 创建当前节点
        const tmp = {
          id: node.id,
					label: node.name
        }
        res.push(tmp)
        // 递归子节点
        if (node.children) {
          const children = this.generateResourceFormResourceTreeSelect(node.children)
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
