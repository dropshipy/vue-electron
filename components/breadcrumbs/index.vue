<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <template v-for="(item, idx) in items">
      <NuxtLink :to="item.link" class="text-primary last:text-dark2">{{ item.name }}</NuxtLink>
      <span v-if="idx !== items.length - 1" class="text-[#66738F]">></span>
    </template>
  </div>
</template>