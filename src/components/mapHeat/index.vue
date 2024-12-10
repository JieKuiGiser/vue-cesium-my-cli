<style lang="scss" scoped>
@import "./index.scss";
</style>
<template>
  <div class="mapDataTest">
    <div
      style="width: 100%; height: 100%"
      customClass="mainMap"
      v-loading="mapLoading"
      element-loading-text="地图加载中"
      :element-loading-spinner="loadingSvg"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <vc-viewer
        ref="viewerRef"
        shouldAnimate
        :sceneMode="3"
        animation
        timeline
        @ready="onViewerReady"
        @leftClick="leftClickChange"
        @rightClick="rightClickChange"
      >
        <vc-layer-imagery
          :alpha="alpha"
          :brightness="brightness"
          :contrast="contrast"
          @ready="onRasterImageRead"
          :sort-order="10"
        >
          <vc-imagery-provider-urltemplate
            ref="rasterRef"
            :url="$config.tilesUrl.satellite"
          ></vc-imagery-provider-urltemplate>
        </vc-layer-imagery>
      </vc-viewer>
    </div>
  </div>
</template>

<script>
import { screenCoordinatesToDegrees, flyToBbox } from "@/utils/cesium/tools";
import { Plus, Minus, SortUp, SortDown } from "@element-plus/icons-vue";
import * as satellite from "satellite.js";
// import * as Cesium from "cesium";
import { initSenSor } from "../../utils/cesium/cesium-sensor-volumes";
import getCesiumHeat from "cesiumjs-heat";
const turf = require("@turf/turf");
export default {
  name: "MapDataView",
  props: {},
  data() {
    return {
      Plus: Plus,
      Minus: Minus,
      SortUp: SortUp,
      SortDown: SortDown,
      mapLoading: true,
      MercatorScheme: null,
      GeographicScheme: null,
      mapProjection: null,
      sats: null,
      CesiumSensorVolumes: null,
      heatMapParams: {},
    };
  },
  created() {},
  mounted() {
    console.log(this.$config);
    window.addEventListener(
      "message",
      (e) => {
        const params = e.data;
        this.heatMapParams = params;
        console.log(params, "父组件参数");
      },
      false
    );
  },

  methods: {
    leftClickChange(e) {
      const pick = window.$viewer.scene.pick(e.position);
      if (Cesium.defined(pick)) {
      } else {
        if (this.geojsonDataShow) {
          this.geojsonDataShow = false;
        }
      }
    },
    async onViewerReady({ viewer, Cesium }) {
      window.$viewer = viewer;
      window.$Cesium = Cesium;
      this.CesiumSensorVolumes = initSenSor(Cesium);
      // this.initScript();
      // this.getTLE();
      this.initViewerOpt(window.$viewer);
      this.MercatorScheme = new Cesium.WebMercatorTilingScheme();
      this.GeographicScheme = new Cesium.GeographicTilingScheme();
      this.mapProjection = new Cesium.GeographicProjection();
    },
    initViewerOpt(viewer) {
      viewer.scene.globe.enableLighting = false; //是否开启全局光照
      viewer.shadows = true; //是否开启阴影
      viewer.shadowMap.darkness = 0.3; //阴影透明度--越大越透明
      viewer.scene.debugShowFramesPerSecond = false; //显示fps
      viewer.scene.moon.show = false; //月亮
      viewer.scene.fog.enabled = false; //雾
      viewer.scene.sun.show = false; //太阳
      viewer.scene.skyBox.show = false; //天空盒
      //设置中键放大缩小
      // viewer.scene.screenSpaceCameraController.zoomEventTypes = [
      //   Cesium.CameraEventType.WHEEL,
      //   Cesium.CameraEventType.MIDDLE_DRAG,
      //   Cesium.CameraEventType.PINCH,
      // ];
      // //设置右键旋转
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
    onRasterImageRead(e) {
      this.mapLoading = false;
    },

    addConicSensor() {
      // window.$viewer.scene.primitives.removeAll();
      var position = Cesium.Cartesian3.fromDegrees(0, 0, 1000000);
      var heading = Cesium.Math.toRadians(0);
      var pitch = Cesium.Math.toRadians(90);
      var roll = Cesium.Math.toRadians(0);
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );
      const entity = new Cesium.Entity({
        name: "Test",
        position,
        orientation,
      });
      entity.addProperty("conicSensor");
      entity.conicSensor = new this.CesiumSensorVolumes.ConicSensorGraphics({
        radius: 10000000,
        innerHalfAngle: Cesium.Math.toRadians(0),
        outerHalfAngle: Cesium.Math.toRadians(15),
        lateralSurfaceMaterial: Cesium.Color.GOLD.withAlpha(0.15),
        intersectionColor: Cesium.Color.GOLD.withAlpha(0.3),
        intersectionWidth: 1,
      });
      window.$viewer.entities.add(entity);
    },
    initHeatMap(geojson) {
      const CesiumHeat = getCesiumHeat(window.$Cesium);
      const bbox = turf.bbox(geojson);
      console.log(geojson);
      console.log(bbox);

      let heat = new CesiumHeat(
        window.$viewer,
        geojson.features.map((item) => {
          return {
            x: item.geometry.coordinates[0],
            y: item.geometry.coordinates[1],
            value: item.properties.population,
          };
        }),
        bbox,
        {},
        // auto radius change with height | 自动按高度控制热点的辐射，默认值如下
        {
          enabled: true, // 是否开启，关闭的话不会自动更新
          min: 6375000, // 最低高度，对应高度的辐射为minRadius
          max: 10000000, // 最大高度，对应高度的辐射为maxRadius
          maxRadius: 20 * 10,
          minRadius: 5 * 10,
        }
      );
      flyToBbox(window.$viewer, bbox);

    },

    handleHeatData(data, filed) {
      const features = data.map((item) => {
        const match = item[filed].match(/\(([^ ]+) ([^ ]+)\)/);
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(match[1]), parseFloat(match[2])],
          },
          properties: item,
        };
      });
      return {
        type: "FeatureCollection",
        features,
      };
    },
    getTLE() {
      this.satlliteTest();
    },
    /**
     * 测试轨道
     * 改函数可直接运行
     */
    satlliteTest() {
      const viewer = window.$viewer;
      // Sample TLE-tle数据示例，来源于satellite.js 官网
      var tleName = "TIANMU-1 22";
      var tleLine1 =
          "1 58663U 23208D   24136.87325080  .00010959  00000+0  59758-3 0  9992",
        tleLine2 =
          "2 58663  97.4058 250.1716 0006629 132.9489 227.2301 15.14526722 21289";

      var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      let totalIntervalsInDay = satrec.no * 1440 * 0.159155; //1440 = min && 0.159155 = 1turn
      // 获得运行一圈的分钟数
      let minsPerInterval = 1440 / totalIntervalsInDay; // mins for 1 revolution around earth
      // 获取startTime && endTime
      const { startTime, endTime } = this.getStratEndTime(minsPerInterval);
      viewer.clock.startTime = startTime.clone();
      viewer.clock.endTime = endTime.clone();
      viewer.clock.currentTime = startTime.clone();
      // 获取positionProperty
      const positionProperty = this.getPositionSample(satrec, minsPerInterval);
      const entity = new Cesium.Entity({
        id: "weixing",
        name: "卫星",
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: startTime,
            stop: endTime,
          }),
        ]),
        position: positionProperty,
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        orientation_c: new Cesium.CallbackProperty((time) => {
          let position = Cesium.Property.getValueOrUndefined(
            positionProperty,
            time,
            new Cesium.Cartesian3()
          );
          const hpr = new Cesium.HeadingPitchRoll(
            0,
            Cesium.Math.toRadians(180),
            0
          );
          return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        }, false),
        // 卫星模型
        model: {
          uri: "http://localhost:3000/model/weixin.gltf", // 模型uri
          minimumPixelSize: 128,
        },
        label: new Cesium.LabelGraphics({
          text: tleName,
          font: "15px Arial",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineColor: Cesium.Color.DIMGREY,
          outlineWidth: 2,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          pixelOffset: new Cesium.Cartesian2(10, 0),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            2000,
            8e7
          ),
          translucencyByDistance: new Cesium.NearFarScalar(6e7, 1.0, 8e7, 0.0),
        }),
        point: new Cesium.PointGraphics({
          pixelSize: 6,
          color: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.DIMGREY,
          outlineWidth: 1,
        }),
        path: {
          resolution: 1,
          material: Cesium.Color.WHITE.withAlpha(0.15),
          width: 2,
          // leadTime: 720,
          // trailTime: 720
        },
      });
      // 插值
      entity.position.setInterpolationOptions({
        interpolationDegree: 5,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
      });
      viewer.entities.add(entity);
      this.addSensor("test");
    },
    /**
     * 计算 startTime && endTime
     * minsPerInterval: 一圈分钟数
     */
    getStratEndTime(minsPerInterval) {
      const startTimeStamp = Date.now();
      // 结束时间为一圈后的时间
      const endTimeStamp = startTimeStamp + minsPerInterval * 60 * 1000;
      let startTime = new Cesium.JulianDate.fromDate(new Date(startTimeStamp));
      startTime = Cesium.JulianDate.addHours(
        startTime,
        8,
        new Cesium.JulianDate()
      );
      let endTime = new Cesium.JulianDate.fromDate(new Date(endTimeStamp));
      endTime = Cesium.JulianDate.addHours(endTime, 8, new Cesium.JulianDate());
      return {
        startTime,
        endTime,
      };
    },
    /**
     * 计算SampledPositionProperty
     * satrec: satellite.twoline2satrec返回值
     * minsPerInterval：一圈分钟数
     */
    getPositionSample(satrec, minsPerInterval) {
      const positionProperty = new Cesium.SampledPositionProperty();
      const now = Date.now();
      for (let i = 0; i <= minsPerInterval; i++) {
        // 从现在起，获取一圈内每分钟的位置;生成一个数组，用作插值
        const curTimeDate = new Date(now + i * 60 * 1000);
        var positionAndVelocity = satellite.propagate(satrec, curTimeDate); // 此方法拿到的是惯性系坐标
        var gmst = satellite.gstime(new Date(curTimeDate));
        // 惯性
        const positionEci = positionAndVelocity.position;
        // 惯性转成地固
        const positionEcf = satellite.eciToEcf(positionEci, gmst);
        // julian日期
        const curJulianDate = new Cesium.JulianDate.fromDate(curTimeDate);
        // 北京时
        const d = new Cesium.JulianDate.addHours(
          curJulianDate,
          8,
          new Cesium.JulianDate()
        );
        positionProperty.addSample(
          d,
          // 这里使用惯性或者地固都行，但是地固系在端点处偏差较大，因此使用惯性系
          new Cesium.Cartesian3(
            positionEci.x * 1000,
            positionEci.y * 1000,
            positionEci.z * 1000
          )
        );
      }
      return positionProperty;
    },

    addSensor(sate_id) {
      const viewer = window.$viewer;
      const color = "#FFD700";
      let customSensor =
        new this.CesiumSensorVolumes.RectangularPyramidSensorVolume();

      // radius 是指波束的长度
      customSensor.radius = 1000000.0;
      customSensor.id = `${sate_id}_sensor`;
      customSensor.intersectionWidth = 1;

      customSensor.xHalfAngle = Cesium.Math.toRadians(15);
      customSensor.yHalfAngle = Cesium.Math.toRadians(15);
      customSensor.lateralSurfaceMaterial = Cesium.Material.fromType("Color");
      customSensor.lateralSurfaceMaterial.uniforms.color =
        new Cesium.Color.fromCssColorString(color).withAlpha(0.3);
      // 默认矩阵
      customSensor.modelMatrix = new Cesium.Matrix4();
      // 使用preRender 监听卫星每帧运动
      viewer.scene.preRender.addEventListener((scene, time) => {
        customSensor.show = false;
        // 判断数据源中所有实体是否准备就绪，viewer.dataSourceDisplay.dataSources = viewer.dataSources
        if (viewer.dataSourceDisplay.ready) {
          const satellite = viewer.entities.getById("weixing");
          // 根据时间获取卫星实时笛卡尔位置
          let position = Cesium.Property.getValueOrUndefined(
            satellite.position,
            time,
            new Cesium.Cartesian3()
          );
          // 根据卫星位置和朝向转换为矩阵信息，此处使用的是后台计算的四元数，实际一般情况应该使用Cesium.Transforms+position转换
          let m = Cesium.Matrix4.fromRotationTranslation(
            Cesium.Matrix3.fromQuaternion(
              satellite.orientation_c.getValue(time),
              new Cesium.Matrix3()
            ),
            position,
            new Cesium.Matrix4()
          );
          customSensor.modelMatrix = m;
          customSensor.show = true;
        }
      });
      viewer.scene.primitives.add(customSensor);
    },
  },
  watch: {
    heatMapParams: {
      deep: true,
      handler(val) {
        if (this.heatMapParams.hasOwnProperty("geojson") && !this.mapLoading) {
          this.initHeatMap(this.heatMapParams.geojson);
        }
      },
    },
    mapLoading(val) {
      if (this.heatMapParams.hasOwnProperty("geojson") && !this.mapLoading) {
        this.initHeatMap(this.heatMapParams.geojson);
      }
    },
  },
};
</script>
