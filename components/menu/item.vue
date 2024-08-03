<script>
export default {
  computed: {
    hoverStyle() {
      if (this.$config.appName === "tiksender") {
        return "hover:bg-primary ";
      }
      return "hover:bg-[#00AC01]";
    },
  },
};
</script>

<template>
  <div
    v-on="$listeners"
    :class="hoverStyle"
    class="menu-item flex items-center gap-2 cursor-pointer py-1.5 px-4 hover:bg-opacity-[8%]"
  >
    <slot />
  </div>
</template>
