<script>
import { SIDEBAR_MENU } from "./sidebar-menu";

export default {
  data() {
    return {
      isDrawerExpanded: true,
      sidebarMenu: SIDEBAR_MENU,
      openedMenu: null
    };
  },

  methods: {
    onClickMenu(menu) {
      if (!Array.isArray(menu.children)) return;

      if (this.openedMenu === menu.name) {
        this.openedMenu = null;
      } else {
        this.openedMenu = menu.name;
      }
    },
    isMenuOpen(menu) {
      return this.openedMenu === menu.name;
    },
    hasActiveSubmenu(menu) {
      if (!Array.isArray(menu.children)) return false;
      return menu.children.some((item) => item.path === this.$route.path);
    }
  },

  computed: {
    // NOTE: We can't set src directly in template ~/assets/brand/${img}
    // so we need to use require()
    logoUrl() {
      const appName = this.$config.appName;

      if (this.isDrawerExpanded) {
        return require(`~/assets/brand/${appName}.png`);
      }
      return require(`~/assets/brand/${appName}-logo.png`);

    },
  },

  watch: {
    isDrawerExpanded(val) {
      this.$emit('expanded', val);
    }
  },

  mounted() {
    const activeMenu = this.sidebarMenu.find(menu => this.hasActiveSubmenu(menu));
    if (activeMenu) {
      this.openedMenu = activeMenu.name;
    }
  }
};
</script>

<template>
  <aside
    class="fixed top-0 bottom-0 w-[290px] bg-white transition-all overflow-y-auto overflow-x-hidden shadow-sidebar z-20"
    :class="{ 'w-[84px]': !isDrawerExpanded }">
    <div class="flex items-center justify-between gap-2 px-5 py-3 sticky top-0 bg-white"
      :class="{ 'gap-1 -mx-2': !isDrawerExpanded }">
      <img :src="logoUrl" alt="logo" class="w-[120px] h-auto" :class="{ 'w-[30px] h-[30px]': !isDrawerExpanded }" />

      <button @click="isDrawerExpanded = !isDrawerExpanded" class="text-primary">
        <Icon :name="isDrawerExpanded ? 'menu-collapse' : 'menu-expand'" :size="28" />
      </button>
    </div>

    <div class="mt-7 px-5 py-3">
      <div v-for="(menu, idx) in  sidebarMenu" :key="idx" class="cursor-pointer w-full">
        <template v-if="typeof menu.isShown === 'function' ? menu.isShown($config) : true">
          <template v-if="menu.name !== 'divider'">
            <component :is="Array.isArray(menu.children) ? 'button': 'NuxtLink'" :to="menu.path || ''"
              class="menu-item flex items-center rounded-lg w-full" :class="[
                isDrawerExpanded ? 'p-3 justify-between' : 'px-2 py-3 justify-center',
                { 'menu-item--active': hasActiveSubmenu(menu) },
              ]" @click="onClickMenu(menu)">
              <div class="flex items-center space-x-2">
                <Icon :name="menu.icon" class="text-primary" />
                <span v-if="isDrawerExpanded" class="menu-item__text">
                  {{ menu.name }}
                </span>
              </div>

              <button v-if="menu.children && isDrawerExpanded" class="dropdown-icon transition-all"
                :class="{ 'rotate-180': isMenuOpen(menu) }">
                <Icon name="chv-down" :size="16" />
              </button>
            </component>

            <div v-if="menu.children && (!isDrawerExpanded || isMenuOpen(menu))">
              <NuxtLink v-for="( submenu, submenuIdx ) in  menu.children " :key="submenuIdx" :to="submenu.path"
                class="submenu-item flex items-center space-x-4 rounded-lg"
                :class="{ 'ml-5 p-3': isDrawerExpanded, 'px-2 py-3 justify-center': !isDrawerExpanded }">
                <Icon :name="submenu.icon" class="text-primary" />
                <span v-if="isDrawerExpanded" class="submenu-item__text">
                  {{ submenu.name }}
                </span>
              </NuxtLink>
            </div>
          </template>

          <hr v-else class="mt-6 mb-3 border-gray-200" />
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
.menu-item,
.submenu-item {
  @apply transition-all;

  &:hover {
    @apply bg-primary bg-opacity-[4%];
  }

  &__text {
    @apply text-base text-dark font-normal transition-all;
  }
}

.nuxt-link-active,
.menu-item--active {
  &.menu-item {
    @apply bg-primary bg-opacity-[8%];
  }

  .dropdown-icon {
    @apply text-primary;
  }

  .menu-item__text,
  .submenu-item__text {
    @apply text-primary font-bold;
  }
}
</style>