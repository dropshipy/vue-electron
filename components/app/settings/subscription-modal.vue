<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      email: '',
      password: '',
      subscription: '',
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
      const { email, password, subscription } = this;
      if (!email || !password || !subscription) {
        this.$snackbar.error("Form tidak lengkap");
      } else {
        const payload = {
          email,
          password,
          subscription
        }
        electronStore.set("account-subscription", payload);
        this.$snackbar.success("Berhasil menyimpan info akun");
        this.isShow = false
      }
    },
    getAccountSubscription() {
      const data = electronStore.get("account-subscription");
      if (data) {
        this.email = data.email;
        this.password = data.password;
        this.subscription = data.subscription;
      }
    },
    reset() {
      this.email = '';
      this.password = '';
      this.subscription = '';
    }
  },
  watch: {
    isShow(val) {
      console.log("is show: ", val)
      if (val) {
        this.getAccountSubscription()
      }
    }
  }
}
</script>

<template>
  <Modal v-model="isShow" title="Akun Shopee Power Tools" @confirm="onConfirm" @close="reset">
    <div class="mt-5 mb-10 space-y-3">
      <Textfield v-model="email" label="Email" placeholder="Masukkan email kamu disini" />
      <Textfield v-model="password" label="Password" placeholder="Masukkan password kamu disini"
        :type="isShowPassword ? 'text' : 'password'" @click:icon="isShowPassword = !isShowPassword"
        :icon="isShowPassword ? 'eye-show' : 'eye-hide'" />
      <Textfield v-model="subscription" label="Subscription Code" placeholder="Masukkan subscription code kamu disini" />
    </div>
  </Modal>
</template>