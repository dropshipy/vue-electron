<script>
import { SHOPEE_ACCOUNT_STORE_KEY } from '~/constants/store.constant'
import { SHOPEE_LOGIN_METHOD } from "~/constants/shopee.constant";

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      contact: '',
      password: '',
      isLoginWithQRCode: true,
      isShowPassword: false,
    }
  },
  computed: {
    isShow: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    onConfirm() {
      const { contact, password, isLoginWithQRCode } = this;
      if (!contact || !password) {
        this.$snackbar.error("Form tidak lengkap");
      } else {
        const payload = {
          contact,
          password,
          loginMethod: isLoginWithQRCode ? SHOPEE_LOGIN_METHOD.QR_CODE : SHOPEE_LOGIN_METHOD.CONTACT
        }
        electronStore.set(SHOPEE_ACCOUNT_STORE_KEY, payload);
        this.$snackbar.success("Berhasil menyimpan informasi akun shopee");
        this.isShow = false
      }
    },
    getShopeeAccount() {
      const data = electronStore.get(SHOPEE_ACCOUNT_STORE_KEY);
      if (data) {
        this.contact = data.contact;
        this.password = data.password;
        this.isLoginWithQRCode = data.loginMethod === SHOPEE_LOGIN_METHOD.QR_CODE;
      }
    },
    reset() {
      this.contact = '';
      this.password = '';
      this.isLoginWithQRCode = true;
    }
  },
  watch: {
    isShow(val) {
      if (val) {
        this.getShopeeAccount()
      }
    },
  }
}
</script>

<template>
  <Modal v-model="isShow" title="Akun Shopee" @confirm="onConfirm" @close="reset">
    <div class="mt-5 mb-10 space-y-3">
      <Textfield v-model="contact" label="No. Handphone/Username/Email"
        placeholder="Masukkan no.handphone/username/email kamu disini" />
      <Textfield v-model="password" label="Password" placeholder="Masukkan password kamu disini"
        :type="isShowPassword ? 'text' : 'password'" @click:icon="isShowPassword = !isShowPassword"
        :icon="isShowPassword ? 'eye-show' : 'eye-hide'" />
      <Toggle v-model="isLoginWithQRCode" label="Login dengan QR Code" />
    </div>
  </Modal>
</template>