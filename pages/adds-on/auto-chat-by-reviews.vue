<script>
import { AUTO_CHAT_BY_REVIEWS_LINK_STORE_KEY } from "~/constants/store.constant";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      targetLink: null,
      startPoint: 1,
      iteration: 1,
      templateChat: "",
    };
  },
  computed: {
    token() {
      return this.$store.getters["user/getToken"] || {};
    },
    isLoading() {
      return this.$store.getters["user/getLoading"];
    },
  },

  methods: {
    ...mapActions("user", ["getMe"]),
    processGetMe() {
      const endpoint = `${this.$config.apiBaseUrl}/users/token/`;

      const getStorage = JSON.parse(localStorage.getItem("user_info"));

      const url = `${endpoint}${getStorage.id}`;

      this.getMe(url);
    },
    processChat() {
      if (this.token.token > 0) {
        const hasEmptyField =
          !this.targetLink ||
          !this.startPoint ||
          !this.iteration ||
          !this.templateChat;

        if (hasEmptyField) {
          this.$snackbar.error("Silakan isi semua field terlebih dahulu");
          return;
        }

        electronStore.set(AUTO_CHAT_BY_REVIEWS_LINK_STORE_KEY, this.targetLink);

        const context = {
          startPoint: this.startPoint,
          iteration: +this.iteration,
          template: this.templateChat,
        };

        window.electron.ipcRenderer.send(
          "process-auto-chat-by-reviews",
          context
        );
      } else this.$snackbar.error("Silakan isi token terlebih dahulu");
    },
  },
  mounted() {
    this.processGetMe();
    const linkForAutoChatByReviews = electronStore.get(
      AUTO_CHAT_BY_REVIEWS_LINK_STORE_KEY
    );
    if (linkForAutoChatByReviews) {
      this.targetLink = linkForAutoChatByReviews;
    }
  },
};
</script>

<template>
  <div>
    <Card class="w-full max-w-[540px] mx-auto mt-10">
      <div class="flex items-center justify-center gap-2">
        <Icon
          name="sidebar/adds-on/auto-chat-by-reviews"
          class="text-primary"
        />
        <h3 class="text-xl text-dark2 font-bold">Auto Chat Ulasan</h3>
      </div>

      <p class="text-center text-gray-600 mt-2 font-medium">
        Dari Followers Toko
      </p>

      <Textfield
        v-model="targetLink"
        label="Link Produk/Ulasan"
        placeholder="Masukkan link produk/ulasan"
        class="mt-5"
      />
      <Textfield
        v-model="startPoint"
        type="number"
        label="Mulai Dari Ulasan Ke"
        placeholder="Masukkan mulai dari ulasan ke"
        class="mt-3"
      />
      <Textfield
        v-model="iteration"
        type="number"
        label="Total Chat"
        placeholder="Masukkan total chat"
        class="mt-3"
      />
      <Textfield
        v-model="templateChat"
        type="textarea"
        label="Template Chat"
        placeholder="Masukkan template chat"
        input-class="min-h-28"
        :max-height="200"
        class="mt-3"
      />
      <div class="flex gap-5">
        <Button class="w-full mt-7 !cursor-default"
          >Token : {{ !isLoading ? token.token : "..." }}</Button
        >
        <Button class="w-full mt-7" @click="processChat">Start</Button>
      </div>
    </Card>
  </div>
</template>
