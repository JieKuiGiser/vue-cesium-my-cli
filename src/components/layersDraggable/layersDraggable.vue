<style lang="scss" scoped>
@import "./layersDraggable.scss";
</style>
<template>
  <div class="layersSrcoll">
    <draggable
      tag="ul"
      :list="layersData.features"
      class="list-group"
      handle=".handle"
      @end="draggableEnd"
      animation="300"
    >
      <transition-group type="transition">
        <li
          class="list-group-item"
          v-for="(feature, index) in layersData.features"
          :key="feature.id"
          :class="{ active: isActive === index }"
          @mousedown="mousedown(feature)"
          @click="toogleLayer(index)"
        >
          <div class="content">
            <img
              class="handle"
              :src="getImgUrl(feature.properties.type)"
              alt=""
            />
            <el-input
              v-model="feature.properties.name"
              @change="editFeatureName"
            ></el-input>
            <img
              class="delItem"
              src="@/assets/images/del.png"
              @click="delItem(feature)"
              alt=""
            />
          </div>
        </li>
      </transition-group>
    </draggable>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { mapGetters } from "vuex";
import poi from "@/assets/images/hui-poi.png";
import zhixian from "@/assets/images/hui-zhixian.png";
import quxian from "@/assets/images/hui-quxian.png";
import duobianx from "@/assets/images/hui-duobianx.png";
import yuan from "@/assets/images/hui-yuan.png";
import tuoyuan from "@/assets/images/hui-tuoyuan.png";
import zhengfangx from "@/assets/images/hui-zhengfangx.png";
import lingxing from "@/assets/images/hui-lingxing.png";
import wenzi from "@/assets/images/hui-wenzi.png";
import celiang from "@/assets/images/hui-celiang.png";
import celiangxian from "@/assets/images/hui-celiangxian.png";
import celiangmian from "@/assets/images/hui-celiangmian.png";
export default {
  name: "layersDraggable",
  components: {
    draggable,
  },
  computed: {
    ...mapGetters(["baseShapeList"]),
  },
  data() {
    return {
      isActive: 0,
      layersData: {
        type: "FeatureCollection",
        features: [],
      },
      currentClickData: {},
    };
  },
  watch: {
    "$store.state.drawMap.baseShapeList": {
      handler(newValue, oldValue) {
        if (sessionStorage.getItem("baseShapeList")) {
          this.layersData = JSON.parse(sessionStorage.getItem("baseShapeList"));
          this.$parent.$parent.$parent.changeStyleModal(
            this.layersData.features
          );
          this.$forceUpdate();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {},
  methods: {
    // 找到点击图层的初始位置
    mousedown(layer) {
      this.currentClickData = layer;
    },
    // 找到点击图层拖拽结束时的位置
    draggableEnd(e) {
      this.$parent.$parent.$parent.updateDrawData(this.layersData);
      this.isActive = e.newIndex;
    },
    getImgUrl(val) {
      let imgurl = poi;
      switch (val) {
        case "POI":
          imgurl = poi;
          break;
        case "直线":
          imgurl = zhixian;
          break;
        case "曲线":
          imgurl = quxian;
          break;
        case "多边形":
          imgurl = duobianx;
          break;
        case "圆形":
          imgurl = yuan;
          break;
        case "椭圆":
          imgurl = tuoyuan;
          break;
        case "矩形":
          imgurl = zhengfangx;
          break;
        case "文字":
          imgurl = wenzi;
          break;
        case "测量线":
          imgurl = celiangxian;
          break;
        case "测量面":
          imgurl = celiangmian;
          break;
      }
      return imgurl;
    },
    delItem(feature) {
      this.isActive = this.isActive - 1;
      this.$parent.$parent.$parent.delDrawItem(feature);
      this.$emit("switchLayer", this.isActive, this.layersData);
      this.$forceUpdate();
    },
    editFeatureName(val) {
      if (val) {
        this.$parent.$parent.$parent.updateDrawData(this.layersData);
      } else {
        this.$message.error("图层名称不能为空！");
      }
    },
    toogleLayer(index) {
      this.isActive = index;
      this.$emit("switchLayer", this.isActive, this.layersData);
    },
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.$emit("switchLayer", this.isActive, this.layersData);
    }, 2000);
  },
};
</script>
