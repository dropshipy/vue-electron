<script>
export default {
  props: {
    primary: {
      type: Boolean,
      default: false
    },
  },
}
</script>

<template>
  <div class="rounded-[10px]" :class="{
    'shadow-card bg-white p-5 ': !primary,
    'bg-[#FFF8F3] border border-[#F9EDE7]': primary
  }">
    <slot />
  </div>
</template>