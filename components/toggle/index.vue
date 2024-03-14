<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    isChecked: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>

<template>
  <label class="flex items-center gap-2 w-max cursor-pointer">
    <div class="flex items-center p-[2px] w-12 h-6 bg-gray-300 rounded-3xl" :class="{ '!bg-primary': value }">
      <input type="checkbox" class="hidden" v-model="isChecked" />
      <div class="bg-white h-5 w-5 rounded-full transition-all" :class="{ 'translate-x-6': value }">
      </div>
    </div>

    <p class="text-base transition-all text-dark" :class="{ '!text-primary': value }">
      {{ label }}
    </p>
  </label>
</template>

<style scoped></style>