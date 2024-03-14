<template>
  <div class="flex items-center justify-center min-h-screen p-4 wrapper-login">
    <div class="w-full max-w-[480px] mx-auto h-max bg-white px-5 pb-8 pt-5 rounded-lg space-y-4">
      <img :src="logoUrl" alt="logo" class="w-[120px] h-auto absolute left-10 top-10" />

      <h1 class="text-[26px] text-primary font-semibold leading-none">
        Login
      </h1>

      <Textfield v-model="email" label="Email" type="email" placeholder="Masukkan email kamu disini" />

      <Textfield v-model="password" label="Password" placeholder="Masukkan password kamu disini"
        :type="isShowPassword ? 'text' : 'password'" @click:icon="isShowPassword = !isShowPassword"
        :icon="isShowPassword ? 'eye-show' : 'eye-hide'" />

      <Button @click="handleLogin" class="!mt-10 w-full hover:opacity-60">Login</Button>
    </div>
  </div>
</template>

<style scoped>
.wrapper-login {
  background-image: linear-gradient(to top,
      #f3e7e9 0%,
      #e3eeff 99%,
      #e3eeff 100%);
}
</style>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      email: "",
      password: "",
      isShowPassword: false,
    }
  },
  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        this.$snackbar.error("Harap isi semua field");
        return;
      }

      const payload = {
        email: this.email,
        password: this.password,
      };
      try {
        window.electron.ipcRenderer.send(
          "post-cookies-shopee-tools",
          payload
        );
        const response = await this.$axios.post(
          `${this.$config.apiBaseUrl}/users/authenticate`,
          payload
        );
        if (response?.status === 200) {
          const userData = response.data.user;

          localStorage.setItem("user_info", JSON.stringify(userData));

          const accountSubscription = electronStore.get("account-subscription") || {};
          electronStore.set("account-subscription", {
            ...accountSubscription,
            ...payload
          });

          setTimeout(() => {
            this.$router.push('/?from_login=true')
          }, 1000);
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.$snackbar.error("Form tidak lengkap");
        } else if (error.response?.status === 403) {
          this.$snackbar.error("Email atau password yang anda masukkan salah");
        }
      }
    },
  },
  computed: {
    logoUrl() {
      const appName = this.$config.appName;
      return require(`~/assets/brand/${appName}.png`);
    },
  }
}
</script>
