/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-12-29 13:45:20
 * @LastEditTime: 2021-12-29 13:47:20
 * @LastEditors: zouyaoji
 * @Description:
 * @FilePath: \vue-cesium-vite-starter\src\main.ts
 */
import { createApp, Directive } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "./router/index"; // 引入router
import "@/router/permission";
import VueCesium from "vue-cesium";
import "vue-cesium/dist/index.css";
import ElementPlus from "element-plus";
import locale from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "./assets/css/public.css";
import animated from "animate.css"; // npm install animate.css --save安装，在引入

import vue3dLoader from "vue-3d-loader";

import SvgIcon from "./components/SvgIcon/index.vue";

import Component from "./components/index";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import scrollbarDirective from "@/directive/scroll/scrollbarDirective";

import Vue3DraggableResizable from "vue3-draggable-resizable";
//default styles
import "vue3-draggable-resizable/dist/Vue3DraggableResizable.css";

if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

//引用富文本编辑器
import VueQuillEditor from "vue-quill-editor";
//引入富文本css
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(VueQuillEditor);
app.use(vue3dLoader);
app.use(Vue3DraggableResizable);
app.use(animated);
app.use(scrollbarDirective);
app.use(ElementPlus, { locale });
app.use(router);
app.use(Component);
app.component("svg-icon", SvgIcon);
// 全局注册icon（后期可优化，按需注册）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(VueCesium, {
  // cesiumPath 是指引用的Cesium.js路径，如
  cesiumPath: "./../Cesium/Cesium.js",
  // cesiumPath: 'https://unpkg.com/cesium/Build/Cesium/Cesium.js'
  // cesiumPath: 'https://www.supermapol.com/earth/Build/Cesium/Cesium.js',
  // 使用Cesium ion的数据源需要到https://cesium.com/ion/申请一个账户，获取Access Token。不指定的话可能导致 CesiumIon 的在线影像、地形加载失败
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MGEyYTA0Ni04ODVkLTQ1OTAtOWFhNC02MDUxODU1MGQyYzUiLCJpZCI6MTMyOTA3LCJpYXQiOjE2ODExMDU5NjR9.2pvw9aYzgbfW7KHlDf8KDvl_V1NHF1U7uLzVssM1YjM",
});


app.mount("#app");
