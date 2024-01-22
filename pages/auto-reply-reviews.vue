<script>
export default {
  data() {
    return {
      selectedIteration: 1,
      replyMessage: '',
      productName: '',
      selectedRatings: [],
      ratings: {
        left: ['Semua', '5 Bintang', '4 Bintang'],
        right: ['3 Bintang', '2 Bintang', '1 Bintang'],
      }
    }
  },
  methods: {
    onSave() {
      this.replyMessage = this.replyMessage.trim()

      if (!this.replyMessage) {
        this.$snackbar.error("Pesan Ulasan tidak boleh kosong")
        return;
      }

      const payload = {
        iteration: this.selectedIteration,
        replyMessage: this.replyMessage,
        ratingComment: this.selectedRatings,
        productName: this.productName
      }

      console.log('payload', payload)

      electronStore.set("selected-reply-reviews", payload);
      this.$snackbar.success("Berhasil menyimpan konfigurasi")
    },

    onStart() {
      const context = electronStore.get("selected-reply-reviews");

      if (context) {
        window.electron.ipcRenderer.send("process-reply-reviews", context)
      } else {
        this.$snackbar.error("Belum ada konfigurasi")
      }
    },
  },
  mounted() {
    const dataSelectedReplyReviews = electronStore.get("selected-reply-reviews");
    if (dataSelectedReplyReviews) {
      this.selectedIteration = dataSelectedReplyReviews.iteration
      this.replyMessage = dataSelectedReplyReviews.replyMessage
      this.selectedRatings = dataSelectedReplyReviews.ratingComment
      this.productName = dataSelectedReplyReviews.productName
    }
  }
}
</script>

<template>
  <Card>
    <div class="flex items-center gap-2">
      <Icon name="sidebar/auto-chat-creator" class="text-primary" />
      <h3 class="text-xl text-dark2 font-bold">Balas Ulasan Otomatis</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3">
      <div>
        <h6 class="text-gray-500 font-medium">Konfigurasi Bot Automasi</h6>
        <Textfield v-model="selectedIteration" label="Jumlah Balas Ulasan" type="number"
          placeholder="Masukkan jumlah balas ulasan" class="mt-3" />

        <Textfield v-model="replyMessage" label="Pesan Ulasan" placeholder="Masukkan pesan ulasan" type="textarea"
          input-class="min-h-24" :max-height="200" class="mt-3" />
      </div>

      <div>
        <h6 class="text-gray-500 font-medium">Filter Ulasan (Opsional)</h6>

        <Textfield v-model="productName" label="Nama Produk" placeholder="Masukkan nama produk" class="mt-3" />

        <h6 class="text-[#2D2D2D] my-3">Rating Ulasan</h6>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div class="space-y-3">
            <div v-for="(rating, i) in ratings.left" :key="i" class="flex items-center gap-2">
              <input v-model="selectedRatings" type="checkbox" :value="rating" :id="`checkbox-${rating}`"
                class="accent-primary w-4 h-4" />
              <label :for="`checkbox-${rating}`">{{ rating }}</label>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="(rating, i) in ratings.right" :key="i" class="flex items-center gap-2">
              <input v-model="selectedRatings" type="checkbox" :value="rating" :id="`checkbox-${rating}`"
                class="accent-primary w-4 h-4" />
              <label :for="`checkbox-${rating}`">{{ rating }}</label>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end mt-9 gap-2.5">
          <Button class="w-full max-w-[140px]" theme="primary-outline" @click="onSave">Simpan</Button>
          <Button class="w-full max-w-[140px]" @click="onStart">Start</Button>
        </div>
      </div>
    </div>
  </Card>
</template>