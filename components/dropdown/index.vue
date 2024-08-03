<script>
import { OPTION_ALL } from "~/constants/option.constant";

export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Array, String, Number],
      default: () => [],
    },
    maxHeight: {
      type: Number,
      default: 180,
    },
    showOptionAll: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isShow: false,
      selectedItems: [],
      optionAll: OPTION_ALL,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    valueText() {
      if (this.multiple) {
        return this.selectedItems.map((i) => i.label).join(", ");
      }
      const item = this.selectedItems[0];
      return item?.label || "";
    },
    isAllSelected() {
      return this.selectedItems[0]?.value === this.optionAll?.value;
    },
    accentStyle() {
      if (this.$config.appName === "tiksender") {
        return "accent-primary ";
      }
      return "accent-[#00AC01]";
    },
    textStyle() {
      if (this.$config.appName === "tiksender") {
        return "text-primary";
      }
      return "text-[#00AC01]";
    },
  },
  methods: {
    toggleMenu() {
      this.isShow = !this.isShow;
    },
    handleClickOption(item) {
      if (this.multiple) {
        if (item.value === "Semua") {
          this.selectedItems = [item];
          return;
        } else {
          this.selectedItems = this.selectedItems.filter(
            (i) => i.value !== "Semua"
          );
        }

        const itemIdx = this.selectedItems.findIndex(
          (i) => i.value === item.value
        );
        if (itemIdx >= 0) {
          this.selectedItems.splice(itemIdx, 1);
        } else {
          this.selectedItems.push(item);
        }
      } else {
        this.selectedItems = [item];
        this.isShow = false;
      }
    },
    isItemChecked(item) {
      return this.selectedItems.findIndex((i) => i.value === item.value) >= 0;
    },
    handleReset() {
      this.selectedItems = [];
      this.internalValue = [];
    },
  },
  watch: {
    isShow(val) {
      if (!val) {
        if (this.multiple) {
          this.internalValue = this.selectedItems.map((i) => i.value);
        } else {
          this.internalValue = this.selectedItems[0]?.value || "";
        }
      }
    },
    value: {
      handler(val, prevVal) {
        let items = val;

        if (!this.multiple) {
          items = [val];
        }

        this.selectedItems = [this.optionAll, ...this.options].filter((i) =>
          items.includes(i.value)
        );

        if (val !== prevVal) {
          this.$emit("change", val);
        }
      },
      immediate: true,
    },
  },
};
</script>

<template>
  <div class="relative">
    <Textfield
      :label="label"
      :placeholder="placeholder"
      readonly
      :value="valueText"
      icon="chv-down"
      :iconSize="16"
      :input-class="{
        '!pr-[180px] overflow-hidden overflow-ellipsis':
          multiple && selectedItems.length,
      }"
      @click="toggleMenu"
      @click:icon="toggleMenu"
    />

    <Button
      v-if="multiple && selectedItems.length"
      theme="primary-outline"
      class="!p-1 lg:!py-2 lg:!px-4 absolute right-10 top-11 h-7"
      @click.stop="handleReset"
    >
      Hapus Semua
    </Button>

    <Menu
      v-model="isShow"
      full-width
      class="absolute left-0 top-[110%]"
      :max-height="maxHeight"
    >
      <MenuItem
        v-if="showOptionAll"
        class="justify-between"
        @click="handleClickOption(optionAll)"
      >
        <span>{{ optionAll.label }}</span>
        <input
          v-if="multiple"
          type="checkbox"
          :class="accentStyle"
          class="w-4 h-4"
          :value="isAllSelected"
          :checked="isAllSelected"
        />
      </MenuItem>

      <MenuItem
        v-for="item in options"
        :key="item.value"
        class="justify-between"
        @click="handleClickOption(item)"
      >
        <span :class="[isItemChecked(item) ? textStyle : '']">{{
          item.label
        }}</span>
        <input
          v-if="multiple"
          type="checkbox"
          :class="accentStyle"
          class="w-4 h-4"
          :value="isItemChecked(item)"
          :checked="isItemChecked(item)"
        />
      </MenuItem>
    </Menu>
  </div>
</template>
