<script>
export default {
  props: {
    headers: {
      type: Array,
      default: () => [],
      required: true,
    },
    rows: {
      type: Array,
      default: () => [],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: 'Loading...',
    },
    noDataText: {
      type: String,
      default: 'Data tidak ditemukan',
    },
    showRowNumber: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    pagination: {
      type: Object,
      default: () => ({
        currentPage: null,
        perPage: null,
        totalResults: null,
        totalPages: null,
      }),
    },
  },
  methods: {
    getColumnWidth(headerWidth) {
      if (typeof headerWidth === 'number') {
        return {
          maxWidth: `${headerWidth}px`,
          minWidth: `${headerWidth}px`,
        };
      }
    },
    onChangePagination(page) {
      this.$emit('change:page', page)
    }
  }
}
</script>

<template>
  <div class="bg-[#FBFBFD]">
    <div class="w-full overflow-x-auto overflow-y-hidden">
      <table class="border-collapse table-fixed bg-white min-w-full">
        <thead>
          <tr class="text-sm text-dark2 font-medium">
            <th v-if="showRowNumber" class="py-3 px-1 w-8">
              No
            </th>

            <th v-for="(header, idx) in headers" :key="idx" class="py-3 px-1 select-none text-left"
              :style="getColumnWidth(header.width)">
              {{ header.label }}
            </th>
          </tr>
        </thead>

        <tbody class="align-top">
          <tr v-if="!rows.length || loading">
            <td :colspan="headers.length">
              <div class="flex flex-col items-center justify-center text-neutral-500 text-sm uppercase px-6 py-4">
                <div v-if="loading" class="flex flex-col">
                  <slot name="loading">
                    <div class="flex items-center justify-center space-x-2">
                      <Icon name="spinner" :size="24" class="animate-spin text-primary" />
                      <span>{{ loadingText }}</span>
                    </div>
                  </slot>
                </div>

                <div v-else class="mt-2">
                  <slot name="empty">
                    {{ noDataText }}
                  </slot>
                </div>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="(row, rowIdx) in rows" :key="rowIdx" class="odd:bg-[#EB938F0D] odd:bg-opacity-5">
              <td v-if="showRowNumber" class="text-gray-500 text-sm whitespace-nowrap px-1 py-[14px]">
                {{ rowIdx + 1 }}
              </td>

              <td v-for="(col, colIdx) in headers" :key="colIdx"
                class=" text-gray-500 text-sm px-1 py-[14px] whitespace-nowrap overflow-ellipsis overflow-hidden"
                :style="getColumnWidth(col.width)">
                <slot :name="`col.${col.key}`" :row="row" :idx="rowIdx">
                  {{ row[col.key] || '-' }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="showPagination && pagination.totalResults" class="flex justify-center p-2.5">
      <Pagination :pagination="pagination" :max-displayed-pages="5" @change="onChangePagination" />
    </div>
  </div>
</template>

<style scoped>
th:first-child,
td:first-child {
  @apply !pl-5;
}

th:last-child,
td:last-child {
  @apply !pr-5;
}
</style>