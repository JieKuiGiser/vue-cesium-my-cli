import { defineStore } from "pinia";
import { ref } from "vue";

export const usedrawEventStore = defineStore(
  "usedrawEventStore",
  () => {
    // 地图鼠标事件
    let drawToolClick = ref({
      pin: {
        state: false,
        event: null,
      },
      point: {
        state: false,
        event: null,
      },
      polyline: {
        state: false,
        event: null,
      },
      rectangle: {
        state: false,
        event: null,
      },
      polygon: {
        state: false,
        event: null,
      },
      regular: {
        state: false,
        event: null,
      },
      circle: {
        state: false,
        event: null,
      },
    });

    let drawFinish = ref({
      state: false,
      event: "",
    });

    return {
      drawToolClick,
      drawFinish,
    };
  },
  {
    persist: true, // 开启持久化
  }
);
