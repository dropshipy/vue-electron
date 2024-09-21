<script>
export default {
  computed: {
    cardTheme() {
      if (this.primary) {
        if (this.$config.appName === "tiksender") {
          return "bg-[#FFF8F3] border border-[#F9EDE7]";
        }
        return "bg-[#EFF8EE] border !border-[#FFF0E8]";
      }
    },
  },
  props: {
    primary: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <div
    class="rounded-xl"
    :class="[
      cardTheme,
      {
        'shadow-card bg-white p-5 ': !primary,
      },
    ]"
  >
    <slot />
  </div>
</template>
