<script>
import {
  CATEGORY_OPTIONS,
  SOCIAL_MEDIA_OPTIONS,
  FOLLOWER_COUNT_OPTIONS,
  FOLLOWER_AGE_OPTIONS,
  GENDER_OPTIONS
} from '~/constants/option.constant'

export default {
  data() {
    return {
      selectedIteration: 1,
      selectedCategories: [],
      categoryOptions: CATEGORY_OPTIONS,
      selectedSocialMedia: null,
      socialMediaOptions: SOCIAL_MEDIA_OPTIONS,
      selectedFollowerCount: null,
      selectedFollowerAge: null,
      followerAgeOptions: FOLLOWER_AGE_OPTIONS,
      selectedGender: null,
      genderOptions: GENDER_OPTIONS,
      message: ''
    }
  },
  computed: {
    followerCountOptions() {
      console.log('selectedSocialMedia', this.selectedSocialMedia)
      const differentOptions = ['Youtube', 'Shopee']
      if (differentOptions.includes(this.selectedSocialMedia)) {
        return FOLLOWER_COUNT_OPTIONS[this.selectedSocialMedia]
      }
      return FOLLOWER_COUNT_OPTIONS['Default']
    }
  },
  methods: {
    onSave() {
      this.message = this.message.trim()

      if (!this.message) {
        this.$snackbar.error("Balasan Ulasan tidak boleh kosong")
        return;
      }

      const payload = {
        iteration: this.selectedIteration,
        socialMedias: this.selectedSocialMedia,
        followerCount: this.selectedFollowerCount,
        followerAge: this.selectedFollowerAge,
        followerGender: this.selectedGender,
        replyMessage: this.message,
        category: this.selectedCategories,
      }

      console.log('payload', payload)

      electronStore.set("selected-crawl-creator", payload);
      this.$snackbar.success("Berhasil menyimpan konfigurasi")
    },
    onStart() {
      const context = electronStore.get("selected-crawl-creator");

      if (context) {
        window.electron.ipcRenderer.send("crawl-creator", context)
      } else {
        this.$snackbar.error("Belum ada konfigurasi")
      }
    }
  },
  mounted() {
    const dataSelectedCrawlCreator = electronStore.get("selected-crawl-creator")
    if (dataSelectedCrawlCreator) {
      this.selectedIteration = dataSelectedCrawlCreator.iteration
      this.selectedSocialMedia = dataSelectedCrawlCreator.socialMedias
      this.selectedFollowerCount = dataSelectedCrawlCreator.followerCount
      this.selectedFollowerAge = dataSelectedCrawlCreator.followerAge
      this.selectedGender = dataSelectedCrawlCreator.followerGender
      this.message = dataSelectedCrawlCreator.replyMessage
      this.selectedCategories = dataSelectedCrawlCreator.category
    }
  }
}
</script>

<template>
  <Card>
    <div class="flex items-center gap-2">
      <Icon name="sidebar/auto-chat-creator" class="text-primary" />
      <h3 class="text-xl text-dark2 font-bold">Konfigurasi Kirim Pesan ke Kreator</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3">
      <div>
        <h6 class="text-gray-500 font-medium">Konfigurasi Bot Automasi</h6>
        <Textfield v-model="selectedIteration" label="Jumlah Pengulangan Automasi" type="number"
          placeholder="Masukkan jumlah pengulangan" class="mt-3" />

        <h6 class="text-gray-500 font-medium mt-6">Kategori Utama</h6>

        <Dropdown v-model="selectedCategories" multiple label="Kategori" placeholder="Pilih kategori"
          :options="categoryOptions" class="mt-3" />

        <h6 class="text-gray-500 font-medium mt-6">Atribut Kreator</h6>

        <Dropdown v-model="selectedSocialMedia" label="Media Sosial" placeholder="Pilih sosial media kreator"
          :options="socialMediaOptions" :max-height="150" class="mt-3" />
      </div>

      <div>
        <h6 class="text-gray-500 font-medium">Filter Jumlah Pengikut</h6>

        <Dropdown v-model="selectedFollowerCount" label="Pengikut" placeholder="Pilih jumlah pengikut"
          :options="followerCountOptions" class="mt-3" />

        <Dropdown v-model="selectedFollowerAge" label="Usia Pengikut" placeholder="Pilih usia pengikut"
          :options="followerAgeOptions" class="mt-3" />

        <Dropdown v-model="selectedGender" label="Jenis Kelamin" placeholder="Pilih gender pengikut"
          :options="genderOptions" class="mt-3" />

        <h6 class="text-gray-500 font-medium mt-6">Pesan Undangan Untuk Kreator</h6>

        <Textfield v-model="message" label="Pesan Undangan Ke Affiliator" placeholder="Masukkan pesan undangan"
          type="textarea" input-class="min-h-24" :max-height="200" class="mt-3">
          <template #label>
            <div class="flex items-center space-x-1 text-error">
              <Icon name="warning" :size="14" />
              <span>Harus diisi</span>
            </div>
          </template>
        </Textfield>

        <div class="flex items-center justify-end mt-9 gap-2.5">
          <Button class="w-full max-w-[140px]" theme="primary-outline" @click="onSave">Simpan</Button>
          <Button class="w-full max-w-[140px]" @click="onStart">Start</Button>
        </div>
      </div>
    </div>
  </Card>
</template>