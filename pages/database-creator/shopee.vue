<script>
import { CATEGORY_OPTIONS } from "~/constants/option.constant";
import { convertToCompactFormat } from "~/utils/format-number";
import formatCurrency from "~/utils/format-currency";

export default {
  data() {
    return {
      isLoading: false,
      rows: [],
      headers: [
        { key: "displayName", label: "Display Name", width: 180 },
        { key: "username", label: "Username", width: 150 },
        { key: "relatedCategoris", label: "Kategori Kreator", width: 220 },
        { key: "socialMedias", label: "Sosial Media", width: 150 },
        { key: "totalFollower", label: "Jumlah Follower", width: 150 },
        { key: "soldProductCount", label: "Produk Terjual", width: 150 },
        { key: "orderRange", label: "Pesanan", width: 150 },
        { key: "saleCount", label: "Penjualan", width: 150 },
        { key: "audience", label: "Jenis Kelamin Audiens", width: 190 },
      ],
      pagination: {
        currentPage: 1,
        perPage: 10,
        totalResults: 0,
        totalPages: 0,
      },
      filterCategory: null,
      categoryOptions: CATEGORY_OPTIONS,
      search: null,
    };
  },
  computed: {
    textStyle() {
      if (this.$config.appName === "tiksender") {
        return "text-primary";
      }
      return "text-[#00AC01]";
    },
    isSupportSeller() {
      return this.$config.appName !== "tiksender";
    },
  },
  methods: {
    async getDatabaseCreator() {
      try {
        this.isLoading = true;

        const payload = {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
          category: this.filterCategory === "Semua" ? "" : this.filterCategory,
          search: this.search,
        };

        const resData = await window.electron.ipcRenderer.invoke(
          "get-database-creator-shopee",
          payload
        );
        if (resData) {
          this.rows = resData.data;
          this.pagination = {
            ...resData.pagination,
          };
        }
      } catch (error) {
        this.$snackbar.error("Gagal mengambil data creator");
        console.error("Error getting database creators:", error);
      } finally {
        this.isLoading = false;
      }
    },
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      this.getDatabaseCreator();
    },
    extractPlatformName(url) {
      let iconStyle = this.isSupportSeller ? "-green" : "";
      if (url) {
        try {
          const urlSosmed = JSON.parse(url);
          const sanitizedUrls = [];
          urlSosmed.forEach((val) => {
            if (val.website_url) {
              const sosmed = val.website_url.replace(/^\"|\"$/g, "");
              sanitizedUrls.push(sosmed);
            }
          });
          const link = sanitizedUrls.map(
            (url) => `
              <a href="${url}" target="_blank">
                <img src="/icons/social-medias/${this.getWebsiteName(
                  url
                )}${iconStyle}.svg" alt="${this.getWebsiteName(
              url
            )}" class="w-6 h-6 cursor-pointer rounded"/>
              </a>
            `
          );
          return link.join("");
        } catch (error) {
          return "-";
        }
      }
    },
    getWebsiteName(url) {
      const domainRegex = /(?:https?:\/\/)?(?:[a-zA-Z]+\.)?([^./]+)\./;
      const matches = url.match(domainRegex);
      return matches ? matches[1] : null;
    },
    convertToCompactFormat,
    formatToRupiah(val) {
      return formatCurrency(val, { notation: "compact" });
    },
    formatRangeValue(range, valueType = "number") {
      if (!Array.isArray(range) || range.length !== 2) {
        return "-";
      }

      let formatter = convertToCompactFormat;

      if (valueType === "currency") {
        formatter = this.formatToRupiah;
      }

      const [lower, upper] = range;

      if (lower != "-1" && upper != "-1") {
        return `${formatter(lower)}-${formatter(upper)}`;
      }
      if (lower != "-1") {
        return `>${formatter(lower)}`;
      }
      if (upper != "-1") {
        return `<${formatter(upper)}`;
      }
      return "Invalid Range";
    },
    onSearch() {
      this.pagination.currentPage = 1;
      this.getDatabaseCreator();
    },
    async exportDataToExcel() {
      const resData = await window.electron.ipcRenderer.invoke(
        "export-data-to-excel",
        {
          category: this.filterCategory === "Semua" ? "" : this.filterCategory,
          search: this.search,
        }
      );
      console.log("export to excel :", resData);
    },
  },
  mounted() {
    this.getDatabaseCreator();
  },
};
</script>

<template>
  <Card class="!p-0">
    <div class="p-5 bg-[#FBFBFD] rounded-t-[10px]">
      <div class="flex items-center gap-2">
        <Icon name="sidebar/database-creator/shopee" :class="textStyle" />
        <h3 class="text-xl text-dark2 font-bold">Database Creator Shopee</h3>
      </div>

      <div class="flex items-center justify-between gap-2 mt-5">
        <Dropdown
          v-model="filterCategory"
          placeholder="Pilih kategori"
          :options="categoryOptions"
          @change="getDatabaseCreator"
        />

        <Textfield
          v-model="search"
          placeholder="Search here..."
          icon="search"
          :icon-size="24"
          @change="onSearch"
        />
      </div>
    </div>

    <Table
      :rows="rows"
      :headers="headers"
      :pagination="pagination"
      :loading="isLoading"
      show-row-number
      @change:page="changePage"
      class="rounded-b-[10px] overflow-hidden"
    >
      <template #col.relatedCategoris="{ row }">
        {{ (row.relatedCategoris || []).join(", ") }}
      </template>

      <template #col.socialMedias="{ row }">
        <div
          class="flex items-center gap-1"
          v-html="extractPlatformName(row.socialMedias)"
        ></div>
      </template>

      <template #col.totalFollower="{ row }">
        {{ convertToCompactFormat(row.totalFollower || 0) }}
      </template>

      <template #col.orderRange="{ row }">
        {{ formatRangeValue(row.orderRange) }}
      </template>

      <template #col.soldProductCount="{ row }">
        {{ formatRangeValue(row.soldProductCount) }}
      </template>

      <template #col.saleCount="{ row }">
        {{ formatRangeValue(row.saleCount, "currency") }}
      </template>

      <template #col.audience="{ row }">
        <div
          v-if="row.maleAudience || row.femaleAudience"
          class="flex items-center gap-1"
        >
          <div class="flex items-center gap-1">
            <img src="~/assets/icons/male.svg" alt="male" class="w-4 h-4" />
            <p class="text-gray-500">{{ row.maleAudience }}%</p>
          </div>

          <div
            class="w-[0.5px] h-5 bg-opacity-30"
            :class="[isSupportSeller ? 'bg-green' : 'bg-primary']"
          ></div>

          <div class="flex items-center gap-1">
            <img src="~/assets/icons/female.svg" alt="female" class="w-4 h-4" />
            <p class="text-gray-500">{{ row.femaleAudience }}%</p>
          </div>
        </div>
      </template>
    </Table>

    <div class="flex justify-end py-6 px-4">
      <Button @click="exportDataToExcel()"> Export to Excel </Button>
    </div>
  </Card>
</template>
