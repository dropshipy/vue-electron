<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      storeLink: null,
      followCount: null,
    };
  },
  computed: {
    textStyle() {
      if (this.$config.appName === "tiksender") {
        return "text-primary";
      }
      return "text-[#00AC01]";
    },
    isRun() {
      return this.$store.getters["loading/getFollowByShop"];
    }
  },
  methods: {
    ...mapMutations({
      setFollowByShop: "loading/setFollowByShop"
    }),
    async processFollow() {
      if (!this.storeLink || !this.followCount) {
        this.$snackbar.error("Pastikan data sudah diisi semua");
      } else {
        electronStore.set("link-auto-follow", this.storeLink);
        this.setFollowByShop(true)
        await window.electron.ipcRenderer.invoke(
          "process-auto-follow",
          this.followCount
        );
        this.setFollowByShop(false)
      }
    },
  },
  mounted() {
    const linkForAutoFollow = electronStore.get("link-auto-follow");
    if (linkForAutoFollow) {
      this.storeLink = linkForAutoFollow;
    }
  },
};
</script>

<template>
  <Card class="w-full max-w-[540px] mx-auto">
    <div class="flex items-center justify-center gap-2">
      <Icon name="sidebar/auto-follow" :class="textStyle" />
      <h3 class="text-xl text-dark2 font-bold">Auto Follow</h3>
    </div>

    <p class="text-center text-gray-600 mt-2 font-medium">
      Dari Followers Toko
    </p>

    <Textfield v-model="storeLink" label="Link Produk" placeholder="Masukkan link produk" class="mt-5" />
    <Textfield v-model="followCount" type="number" label="Jumlah" placeholder="Masukkan jumlah yang ingin difollow"
      class="mt-3" />
    <Button class="w-full mt-7" @click="processFollow">
      <Icon v-if="isRun" name="spinner" :size="24" class="animate-spin" :clas="textStyle" />
      <span v-else>Start</span>
    </Button>
  </Card>
</template>
