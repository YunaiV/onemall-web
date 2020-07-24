<template>
  <div>

    <headerNav title="我的地址"/>
    <van-address-list
      v-model="chosenAddressId"
      :class="isSelect?'':'hideselect'"
      :list="list"
      @add="onAdd"
      @edit="onEdit"
      @select="onSelect"
    />
  </div>
</template>

<script>

  import {listUserAddressList} from "../../../api/user.js";
  import { AddressList } from 'vant';
  import eventBus from '../../eventBus';
  import orderStore from '../../../store/order'

  export default {
    components: {
      [AddressList.name]: AddressList,
    },
    data() {
      return {
        chosenAddressId: -1,
        isSelect: false,
        list: [],
      }
    },

    methods: {
      onAdd() {
        this.$router.push('/user/address/edit')
      },

      onEdit(item, index) {
        this.$router.push('/user/address/edit?id=' + item.id);
      },
      onSelect(item, index) {
        if (!this.isSelect) {
          return;
        }
        this.$store.commit('changeAddressData', {
          ...item
        });
        this.$router.go(-1);
      }
    },
    created: function () {
      this.chosenAddressId = this.$route.query.id;
      this.isSelect = this.$route.query.id > 0;
      listUserAddressList().then(response => {
        this.list = response.map(item => {
          // 如果该收件地址是默认的，则进行默认选中
					// TODO 优化点：感觉有点点问题 = =
          if (item.type === 1) {
            this.chosenAddressId = item.id;
          }

          // convert data
          return {
            id: item.id,
            name: item.name,
            tel: item.mobile,
            areaCode: item.areaCode, // TODO 需要拼接好给前端
            address: item.detailAddress,
            isDefault: item.type === 1
          }
        });
      })
    },
    store: orderStore,
  }
</script>

<style lang="less">
  .hideselect {
    .van-radio__input {
      display: none;
    }
  }
</style>
