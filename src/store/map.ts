import { defineStore } from "pinia";
import { ref, getCurrentInstance } from "vue";
import { config } from "@/config";

export const useMapStore = defineStore(
  "map",
  () => {
    const instance = getCurrentInstance();
    const {
      satellite,
      satelliteType,
      satelliteFormat,
      satelliteSrs,
      satelliteMaxZoom,
      demUrl,
      demFormat,
      demMaxDoom,
      vector,
      vectorType,
      vectorFormat,
      vectorSrs,
      vectorMaxZoom,
      rgbDemUrl,
      rgbDemType,
      rgbDemFormat,
      rgbDemSrs,
      rgbDemMaxZoom,
    } = config.tilesUrl;
    // 地图加载状态
    const defaultStyle = ref({
      id: 1,
      url: require("@/assets/images/map02.png"),
      name: "三维地图",
      sceneMode: 3,
      terrain: true,
      mapUrl: satellite,
      mapType: satelliteType,
      mapSrs: satelliteSrs,
      mapFormat: satelliteFormat,
      demUrl: demUrl,
      demFormat: demFormat,
      mapMaxZoom: satelliteMaxZoom,
      mapDemMaxZoom: demMaxDoom,
    });
    const mapStyleList = ref([
      {
        id: 0,
        url: require("@/assets/images/map01.png"),
        name: "二维地图",
        sceneMode: 2,
        terrain: false,
        mapUrl: satellite,
        mapType: satelliteType,
        mapSrs: satelliteSrs,
        mapFormat: satelliteFormat,
        mapMaxZoom: satelliteMaxZoom,
      },
      {
        id: 1,
        url: require("@/assets/images/map02.png"),
        name: "三维地图",
        sceneMode: 3,
        terrain: true,
        mapUrl: satellite,
        mapType: satelliteType,
        mapSrs: satelliteSrs,
        mapFormat: satelliteFormat,
        demUrl: demUrl,
        demFormat: demFormat,
        mapMaxZoom: satelliteMaxZoom,
        mapDemMaxZoom: demMaxDoom,
      },
      {
        id: 2,
        url: require("@/assets/images/map03.png"),
        name: "电子地图",
        sceneMode: 2,
        terrain: false,
        mapUrl: vector,
        mapFormat: vectorFormat,
        mapType: vectorType,
        mapSrs: vectorSrs,
        mapMaxZoom: vectorMaxZoom,
      },
      {
        id: 3,
        url: require("@/assets/images/map04.png"),
        name: "地形图",
        sceneMode: 3,
        terrain: false,
        mapUrl: satellite,
        rgbDemUrl: rgbDemUrl,
        mapFormat: rgbDemFormat,
        mapType: rgbDemType,
        mapSrs: rgbDemSrs,
        mapMaxZoom: rgbDemMaxZoom,
      },
    ]);
    const mapLoading = ref(true);
    const mapParams = ref<any>({
      zoom: 8,
      // 地图中心点
      center: "110,39",
      // 地图偏航脚
      heading: 0,
      // 地图俯仰角
      pitch: 0,
      // 相机翻滚角
      roll: 0,
      // 地图场景:三维模式、二维模式或哥伦布视图模式。
      // COLUMBUS_VIEW: 1, SCENE2D: 2, SCENE3D: 3
      sceneMode: 3,
      // 地图样式:1:电子图、2:三维地图、0:影像图、3:地形图
      mapStyleIndex: 2,
      // 是否开启默认地形
      isTerrain: false,
    });
    const setZoom = (zoom: Number) => {
      mapParams.value.zoom = zoom;
    };
    const setCenter = (center: String) => {
      mapParams.value.center = center;
    };
    const setHeading = (heading: String) => {
      mapParams.value.heading = heading;
    };
    const setPitch = (pitch: String) => {
      mapParams.value.pitch = pitch;
    };
    const setRoll = (roll: String) => {
      mapParams.value.roll = roll;
    };
    const setSceneMode = (sceneMode: String) => {
      mapParams.value.sceneMode = sceneMode;
    };
    const setMapStyle = (index: any) => {
      mapParams.value.mapStyleIndex = index;
      defaultStyle.value = mapStyleList.value[index];
    };
    const setIsTerrain = (state: Boolean) => {
      mapParams.value.isTerrain = state;
    };
    const setMapLoading = (state: any) => {
      mapLoading.value = state;
    };
    const resetDefaultMap = (state: any) => {
      defaultStyle.value = mapStyleList.value[1];
      mapParams.value.isTerrain = true;
      mapParams.value.sceneMode = 3;
      mapParams.value.mapStyleIndex = 2;
      mapLoading.value = true;
    };
    return {
      mapParams,
      mapLoading,
      defaultStyle,
      mapStyleList,
      setZoom,
      setCenter,
      setHeading,
      setPitch,
      setRoll,
      setSceneMode,
      setMapStyle,
      setIsTerrain,
      setMapLoading,
      resetDefaultMap,
    };
  },
  {
    persist: true, // 开启持久化
  }
);
