<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      productLink: null,
      startPoint: null,
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
      return this.$store.getters["loading/getFollowByReviews"];
    }
  },
  methods: {
    ...mapMutations({
      setFollowByReviews: "loading/setFollowByReviews"
    }),
    async processFollow() {
      if (!this.productLink || !+this.startPoint || !+this.followCount) {
        this.$snackbar.error("Pastikan data sudah diisi semua");
      } else {
        electronStore.set("link-auto-follow-by-reviews", this.productLink);
        const payload = {
          startPointFollowByReviews: +this.startPoint,
          iterationFollowByReviews: +this.followCount,
        };
        this.setFollowByReviews(true)
        await window.electron.ipcRenderer.invoke(
          "process-auto-follow-by-reviews",
          payload
        );
        this.setFollowByReviews(false)
      }
    },
  },
  mounted() {
    const linkForAutoFollowByReviews = electronStore.get(
      "link-auto-follow-by-reviews"
    );
    if (linkForAutoFollowByReviews) {
      this.productLink = linkForAutoFollowByReviews;
    }
  },
};
</script>

<template>
  <Card class="w-full max-w-[540px] mx-auto">
    <div class="flex items-center justify-center gap-2">
      <Icon name="sidebar/auto-follow-by-reviews" :class="textStyle" />
      <h3 class="text-xl text-dark2 font-bold">Auto Follow</h3>
    </div>

    <p class="text-center text-gray-600 mt-2 font-medium">Dari Ulasan Produk</p>

    <Textfield v-model="productLink" label="Link Produk/Ulasan" placeholder="Masukkan link produk/ulasan"
      class="mt-5" />
    <Textfield v-model="startPoint" type="number" label="Mulai Dari Ulasan Ke"
      placeholder="Masukkan mulai dari ulasan ke" class="mt-3" />
    <Textfield v-model="followCount" type="number" label="Total Follow" placeholder="Masukkan total follow"
      class="mt-3" />
    <Button class="w-full mt-7" @click="processFollow">
      <Icon v-if="isRun" name="spinner" :size="24" class="animate-spin" :clas="textStyle" />
      <span v-else>Start</span>
    </Button>
  </Card>
</template>
