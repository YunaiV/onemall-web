<template>
  <div class="app-container">
		<el-row>
			<el-col :span="12">
				<!--搜索栏 -->
				<el-form ref="productAttrKeyListQueryForm" :model="productAttrKeyListQuery" :inline="true">
					<el-form-item label="规格键名称" prop="name">
						<el-input v-model="productAttrKeyListQuery.name" placeholder="请输入规格键名称" clearable size="small" style="width: 240px" />
					</el-form-item>
					<el-form-item label="状态" prop="status">
						<el-select v-model="productAttrKeyListQuery.status" placeholder="请选择状态" clearable>
							<el-option v-for="dict in commonStatusDataDicts" :key="dict.value" :label="dict.displayName" :value="dict.value" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" size="mini" @click="productAttrKeyListQueryFormSubmit">搜索</el-button>
						<el-button icon="el-icon-refresh" size="mini" @click="productAttrKeyListQueryFormReset">重置</el-button>
					</el-form-item>
				</el-form>

				<!-- 工具栏 -->
				<el-row :gutter="10" class="mb8">
					<el-col :span="1.5">
						<el-button v-permission="['product:attr-key:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleProductAttrKeyAddClick">新增</el-button>
					</el-col>
				</el-row>

				<!-- 商品规格键列表 -->
				<el-table border v-loading="productAttrKeyListLoading" :data="productAttrKeyList" row-key="id"
									@row-click="productAttrKeyTableRowClick">
					<el-table-column prop="name" label="规格键名称" width="200" :show-overflow-tooltip="true" />
					<el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
					<el-table-column label="创建时间" align="center">
						<template slot-scope="scope">
							<span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="100">
						<template slot-scope="scope">
							<el-button v-permission="['product:attr-key:update']" type="text" size="mini" icon="el-icon-edit" @click="handleProductAttrKeyUpdateClick(scope.row)">修改</el-button>
						</template>
					</el-table-column>
				</el-table>
				<!-- 商品规格键列表的分页 -->
				<pagination
						v-show="productAttrKeyListTotal > 0"
						:total="productAttrKeyListTotal"
						:page.sync="productAttrKeyListQuery.pageNo"
						:limit.sync="productAttrKeyListQuery.pageSize"
						@pagination="getProductAttrKeyList"
				/>
			</el-col>
			<el-col :span="12">
				<!-- 工具栏 -->
				<el-row :gutter="10" class="mb8">
					<el-col :span="1.5">
						<el-button v-if="productAttrValueLisQuery.productAttrKeyId !== undefined" v-permission="['product:attr-value:create']"
											 type="primary" icon="el-icon-plus" size="mini"
											 @click="handleProductAttrValueAddClick">新增（{{productAttrValueLisQuery.productAttrKeyName}}）</el-button>
					</el-col>
				</el-row>

				<!-- 商品规格值列表 -->
				<el-table border v-loading="productAttrValueListLoading" :data="productAttrValueList" row-key="id">
					<el-table-column prop="name" label="规格值名称" width="200" :show-overflow-tooltip="true" />
					<el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
					<el-table-column label="创建时间" align="center">
						<template slot-scope="scope">
							<span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="scope">
							<el-button v-permission="['product:attr-value:update']" type="text" size="mini" icon="el-icon-edit"
												 @click="handleProductAttrValueUpdateClick(scope.row)">修改</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>

    <!-- 商品规格键添加与修改表单 -->
    <el-dialog
      v-loading="productAttrKeyFormLoading"
      :title="productAttrKeyFormTitle"
      :visible.sync="productAttrKeyFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="productAttrKeyForm" :model="productAttrKeyForm" :rules="productAttrKeyFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="productAttrKeyForm.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
					<el-col :span="24">
						<el-form-item label="状态" prop="status">
							<el-radio-group v-model="productAttrKeyForm.status">
								<el-radio v-for="dict in commonStatusDataDicts" :label="parseInt(dict.value)">{{dict.displayName}}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleProductAttrKeyFormSubmit">确 定</el-button>
        <el-button @click="handleProductAttrKeyFormCancel">取 消</el-button>
      </div>
    </el-dialog>

		<!-- 商品规格值添加与修改表单 -->
		<el-dialog
				v-loading="productAttrValueFormLoading"
				:title="productAttrValueFormTitle"
				:visible.sync="productAttrValueFormVisible"
				width="600px"
				append-to-body
				element-loading-text="提交中..."
				element-loading-spinner="el-icon-loading"
		>
			<el-form ref="productAttrValueForm" :model="productAttrValueForm" :rules="productAttrValueFormRule" label-width="100px">
				<el-row>
					<el-col :span="24">
						<el-form-item label="规格键">
							<el-input v-model="productAttrValueLisQuery.productAttrKeyName" :disabled="true" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="规格值名称" prop="name">
							<el-input v-model="productAttrValueForm.name" placeholder="请输入名称" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="状态" prop="status">
							<el-radio-group v-model="productAttrValueForm.status">
								<el-radio v-for="dict in commonStatusDataDicts" :label="parseInt(dict.value)">{{dict.displayName}}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleProductAttrValueFormSubmit">确 定</el-button>
				<el-button @click="handleProductAttrValueFormCancel">取 消</el-button>
			</div>
		</el-dialog>
  </div>
</template>

<script>
import { pageProductAttrKey, createProductAttrKey, updateProductAttrKey,
  listProductAttrValues, createProductAttrValue, updateProductAttrValue } from '@/api/product/productAttr'

import Pagination from '@/components/Pagination'

import { CommonStatusEnum } from '@/utils/constants'

import { getDataDictName, getDataDicts, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

export default {
  name: 'ProductAttrList',
  components: { Pagination },
  data() {
    return {
      // 商品规格键列表
      productAttrKeyList: [],
      // 总数
      productAttrKeyListTotal: 0,
      // 进度条
      productAttrKeyListLoading: true,
      // 查询条件
      productAttrKeyListQuery: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
				status: undefined
      },

      // 商品规格键添加与修改表单
      productAttrKeyForm: {},
      // 校验规则
      productAttrKeyFormRule: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
				status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
				]
      },
      // 是否可见
      productAttrKeyFormVisible: false,
      // 标题
      productAttrKeyFormTitle: '',
			// 进度条
      productAttrKeyFormLoading: false,

			// 商品规格值列表
      productAttrValueList: [],
			// 进度条
      productAttrValueListLoading: false,
			// 查询条件
      productAttrValueLisQuery: {
        productAttrKeyId: undefined, // 选中的规格键编号
        productAttrKeyName: undefined // 选中的规格键名字
      },

      // 商品规格值添加与修改表单
      productAttrValueForm: {},
      // 校验规则
      productAttrValueFormRule: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      productAttrValueFormVisible: false,
      // 标题
      productAttrValueFormTitle: '',
      // 进度条
      productAttrValueFormLoading: false,

      // 枚举
      CommonStatusEnum: CommonStatusEnum,

			// 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
    }
  },
  created() {
    this.getProductAttrKeyList()
  },
  methods: {
    // ========== 规格键相关的 ==========

    // 加载商品规格键列表
    getProductAttrKeyList() {
      this.productAttrKeyListLoading = true
      pageProductAttrKey(this.productAttrKeyListQuery).then(response => {
        // 取消加载中
        this.productAttrKeyListLoading = false
        // 设置数据
        this.productAttrKeyList = response.data.list
        this.productAttrKeyListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.productAttrKeyListLoading = false
      })
    },
		// 商品规格键被点击
    productAttrKeyTableRowClick(row) {
      // 设置选中的商品规格
      this.productAttrValueLisQuery = {
        productAttrKeyId: row.id,
        productAttrKeyName: row.name
			}
			this.getProductAttrValueList()
		},
    // 添加弹窗
    handleProductAttrKeyAddClick(row) {
      this.productAttrKeyFormVisible = true
      this.productAttrKeyFormTitle = '添加商品规格键'
      // 重置表单
      this.resetForm('productAttrKeyForm')
      this.productAttrKeyForm = {}
      // 设置 pid，如果有传递的话
      if (row) {
        this.productAttrKeyForm.pid = row.id
      }
    },
    // 修改弹窗
    handleProductAttrKeyUpdateClick(row) {
      this.productAttrKeyFormVisible = true
      this.productAttrKeyFormTitle = '修改商品规格键'
      // 重置表单
      this.resetForm('productAttrKeyForm')
      // 设置修改的表单
      this.productAttrKeyForm = {
        ...row,
        children: undefined // TODO 芋艿：有什么办法剔除非表单的字段
      }
    },
    // 表单提交
    handleProductAttrKeyFormSubmit() {
      this.$refs['productAttrKeyForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.productAttrKeyFormLoading = true

        // 更新
        if (this.productAttrKeyForm.id) {
          updateProductAttrKey(this.productAttrKeyForm).then(response => {
            // 取消加载中
            this.productAttrKeyFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.productAttrKeyFormVisible = false
            // 重新加载商品规格键列表
            this.getProductAttrKeyList()
          }).catch(() => {
            // 取消加载中
            this.productAttrKeyFormLoading = false
          })
          // 新增
        } else {
          createProductAttrKey(this.productAttrKeyForm).then(response => {
            // 取消加载中
            this.productAttrKeyFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.productAttrKeyFormVisible = false
            // 重新加载商品规格键列表
            this.getProductAttrKeyList()
          }).catch(() => {
            // 取消加载中
            this.productAttrKeyFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleProductAttrKeyFormCancel() {
      this.productAttrKeyFormVisible = false
    },
    // 搜索表单提交
    productAttrKeyListQueryFormSubmit() {
      // 重置到第一页
      this.productAttrKeyListQuery.pageNo = 1
      // 加载商品规格键列表
      this.getProductAttrKeyList()
    },
    // 搜索表单重置
    productAttrKeyListQueryFormReset() {
      // 重置表单
      this.resetForm('productAttrKeyListQueryForm')
      // 加载商品规格键列表
      this.getProductAttrKeyList()
    },
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.status);
    },

    // ========== 规格值相关的 ==========
    getProductAttrValueList() {
      listProductAttrValues({
        productAttrKeyId: this.productAttrValueLisQuery.productAttrKeyId
      }).then(response => {
        // 取消加载中
        this.productAttrValueListLoading = false
        // 设置数据
        this.productAttrValueList = response.data
      }).catch(() => {
        // 取消加载中
        this.productAttrValueListLoading = false
      })
		},
    // 添加弹窗
    handleProductAttrValueAddClick(row) {
      this.productAttrValueFormVisible = true
      this.productAttrValueFormTitle = '添加商品规格值'
      // 重置表单
      this.resetForm('productAttrValueForm')
      this.productAttrValueForm = {
        attrKeyId: this.productAttrValueLisQuery.productAttrKeyId
			}
    },
    // 修改弹窗
    handleProductAttrValueUpdateClick(row) {
      this.productAttrValueFormVisible = true
      this.productAttrValueFormTitle = '修改商品规格值'
      // 重置表单
      this.resetForm('productAttrValueForm')
      // 设置修改的表单
      this.productAttrValueForm = {
        ...row
      }
    },
    // 表单提交
    handleProductAttrValueFormSubmit() {
      this.$refs['productAttrValueForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.productAttrValueFormLoading = true

        // 更新
        if (this.productAttrValueForm.id) {
          updateProductAttrValue(this.productAttrValueForm).then(response => {
            // 取消加载中
            this.productAttrValueFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.productAttrValueFormVisible = false
            // 重新加载商品规格值列表
            this.getProductAttrValueList()
          }).catch(() => {
            // 取消加载中
            this.productAttrValueFormLoading = false
          })
          // 新增
        } else {
          createProductAttrValue(this.productAttrValueForm).then(response => {
            // 取消加载中
            this.productAttrValueFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.productAttrValueFormVisible = false
            // 重新加载商品规格值列表
            this.getProductAttrValueList()
          }).catch(() => {
            // 取消加载中
            this.productAttrValueFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleProductAttrValueFormCancel() {
      this.productAttrValueFormVisible = false
    }

  }
}
</script>
