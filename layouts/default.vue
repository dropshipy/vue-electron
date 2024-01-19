<script>
export default {
  data() {
    return {
      isExpanded: true
    }
  },
  created() {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info'));
      if (userInfo) {
        this.$store.commit('user/setUserInfo', userInfo);
      } else {
        this.$router.push('/login');
      }
    } catch (error) {
      console.log('Error parsing user info: ', error)
    }
  },
  mounted() {
    const userData = this.$store.getters['user/getUserInfo'];
    if (this.$route.query.from_login) {
      this.$snackbar.success(`Welcome, ${userData?.fullName}`)
      this.$router.replace({ path: this.$route.path, query: {} });
    }

    const subscriptionStoreData = electronStore.get('account-subscription');
    if (!subscriptionStoreData?.email || !subscriptionStoreData?.password) {
      this.$router.replace('/login');
      return;
    }

    this.fetchUserSubscription()
  },
  methods: {
    async fetchUserSubscription() {
      try {
        const resData = await window.electron.ipcRenderer.invoke("get-subscription-info");
        if (resData) {
          this.$store.commit('subscription/setSubscriptionInfo', resData.data);
        }
      } catch (error) {
        this.$snackbar.error('Gagal mengambil informasi subscription');
        console.error('Error getting subscription info:', error);
      }
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