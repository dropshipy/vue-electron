<script>
export default {
  data() {
    return {
      isOpenSettings: false,
      isShowSubscriptionModal: false,
      isShowShopeeAccountModal: false,
      isShowDeleteShopeeSessionModal: false,
      isShowBrowserOptionsModal: false,
    };
  },
  computed: {
    isSupportSeller() {
      return this.$config.appName === "supportseller";
    },
    iconStyle() {
      if (this.$config.appName === "tiksender") {
        return "text-primary";
      }
      return "text-[#00AC01]";
    },
  },
  methods: {
    onClickMenuItem(type) {
      switch (type) {
        case "spt-account":
          this.isShowSubscriptionModal = true;
          break;
        case "shopee-account":
          this.isShowShopeeAccountModal = true;
          break;
        case "delete-shopee-session":
          this.isShowDeleteShopeeSessionModal = true;
          break;
        case "browser-options":
          this.isShowBrowserOptionsModal = true;
          break;
      }
    },
    logout() {
      localStorage.removeItem("user_info");
      electronStore.clearAll();
      setTimeout(() => {
        this.$router.replace("/login");
      }, 500);
    },
  },
};
</script>

<template>
  <nav
    class="sticky h-[72px] top-0 shadow-navbar flex items-center justify-between px-8 py-4 z-10"
    :class="isSupportSeller ? 'bg-[#FDD1C3]' : 'bg-white'"
  >
    <div>
      <div class="flex items-center gap-1" v-if="isSupportSeller">
        <img src="/icons/shopee.svg" alt="shopee" class="w-6 h-6" />
        <p class="font-bold text-[20px]">ShopeeBlast</p>
      </div>
    </div>
    <div class="flex">
      <Button
        theme="tertiary"
        class="relative"
        @click.stop="isOpenSettings = !isOpenSettings"
      >
        <Icon :class="{ '!text-[#F1582C]': isSupportSeller }" name="setting" />
        <span :class="{ '!text-[#F1582C]': isSupportSeller }">Settings</span>

        <Menu v-model="isOpenSettings">
          <MenuItem
            v-if="!$config.hideSettingSpt"
            @click="onClickMenuItem('spt-account')"
          >
            <Icon name="profile" :class="iconStyle" />
            <p class="text-sm whitespace-nowrap leading-normal">Akun SPT</p>
          </MenuItem>

          <MenuItem @click="onClickMenuItem('shopee-account')">
            <Icon name="sidebar/database-creator/shopee" :class="iconStyle" />
            <p class="text-sm whitespace-nowrap leading-normal">Akun Shopee</p>
          </MenuItem>

          <MenuItem @click="onClickMenuItem('delete-shopee-session')">
            <Icon name="delete" :class="iconStyle" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Hapus Sesi Login Shopee
            </p>
          </MenuItem>
          <MenuItem @click="onClickMenuItem('browser-options')">
            <Icon name="setting" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">Opsi Browser</p>
          </MenuItem>
        </Menu>
      </Button>

      <Button
        :theme="isSupportSeller ? 'tertiary' : 'primary'"
        @click="logout"
        :className="{ 'text-white !bg-[#F1582C]': isSupportSeller }"
      >
        <span>Logout</span>
        <Icon name="logout" />
      </Button>

      <AppSettingsSubscriptionModal v-model="isShowSubscriptionModal" />
      <AppSettingsShopeeAccountModal v-model="isShowShopeeAccountModal" />
      <AppSettingsDeleteShopeeSessionModal
        v-model="isShowDeleteShopeeSessionModal"
      />
      <AppSettingsChromeModal v-model="isShowBrowserOptionsModal" />
    </div>
  </nav>
</template>
