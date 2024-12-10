import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapPlotDataStore = defineStore(
  "mapPlotData",
  () => {
    // 时空训练场数据
    // const GJBList = ref([]);
    // const textList = ref([]);
    const layersList = ref([])

    return {
      // GJBList,
      // textList,
      layersList
    };
  },
  {
    persist: true, // 开启持久化
  }
);
