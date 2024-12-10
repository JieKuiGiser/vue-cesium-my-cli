<style lang="scss">
@import "./index.scss";
</style>
<template>
  <div class="colorPicker">
    <el-color-picker v-model="styleData.value" @change="colorPickerChange"></el-color-picker>
  </div>
</template>
<script>
export default {
  props: ["styleData"],
  name: "colorPicker",
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
    colorPickerChange(val){
        this.$emit('styleChange',this.styleData)
    }
  },
  created() {},
  mounted() {
  },
};
</script>
