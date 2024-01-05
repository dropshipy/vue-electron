<script>
export default {
  data() {
    return {
      isOpenSettings: false,
    }
  },

  methods: {
    onClickMenuItem(item) {
      console.log(item)
    }
  }
}
</script>

<template>
  <nav class="sticky h-[72px] top-0 bg-white shadow-navbar flex items-center justify-end px-8 py-4">
    <Button theme="tertiary" class="relative" @click.stop="isOpenSettings = !isOpenSettings">
      <Icon name="setting" />
      <span>Settings</span>

      <Menu v-model="isOpenSettings">
        <MenuItem @click="onClickMenuItem('spt-account')">
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

    <Button class="ml-4">
      <span>Logout</span>
      <Icon name="logout" />
    </Button>
  </nav>
</template>

