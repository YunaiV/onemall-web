<template>
    <div>
      <headerNav title="手机号登录"/>
      <div>
          <div style="padding-top: 70px;">
            <van-cell-group>
                <van-field placeholder="请输入手机号" @input="inputMobile"/>
							  <van-field center placeholder="请输入短信验证码" @input="inputCode">
									<van-button slot="button" size="small" type="primary" @click="sendCode">发送验证码</van-button>
                </van-field>
            </van-cell-group>
            <div style="margin: 10px;">
                <van-button size="large" type="primary" style="height: 45px;line-height:45px;" @click="submit">登录</van-button>
            </div>
              <van-panel title="友情提示">
                  <van-cell>1. 新注册的手机号验证后自动创建账户</van-cell>
                  <van-cell>2. 默认验证码是 9999</van-cell>
              </van-panel>
          </div>
      </div>

			<van-popup v-model="humanIdentificationVisible">
				<van-cell-group>
					<van-cell>人机识别</van-cell>
					<van-cell>扫码下方二维码，回复【前台】</van-cell>
					<img src="http://static.iocoder.cn/images/common/erweima/javajj.png" height="100%" width="100%" >
					<van-field left-icon="smile-o" label="验证码" center placeholder="请输入验证码" @input="inputHumanIdentificationFormCode">
						<van-button slot="button" size="small" type="primary" @click="handleHumanIdentificationFormSubmit">确认</van-button>
					</van-field>
				</van-cell-group>
			</van-popup>
		</div>
</template>

<script>
import { passportSendSmsCode, passportLoginBySms } from '../../api/user';
import { Dialog } from 'vant';
import { setLoginToken } from '../../utils/cache';

export default {

  data() {
    return {
      mobile: '',
      code: '',

			// 人机识别
      humanIdentificationVisible: false,
      humanIdentificationForm: {
        code: undefined
      }
    }
  },

  methods: {
    inputMobile: function (value) {
      this.mobile = value;
    },
    inputCode: function (value) {
      this.code = value;
    },
    sendCode: function() {
      if (!this.mobile || this.mobile.length !== 11) {
        Dialog.alert({
          title: '系统提示',
          message: '手机号码不正确',
        });
        return;
      }
      let response = passportSendSmsCode(this.mobile, 1); // TODO 优化点：magic number 后续搞一搞
      response.then(data => {
        Dialog.alert({
          title: '系统提示',
          message: '发送验证码成功',
        });
      });
    },
    submit: function () {
      // 人机识别逻辑，第一个版本
      if (localStorage.getItem('human') !== 'true') {
        this.humanIdentificationVisible = true
        return
      }
      // 表单提交
      let that = this;
      let response = passportLoginBySms(this.mobile, this.code);
      response.then(data => {
        setLoginToken(data.accessToken, data.refreshToken);
        Dialog.alert({
          title: '系统提示',
          message: '登陆成功',
          beforeClose: function (action, done) {
            done();
            // TODO 芋艿，简单的 callback 后续完善
            let redirect = that.$route.query.redirect || '/user/index';
            that.$router.push(redirect);
          }
        });
      });
    },
    inputHumanIdentificationFormCode: function (value) {
      this.humanIdentificationForm.code = value;
    },
    // 表单提交
    handleHumanIdentificationFormSubmit() {
      // 关闭表单
      this.humanIdentificationVisible = true
      // 验证 code 码
      if (this.humanIdentificationForm.code !== 'yutou') {
        alert('验证码不正确')
        return
      }
      localStorage.setItem('human', 'true')
      this.humanIdentificationVisible = false
    },
  }

}
</script>

<style>

</style>
