<template>
<main>
  <div
    id="app"
    class="w-full min-h-screen pt-[110px]"
    :class="[flags.linkCreatpr == 'login-spt'  ? 'wrapper-login': 'wrapper-login-supp-seller' ]"
  >
    <div
      class="w-full max-w-[480px] mx-auto h-max bg-white px-5 pb-8 pt-5 rounded-lg space-y-4"
    >
      <img
        :src="`../assets/brand/${flags.logo}`"
        alt="shopee-power-tools"
        class="w-[120px] h-auto absolute left-10"
        :class="[flags.linkCreator == 'login-spt'  ? 'top-2': 'top-10']"
      />
      <div>
        <h1 class="text-[26px] text-[#f3694a] font-semibold leading-none">
          Login
        </h1>
      </div>
      <section class="w-full text-base text-[#2D2D2D]">
        <label for="email" class="block pb-1">Email</label>
        <input
          placeholder="Masukkan email kamu disini"
          id="email"
          type="email"
          v-model="email"
          class="text-sm border w-full border-[#A0A3BD66] focus:outline-[#f79e44] py-2.5 px-2 rounded-[6px] block"
        />
      </section>
      <section>
        <label for="password" class="block pb-1">Password</label>
        <div class="relative">
          <input
            placeholder="Masukkan password kamu disini"
            id="password"
            :type="typePaswword"
            v-model="password"
            class="text-sm border w-full border-[#A0A3BD66] focus:outline-[#f79e44] py-2.5 px-2 rounded-[6px] block"
          />
          <img
            :src="[typePaswword == 'password' ? '../assets/icons/eye-hide.svg' : '../assets/icons/eye-show.svg']"
            class="w-7 h-7 absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
            @click="togglePassword"
          />
        </div>
      </section>
      <button
        @click="handleLogin "
        class="w-full font-bold text-white rounded-lg py-3 !mt-10 hover:opacity-80"
        :class="[flags.linkCreator == 'login-spt'  ? 'bg-gradient-to-r from-[#f79e44] to-[#f3694a]': 'bg-gradient-to-r from-[#FF6E79]/70 to-[#FF6E79]']"
      >
        Login
      </button>
    </div>
  </div>
</main>
</template>

<script>
export default {
  data () {
    return {
      email: "",
      password: "",
      typePaswword: "password",
      baseUrl: process.env.NUXT_ENV_API_BASE_URL,
      flags: {},
    }
  },
  mounted() {
    electronStore.set("activeTab", "home");
    this.flags = this.getFlags();
  },
  methods: {
    getFlags() {
      // shopee-power-tools || support-seller
      const flags = "shopee-power-tools";
      const result = {};
      // logo
      if (flags == "shopee-power-tools") {
        result.linkCreator = "login-spt";
        result.logo = "spt.png";
      } else {
        result.linkCreator = "login-spt-ss";
        result.logo = "support-seller.png";
      }
      return result;
    },
    togglePassword() {
      this.typePaswword == "password"
        ? (this.typePaswword = "text")
        : (this.typePaswword = "password");
    },
    async handleLogin() {
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
          `${this.baseUrl}/shopee-users/authenticate`,
          payload
        );
        if (response?.status === 200) {
          localStorage.setItem(
            "user_info",
            JSON.stringify(response.data.user)
          );

          this.$toasted.show(
            `<i class="fas  fa-check"></i> Welcome, ${response.data.user.fullName}`,
            {
              icon: "",
              position: "top-right",
              duration: 3000,
              type: "success",
            }
          );

          setTimeout(() => {
            this.$router.push("/");
          }, 500);
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.$toasted.show(
            '<i class="fas  fa-exclamation-circle"></i> Form tidak lengkap',
            {
              icon: "",
              position: "top-right",
              duration: 3000,
              type: "error",
            }
          );
        } else if (error.response?.status === 403) {
          this.$toasted.show(
            '<i class="fas  fa-exclamation-circle"></i>Email atau password yang anda masukkan salah',
            {
              icon: "",
              position: "top-right",
              duration: 3000,
              type: "error",
            }
          );
        }
      }
    },
  },
}
</script>
