<template>
  <div class="flex items-center justify-center min-h-screen p-4 wrapper-login">
    <div
      class="w-full max-w-[480px] mx-auto h-max bg-white px-5 pb-8 pt-5 rounded-lg space-y-4"
    >
      <img
        :src="logoUrl"
        alt="logo"
        class="w-[120px] h-auto absolute left-10 top-10"
      />

      <h1 :style="titleStyle" class="text-[26px] font-semibold leading-none">
        Login
      </h1>

      <p>Silakan masuk ke Akun Anda.</p>

      <Textfield
        v-model="email"
        label="Email"
        type="email"
        placeholder="Masukkan email kamu disini"
      />

      <Textfield
        v-model="password"
        label="Password"
        placeholder="Masukkan password kamu disini"
        :type="isShowPassword ? 'text' : 'password'"
        @click:icon="isShowPassword = !isShowPassword"
        :icon="isShowPassword ? 'eye-show' : 'eye-hide'"
      />

      <Button @click="handleLogin" class="!mt-10 w-full hover:opacity-60"
        >Login</Button
      >
    </div>
  </div>
</template>

<style scoped>
.wrapper-login {
  background-image: linear-gradient(
    to top,
    #b6eeaf 0%,
    #f0feee 99%,
    #f0feee 100%
  );
}
</style>

<script>
export default {
  layout: "blank",
  data() {
    return {
      email: "",
      password: "",
      isShowPassword: false,
    };
  },
  computed: {
    titleStyle() {
      if (this.$config.appName === "tiksender") {
        return {
          color: "#EE3A31",
        };
      }
      return {
        color: "#2D2D2D",
      };
    },
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
        const response = await this.$axios.post(
          `${this.$config.apiBaseUrl}/users/authenticate`,
          payload
        );
        if (response?.status === 200) {
          window.electron.ipcRenderer.send(
            "post-cookies-shopee-tools",
            payload
          );
          const userData = response.data.user;

          localStorage.setItem("user_info", JSON.stringify(userData));

          const accountSubscription =
            electronStore.get("account-subscription") || {};
          electronStore.set("account-subscription", {
            ...accountSubscription,
            ...payload,
          });

          setTimeout(() => {
            this.$router.push("/?from_login=true");
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
  },
};
</script>
