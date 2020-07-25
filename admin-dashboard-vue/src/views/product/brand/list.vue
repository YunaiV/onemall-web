<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['product:brand:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 商品品牌树 -->
    <el-table v-loading="productBrandListLoading" :data="productBrandList" row-key="id">
      <el-table-column prop="name" label="品牌名称" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="图片" align="center" width="200">
        <template slot-scope="scope">
					<el-image v-if="scope.row.picUrl && scope.row.picUrl.length > 0" :src="scope.row.picUrl"/>
				</template>
      </el-table-column>
			<el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
			<el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button v-permission="['product:brand:update']" type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
          <el-button v-permission="['product:brand:delete']" type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
		<!-- 商品分类列表的分页 -->
		<pagination
				v-show="productBrandListTotal > 0"
				:total="productBrandListTotal"
				:page.sync="productBrandListQuery.pageNo"
				:limit.sync="productBrandListQuery.pageSize"
				@pagination="getProductBrandList"
		/>

    <!-- 商品品牌添加与修改表单 -->
    <el-dialog
      v-loading="productBrandFormLoading"
      :title="productBrandFormTitle"
      :visible.sync="productBrandFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="productBrandForm" :model="productBrandForm" :rules="productBrandFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="productBrandForm.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图片" prop="picUrl">
              <el-input v-model="productBrandForm.picUrl" placeholder="请输入图片" />
            </el-form-item>
          </el-col>
					<el-col :span="24">
						<el-form-item label="描述" prop="description">
							<el-input type="textarea" v-model="productBrandForm.description" placeholder="请输入图片" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="状态" prop="status">
							<el-radio-group v-model="productBrandForm.status">
								<el-radio v-for="dict in commonStatusDataDicts" :label="parseInt(dict.value)">{{dict.displayName}}</el-radio>
							</el-radio-group>
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
import { pageProductBrand, createProductBrand, updateProductBrand, deleteProductBrand } from '@/api/product/productBrand'

import { CommonStatusEnum } from '@/utils/constants'

import { getDataDictName, getDataDicts, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

export default {
  name: 'ProductBrandList',
  components: { Pagination },
  data() {
    return {
      // 商品品牌树
      productBrandList: [],
      //商品品牌总数
      productBrandListTotal: 0,
      // 进度条
      productBrandListLoading: true,
      // 查询条件
      productBrandListQuery: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },

      // 商品品牌添加与修改表单
      productBrandForm: {},
      // 校验规则
      productBrandFormRule: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
				status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
				]
      },
      // 是否可见
      productBrandFormVisible: false,
      // 标题
      productBrandFormTitle: '',
      // 商品品牌树 ListSelect 的数据
      productBrandFormProductBrandListSelect: [],
      productBrandFormLoading: false,

      // 枚举
      CommonStatusEnum: CommonStatusEnum,

			// 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
    }
  },
  created() {
    this.getProductBrandList()
  },
  methods: {
    // 加载商品品牌树
    getProductBrandList() {
      this.productBrandListLoading = true
      pageProductBrand(this.productBrandListQuery).then(response => {
        // 取消加载中
        this.productBrandListLoading = false
        // 设置数据
        this.productBrandList = response.data.list
				this.productBrandListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.productBrandListLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.productBrandFormVisible = true
      this.productBrandFormTitle = '添加商品品牌'
      // 重置表单
      this.resetForm('productBrandForm')
      this.productBrandForm = {}
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.productBrandFormVisible = true
      this.productBrandFormTitle = '修改商品品牌'
      // 重置表单
      this.resetForm('productBrandForm')
      // 设置修改的表单
      this.productBrandForm = row
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['productBrandForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.productBrandFormLoading = true

        // 更新
        if (this.productBrandForm.id) {
          updateProductBrand(this.productBrandForm).then(response => {
            // 取消加载中
            this.productBrandFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.productBrandFormVisible = false
            // 重新加载商品品牌树
            this.getProductBrandList()
          }).catch(() => {
            // 取消加载中
            this.productBrandFormLoading = false
          })
          // 新增
        } else {
          createProductBrand(this.productBrandForm).then(response => {
            // 取消加载中
            this.productBrandFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.productBrandFormVisible = false
            // 重新加载商品品牌树
            this.getProductBrandList()
          }).catch(() => {
            // 取消加载中
            this.productBrandFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.productBrandFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的商品品牌?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteProductBrand(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载商品品牌树
          this.getProductBrandList()
        })
      })
    },
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.status);
    }
  }
}
</script>
