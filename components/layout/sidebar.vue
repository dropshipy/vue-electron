<script>
import { SIDEBAR_MENU } from "./sidebar-menu";

export default {
  data() {
    return {
      isOpenMenu: true,
      sidebarMenu: SIDEBAR_MENU,
      activePath: this.$router.currentRoute.path,
    };
  },

  methods: {
    isMenuActive(menu) {
      if (!this.isOpenMenu) return true;

      if (menu?.children) {
        return this.activePath.includes(menu.path);
      }
      return this.activePath === menu.path;
    },
  },

  computed: {
    // NOTE: We can't set src directly in template ~/assets/brand/${img}
    // so we need to use require()
    logoUrl() {
      const appName = this.$config.appName;

      if (this.isOpenMenu) {
        return require(`~/assets/brand/${appName}.png`);
      }
      return require(`~/assets/brand/${appName}-logo.png`);

    },
  },

  watch: {
    $route() {
      this.activePath = this.$router.currentRoute.path;
    },

    isOpenMenu(val) {
      this.$emit('expanded', val);
    }
  }
};
</script>

<template>
  <aside
    class="fixed top-0 bottom-0 w-[290px] bg-white transition-all overflow-y-auto overflow-x-hidden shadow-sidebar z-20"
    :class="{ 'w-[84px]': !isOpenMenu }">
    <div class="flex items-center justify-between gap-2 px-5 py-3 sticky top-0 bg-white"
      :class="{ 'gap-1 -mx-2': !isOpenMenu }">
      <img :src="logoUrl" alt="logo" class="w-[120px] h-auto" :class="{ 'w-[30px] h-[30px]': !isOpenMenu }" />

      <button @click="isOpenMenu = !isOpenMenu" class="text-primary">
        <Icon :name="isOpenMenu ? 'menu-collapse' : 'menu-expand'" :size="28" />
      </button>
    </div>

    <div class="mt-7 px-5 py-3">
      <NuxtLink v-for="(menu, idx) in  sidebarMenu " :key="idx" class="cursor-pointer" :to="menu.path || ''">
        <template v-if="menu.name !== 'divider'">
          <div class="menu-item flex items-center justify-between p-3 rounded-lg w-full">
            <div class="flex items-center space-x-2">
              <!-- TODO: find the better way to load the icon -->
              <Icon :name="menu.icon" class="text-primary" />
              <span v-if="isOpenMenu" class="menu-item__text">
                {{ menu.name }}
              </span>
            </div>

            <button v-if="menu.children && isOpenMenu" class="dropdown-icon transition-all">
              <Icon name="chv-down" />
            </button>
          </div>

          <div v-if="menu.children && isMenuActive(menu)">
            <NuxtLink v-for="( submenu, submenuIdx ) in  menu.children " :key="submenuIdx" :to="submenu.path"
              class="submenu-item flex items-center space-x-4 p-3 rounded-lg" :class="{ 'ml-5': isOpenMenu }">
              <Icon :name="submenu.icon" class="text-primary" />
              <span v-if="isOpenMenu" class="submenu-item__text">
                {{ submenu.name }}
              </span>
            </NuxtLink>
          </div>
        </template>

        <hr v-else class="mt-6 mb-3 border-gray-200" />
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
.menu-item__text,
.submenu-item__text {
  @apply text-base text-dark font-normal transition-all;
}

.menu-item,
.submenu-item {
  @apply transition-all;

  &:hover {
    @apply bg-primary bg-opacity-[4%];
  }
}

.nuxt-link-active {
  .menu-item {
    @apply bg-primary bg-opacity-[8%];

    &__text {
      @apply text-primary font-bold;
    }

    .dropdown-icon {
      @apply text-primary rotate-180;
    }
  }
}

.nuxt-link-exact-active {
  .submenu-item__text {
    @apply text-primary font-bold;
  }
}
</style>