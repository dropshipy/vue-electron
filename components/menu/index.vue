<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: Number,
      default: 180
    }
  },

  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },

  methods: {
    handleClickOutside() {
      this.isShow = false
      this.$emit('close', true)
    }
  }
}
</script>

<template>
  <div v-click-outside="handleClickOutside" class="absolute top-10 right-0 z-[9]">
    <Transition name="menu">
      <div v-if="isShow" class="menu-content bg-white drop-shadow z-10 rounded-lg py-2 overflow-y-auto"
        :class="fullWidth ? 'w-full' : 'w-max'" :style="{ maxHeight: `${maxHeight}px` }">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.menu-enter-active,
.menu-leave-active {
  @apply transition-all;
}

.menu-enter,
.menu-leave-to {
  @apply opacity-0 scale-75;
}
</style>