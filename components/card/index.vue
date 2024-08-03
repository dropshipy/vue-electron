<script>
export default {
  computed: {
    cardTheme() {
      if (this.primary) {
        if (this.$config.appName === "tiksender") {
          return "bg-[#FFF8F3] border border-[#F9EDE7]";
        }
        return "bg-[#60BB55]/10 border border-[#60BB55]/[15%]";
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
    class="rounded-[10px]"
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
