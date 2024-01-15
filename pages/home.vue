<script>
import formatDate from '~/utils/format-date'
import formatCurrency from '~/utils/format-currency'
import copyToClipboard from '~/utils/copy-to-clipboard'

export default {
  computed: {
    userInfo() {
      return this.$store.getters['user/getUserInfo'] || {}
    },
    subscription() {
      return this.$store.getters['subscription/getSubscriptionInfo']
    },
    dataProfile() {
      return [
        { label: 'Nama', icon: 'profile', value: this.userInfo.fullName || '-' },
        { label: 'Email', icon: 'email', value: this.userInfo.email || '-' },
        { label: 'No. HP', icon: 'phone', value: this.userInfo.phoneNumber || '-' },
      ]
    }
  },
  methods: {
    getStatusLabel(status) {
      if (status === 'active') return 'Aktif'
      if (status === 'register') return 'Belum aktif'
      if (status === 'inactive') return 'Tidak aktif'
    },
    dateFormatter(date) {
      return formatDate(date)
    },
    currencyFormatter(amount) {
      return formatCurrency(amount)
    },
    copySubscriptionCode(code) {
      copyToClipboard(code, () => {
        this.$snackbar.success('Berhasil menyalin kode subscription')
      })
    }
  }
}
</script>

<template>
  <Card>
    <div class="flex items-center gap-2">
      <img src="~/assets/icons/profile-circle-filled.svg" alt="profile" />
      <h3 class="text-xl text-dark2 font-bold">Data Profil</h3>
    </div>

    <Card primary class="mt-3 w-full max-w-[530px] space-y-2 p-3">
      <div v-for="(item, idx) in dataProfile" :key="idx" class="flex items-center gap-2">
        <Icon :name="item.icon" class="text-primary" />
        <span class="text-dark2 text-sm">{{ item.label }}: {{ item.value }}</span>
      </div>
    </Card>

    <div class="flex items-center gap-2 mt-8">
      <img src="~/assets/icons/subscription-filled.svg" alt="subscription" />
      <h3 class="text-xl text-dark2 font-bold">Data Berlangganan</h3>
    </div>

    <Card v-if="!subscription" primary class="flex flex-col items-center justify-center mt-3 w-full max-w-[530px] p-6">
      <img src="~/assets/icons/empty.svg" alt="empty" />
      <p class="text-sm text-dark2 mt-3">Oops! Kamu belum berlangganan</p>
      <a href="#" class="text-primary underline text-sm font-medium mt-5">Berlangganan Sekarang</a>
    </Card>

    <Card v-else primary class="mt-3 w-full max-w-[530px]">
      <div class="flex items-center justify-center gap-1 bg-[#FEB186] text-white p-3 cursor-pointer rounded-t-[10px]"
        @click="copySubscriptionCode(subscription.code)">
        <Icon name="transaction" />
        <p class="font-bold">{{ subscription.code }}</p>
      </div>

      <div class="p-5">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Icon name="product" class="text-primary" />
              <p class="font-medium">{{ subscription.subscriptionPlan?.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="price-tag" class="text-primary" />
              <p class="font-medium">{{ currencyFormatter(subscription.subscriptionPlan?.price) }}</p>
            </div>
          </div>

          <div class="px-4 py-2 bg-opacity-10 border border-opacity-20 text-sm font-medium rounded-[40px]" :class="{
            'bg-green border-green text-green': subscription.status === 'active',
            'bg-yellow-500 border-yellow-500 text-yellow-500': subscription.status === 'register',
            'bg-red-500 border-red-500 text-red-500': subscription.status === 'inactive',
          }">
            {{ getStatusLabel(subscription.status) }}
          </div>
        </div>

        <hr class="border-[#FFF0E8] my-3" />

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Icon name="date" class="text-primary" />
            <p>Periode: {{ subscription.cycle }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="symbol-start" class="text-blue" />
            <p>Tanggal mulai: {{ dateFormatter(subscription.startAt) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="symbol-start" class="text-primary rotate-180" />
            <p>Berakhir pada: {{ dateFormatter(subscription.expiredAt) }}</p>
          </div>
        </div>
      </div>
    </Card>
  </Card>
</template>