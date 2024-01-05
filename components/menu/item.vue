<template>
  <div v-on="$listeners"
    class="menu-item flex items-center gap-2 cursor-pointer py-1.5 px-4 hover:bg-primary hover:bg-opacity-[8%]">
    <slot />
  </div>
</template>