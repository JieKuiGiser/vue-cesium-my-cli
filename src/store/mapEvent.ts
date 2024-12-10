import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapEventStore = defineStore(
  "mapEvent",
  () => {
    // 地图鼠标事件
    const leftClick = ref({
      state: false,
      position: "",
    });
    const rightClick = ref({
      state: false,
      position: "",
    });
    return {
      leftClick,
      rightClick,
    };
  },
  {
    persist: true, // 开启持久化
  }
);
