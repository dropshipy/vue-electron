<script>
export default {
  data() {
    return {
      isExpanded: true
    }
  }
}
</script>

<template>
  <div>
    <LayoutSidebar @expanded="isExpanded = $event" />

    <div class="transition-all" :class="isExpanded ? 'ml-[290px]' : 'ml-[84px]'">
      <LayoutNavbar />

      <main class="bg-light min-h-[calc(100vh-72px)] p-8">
        <Nuxt />
      </main>
    </div>
  </div>
</template>