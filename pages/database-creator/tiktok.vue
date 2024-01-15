<script>
import {
  DB_CREATOR_TIKTOK_CREATOR_PER_PAGE_OPTIONS,
  DB_CREATOR_TIKTOK_CATEGORY_OPTIONS,
  DB_CREATOR_TIKTOK_FOLLOWER_COUNT_OPTIONS
} from '~/constants/option.constant'
import {
  convertToCompactFormat,
  convertToFixedNumber,
  convertToWhatsappNumber
} from '~/utils/format-number'

export default {
  data() {
    return {
      isLoading: false,
      rows: [],
      headers: [
        { key: 'userName', label: 'User Name', width: 120 },
        { key: 'email', label: 'Email', width: 180 },
        { key: 'whatsapp', label: 'WhatsApp', width: 150 },
        { key: 'followerCount', label: 'Follower', width: 100 },
        { key: 'creatorScore', label: 'Skor', width: 100 },
        { key: 'productCount', label: 'Product', width: 100 },
        { key: 'categories', label: 'Kategori', width: 200 },
        { key: 'action', label: 'Action', width: 100 },
      ],
      pagination: {
        currentPage: 1,
        perPage: 10,
        totalResults: 0,
        totalPages: 0
      },
      filterCategory: null,
      categoryOptions: DB_CREATOR_TIKTOK_CATEGORY_OPTIONS,
      filterFollowerCount: null,
      followerCountOptions: DB_CREATOR_TIKTOK_FOLLOWER_COUNT_OPTIONS,
      creatorPerPageOptions: DB_CREATOR_TIKTOK_CREATOR_PER_PAGE_OPTIONS,
      search: null
    }
  },
  methods: {
    async getDatabaseCreator() {
      try {
        this.isLoading = true;

        const payload = {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
          category: this.filterCategory,
          followerCount: this.filterFollowerCount,
          search: this.search,
        }

        const resData = await window.electron.ipcRenderer.invoke("get-database-creator-tiktok", payload);
        if (resData) {
          this.rows = resData.data
          this.pagination = {
            ...resData.pagination
          }
        }
      } catch (error) {
        this.$snackbar.error('Gagal mengambil data creator');
        console.error('Error getting database creators:', error);
      } finally {
        this.isLoading = false
      }
    },
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber
      this.getDatabaseCreator()
    },
    formatFollowerCount(followerCount) {
      return convertToCompactFormat(followerCount)
    },
    formatCreatorScore(creatorScore) {
      return convertToFixedNumber(creatorScore, 1)
    },
    formatToWhatsappNumber(phoneNumber) {
      return convertToWhatsappNumber(phoneNumber)
    },
    sendWhatsapp(phoneNumber) {
      if (phoneNumber) {
        window.open(
          `https://api.whatsapp.com/send?phone=${this.formatToWhatsappNumber(
            phoneNumber
          )}&text=`,
          '_blank'
        )
      }
    },
    sendEmail(emailAddress) {
      if (emailAddress) {
        window.open(
          `mailto:${emailAddress}?subject=Undangan Afiliasi Shopee&body=`,
          '_blank'
        )
      }
    }
  },
  mounted() {
    this.getDatabaseCreator()
  }
}
</script>

<template>
  <Card class="!p-0">
    <div class="p-5 bg-[#FBFBFD]">
      <div class="flex items-center gap-2">
        <Icon name="sidebar/database-creator/tiktok" class="text-primary" />
        <h3 class="text-xl text-dark2 font-bold">Database Creator Tiktok</h3>
      </div>

      <div class="flex items-center justify-between gap-2 mt-5">
        <div class="flex items-center gap-2">
          <Dropdown v-model="filterCategory" placeholder="Pilih kategori" :options="categoryOptions"
            @change="getDatabaseCreator" />
          <Dropdown v-model="filterFollowerCount" placeholder="Pilih jumlah follower" :options="followerCountOptions"
            @change="getDatabaseCreator" />
        </div>
        <div class="flex items-center gap-2">
          <Dropdown v-model="pagination.perPage" :show-option-all="false" placeholder="Pilih jumlah creator"
            :options="creatorPerPageOptions" @change="getDatabaseCreator" />
          <Textfield v-model="search" placeholder="Search here..." icon="search" :icon-size="24"
            @change="getDatabaseCreator" />
        </div>
      </div>
    </div>

    <Table :rows="rows" :headers="headers" :pagination="pagination" :loading="isLoading" show-row-number
      @change:page="changePage">
      <template #col.followerCount="{ row }">
        <div class="flex items-center gap-1">
          <img src="~/assets/icons/people-filled.svg" alt="followers" class="w-4 h-4" />
          <span>
            {{ formatFollowerCount(row.followerCount || 0) }}
          </span>
        </div>
      </template>

      <template #col.creatorScore="{ row }">
        <div class="flex items-center gap-1">
          <img src="~/assets/icons/star-filled.svg" alt="score" class="w-4 h-4" />
          <span>
            {{ formatCreatorScore(row.creatorScore || 0) }}
          </span>
        </div>
      </template>

      <template #col.action="{ row }">
        <div class="flex items-center gap-1">
          <button @click="sendWhatsapp(row.whatsapp)"
            :class="row.whatsapp ? 'text-primary cursor-pointer' : 'text-gray-400 pointer-events-none'">
            <Icon name="whatsapp" />
          </button>

          <div class="w-[0.5px] h-5 bg-primary bg-opacity-30"></div>

          <button @click="sendEmail(row.email)"
            :class="row.email ? 'text-primary cursor-pointer' : 'text-gray-400 pointer-events-none'">
            <Icon name="email" :size="22" />
          </button>
        </div>
      </template>
    </Table>
  </Card>
</template>