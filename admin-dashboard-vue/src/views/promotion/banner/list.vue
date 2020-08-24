<template>
  <div class="app-container">
		<!--搜索栏 -->
		<el-form ref="bannerListQueryForm" :model="bannerListQuery" :inline="true">
			<el-form-item label="标题" prop="title">
				<el-input v-model="bannerListQuery.title" placeholder="请输入标题" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="bannerListQueryFormSubmit">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="bannerListQueryFormReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-permission="['promotion:banner:create']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
      </el-col>
    </el-row>

    <!-- 广告列表 -->
    <el-table v-loading="bannerListLoading" :data="bannerList" row-key="id">
      <el-table-column prop="title" label="标题" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="url" label="跳转链接" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="图片" align="center" width="200">
        <template slot-scope="scope">
          <el-image v-if="scope.row.picUrl && scope.row.picUrl.length > 0" :src="scope.row.picUrl" />
        </template>
      </el-table-column>
			<el-table-column prop="sort" label="排序值" width="100" :show-overflow-tooltip="true" />
			<el-table-column prop="status" :formatter="formatStatusTableColumn" label="状态" width="50" />
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button v-permission="['promotion:banner:update']" type="text" size="mini" icon="el-icon-edit" @click="handleUpdateClick(scope.row)">修改</el-button>
          <el-button v-permission="['promotion:banner:delete']" type="text" size="mini" icon="el-icon-delete" @click="handleDeleteClick(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 广告列表的分页 -->
    <pagination
      v-show="bannerListTotal > 0"
      :total="bannerListTotal"
      :page.sync="bannerListQuery.pageNo"
      :limit.sync="bannerListQuery.pageSize"
      @pagination="getBannerList"
    />

    <!-- 广告添加与修改表单 -->
    <el-dialog
      v-loading="bannerFormLoading"
      :title="bannerFormTitle"
      :visible.sync="bannerFormVisible"
      width="600px"
      append-to-body
      element-loading-text="提交中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-form ref="bannerForm" :model="bannerForm" :rules="bannerFormRule" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="title">
              <el-input v-model="bannerForm.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="跳转链接" prop="url">
              <el-input v-model="bannerForm.url" placeholder="请输入跳转链接" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图片链接" prop="picUrl">
              <el-input v-model="bannerForm.picUrl" type="textarea" placeholder="请输入图片链接" />
            </el-form-item>
          </el-col>
					<el-col :span="24">
						<el-form-item label="排序" prop="sort">
							<el-input-number v-model="bannerForm.sort" controls-position="right" />
						</el-form-item>
					</el-col>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="bannerForm.status">
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
import { pageBanner, createBanner, updateBanner, deleteBanner } from '@/api/promotion/banner'

import { CommonStatusEnum } from '@/utils/constants'

import { getDataDictName, getDataDicts, DATA_DICT_ENUM_VALE } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

export default {
  name: 'BannerList',
  components: { Pagination },
  data() {
    return {
      // 广告树
      bannerList: [],
      // 广告总数
      bannerListTotal: 0,
      // 进度条
      bannerListLoading: true,
      // 查询条件
      bannerListQuery: {
        pageNo: 1,
        pageSize: 10,
        title: undefined
      },

      // 广告添加与修改表单
      bannerForm: {},
      // 校验规则
      bannerFormRule: {
        title: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '跳转链接不能为空', trigger: 'blur' }
        ],
        picUrl: [
          { required: true, message: '图片链接不能为空', trigger: 'blur' }
				],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      // 是否可见
      bannerFormVisible: false,
      // 标题
      bannerFormTitle: '',
      bannerFormLoading: false,

      // 枚举
      CommonStatusEnum: CommonStatusEnum,

      // 数据字典
      commonStatusDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.COMMON_STATUS)
    }
  },
  created() {
    this.getBannerList()
  },
  methods: {
    // 加载广告树
    getBannerList() {
      this.bannerListLoading = true
      pageBanner(this.bannerListQuery).then(response => {
        // 取消加载中
        this.bannerListLoading = false
        // 设置数据
        this.bannerList = response.data.list
        this.bannerListTotal = response.data.total
      }).catch(() => {
        // 取消加载中
        this.bannerListLoading = false
      })
    },
    // 添加弹窗
    handleAddClick(row) {
      this.bannerFormVisible = true
      this.bannerFormTitle = '添加广告'
      // 重置表单
      this.resetForm('bannerForm')
      this.bannerForm = {}
    },
    // 修改弹窗
    handleUpdateClick(row) {
      this.bannerFormVisible = true
      this.bannerFormTitle = '修改广告'
      // 重置表单
      this.resetForm('bannerForm')
      // 设置修改的表单
      this.bannerForm = row
    },
    // 表单提交
    handleFormSubmit() {
      this.$refs['bannerForm'].validate(valid => {
        if (!valid) {
          return
        }
        // 设置加载中，避免重复点击
        this.bannerFormLoading = true

        // 更新
        if (this.bannerForm.id) {
          updateBanner(this.bannerForm).then(response => {
            // 取消加载中
            this.bannerFormLoading = false
            // 提示成功
            this.messageSuccess('修改成功')
            // 关闭表单
            this.bannerFormVisible = false
            // 重新加载广告树
            this.getBannerList()
          }).catch(() => {
            // 取消加载中
            this.bannerFormLoading = false
          })
          // 新增
        } else {
          createBanner(this.bannerForm).then(response => {
            // 取消加载中
            this.bannerFormLoading = false
            // 提示成功
            this.messageSuccess('新增成功')
            // 关闭表单
            this.bannerFormVisible = false
            // 重新加载广告树
            this.getBannerList()
          }).catch(() => {
            // 取消加载中
            this.bannerFormLoading = false
          })
        }
      })
    },
    // 表单取消
    handleFormCancel() {
      this.bannerFormVisible = false
    },
    // 删除弹窗
    handleDeleteClick(row) {
      this.$confirm('确认删除名字为"' + row.title + '"的广告?', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteBanner(row.id).then(response => {
          // 提示成功
          this.messageSuccess('删除成功')
          // 重新加载广告树
          this.getBannerList()
        })
      })
    },
    // 搜索表单提交
    bannerListQueryFormSubmit() {
      // 重置到第一页
      this.bannerListQuery.pageNo = 1
      // 加载优惠劵模板列表
      this.getBannerList()
    },
    // 搜索表单重置
    bannerListQueryFormReset() {
      // 重置表单
      this.resetForm('bannerListQueryForm')
      // 加载优惠劵模板列表
      this.getBannerList()
    },
    // 列表渲染（状态列）
    formatStatusTableColumn(row) {
      return getDataDictName(DATA_DICT_ENUM_VALE.COMMON_STATUS, row.status)
    }
  }
}
</script>
