import { App } from "vue";
import MyTree from "./MyTree/index.vue";
import PageVue from "./Page/index.vue";
import BarVue from "./Echarts/bar.vue";
import PieVue from "./Echarts/pie.vue";
import LinesVue from "./Echarts/line.vue";
import FooterVue from "./MenhuFooter/index.vue";
import DrawToolsVue from "./drawTools/index.vue";
import Multitemporal from "./Multitemporal/index.vue";
import MeasureToolsVue from "./measureTools/index.vue";
import PopupVue from "./Popup/index.vue";
import MapReset from "./MapReset/index.vue";
import MapOrientation from "./MapOrientation/index.vue";
import MapLayerManage from "./MapLayerManage/index.vue";
import MapStyle from "./MapStyle/index.vue";
import MapView from "./MapView/index.vue";
import MapZoom from "./MapZoom/index.vue";
import MapFullscreen from "./MapFullscreen/index.vue";
import MapLabel from "./MapLabel/index.vue";


const components = [
  { title: "Page", componentName: PageVue },
  { title: "Bar", componentName: BarVue },
  { title: "Pie", componentName: PieVue },
  { title: "Lines", componentName: LinesVue },
  { title: "Footer", componentName: FooterVue },
  { title: "DrawTools", componentName: DrawToolsVue },
  // { title: "Multitemporal", componentName: Multitemporal },
  { title: "MeasureTools", componentName: MeasureToolsVue },
  { title: "Popup", componentName: PopupVue },
  { title: "MapReset", componentName: MapReset },
  { title: "MapOrientation", componentName: MapOrientation },
  // { title: "MapLayerManage", componentName: MapLayerManage },
  // { title: "MapStyle", componentName: MapStyle },
  // { title: "MapView", componentName: MapView },
  { title: "MapZoom", componentName: MapZoom },
  { title: "MapFullscreen", componentName: MapFullscreen },
  { title: "MapLabel", componentName: MapLabel },
  { title: "MyTree", componentName: MyTree },
];

export default {
  install(app: App) {
    components.forEach((item) => {
      // 通过循环遍历数据批量注册组件
      app.component(item.title, item.componentName);
    });
  },
};
