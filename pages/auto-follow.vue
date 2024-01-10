<script>
export default {
  data() {
    return {
      storeLink: null,
      followCount: null,
    }
  },
  methods: {
    processFollow() {
      if (!this.storeLink || !this.followCount) {
        this.$snackbar.error("Pastikan data sudah diisi semua")
      } else {
        electronStore.set("link-auto-follow", this.storeLink);
        window.electron.ipcRenderer.send("process-auto-follow", this.followCount)
      }
    }
  }
}
</script>

<template>
  <Card class="w-full max-w-[540px] mx-auto">
    <div class="flex items-center justify-center gap-2">
      <Icon name="sidebar/auto-follow" class="text-primary" />
      <h3 class="text-xl text-dark2 font-bold">Auto Follow</h3>
    </div>

    <p class="text-center text-gray-600 mt-2 font-medium">Dari Followers Toko</p>

    <Textfield v-model="storeLink" label="Link Toko" placeholder="Masukkan link toko" class="mt-5" />
    <Textfield v-model="followCount" type="number" label="Jumlah" placeholder="Masukkan jumlah yang ingin difollow"
      class="mt-3" />
    <Button class="w-full mt-7" @click="processFollow">Start</Button>
  </Card>
</template>