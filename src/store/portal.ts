import { defineStore } from "pinia";
import { ref } from "vue";

export const portalStore = defineStore(
    "portal",
    {
        state: () => {
            return {
                detailPath: false,
                detaliList: {},
                noticeDetailPath: false,
                newsDetailPath: false,
                searchName: '',
            }

        }
    },
    {
        persist: true, // 开启持久化
    }
);
