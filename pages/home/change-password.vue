<script>
export default {
  data() {
    return {
      currentPassword: "",
      isShowCurrentPassword: false,
      newPassword: "",
      isShowNewPassword: false,
      breadcrumbItems: [
        { name: "Beranda", link: "/home" },
        { name: "Ubah Password", link: "/home/change-password" },
      ],
      isHandlePassword: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"] || {};
    },
  },
  methods: {
    async onConfirm() {
      try {
        this.isHandlePassword = true;
        const { currentPassword, newPassword } = this;

        if (!currentPassword || !newPassword) {
          this.$snackbar.error("Form tidak lengkap");
        } else {
          const payload = {
            email: this.userInfo.email,
            password: currentPassword,
            newPassword,
          };
          const response = await this.$axios.patch(
            `${this.$config.apiBaseUrl}/users/password`,
            payload
          );

          if (response.status === 201) {
            const accountSubscription =
              electronStore.get("account-subscription") || {};
            electronStore.set("account-subscription", {
              ...accountSubscription,
              email: payload.email,
              password: payload.newPassword,
            });

            this.$snackbar.success("Password berhasil diubah");
            this.$router.push("/home");
          } else {
            this.$snackbar.error(
              response.data?.error || response.data?.message
            );
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.isHandlePassword = false;
      }
    },
  },
};
</script>

<template>
  <div class="w-full max-w-lg mx-auto">
    <Breadcrumbs :items="breadcrumbItems" />

    <Card class="mt-4">
      <h1 class="text-[26px] font-bold">Ubah Password</h1>
      <p class="mt-2">Silakan lengkapi data berikut ini.</p>

      <Textfield
        :value="userInfo.email"
        label="Email"
        placeholder="Masukkan email kamu disini"
        readonly
        class="mt-7"
      />

      <Textfield
        v-model="currentPassword"
        label="Password Sekarang"
        placeholder="Masukkan password saat ini"
        class="mt-4"
        :type="isShowCurrentPassword ? 'text' : 'password'"
        @click:icon="isShowCurrentPassword = !isShowCurrentPassword"
        :icon="isShowCurrentPassword ? 'eye-show' : 'eye-hide'"
      />

      <Textfield
        v-model="newPassword"
        label="Password Baru"
        placeholder="Masukkan password baru disini"
        class="mt-4"
        :type="isShowNewPassword ? 'text' : 'password'"
        @click:icon="isShowNewPassword = !isShowNewPassword"
        :icon="isShowNewPassword ? 'eye-show' : 'eye-hide'"
      />

      <Button
        class="mt-11 w-full !text-base"
        @click="onConfirm"
        :is-disabled="isHandlePassword"
        >Simpan</Button
      >
    </Card>
  </div>
</template>
