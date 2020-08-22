<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['system:data-dict:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据字典树 -->
    <el-table v-loading="dataDictTreeLoading" :data="dataDictTree" row-key="id">
      <el-table-column prop="enumValue" label="大类枚举值" width="300" :show-overflow-tooltip="true" />
      <el-table-column prop="value" label="小类数值"width="100" />
      <el-table-column prop="displayName" label="展示名" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="memo" label="备注" width="300" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.type === 'enumValue'"
            v-permission="['system:data-dict:create']"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click="handleAddClick(scope.row)"
          >新增</el-button>
          <el-button
            v-if="scope.row.type === 'value'"
            v-permission="['system:data-dict:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdateClick(scope.row)"
          >修改</el-button>
          <el-button
            v-if="scope.row.type === 'value'"
            v-permission="['system:data-dict:delete']"
            type="text"
            size="mini"
            icon="el-icon-delete"
            @click="handleDeleteClick(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 数据字典添加与修改表单 -->
    <el-dialog
      v-loading="dataDictFormLoading"
      :title="dataDictFormTitle"
      :visible.sync="dataDictFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="dataDictForm" :model="dataDictForm" :rules="dataDictFormRule" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="大类枚举值" prop="enumValue">
              <el-input v-model="dataDictForm.enumValue" placeholder="请输入大类枚举值" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="小类数值" prop="value">
              <el-input v-model="dataDictForm.value" placeholder="请输入小类数值" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="展示名" prop="displayName">
              <el-input v-model="dataDictForm.displayName" placeholder="请输入展示名" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="dataDictForm.sort" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="memo">
              <el-input v-model="dataDictForm.memo" placeholder="请输入备注" />
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
import { listAllDataDict, createDataDict, updateDataDict, deleteDataDict } from '@/api/datadict/datadict'

export default {
  name: 'DataDictList',
  data() {
    return {
      // 数据字典树
      dataDictTree: [],
      // 进度条
      dataDictTreeLoading: true,

      // 数据字典添加与修改表单
      dataDictForm: {},
      // 校验规则
      dataDictFormRule: {
        enumValue: [
          { required: true, message: '大类枚举值不能为空', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '小类数值不能为空', trigger: 'blur' }
        ],
        displayName: [
          { required: true, message: '展示名不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      dataDictFormVisible: false,
      // 标题
      dataDictFormTitle: '',
      dataDictFormLoading: false

      // 枚举
      // DataDictTypeEnum: DataDictTypeEnum
    }
  },
  created() {
    this.getDataDictTree()
  },
  methods: {
    // 加载数据字典树
    getDataDictTree() {
      this.dataDictTreeLoading = true
      listAllDataDict().then(response => {
        // 取消加载中
        this.dataDictTreeLoading = false
        // 设置数据
        const dataDictTree = []
        const dataDictMap = {}
        response.data.forEach(dataDict => {
				  // 获得 enumValue 层级
				  let enumValueObj = dataDictMap[dataDict.enumValue]
          if (!enumValueObj) {
					  enumValueObj = dataDictMap[dataDict.enumValue] = {
					    id: 'enumValue-' + dataDict.id,
					    type: 'enumValue',
              enumValue: dataDict.enumValue,
              children: [],
              // meta 字段，元数据，方便后续更新
              meta: dataDict
            }
            dataDictTree.push(enumValueObj)
          }
          // 处理 value 层级
          enumValueObj.children.push({
            id: 'value-' + dataDict.id,
            type: 'value',
            value: dataDict.value,
            displayName: dataDict.displayName,
            memo: dataDict.memo,
            createTime: dataDict.createTime,
            // meta 字段，元数据，方便后续更新
            meta: dataDict
          })
        })
        this.dataDictTree = dataDictTree
      }).catch(() => {
        // 取消加载中
        this.dataDictTreeLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.dataDictFormVisible = true
      this.dataDictFormTitle = '添加数据字典'
      // 重置表单
      this.resetForm('dataDictForm')
      this.dataDictForm = {}
      // 设置 enumValue，如果有传递的话
      if (row && row.enumValue) {
        this.dataDictForm.enumValue = row.enumValue
      }
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.dataDictFormVisible = true
      this.dataDictFormTitle = '修改数据字典'
      // 重置表单
      this.resetForm('dataDictForm')
      // 设置修改的表单
      this.dataDictForm = row.meta
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['dataDictForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.dataDictFormLoading = true

        // 更新
        if (this.dataDictForm.id) {
          updateDataDict(this.dataDictForm).then(response => {
            // 取消加载中
            this.dataDictFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.dataDictFormVisible = false
            // 重新加载数据字典树
            this.getDataDictTree()
          }).catch(() => {
            // 取消加载中
            this.dataDictFormLoading = false
          })
          // 新增
        } else {
          createDataDict(this.dataDictForm).then(response => {
            // 取消加载中
            this.dataDictFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.dataDictFormVisible = false
            // 重新加载数据字典树
            this.getDataDictTree()
          }).catch(() => {
            // 取消加载中
            this.dataDictFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.dataDictFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.meta.enumValue + '(' + row.meta.value + ')' + '"的数据字典?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteDataDict(row.meta.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载数据字典树
          this.getDataDictTree()
        })
      })
    }
  }
}
</script>
