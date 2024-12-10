<template>
  <el-row class="closeBtn" @click="closeApp"> 关闭多时相 </el-row>
  <div class="multitemporal">
    <el-row class="con" type="flex" justify="space-between" align="middle">
      <div class="startPause" @click="tooglePlay">
        <img
          src="../../assets/images/action.svg"
          width="62"
          height="62"
          alt=""
          v-if="isPlay"
        />
        <img
          src="../../assets/images/suspend.svg"
          width="62"
          height="62"
          alt=""
          v-else
        />
      </div>
      <div class="yearSteps">
        <el-row type="flex" class="btns" justify="end">
          <el-autocomplete
            :teleported="false"
            v-model="searchParams.address"
            popper-class="autocomplete"
            :fetch-suggestions="addressQuerySearch"
            value-key="name"
            clearable
            placeholder="请输入地点"
            @select="addressHandleSelect"
            suffix-icon="Search"
          />
          <el-date-picker
            class="dateSelect"
            v-model="searchParams.date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="选择日期"
            @change="selectDateChange"
          >
          </el-date-picker>
        </el-row>
        <swiper
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          :slides-per-view="4"
          :pagination="{ clickable: true }"
          :autoplay="{ disableOnInteraction: false }"
          :scrollbar="{ draggable: true }"
          class="stepList"
        >
          <swiper-slide
            class="step"
            v-for="(item, index) in setpList"
            :key="index"
            @click="onSlideClick(index)"
          >
            <el-divider>
              <img src="@/assets/images/yearCircle.svg" alt="" />
              <div :class="currentIndex == index ? 'active_tep' : ''"></div>
            </el-divider>
            <span class="label">{{ item.label }}</span>
          </swiper-slide>
          <div class="leftArrow" @click="addYearChange(-1)" v-if="historyYear">
            <img
              src="../../assets/images/line_next.svg"
              width="15"
              height="15"
              alt=""
            />
          </div>
          <div class="rightArrow" @click="addYearChange(1)" v-if="newYear">
            <img
              src="../../assets/images/line_previous.svg"
              width="15"
              height="15"
              alt=""
            />
          </div>
        </swiper>
      </div>
      <div class="empty"></div>
    </el-row>
  </div>
</template>

<script lang="ts">
import { flyToBbox } from "@/utils/cesium/tools";
const turf = require("@turf/turf");
import { defineComponent } from "vue";
import { useGisDataStore } from "@/store/gisData";
import {
  getResourceUrl,
  findPid,
  getGisDataInfo,
  previewMapServiceById,
  findExternalTile,
} from "@/api/resourceCentre";
import { searchXzqhByName } from "@/api/gateway";
import {
  VideoPlay,
  VideoPause,
  ArrowLeft,
  ArrowRight,
  Search,
} from "@element-plus/icons-vue";
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";

export default defineComponent({
  name: "multitemporal",
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      gisDataStore: null,
      SearchIcon: Search,
      searchParams: {
        address: "",
        date: "",
      },
      useSwiper: null,
      historyYear: true,
      newYear: true,
      isPlay: true,
      yearStep: 1,
      setpList: [],
      timer: null,
      currentIndex: -1,
    };
  },
  async mounted() {
    this.gisDataStore = useGisDataStore();
    console.log(this.gisDataStore, "this.gisDataStore");

    this.initWxyxData();
  },
  methods: {
    addressQuerySearch(queryString: string, cb: any) {
      searchXzqhByName({ name: queryString }).then((res) => {
        if (res.code == 200) {
          cb(res.data);
        }
      });
    },
    addressHandleSelect(address) {
      const addressGeoJson = this.parseWKTToGeoJSON(address.theGeom);

      const bbox = turf.bbox(addressGeoJson);
      flyToBbox(window.$viewer, bbox);
    },

    parseWKTToGeoJSON(wkt) {
      const geoJSON = {
        type: "MultiPolygon",
        coordinates: [],
      };

      // 去掉 MULTIPOLYGON 前缀和最外层的括号
      let polygonText = wkt.replace("MULTIPOLYGON(", "").replace(")", "");

      // 按照 "),(" 拆分多边形组
      const polygons = polygonText.split(")),((");

      polygons.forEach((polygon) => {
        // 清理多边形坐标的括号
        polygon = polygon.replace("((", "").replace("))", "");

        const coordinates = polygon.split(",").map((point) => {
          const [lon, lat] = point.trim().split(" ").map(Number);
          return [lon, lat];
        });

        // 添加到 MultiPolygon 坐标中（嵌套数组符合 GeoJSON 格式）
        geoJSON.coordinates.push([coordinates]);
      });

      return geoJSON;
    },
    async findSeviceData(id) {
      return new Promise((resovle, reject) => {
        findExternalTile(id).then(async (res) => {
          if (res.code == 200) {
            resovle(res.data);
          }
        });
      });
    },

    async initWxyxData() {
      const wxyxGisData = this.gisDataStore.gisData.filter(async (item) => {
        let externalTile = {
          type: -1,
        };
        if (item.isExternalTile == "1") {
          externalTile = await this.findSeviceData(item.externalId);
        }
        return item.topId == 1 || externalTile.type == 1;
      });
      wxyxGisData.sort(
        (a, b) => new Date(a.updateTime) - new Date(b.updateTime)
      );
      this.setpList = await Promise.all(
        wxyxGisData.map(async (item) => {
          let serviceUrl;
          let serviceSrs;
          let serviceScheme;
          if (item.isExternalTile == "1") {
            const externalTile = await this.findSeviceData(item.externalId);
            console.log(externalTile, "externalTile");
            serviceUrl = externalTile.serviceApi;
            serviceSrs = externalTile.tileParams.profile;
          } else {
            let { url, maxX, maxY, minX, minY, srs } = await this.getUrl(
              item,
              item.topId
            );
            serviceUrl = url;
            serviceSrs = srs;
          }
          console.log(serviceUrl);
          console.log(serviceSrs);
          console.log(serviceScheme);

          //     if (
          //   proj == "WebMercatorQuad" ||
          //   proj == "EPSG:3857" ||
          //   proj == "EPSG:900913"
          // ) {
          //   return this.MercatorScheme;
          // } else {
          //   return this.GeographicScheme;
          // }

          if (
            serviceSrs == "EPSG:900913" ||
            serviceSrs == "EPSG:3857" ||
            serviceSrs == "WebMercatorQuad"
          ) {
            serviceScheme = new Cesium.WebMercatorTilingScheme();
          } else {
            serviceScheme = new Cesium.GeographicTilingScheme({
              numberOfLevelZeroTilesX: 2,
              numberOfLevelZeroTilesY: 1,
            });
          }

          const imageProvider = new window.$Cesium.UrlTemplateImageryProvider({
            url: serviceUrl,
            tilingScheme: serviceScheme,
          });
          // const rectangle = Cesium.Rectangle.fromDegrees(
          //   minX,
          //   minY,
          //   maxX,
          //   maxY
          // );
          const imageLayer = new window.$Cesium.ImageryLayer(imageProvider, {
            // rectangle:rectangle
          });
          return {
            label: item.name,
            updateTime: item.updateTime,
            layer: imageLayer,
          };
          // return {
          //   label:item.label,
          //   layer: new window.$Cesium.ImageryLayer(new window.$Cesium.UrlTemplateImageryProvider({
          //     url: item.tileUrl
          //   }))
          // }
        })
      );
      console.log(this.setpList, "this.setpList");
    },
    getUrl(row, parentId) {
      var id = row.domServiceId;
      if (!id) {
        this.$message("数据错误");
        return;
      }

      return new Promise((resovle, reject) => {
        previewMapServiceById(id, parentId).then((res) => {
          if (res.code == 200 && res.data.status == 2) {
            resovle(res.data);
          } else {
            this.$message.error(
              row.name + "获取服务地址失败:" + res.errorMessage
            );
            return;
          }
        });
      });
    },
    // getUrl(tableId) {
    //   return new Promise((resovle, reject) => {
    //     getResourceUrl(tableId).then((res) => {
    //       if (res.code == 200 && res.data.status == 1) {
    //         resovle(res.data);
    //       } else {
    //         resovle(false);
    //       }
    //     });
    //   });
    // },
    selectDateChange() {
      const targetDate = new Date(this.searchParams.date).getTime();

      let closestIndex = -1;
      let minDiff = Infinity;

      this.setpList.forEach((item, index) => {
        const updateTime = new Date(item.updateTime).getTime();
        const diff = Math.abs(updateTime - targetDate);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      const oldIdx = this.currentIndex;
      this.currentIndex = closestIndex;
      this.updateLayer(oldIdx, this.currentIndex);

      console.log(this.setpList[closestIndex]);
    },
    closeApp() {
      for (let i = 0; i < this.setpList.length; i++) {
        const layer = this.setpList[i].layer;
        window.$viewer.imageryLayers.remove(layer, false);
      }
      if (this.timer) clearInterval(this.timer);
      this.$parent.currentToolIndex = -1;
      this.$parent.currentToolPanel = false;
      this.$parent.currentToolTitle = "";
      this.gisDataStore.show = true;
    },
    onSwiper(swiper: any) {
      this.useSwiper = swiper;
    },
    tooglePlay() {
      this.isPlay = !this.isPlay;
      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.isPlay) return;
          this.addYearChange(1);
        }, 2000);
      }
    },
    addYearChange(num: Number) {
      const oldIdx = this.currentIndex;
      this.currentIndex = (this.currentIndex + num) % this.setpList.length;
      this.updateLayer(oldIdx, this.currentIndex);
    },
    onSlideClick(index) {
      const oldIdx = this.currentIndex;
      this.currentIndex = index;
      this.updateLayer(oldIdx, this.currentIndex);
    },
    updateLayer(oldIdx, newIdx) {
      const viewer = window.$viewer;
      if (oldIdx >= 0) {
        const layer = this.setpList[oldIdx].layer;
        if (viewer.imageryLayers.indexOf(layer) >= 0) {
          viewer.imageryLayers.remove(layer, false);
        }
      }
      if (newIdx >= 0) {
        const layer = this.setpList[newIdx].layer;
        if (viewer.imageryLayers.indexOf(layer) < 0) {
          viewer.imageryLayers.add(layer);
        }
      }
      if (newIdx >= 0) {
        this.useSwiper.slideTo(4 * (newIdx / 4));
      }
    },
  },
  beforeDestroy() {
    this.closeApp();
  },
});
</script>
<style lang="scss" scoped>
@import "./index.scss";
</style>
