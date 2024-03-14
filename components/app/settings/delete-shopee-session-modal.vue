<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isShow: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    onConfirm() {
      electronStore.delete("cookies-shopee-account");
      this.isShow = false;
      this.$snackbar.success("Berhasil menghapus sesi login akun shopee kamu");
    },
  },
}
</script>

<template>
  <Modal v-model="isShow" title="Hapus Sesi Login Shopee" @confirm="onConfirm" confirm-btn-text="Hapus">
    <div class="mt-5 mb-10">
      Apakah kamu ingin menghapus info sesi login pada akun shopee kamu?
    </div>
  </Modal>
</template>