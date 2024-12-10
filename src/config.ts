// 判断是否生产模式还是开发模式
const isProd = process.env.NODE_ENV === "production" ? true : false;
// 生产模式接口ip
const PROD_HOST = "http://192.168.16.43:50001";
// 开发模式接口ip
const DEV_HOST = "http://192.168.16.43:50001";

export const config = {
  // 接口URL
  baseurl: isProd ? `${PROD_HOST}/gateway` : `${DEV_HOST}/gateway`,
  tilesUrl: {
    satellite: "http://192.168.16.41/global/UTM/{z}/{x}/{y}.jpg",
    satelliteFormat: "jpg",
    satelliteMaxZoom: "20",
    satelliteSrs: "WebMercatorQuad",
    satelliteType: "xyz",
    demUrl: "http://192.168.16.41/dem/dem-l10-1/",
    demFormat: "terrain",
    demMaxDoom: "10",
    rgbDemUrl:
      "http://192.168.16.39:8080/geoserver/fdtop/gwc/service/wmts?layer=fdtop%3Adixing-global-dem-l10-rgb&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
    rgbDemType: "wmts",
    rgbDemFormat: "png",
    rgbDemSrs: "WebMercatorQuad",
    rgbDemMaxZoom: "21",
    vector:
      "http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
    vectorType: "xyz",
    vectorFormat: "jpg",
    vectorSrs: "WebMercatorQuad",
    vectorMaxZoom: "18",
  },
};
