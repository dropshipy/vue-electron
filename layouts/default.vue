<script>
export default {
  data() {
    return {
      isExpanded: true
    }
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    if (userInfo) {
      this.$store.commit('user/setUserInfo', userInfo);
    } else {
      this.$router.push('/login');
    }
  },
  mounted() {
    const userData = this.$store.getters['user/getUserInfo'];
    if (this.$route.query.from_login) {
      this.$snackbar.success(`Welcome, ${userData?.fullName}`)
      this.$router.replace({ path: this.$route.path, query: {} });
    }
  }
}
</script>

<template>
  <div>
    <LayoutSidebar @expanded="isExpanded = $event" />

    <div class="transition-all" :class="isExpanded ? 'ml-[290px]' : 'ml-[84px]'">
      <LayoutNavbar />

      <main class="bg-light min-h-[calc(100vh-72px)] p-8">
        <Nuxt />
      </main>
    </div>

    <Snackbar />
  </div>
</template>