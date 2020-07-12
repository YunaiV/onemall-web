<template>

	<!-- 角色列表 -->
	<el-table v-loading="roleListLoading" :data="roleList" row-key="id">
		<el-table-column prop="name" label="名称" width="200" :show-overflow-tooltip="true"/>
		<el-table-column prop="code" label="编码" width="100"/>
		<!-- TODO 芋艿：接入数据字典 -->
		<el-table-column prop="type" label="类型"width="50"/>
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

</template>

<script>
// import { treeResource, createResource, updateResource, deleteResource } from '@/api/permission/resource'

export default {
	name: 'RoleList',
	data() {
		return {
			// 角色列表
			roleList: [],
			// 进度条
			roleListLoading: true,

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
			this.resourceForm = {
				...row,
				children: undefined // TODO 芋艿：有什么办法剔除非表单的字段
			};
		},
		// 表单提交
		handleFormSubmit() {
			this.$refs["resourceForm"].validate(valid => {
				if (!valid) {
					return
				}
				// 若权限类型为菜单时，进行 route 的校验，避免后续拼接出来的路由无法跳转
				if (this.resourceForm.type === ResourceTypeEnum.MENU) {
					// 如果是外链，则不进行校验
					const route = this.resourceForm.route
					if (route.indexOf('http://') === -1 || route.indexOf('https://') === -1) {
						// 父权限为根节点，route 必须以 / 开头
						if (this.resourceForm.pid === 0 && route.charAt(0) !== '/') {
							this.messageSuccess("前端必须以 / 开头")
							return
						} else if (this.resourceForm.pid !== 0 && route.charAt(0) === '/') {
							this.messageSuccess("前端不能以 / 开头")
							return
						}
					}
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

<style scoped>

</style>
