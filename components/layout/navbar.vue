<script>
export default {
  data() {
    return {
      isOpenSettings: false,
      isShowSubscriptionModal: false,
      isShowShopeeAccountModal: false,
      isShowDeleteShopeeSessionModal: false
    }
  },

  methods: {
    onClickMenuItem(type) {
      switch (type) {
        case 'spt-account':
          this.isShowSubscriptionModal = true
          break;
        case 'shopee-account':
          this.isShowShopeeAccountModal = true
          break;
        case 'delete-shopee-session':
          this.isShowDeleteShopeeSessionModal = true
          break;
      }
    },
    logout() {
      localStorage.removeItem('user_info')
      electronStore.delete("account-subscription")
      setTimeout(() => {
        this.$router.replace('/login')
      }, 500);
    }
  }
}
</script>

<template>
  <nav class="sticky h-[72px] top-0 bg-white shadow-navbar flex items-center justify-end px-8 py-4 z-10">
    <Button theme="tertiary" class="relative" @click.stop="isOpenSettings = !isOpenSettings">
      <Icon name="setting" />
      <span>Settings</span>

      <Menu v-model="isOpenSettings">
        <MenuItem v-if="!$config.hideSettingSpt" @click="onClickMenuItem('spt-account')">
        <Icon name="profile" class="text-primary" />
        <p class="text-sm whitespace-nowrap leading-normal">
          Akun SPT
        </p>
        </MenuItem>

        <MenuItem @click="onClickMenuItem('shopee-account')">
        <Icon name="sidebar/database-creator/shopee" class="text-primary" />
        <p class="text-sm whitespace-nowrap leading-normal">
          Akun Shopee
        </p>
        </MenuItem>

        <MenuItem @click="onClickMenuItem('delete-shopee-session')">
        <Icon name="delete" class="text-primary" />
        <p class="text-sm whitespace-nowrap leading-normal">
          Hapus Sesi Login Shopee
        </p>
        </MenuItem>
      </Menu>
    </Button>

    <Button class="ml-4" @click="logout">
      <span>Logout</span>
      <Icon name="logout" />
    </Button>

    <AppSettingsSubscriptionModal v-model="isShowSubscriptionModal" />
    <AppSettingsShopeeAccountModal v-model="isShowShopeeAccountModal" />
    <AppSettingsDeleteShopeeSessionModal v-model="isShowDeleteShopeeSessionModal" />
  </nav>
</template>