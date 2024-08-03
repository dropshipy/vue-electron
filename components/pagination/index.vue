<script>
export default {
  props: {
    pagination: {
      type: Object,
      default: () => ({
        currentPage: null,
        perPage: null,
        totalResults: null,
        totalPages: null,
      }),
    },
    maxDisplayedPages: {
      type: Number,
      default: 5,
    },
  },

  computed: {
    pageCount() {
      return Math.ceil(this.pagination.totalResults / this.pagination.perPage);
    },
    displayedPages() {
      if (this.pageCount <= this.maxDisplayedPages) {
        return Array.from({ length: this.pageCount }, (_, i) => i + 1);
      }
      const halfMax = Math.floor(this.maxDisplayedPages / 2);
      const start = Math.max(1, this.pagination.currentPage - halfMax);
      const end = Math.min(
        this.pageCount,
        this.pagination.currentPage + halfMax
      );
      let pages = Array.from({ length: end - start + 1 }, (_, i) => i + start);
      if (pages[0] > 1) {
        pages = [...pages];
      }
      if (pages[pages.length - 1] < this.pageCount) {
        pages = [...pages];
      }
      return pages;
    },
    showFirstDots() {
      return this.displayedPages[0] > 2;
    },
    showLastDots() {
      return (
        this.displayedPages[this.displayedPages.length - 1] < this.pageCount - 1
      );
    },
    textStyle() {
      if (this.$config.appName === "tiksender") {
        return "!text-primary";
      }
      return "!text-[#00AC01]";
    },
    backgroundStyle() {
      if (this.$config.appName === "tiksender") {
        return "bg-primary/10";
      }
      return "bg-[#60BB55]/10";
    },
  },
  methods: {
    changePage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.pageCount) {
        this.$emit("change", pageNumber);
      }
    },
  },
};
</script>

<template>
  <div class="flex space-x-2 items-center text-[#A0A3BD66]/40">
    <button
      class="p-1 rounded-full w-8 h-8 flex justify-center items-center !mr-4"
      :class="
        pagination.currentPage !== 1 ? backgroundStyle : 'bg-[#A0A3BD80]/10'
      "
      :disabled="pagination.currentPage === 1"
      @click="changePage(pagination.currentPage - 1)"
    >
      <Icon
        name="chv-down"
        class="rotate-90"
        :size="16"
        :class="
          pagination.currentPage !== 1 ? textStyle : 'text-[#A0A3BD80]/50'
        "
      />
    </button>
    <ul class="flex space-x-2 items-center">
      <li
        class="cursor-pointer p-1 rounded-full w-8 h-8 flex justify-center items-center"
        v-if="this.displayedPages[0] >= 2"
        @click="changePage(1)"
      >
        1
      </li>
      <li
        v-if="showFirstDots"
        class="dots w-8 h-8 flex justify-center items-center"
      >
        ...
      </li>
      <li
        class="cursor-pointer p-1 rounded-full w-8 h-8 flex justify-center items-center"
        v-for="pageNumber in displayedPages"
        :key="pageNumber"
        :class="[
          pageNumber === pagination.currentPage
            ? `font-bold  bg-none ${textStyle}`
            : '',
        ]"
        @click="changePage(pageNumber)"
      >
        {{ pageNumber }}
      </li>
      <li
        v-if="showLastDots"
        class="dots w-8 h-8 flex justify-center items-center"
      >
        ...
      </li>
      <li
        class="cursor-pointer p-1 rounded-full w-8 h-8 flex justify-center items-center"
        v-if="
          this.displayedPages[this.displayedPages.length - 1] <=
          this.pageCount - 1
        "
        @click="changePage(pagination.totalPages)"
      >
        {{ pagination.totalPages }}
      </li>
    </ul>
    <button
      class="p-1 rounded-full w-8 h-8 flex justify-center items-center !ml-4"
      :class="
        pagination.currentPage !== pageCount
          ? backgroundStyle
          : 'bg-[#A0A3BD80]/10'
      "
      :disabled="pagination.currentPage === pageCount"
      @click="changePage(pagination.currentPage + 1)"
    >
      <Icon
        name="chv-down"
        class="-rotate-90"
        :size="16"
        :class="
          pagination.currentPage !== pageCount
            ? textStyle
            : 'text-[#A0A3BD80]/50'
        "
      />
    </button>
  </div>
</template>
