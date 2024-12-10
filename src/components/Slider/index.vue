<style lang="scss" scoped>
@import "./index.scss";
</style>
<template>
  <div class="slider">
    <el-row :span="24">
      <el-col :span="21" class="left">
        <el-slider
          @change="sliderChange"
          v-model="styleData.value"
          :max="styleData.maxValue"
          :min="styleData.minValue"
        >
        </el-slider>
      </el-col>
      <el-col :span="3" class="right">
        <div class="unit">
          <span>{{ styleData.value }}</span>
          <span v-if="styleData.isFormat">%</span>
          <span v-else>px</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  props: ["styleData"],
  name: "slider",
  components: {},
  computed: {},
  data() {
    return {
      value: 0,
    };
  },
  watch: {},
  computed: {},
  methods: {
    formatTooltip(val) {
      // return val / 100;
    },
    sliderChange(val){
      this.$emit('styleChange',this.styleData)
    }
  },
  created() {},
  mounted() {
  },
};
</script>
