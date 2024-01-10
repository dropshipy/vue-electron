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
      // redirect to login page if user is not logged in
      // this.$router.push('/login');
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