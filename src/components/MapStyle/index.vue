<template>
  <div
    class="control MapStyle"
    :style="{ position: 'absolute', left: left + 'px', bottom: bottom + 'px' }"
    @click="switchStylesView"
  >
    <div class="icon">
      <img :src="defaultStyle.url" alt="" />
    </div>
  </div>
  <div
    class="stylesView"
    :style="{
      position: 'absolute',
      left: left + 50 + 'px',
      bottom: bottom - 55 + 'px',
    }"
    v-if="homeMenuStore.baselayersMenuState"
  >
    <el-row class="stylesRow" type="flex" justify="space-between" :gutter="5">
      <el-col :span="6" v-for="(item, index) in mapStyleData" :key="index">
        <div class="border">
          <img
            :src="item.url"
            width="120px"
            @click="changeStyle(index, item)"
          />
          <span class="type" :class="{ active_type: currentIndex === index }">
            <span>
              {{ item.name }}
            </span>
          </span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useMapStore } from "@/store/map";
import { useHomeMenuStore } from "@/store/homeMenu";

export default {
  name: "MapStyle",
  props: {
    left: {
      type: Number,
      default: 0,
    },
    bottom: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      homeMenuStore: null,
      mapStore: null,
      layerKeyWord: "",
      isContextMenuVisible: false,
      mapStyleData: [],
      currentIndex: 0,
      defaultStyle: {
        url: require("../../assets/images/map01.png"),
        name: "卫星影像",
        mapUrl:
          "https://a.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamVyY2t5IiwiYSI6ImNqYjI5dWp3dzI1Y2YzMnM3eG0xNnV3bWsifQ.eQp4goc9Ng8SuEZcdgNJ_g",
      },
    };
  },
  created() {
    this.homeMenuStore = useHomeMenuStore();
  },
  mounted() {
    this.mapStore = useMapStore();
    this.mapStyleData = this.mapStore.mapStyleList;
    this.defaultStyle = this.mapStore.defaultStyle;
    this.currentIndex = this.mapStore.mapParams.mapStyleIndex;
  },

  methods: {
    switchStylesView() {
      this.homeMenuStore.baselayersMenuState =
        !this.homeMenuStore.baselayersMenuState;
      this.homeMenuStore.mapViewMenuState = false;
      this.homeMenuStore.layersMenuState = false;
    },
    changeStyle(index, item) {
      this.mapStore.setMapStyle(index);
      this.mapStore.setSceneMode(item.sceneMode);
      this.mapStore.setIsTerrain(item.terrain);
      this.homeMenuStore.baselayersMenuState = false;
    },
  },
  watch: {
    "mapStore.mapParams.mapStyleIndex"() {
      this.currentIndex = this.mapStore.mapParams.mapStyleIndex;
      this.defaultStyle = this.mapStore.defaultStyle;
    },
    "homeMenuStore.baselayersMenuState"() {
      if (this.homeMenuStore.baselayersMenuState) {
        document.querySelector(".MapStyle").style.borderWidth = "2px";
        document.querySelector(".MapStyle").style.borderStyle = "solid";
        document.querySelector(".MapStyle").style.borderColor = "#33f8ff";
      } else {
        document.querySelector(".MapStyle").style.borderWidth = "0px";
        document.querySelector(".MapStyle").style.borderStyle = "solid";
        document.querySelector(".MapStyle").style.borderColor = "#33f8ff";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  width: 44px;
  height: 44px;
  background: rgba(20, 27, 31, 0.8);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;

  .icon {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.stylesView {
  width: 530px;
  height: 100px;
  padding: 0 8px 0;
  background: rgba(20, 27, 31, 0.94);
  border: 1px solid rgba(80, 123, 134, 1);
  border-top: 5px solid #38888c;
  box-shadow: inset 0px 0px 20px 0px rgba(90, 150, 185, 0.45);

  .stylesRow {
    height: 100%;
  }

  .el-col {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .border {
    background: rgba(20, 27, 31, 0.9);
    border-radius: 2px;
    position: relative;
    border: 1px solid #38888c;
    width: 100%;
    height: 90%;

    img {
      width: 100%;
      height: 100%;
    }

    .type {
      width: 60px;
      color: #fff;
      display: inline-block;
      background-color: rgba(20, 27, 31, 0.5);
      position: absolute;
      left: 52%;
      bottom: 0px;

      font-family: Source Han Sans CN;
      font-weight: 500;
      color: #ffffff;
      font-size: 12px;
      line-height: normal;
    }

    .active_type {
      display: inline-block;
      width: 60px;
      color: #fff;
      background-color: #00b8b8;
    }
  }
}
</style>
