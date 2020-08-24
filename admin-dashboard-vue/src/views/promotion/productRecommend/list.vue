<template>
  <div class="app-container">

		<!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['promotion:product-recommend:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 商品推荐列表 -->
    <el-table v-loading="productRecommendListLoading" :data="productRecommendList" row-key="id">
			<el-table-column prop="type" :formatter="formatTypeTableColumn" label="推荐类型" width="100" />
			<el-table-column prop="spu.name" label="商品" width="150" />
			<el-table-column prop="sort" label="排序值" width="100" :show-overflow-tooltip="true" />
			<el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button v-permission="['promotion:product-recommend:update']" type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
          <el-button v-permission="['promotion:product-recommend:delete']" type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 商品推荐列表的分页 -->
    <pagination
      v-show="productRecommendListTotal > 0"
      :total="productRecommendListTotal"
      :page.sync="productRecommendListQuery.pageNo"
      :limit.sync="productRecommendListQuery.pageSize"
      @pagination="getProductRecommendList"
    />

    <!-- 商品推荐添加与修改表单 -->
    <el-dialog
      v-loading="productRecommendFormLoading"
      :title="productRecommendFormTitle"
      :visible.sync="productRecommendFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="productRecommendForm" :model="productRecommendForm" :rules="productRecommendFormRule" label-width="120px">
        <el-row>
					<el-col :span="24">
						<el-form-item label="推荐类型" prop="status">
							<el-radio-group v-model="productRecommendForm.type">
								<el-radio v-for="dict in typeDataDicts" :label="parseInt(dict.value)">{{ dict.displayName }}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="商品 SPU 编号" prop="productSpuId">
							<el-input-number v-model="productRecommendForm.productSpuId" controls-position="right" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="排序" prop="sort">
							<el-input-number v-model="productRecommendForm.sort" controls-position="right" />
						</el-form-item>
					</el-col>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="productRecommendForm.status">
									<el-radio v-for="dict in commonStatusDataDicts" :label="parseInt(dict.value)">{{ dict.displayName }}</el-radio>
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
import { pageProductRecommend, createProductRecommend, updateProductRecommend, deleteProductRecommend } from '@/api/promotion/productRecommend'

import { CommonStatusEnum, PRODUCT_RECOMMEND_TYPE } from '@/utils/constants'

import { getDataDictName, getDataDicts, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

export default {
  name: 'ProductRecommendList',
  components: { Pagination },
  data() {
    return {
      // 商品推荐列表
      productRecommendList: [],
      // 商品推荐总数
      productRecommendListTotal: 0,
      // 进度条
      productRecommendListLoading: true,
      // 查询条件
      productRecommendListQuery: {
        pageNo: 1,
        pageSize: 10,
        title: undefined
      },

      // 商品推荐添加与修改表单
      productRecommendForm: {},
      // 校验规则
      productRecommendFormRule: {
        title: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        productSpuId: [
          { required: true, message: '商品 SPU 编号不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      productRecommendFormVisible: false,
      // 标题
      productRecommendFormTitle: '',
			// 是否加载
      productRecommendFormLoading: false,

      // 枚举
      CommonStatusEnum: CommonStatusEnum,

      // 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS),
			typeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.PRODUCT_RECOMMEND_TYPE)
    }
  },
  created() {
    this.getProductRecommendList()
  },
  methods: {
    // 加载商品推荐树
    getProductRecommendList() {
      this.productRecommendListLoading = true
      pageProductRecommend(this.productRecommendListQuery).then(response => {
        // 取消加载中
        this.productRecommendListLoading = false
        // 设置数据
        this.productRecommendList = response.data.list
        this.productRecommendListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.productRecommendListLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.productRecommendFormVisible = true
      this.productRecommendFormTitle = '添加商品推荐'
      // 重置表单
      this.resetForm('productRecommendForm')
      this.productRecommendForm = {}
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.productRecommendFormVisible = true
      this.productRecommendFormTitle = '修改商品推荐'
      // 重置表单
      this.resetForm('productRecommendForm')
      // 设置修改的表单
      this.productRecommendForm = row
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['productRecommendForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.productRecommendFormLoading = true

        // 更新
        if (this.productRecommendForm.id) {
          updateProductRecommend(this.productRecommendForm).then(response => {
            // 取消加载中
            this.productRecommendFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.productRecommendFormVisible = false
            // 重新加载商品推荐树
            this.getProductRecommendList()
          }).catch(() => {
            // 取消加载中
            this.productRecommendFormLoading = false
          })
          // 新增
        } else {
          createProductRecommend(this.productRecommendForm).then(response => {
            // 取消加载中
            this.productRecommendFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.productRecommendFormVisible = false
            // 重新加载商品推荐树
            this.getProductRecommendList()
          }).catch(() => {
            // 取消加载中
            this.productRecommendFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.productRecommendFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.title + '"的商品推荐?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteProductRecommend(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载商品推荐树
          this.getProductRecommendList()
        })
      })
    },
    // 搜索表单提交
    productRecommendListQueryFormSubmit() {
      // 重置到第一页
      this.productRecommendListQuery.pageNo = 1
      // 加载优惠劵模板列表
      this.getProductRecommendList()
    },
    // 搜索表单重置
    productRecommendListQueryFormReset() {
      // 重置表单
      this.resetForm('productRecommendListQueryForm')
      // 加载优惠劵模板列表
      this.getProductRecommendList()
    },
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.status)
    },
    // 列表渲染（列表列）
    formatTypeTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.PRODUCT_RECOMMEND_TYPE, row.status)
    }
  }
}
</script>
