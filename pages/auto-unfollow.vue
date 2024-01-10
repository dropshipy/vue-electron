<script>
export default {
  data() {
    return {
      unfollowCount: null,
      isFollowAll: true,
    }
  },
  methods: {
    processUnfollow() {
      if (this.isFollowAll) {
        window.electron.ipcRenderer.send("process-auto-unfollow", "Semua")
      } else {
        if (!this.unfollowCount) {
          this.$snackbar.error("Masukkan jumlah yang ingin di unfollow jika tidak ingin semuanya")
        } else {
          window.electron.ipcRenderer.send("process-auto-unfollow", this.unfollowCount)
        }
      }
    }
  }
}
</script>

<template>
  <Card class="w-full max-w-[340px] mx-auto">
    <div class="flex items-center gap-2">
      <Icon name="sidebar/auto-unfollow" class="text-primary" />
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

    <Button class="mt-5 w-full" @click="processUnfollow">Start</Button>
  </Card>
</template>