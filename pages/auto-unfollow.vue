<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      unfollowCount: null,
      isFollowAll: true,
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
      return this.$store.getters["loading/getUnfollow"];
    }
  },
  methods: {
    ...mapMutations({
      setUnfollow: "loading/setUnfollow"
    }),
    async processUnfollow() {
      this.setUnfollow(true)
      if (this.isFollowAll) {
        await window.electron.ipcRenderer.invoke("process-auto-unfollow", "Semua");
      } else {
        if (!this.unfollowCount) {
          this.$snackbar.error(
            "Masukkan jumlah yang ingin di unfollow jika tidak ingin semuanya"
          );
        } else {
          await window.electron.ipcRenderer.invoke(
            "process-auto-unfollow",
            this.unfollowCount
          );
        }
      }
      this.setUnfollow(false)
    },
  },
};
</script>

<template>
  <Card class="w-full max-w-[340px] mx-auto">
    <div class="flex items-center gap-2">
      <Icon name="sidebar/auto-unfollow" :class="textStyle" />
      <h3 class="text-xl text-dark2 font-bold">Auto Unfollow</h3>
    </div>

    <Toggle label="Semua" v-model="isFollowAll" class="mt-3" />

    <div v-if="!isFollowAll" class="mt-3">
      <Textfield v-model="unfollowCount" type="number" />
      <div class="flex items-center gap-1 text-primary mt-3">
        <Icon name="info" />
        <p class="italic">Jumlah yang ingin di unfollow</p>
      </div>
    </div>

    <Button class="mt-5 w-full" @click="processUnfollow" :is-disabled="isRun">
      <Icon v-if="isRun" name="spinner" :size="24" class="animate-spin" :clas="textStyle" />
      <span v-else>Start</span>
    </Button>
  </Card>
</template>
