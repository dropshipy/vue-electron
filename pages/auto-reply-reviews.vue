<script>
import { REVIEW_RATING_OPTIONS } from "~/constants/option.constant";
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      selectedIteration: 1,
      replyMessage: "",
      productName: "",
      selectedRatings: null,
      ratingOptions: REVIEW_RATING_OPTIONS,
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
      return this.$store.getters["loading/getReplyReviews"];
    }
  },
  methods: {
    ...mapMutations({
      setReplyReviews: "loading/setReplyReviews"
    }),
    onSave() {
      this.replyMessage = this.replyMessage.trim();

      if (!this.replyMessage) {
        this.$snackbar.error("Pesan Ulasan tidak boleh kosong");
        return;
      }

      const payload = {
        iteration: this.selectedIteration,
        replyMessage: this.replyMessage,
        ratingComment: this.selectedRatings,
        productName: this.productName,
      };

      console.log("payload", payload);

      electronStore.set("selected-reply-reviews", payload);
      this.$snackbar.success("Berhasil menyimpan konfigurasi");
    },

    async onStart() {
      const context = electronStore.get("selected-reply-reviews");

      if (context) {
        this.setReplyReviews(true);
        await window.electron.ipcRenderer.invoke("process-reply-reviews", context);
        this.setReplyReviews(false);
      } else {
        this.$snackbar.error("Belum ada konfigurasi");
      }
    },
  },
  mounted() {
    const dataSelectedReplyReviews = electronStore.get(
      "selected-reply-reviews"
    );
    if (dataSelectedReplyReviews) {
      this.selectedIteration = dataSelectedReplyReviews.iteration;
      this.replyMessage = dataSelectedReplyReviews.replyMessage;
      this.selectedRatings = dataSelectedReplyReviews.ratingComment;
      this.productName = dataSelectedReplyReviews.productName;
    }
  },
};
</script>

<template>
  <Card>
    <div class="flex items-center gap-2">
      <Icon name="sidebar/auto-reply-reviews" :class="textStyle" />
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

        <Dropdown v-model="selectedRatings" label="Rating Ulasan" placeholder="Pilih rating ulasan"
          :options="ratingOptions" class="mt-3" />

        <div class="flex items-center justify-end mt-9 gap-2.5">
          <Button class="w-full max-w-[140px]" theme="primary-outline" @click="onSave">Simpan</Button>
          <Button class="w-full max-w-[140px]" @click="onStart">
            <Icon v-if="isRun" name="spinner" :size="24" class="animate-spin" :clas="textStyle" />
            <span v-else>Start</span>
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>
