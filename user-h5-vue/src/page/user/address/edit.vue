<template>
  <div>
    <headerNav title="修改地址"/>
    <van-address-edit
      :area-list="areaList"
      :showDelete="showDelete"
      show-set-default
      @save="onSave"
      @delete="onDelete"
      :addressInfo="info"
    />
  </div>
</template>

<script>
  import areaList from '../../../data/area';
  import {getUserAddress, createUserAddress, updateUserAddress, deleteUserAddress} from "../../../api/user.js";

  import {AddressEdit} from 'vant';

  export default {
    components: {
      [AddressEdit.name]: AddressEdit,
    },
    data() {
      return {
        areaList,
        showDelete: false,
        info: {
        },
      }
    },

    methods: {
      onSave(data) {
        const params = {
          id: data.id,
          name: data.name,
          mobile: data.tel,
          areaCode: data.areaCode,
          detailAddress: data.addressDetail,
          type: data.isDefault ? 1 : 2
        };
        if (data.id) {
          updateUserAddress(params).then(response => {
            this.$toast('更新成功');
            this.$router.go(-1);
          })
        } else {
          createUserAddress(params).then(response => {
            this.$toast('保存成功');
            this.$router.go(-1);
          })
        }
      },
      onDelete(data) {
        deleteUserAddress(data.id).then(response => {
          this.$toast('删除成功');
          this.$router.go(-1);
        })
      },
    },
    created: function () {
      const id = this.$route.query.id;
      if (id > 0) {
        this.showDelete = true;
        getUserAddress(id).then(response => {
          this.info = {
            id: response.id,
            name: response.name,
            tel: response.mobile,
            areaCode: response.areaCode,
            addressDetail: response.detailAddress,
            isDefault: response.type === 1
          };
        })
      }
    }

  }
</script>

<style>
  .van-picker__toolbar {
    font-size: 16px;
  }
</style>
