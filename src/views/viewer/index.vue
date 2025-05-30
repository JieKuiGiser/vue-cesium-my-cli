<template>
   <div class="home">
      <el-container>
         <el-header>

            <el-row type="flex" justify="space-between">
               <el-col :span="12">
                  <p class="logo_text">xxxxxxxxxx系统</p>
                  <img src="@/assets/images/tab-0.png" class="logo" />
                  <el-menu
                     :default-active="activeIndex"
                     class="el-menu-demo"
                     mode="horizontal"
                     background-color="#23354e"
                     text-color="#8EAFD6"
                     active-text-color="#19E3FF"
                     @select="handleSelect"
                  >
                     <el-menu-item
                        v-for="(item, index) in menuList"
                        :key="index"
                        :index="item.path"
                        :disabled="item.state == 'disable'"
                        >{{ item.name }}</el-menu-item
                     >
                  </el-menu>
               </el-col>
               <el-col :span="12">
                  <div class="right">
                     <div class="location">
                        <img src="@/assets/images/weizhi.svg" />
                        <span>未知区域</span>
                     </div>
                     <div class="time">
                        <p>
                           北京时间：<span>{{ timeList.year }}</span> 年
                           <span>{{ timeList.month }}</span> 月
                           <span>{{ timeList.day }}</span> 日
                           <span>{{ currentTime }}</span>
                        </p>
                     </div>
                     <img src="@/assets/images/auto.svg" class="auto" />
                  </div>
               </el-col>
            </el-row>
         </el-header>
         <el-main v-if="isMapView">
            <div
               style="width: 100%; height: 100%"
               customClass="mainMap"
               v-loading="mapStore.mapLoading"
               element-loading-text="地图加载中"
               element-loading-background="rgba(0, 0, 0, 0.8)"
            >
               <vc-viewer
                  ref="viewerRef"
                  shouldAnimate
                  animation
                  timeline
                  :sceneMode="mapStore.mapParams.sceneMode"
                  :showRenderLoopErrors="false"
                  @ready="onViewerReady"
                  @leftClick="leftClickChange"
                  @rightClick="rightClickChange"
               >
                  <vc-datasource-geojson
                     ref="chinaBorderRef"
                     :data="chinaBorder"
                     @ready="onChinaBorderReady"
                     :show="chinaBordershow"
                  ></vc-datasource-geojson>
                  <vc-layer-imagery
                     ref="rasterImgRef"
                     :alpha="alpha"
                     :brightness="brightness"
                     :contrast="contrast"
                     @ready="onRasterImageRead"
                     :sort-order="10"
                  >
                     <vc-terrain-provider-cesium
                        v-if="mapStore.defaultStyle.terrain"
                        @ready="onDemRead"
                        ref="terrainRef"
                        :url="demUrl"
                     ></vc-terrain-provider-cesium>
                     <vc-imagery-provider-urltemplate
                        @ready="onDomRead"
                        v-if="rasterType == 'xyz' || rasterType == 'tms'"
                        ref="rasterRef"
                        :tilingScheme="rasterScheme"
                        :url="rasterUrl"
                     ></vc-imagery-provider-urltemplate>
                  </vc-layer-imagery>
                  <vc-layer-imagery
                     ref="rgbDemImg"
                     :alpha="alpha"
                     :brightness="brightness"
                     :contrast="contrast"
                     :sort-order="11"
                  >
                     <vc-imagery-provider-wmts
                        :url="rgbDemUrl"
                        layer="xxx"
                        format="xxx"
                        wmtsStyle="xxx"
                        :tilingScheme="wmtsScheme"
                        tileMatrixSetID="xxx"
                     ></vc-imagery-provider-wmts>
                  </vc-layer-imagery>

                  <vc-status-bar position="bottom"></vc-status-bar>

                  <router-view
                     v-if="!mapStore.mapLoading"
                     :key="$route.fullPath"
                  ></router-view>
                  <!-- 地理信息数据显示 -->
                  <MapGisDataView ref="mapGisDataViewRef"></MapGisDataView>
               </vc-viewer>
            </div>
         </el-main>
         <el-main v-else>
            <router-view :key="$route.fullPath"></router-view>
         </el-main>
      </el-container>
   </div>
</template>
<script lang="ts">
import axios from "axios";
import { useMapStore } from "@/store/map";
import { useMapEventStore } from "@/store/mapEvent";
import { storeToRefs } from "pinia";
import { defineComponent } from "vue";
import chinaBorder from "@/assets/libs/boundData/china.json";
import position from "@/utils/position.json";
import { ref } from "vue";
import {
   VcDrawingsProps,
   VcGraphicsBillboardProps,
   VcGraphicsLabelProps,
   VcGraphicsPointProps,
   VcViewerRef,
   VcViewer,
} from "vue-cesium";
import { VcPickEvent, VcReadyObject } from "vue-cesium/es/utils/types";
import moment from "moment";
import { Base64 } from "js-base64";
export default defineComponent({
   name: "home",
   data() {
      return {
         menuList: [
            {
               id: "1",
               name: "首页",
               path: "/home",
            },
            {
               id: "2",
               name: "xxx",
               path: "/taskRecord",
            },
            {
               id: "3",
               name: "xxx",
               path: "/carManage",
            },
         ],
         // top 时间
         timeList: {
            year: "",
            month: "",
            day: "",
            hour: "",
         },
         currentTime: "",
         userInfo: null,
         isMapView: true,
         chinaBorder: chinaBorder,
         loadingSvg: `
       <path class="loadingSvg" d="
         M 30 15
         L 28 17
         M 25.61 25.61
         A 15 15, 0, 0, 1, 15 30
         A 15 15, 0, 1, 1, 27.99 7.5
         L 15 15
       " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
     `,
         mapStore: null,
         gisDataStore: null,
         mapEventStore: null,
         mapStyleIndex: 2,
         alpha: 1,
         brightness: 1,
         contrast: 1,
         rasterUrl: "",
         demUrl: "",
         rgbDemUrl: "",
         wmtsScheme: null,
         rasterScheme: null,
         rasterType: null,
         splitWidth: 100,
         activeIndex: "/home",
         map: null,
         lon: "119",
         lat: "39",
         bearing: "0",
         altitude: "159.3",
         pressure: "1014.8",
         afterMap: null,
         mapFrame: "mapbox",
         viewer: null,
         drawModesShow: false,
         isEagle: true,
         userInfoShow: false,
         chinaBordershow: true,
         loadingDomTime: Date.now(),
         loadingDemTime: Date.now(),
         scheme3857: null,
         scheme4326: null,
      };
   },
   computed: {
      activeMenu() {
         const route = this.$route;
         const { meta, path } = route;
         // if set path, the sidebar will highlight the path you set
         if (meta.activeMenu) {
            return meta.activeMenu;
         }
         return path;
      },
   },
   created() {
      this.getTime();
  setInterval(() => {
    this.getCurrentTime(); // 每秒更新时间
  }, 1000);
      this.initView();
      this.mapStore = useMapStore();
      this.mapEventStore = useMapEventStore();
      if (this.mapStore.defaultStyle.mapType == "tms") {
         this.rasterUrl = this.mapStore.defaultStyle.mapUrl.replace(
            "{y}",
            "{reverseY}"
         );
      } else {
         this.rasterUrl = this.mapStore.defaultStyle.mapUrl;
      }
      this.demUrl = this.mapStore.defaultStyle.demUrl
         ? this.mapStore.defaultStyle.demUrl
         : "";
      this.rgbDemUrl = this.mapStore.defaultStyle.rgbDemUrl
         ? this.mapStore.defaultStyle.rgbDemUrl
         : "";

      this.rasterType = this.mapStore.defaultStyle.mapType;
   },
   mounted() {
      this.nowTimes();
   },

   methods: {
      getTime() {
         let date = new Date();
         let timeArr = moment(date).format("YYYY-MM-DD-HH:mm:ss").split("-");
         this.timeList.year = timeArr[0];
         this.timeList.month = timeArr[1];
         this.timeList.day = timeArr[2];
         // timeList.value.hour = timeArr[3];
      },

      getCurrentTime() {
         const date = new Date();
         const hours = String(date.getHours()).padStart(2, "0");
         const minutes = String(date.getMinutes()).padStart(2, "0");
         const seconds = String(date.getSeconds()).padStart(2, "0");
         this.currentTime = `${hours}:${minutes}:${seconds}`;
      },
      getScheme(val) {
         if (
            val == "WebMercatorQuad" ||
            val == "EPSG:3857" ||
            val == "EPSG:900913"
         ) {
            return this.scheme3857;
         } else if (val == "EPSG:4326") {
            return this.scheme4326;
         }
      },
      onDemRead() {
         const currentTime = Date.now();
         const loadingTime = currentTime - this.loadingDemTime;
         console.log(`加载高程数据用时:${loadingTime}ms`);
      },
      onDomRead() {
         const currentTime = Date.now();
         const loadingTime = currentTime - this.loadingDomTime;
         console.log(`加载卫星影像数据用时:${loadingTime}ms`);
      },
      setViewerProx() {
         // 获取当前相机的位置
         if (window.$viewer) {
            console.log(
               "=================设置新的 setPitch 角度==============="
            );
            console.log(this.mapStore.mapParams.pitch);
            var cameraPosition = window.$viewer.camera.position;
            // 设置新的 pitch 角度
            var newPitch = Cesium.Math.toRadians(this.mapStore.mapParams.pitch);
            var newRoll = Cesium.Math.toRadians(this.mapStore.mapParams.roll);
            var newHeading = Cesium.Math.toRadians(
               this.mapStore.mapParams.heading
            );

            // 设置新的相机视角
            window.$viewer.camera.setView({
               destination: cameraPosition, // 保持当前位置
               orientation: {
                  pitch: newPitch, // 设置新的俯仰角
                  roll: newRoll, // 保持当前滚动角
                  heading: newHeading, // 保持当前偏航角
               },
            });
         }
      },
      initView() {
         if (
            this.$route.path.indexOf("dataResources") != -1 ||
            this.$route.path.indexOf("drawResult") != -1
         ) {
            this.isMapView = false;
            if (this.mapStore) this.mapStore.setMapLoading(false);
         } else {
            this.isMapView = true;
         }
      },
      leftClickChange(e) {
         this.mapEventStore.leftClick.state = true;
         this.mapEventStore.leftClick.position = e.position;
      },
      rightClickChange(e) {
         this.mapEventStore.rightClick.state = true;
         this.mapEventStore.rightClick.position = e.position;
      },
      onRasterImageRead(e) {},
      onViewerReady(readyObj: VcReadyObject) {
         var that = this;
         window.$viewer = readyObj.viewer;
         window.$Cesium = readyObj.Cesium;
         this.initViewerOpt(window.$viewer);
         window.$viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 16500000),
            orientation: {
               heading: Cesium.Math.toRadians(0),
               pitch: Cesium.Math.toRadians(-90),
               roll: Cesium.Math.toRadians(0),
            },
            complete: function callback() {
               // 定位完成之后的回调函数
               // console.log(readyObj.viewer);
               // console.log("cesium地图加载完毕！");
               // console.log(this.viewer);
               that.mapStore.setMapLoading(false);

               // 计算地图加载耗时
               const currentTime = Date.now();
               const mapViewCostTime = currentTime - that.loadingDemTime;
               console.log(`地图加载完成，耗时：${mapViewCostTime}ms`);
            },
         });
         this.scheme3857 = new Cesium.WebMercatorTilingScheme();
         this.scheme4326 = new Cesium.GeographicTilingScheme();
         this.rasterScheme = this.getScheme(this.mapStore.defaultStyle.mapSrs);
      },
      onChinaBorderReady({ Cesium, viewer, cesiumObject }) {
         console.log(cesiumObject);
         console.log(cesiumObject.entities.values);
         for (let i = 0; i < cesiumObject.entities.values.length; i++) {
            const entity = cesiumObject.entities.values[i];

            if (entity.properties._type._value == "国界") {
               // 修改 entity 样式
               entity.polyline = {
                  positions: entity.polyline.positions,
                  width: 2,
                  material: Cesium.Color.fromCssColorString("red"),
               };
            } else if (entity.properties._type._value == "争议") {
               entity.polyline = {
                  positions: entity.polyline.positions,
                  width: 2,
                  material: new Cesium.PolylineDashMaterialProperty({
                     color: Cesium.Color.RED,
                     dashLength: 20, //短划线长度
                  }),
               };
            } else if (entity.properties._type._value == "海洋") {
               entity.polyline = {
                  positions: entity.polyline.positions,
                  width: 0,
                  material: Cesium.Color.fromCssColorString("red"),
               };
            } else if (
               entity.properties._type._value == "省界" ||
               entity.properties._type._value == "港澳"
            ) {
               entity.polyline = {
                  positions: entity.polyline.positions,
                  width: 1,
                  material: Cesium.Color.fromCssColorString("#ccc"),
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                     100000,
                     5000000.0
                  ),
               };
            }
         }
      },
      initViewerOpt(viewer) {
         viewer.scene.globe.enableLighting = true; //是否开启全局光照
         viewer.shadows = true; //是否开启阴影
         viewer.shadowMap.darkness = 0.3; //阴影透明度--越大越透明
         viewer.scene.debugShowFramesPerSecond = false; //显示fps
         viewer.scene.moon.show = true; //月亮
         viewer.scene.fog.enabled = false; //雾
         viewer.scene.sun.show = false; //太阳
         viewer.scene.skyBox.show = true; //天空盒
         //设置中键放大缩小
         // viewer.scene.screenSpaceCameraController.zoomEventTypes = [
         //   Cesium.CameraEventType.WHEEL,
         //   Cesium.CameraEventType.MIDDLE_DRAG,
         //   Cesium.CameraEventType.PINCH,
         // ];
         //设置右键旋转
         // viewer.scene.screenSpaceCameraController.tiltEventTypes = [
         //   Cesium.CameraEventType.RIGHT_DRAG,
         //   Cesium.CameraEventType.PINCH,

         //   {
         //     eventType: Cesium.CameraEventType.RIGHT_DRAG,
         //     modifier: Cesium.KeyboardEventModifier.CTRL,
         //   },

         //   {
         //     eventType: Cesium.CameraEventType.MIDDLE_DRAG,
         //     modifier: Cesium.KeyboardEventModifier.CTRL,
         //   },
         // ];

         // 获取场景中的点击实体相机
         const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
         );

         // 取消绑定点击实体相机的事件处理程序
         viewer.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
         );
      },
      initMounted() {
         // this.getGisInfoData();
         // this.disabledRightClick();
      },
      handleSelect() {
         console.log("to");
      },
      timeFormate(timeStamp) {
         //显示当前时间
         let newDate = new Date(timeStamp);
         let year = newDate.getFullYear();
         let month =
            newDate.getMonth() + 1 < 10
               ? "0" + (newDate.getMonth() + 1)
               : newDate.getMonth() + 1;
         let date =
            newDate.getDate() < 10
               ? "0" + newDate.getDate()
               : newDate.getDate();
         let hh =
            newDate.getHours() < 10
               ? "0" + newDate.getHours()
               : newDate.getHours();
         let mm =
            newDate.getMinutes() < 10
               ? "0" + newDate.getMinutes()
               : newDate.getMinutes();
         let ss =
            newDate.getSeconds() < 10
               ? "0" + newDate.getSeconds()
               : newDate.getSeconds();
         let week = newDate.getDay();
         let weeks = ["日", "一", "二", "三", "四", "五", "六"];
         let getWeek = "星期" + weeks[week];
         this.week = getWeek;
         this.date = year + "." + month + "." + date;
         this.nowTime = hh + ":" + mm + ":" + ss;
      },
      nowTimes() {
         this.timeFormate(new Date());
         setInterval(this.nowTimes, 1000);
         this.clear();
      },
      clear() {
         clearInterval(this.nowTimes);
         this.nowTimes = null;
      },
      // 禁用浏览器自带右键
      disabledRightClick() {
         var el = document.getElementById("cesiumContainer");
         document.oncontextmenu = function () {
            return false;
         };
      },
      showDrawTool() {
         const store = useSpaceDataStore();
         let { showDrawTools } = storeToRefs(store);
         this.drawModesShow = showDrawTools;
         // console.log(showDrawTools)
      },
      showNameDetail() {
         this.userInfoShow = !this.userInfoShow;
      },
      logoutLogin() {
         this.$router.push("/login");
         this.mapStore.resetDefaultMap();
      },
   },
   watch: {
      "mapStore.mapLoading"() {
         if (this.mapStore.mapLoading) {
            this.initMounted();
         }
      },
      "$route.path"() {
         this.initView();
      },
      async "mapStore.mapParams.mapStyleIndex"() {
         if (this.mapStyleIndex != this.mapStore.mapParams.mapStyleIndex) {
            console.log(this.mapStore.defaultStyle);
            this.mapStyleIndex = this.mapStore.mapParams.mapStyleIndex;
            if (this.mapStore.defaultStyle.mapType == "tms") {
               this.rasterUrl = this.mapStore.defaultStyle.mapUrl.replace(
                  "{y}",
                  "{reverseY}"
               );
            } else {
               this.rasterUrl = this.mapStore.defaultStyle.mapUrl;
            }
            this.demUrl = this.mapStore.defaultStyle.demUrl
               ? this.mapStore.defaultStyle.demUrl
               : "";
            this.rgbDemUrl = this.mapStore.defaultStyle.rgbDemUrl
               ? this.mapStore.defaultStyle.rgbDemUrl
               : "";

            this.rasterType = this.mapStore.defaultStyle.mapType;
            this.rasterScheme = this.getScheme(
               this.mapStore.defaultStyle.mapSrs
            );
            await this.$nextTick();
            if (this.rasterType == "xyz" || this.rasterType == "tms") {
               this.$refs.rasterImgRef.reload();
            }
         }
      },
      async "mapStore.mapParams.isTerrain"() {
         await this.$nextTick();
         if (this.$refs.terrainRef) {
            if (this.mapStore.mapParams.isTerrain) {
               this.$refs.terrainRef.load();
            } else {
               this.$refs.terrainRef.unload();
            }
         }
      },
      async "mapStore.mapParams.sceneMode"() {},
      async "mapStore.mapParams.pitch"() {
         await this.$nextTick();
         this.setViewerProx();
      },
      async "mapStore.mapParams.roll"() {
         await this.$nextTick();
         this.setViewerProx();
      },
      async "mapStore.mapParams.heading"() {
         await this.$nextTick();
         this.setViewerProx();
      },
   },
   beforeDestroy() {
   },
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
