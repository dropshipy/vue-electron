<script>
export default {
  data() {
    return {
      isExpanded: true,
      downloadProgress: false,
      progressPercent: 0,
    };
    };
  },
  created() {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info"));
      if (userInfo) {
        this.$store.commit("user/setUserInfo", userInfo);
        this.$store.commit("user/setUserInfo", userInfo);
      } else {
        this.$router.push("/login");
        this.$router.push("/login");
      }
    } catch (error) {
      console.log("Error parsing user info: ", error);
      console.log("Error parsing user info: ", error);
    }
  },
  computed: {
    isSupportSeller() {
      return this.$config.appName === "supportseller";
    },
    logoUrl() {
      const appName = this.$config.appName;
      return require(`~/assets/brand/${appName}-logo.png`);
      // if (appName == 'tiksender')
      //   return require(`~/assets/brand/${appName}-logo-hd.png`);
      // else
      //   return require(`~/assets/brand/${appName}-logo.png`);
    },
  },
  mounted() {
    window.electron.onUpdateAvailable((data) => {
      this.downloadProgress = data;
      if (process.client && window.electron?.onDownloadProgress) {
        window.electron.onDownloadProgress((progress) => {
          this.progressPercent = parseFloat((progress.percent || 0).toFixed(2));

          // if (progress.percent >= 100) {
          //   setTimeout(() => {
          //     this.downloadProgress = false;
          //   }, 3000);
          // }
        });
      }
    });
    window.electron.onUpdateNotAvailable((data) => {
      this.downloadProgress = data;
    });

    const userData = this.$store.getters["user/getUserInfo"];
    const userData = this.$store.getters["user/getUserInfo"];
    if (this.$route.query.from_login) {
      this.$snackbar.success(`Welcome, ${userData?.fullName}`);
      this.$snackbar.success(`Welcome, ${userData?.fullName}`);
    }

    setTimeout(() => {
      const subscriptionStoreData = electronStore.get("account-subscription");
      const subscriptionStoreData = electronStore.get("account-subscription");

      if (!subscriptionStoreData?.email || !subscriptionStoreData?.password) {
        this.$router.replace("/login");
        this.$router.replace("/login");
        return;
      }

      this.fetchUserSubscription();
      this.fetchUserSubscription();
    }, 300);
  },
  methods: {
    async fetchUserSubscription() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          "get-subscription-info"
        );
        console.log("subscriptionInfo: ", resData);
        const resData = await window.electron.ipcRenderer.invoke(
          "get-subscription-info"
        );
        console.log("subscriptionInfo: ", resData);

        if (resData) {
          this.$store.commit("subscription/setSubscriptionInfo", resData.data);
          this.$store.commit("subscription/setSubscriptionInfo", resData.data);
        }
      } catch (error) {
        this.$snackbar.error("Gagal mengambil informasi subscription");
        console.error("Error getting subscription info:", error);
        this.$snackbar.error("Gagal mengambil informasi subscription");
        console.error("Error getting subscription info:", error);
      }
    },
  },
};
    },
  },
};
</script>

<template>
  <div
    v-if="downloadProgress"
    class="w-screen h-screen bg-whitesmoke flex flex-col items-center justify-center gap-1"
  >
    <img
      :src="logoUrl"
      alt="logo"
      class="w-[75px] h-[75px] my-2 animate-wiggle-zoom"
    />
  <div
    v-if="downloadProgress"
    class="w-screen h-screen bg-whitesmoke flex flex-col items-center justify-center gap-1"
  >
    <img
      :src="logoUrl"
      alt="logo"
      class="w-[75px] h-[75px] my-2 animate-wiggle-zoom"
    />
    <span class="text-dark2">Downloading update... {{ progressPercent }}%</span>
    <!-- <div class="w-64 h-4 bg-gray-300 rounded mt-3 overflow-hidden">
      <div class="h-full bg-blue-500 transition-all duration-300 bg-primary" :style="{ width: progressPercent + '%' }">
      </div>
    </div> -->
  </div>

  <div v-else>
    <LayoutSidebar @expanded="isExpanded = $event" />

    <div
      class="transition-all"
      :class="isExpanded ? 'ml-[290px]' : 'ml-[84px]'"
    >
    <div
      class="transition-all"
      :class="isExpanded ? 'ml-[290px]' : 'ml-[84px]'"
    >
      <LayoutNavbar />

      <main
        class="min-h-[calc(100vh-72px)] p-8"
        :class="[isSupportSeller ? 'bg-[#FEEAE4]' : 'bg-light']"
      >
      <main
        class="min-h-[calc(100vh-72px)] p-8"
        :class="[isSupportSeller ? 'bg-[#FEEAE4]' : 'bg-light']"
      >
        <Nuxt />
      </main>
    </div>

    <Snackbar />

    <!-- NOTE change and up version every update build (same as package json) -->
    <span class="fixed bottom-0 right-0 text-xs m-[6px] text-dark3">
      v16.2.36
    </span>
  </div>
</template>
