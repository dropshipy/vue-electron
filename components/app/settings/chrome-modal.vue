<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        isChromium: true,
        browserPath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      },
    };
  },
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  mounted() {
    this.getSelectedBrowser();
  },
  methods: {
    onConfirm() {
      electronStore.set("browser-choice", this.form);
      this.$snackbar.success("Opsi berhasil disimpan");
      this.isShow = false;
    },
    getSelectedBrowser() {
      const getSelectedBrowser = electronStore.get("browser-choice");
      if (getSelectedBrowser) {
        this.form = {
          ...getSelectedBrowser,
        };
      }
    },
  },
};
</script>

<template>
  <Modal v-model="isShow" title="Akun Tiktok" @confirm="onConfirm">
    <div class="mt-5 mb-10 space-y-3">
      <label class="block cursor-pointer">
        <span>
          <input
            v-model="form.isChromium"
            :value="true"
            type="radio"
            name="browser-option"
            id="browser-option-chromium"
            class="mt-0.5 inline-block"
          />
          Chromium
        </span>
      </label>
      <label class="block cursor-pointer">
        <span>
          <input
            v-model="form.isChromium"
            :value="false"
            type="radio"
            name="browser-option"
            id="browser-option-chrome"
            class="mt-0.5 inline-block"
          />
          Chrome
        </span>
      </label>
      <div v-if="!form.isChromium">
        <Textfield
          v-model="form.browserPath"
          label="Path Chrome"
          placeholder="Masukkan path chrome kamu disini"
        />
      </div>
    </div>
  </Modal>
</template>
