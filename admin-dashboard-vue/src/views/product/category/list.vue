<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['product:category:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 商品分类树 -->
    <el-table v-loading="productCategoryTreeLoading" :data="productCategoryTree" row-key="id">
      <el-table-column prop="name" label="分类名称" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="图片" align="center" width="200">
        <template slot-scope="scope">
          <el-image v-if="scope.row.picUrl && scope.row.picUrl.length > 0" :src="scope.row.picUrl" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="50" />
      <el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-permission="['product:category:create']"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click="handleAddClick(scope.row)"
          >新增</el-button>
          <el-button v-permission="['product:category:update']" type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
          <el-button v-permission="['product:category:delete']" type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 商品分类添加与修改表单 -->
    <el-dialog
      v-loading="productCategoryFormLoading"
      :title="productCategoryFormTitle"
      :visible.sync="productCategoryFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="productCategoryForm" :model="productCategoryForm" :rules="productCategoryFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级类目" prop="pid">
              <treeselect v-model="productCategoryForm.pid" :options="productCategoryFormProductCategoryTreeSelect" :show-count="true" placeholder="选择上级类目" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="productCategoryForm.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="productCategoryForm.sort" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图片" prop="picUrl">
              <el-input v-model="productCategoryForm.picUrl" placeholder="请输入图片" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="productCategoryForm.description" type="textarea" placeholder="请输入图片" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="productCategoryForm.status">
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
import { treeProductCategory, createProductCategory, updateProductCategory, deleteProductCategory } from '@/api/product/productCategory'

import { CommonStatusEnum } from '@/utils/constants'

import { getDataDictName, getDataDicts, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'ProductCategoryList',
  components: { Treeselect },
  data() {
    return {
      // 商品分类树
      productCategoryTree: [],
      // 进度条
      productCategoryTreeLoading: true,

      // 商品分类添加与修改表单
      productCategoryForm: {},
      // 校验规则
      productCategoryFormRule: {
        pid: [
          { required: true, message: '上级类目不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      productCategoryFormVisible: false,
      // 标题
      productCategoryFormTitle: '',
      // 商品分类树 TreeSelect 的数据
      productCategoryFormProductCategoryTreeSelect: [],
      productCategoryFormLoading: false,

      // 枚举
      CommonStatusEnum: CommonStatusEnum,

      // 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
    }
  },
  created() {
    this.getProductCategoryTree()
  },
  methods: {
    // 加载商品分类树
    getProductCategoryTree() {
      this.productCategoryTreeLoading = true
      treeProductCategory().then(response => {
        // 取消加载中
        this.productCategoryTreeLoading = false
        // 设置数据
        this.productCategoryTree = response.data
        this.productCategoryFormProductCategoryTreeSelect = [{
          id: 0,
          label: '根节点'
        }, ...this.generateProductCategoryFormProductCategoryTreeSelect(this.productCategoryTree)]
      }).catch(() => {
        // 取消加载中
        this.productCategoryTreeLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.productCategoryFormVisible = true
      this.productCategoryFormTitle = '添加商品分类'
      // 重置表单
      this.resetForm('productCategoryForm')
      this.productCategoryForm = {}
      // 设置 pid，如果有传递的话
      if (row) {
        this.productCategoryForm.pid = row.id
      }
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.productCategoryFormVisible = true
      this.productCategoryFormTitle = '修改商品分类'
      // 重置表单
      this.resetForm('productCategoryForm')
      // 设置修改的表单
      this.productCategoryForm = {
        ...row,
        children: undefined // TODO 芋艿：有什么办法剔除非表单的字段
      }
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['productCategoryForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.productCategoryFormLoading = true

        // 更新
        if (this.productCategoryForm.id) {
          updateProductCategory(this.productCategoryForm).then(response => {
            // 取消加载中
            this.productCategoryFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.productCategoryFormVisible = false
            // 重新加载商品分类树
            this.getProductCategoryTree()
          }).catch(() => {
            // 取消加载中
            this.productCategoryFormLoading = false
          })
          // 新增
        } else {
          createProductCategory(this.productCategoryForm).then(response => {
            // 取消加载中
            this.productCategoryFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.productCategoryFormVisible = false
            // 重新加载商品分类树
            this.getProductCategoryTree()
          }).catch(() => {
            // 取消加载中
            this.productCategoryFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.productCategoryFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.name + '"的商品分类?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteProductCategory(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载商品分类树
          this.getProductCategoryTree()
        })
      })
    },
    // 构建 productCategoryFormProductCategoryTreeSelect 的数据
    generateProductCategoryFormProductCategoryTreeSelect(tree) {
      const res = []
      tree.forEach(node => {
        // 只有根节点的商品分类，才可以使用。因为目前暂时只做两级分类~
        if (node.pid !== 0) {
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
          const children = this.generateProductCategoryFormProductCategoryTreeSelect(node.children)
          if (children && children.length > 0) {
            tmp.children = children
          }
        }
      })
      return res
    },
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.status)
    }
  }
}
</script>
