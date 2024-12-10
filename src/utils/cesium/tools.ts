const SphericalMercator = require("sphericalmercator");

export function flyToPoint(viewer, lonlat, height) {
  const pointCoordinates = Cesium.Cartesian3.fromDegrees(
    lonlat[0],
    lonlat[1],
    height ? height : 1300
  );
  // 缩放跳转到点
  viewer.camera.flyTo({
    destination: pointCoordinates,
    duration: 2, // 缩放动画时长（秒）
  });
}
export function flyToBbox(viewer, bbox) {
  let paddedBbox;
  if (bbox[0] == -180 && bbox[1] == -90 && bbox[2] == 180 && bbox[3] == 90) {
    paddedBbox = bbox;
  } else {
    const padding = 0.5; // 10% 的填充
    // 计算填充后的边界框
    paddedBbox = addPaddingToBbox(bbox, padding);
  }

  console.log(paddedBbox, "paddedBbox");

  const Rectangle = Cesium.Rectangle.fromDegrees(
    paddedBbox[0],
    paddedBbox[1],
    paddedBbox[2],
    paddedBbox[3]
  );
  viewer.camera.flyTo({
    destination: Rectangle,
    duration: 2, // 缩放动画时长（秒）
  });
}
export function changeHeight(height, tileSet) {
  height = Number(height);
  if (isNaN(height)) {
    return;
  }
  var cartographic = Cesium.Cartographic.fromCartesian(
    tileSet.boundingSphere.center
  );
  var surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    cartographic.height
  );
  var offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    height
  );
  var translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  );
  tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}
function addPaddingToBbox(bbox, padding) {
  // 计算边界框的宽度和高度
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];

  // 计算填充后的宽度和高度
  const paddedWidth = width + 2 * padding * width;
  const paddedHeight = height + 2 * padding * height;

  // 计算填充后的边界框的最小坐标和最大坐标
  const paddedMinX = bbox[0] - padding * width;
  const paddedMinY = bbox[1] - padding * height;
  const paddedMaxX = paddedMinX + paddedWidth;
  const paddedMaxY = paddedMinY + paddedHeight;

  // 返回填充后的边界框数组
  return [paddedMinX, paddedMinY, paddedMaxX, paddedMaxY];
}
// 笛卡尔三维坐标转换经纬度
export function cartesianToDegrees(cartesianPosition) {
  // 使用 ellipsoid.cartesianToCartographic 方法进行转换
  var cartographicPosition =
    Cesium.Cartographic.fromCartesian(cartesianPosition);

  // 获取纬度、经度、高度（弧度）
  var latitude = cartographicPosition.latitude;
  var longitude = cartographicPosition.longitude;
  var height = cartographicPosition.height;

  // 转换为度数
  latitude = Cesium.Math.toDegrees(latitude);
  longitude = Cesium.Math.toDegrees(longitude);

  // 返回经纬度对象
  return {
    latitude: latitude,
    longitude: longitude,
    height: height,
  };
}
// 获取当前中心点位置经纬度
export function getScreenCenterCoordinatesAndHeight(viewer) {
  var scene = viewer.scene;
  var canvas = viewer.canvas;
  var center = new Cesium.Cartesian2(
    canvas.clientWidth / 2,
    canvas.clientHeight / 2
  );

  var pickRay = scene.camera.getPickRay(center);
  var pickPosition = scene.globe.pick(pickRay, scene);
  var ellipsoid = viewer.scene.globe.ellipsoid;
  if (Cesium.defined(pickPosition)) {
    var cartographic = Cesium.Cartographic.fromCartesian(pickPosition);
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
    // var height = cartographic.height;
    // 将相机目标位置转换为地理坐标
    var cartographicDestination =
      ellipsoid.cartesianToCartographic(pickPosition);

    // 获取相机目标位置的高度
    var destinationHeight = cartographicDestination.height;
    return {
      longitude: longitude,
      latitude: latitude,
      height: destinationHeight,
    };
  } else {
    console.log("Unable to determine position.");
    return null;
  }
}
// 获取当前相机朝向的方位角、俯仰角和滚转角
export function getCameraOrientation(viewer) {
  var camera = viewer.camera;

  // 获取相机朝向的方位角、俯仰角和滚转角（弧度）
  var heading = camera.heading;
  var pitch = camera.pitch;
  var roll = camera.roll;

  // 转换为度数
  heading = Cesium.Math.toDegrees(heading);
  pitch = Cesium.Math.toDegrees(pitch);
  roll = Cesium.Math.toDegrees(roll);

  return {
    heading: heading,
    pitch: pitch,
    roll: roll,
  };
}
// 获取2d模式下和非2d模式下的视角高度
export function getCameraHeight(viewer) {
  var camera = viewer.camera;
  var scene = viewer.scene;
  var cameraHeight = 0;

  // 判断是否处于 2D 模式
  if (scene.mode === Cesium.SceneMode.SCENE2D) {
    cameraHeight = Math.round(viewer.camera.positionCartographic.height);
  } else {
    // 非 2D 模式下直接获取相机位置的高度
    cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(
      viewer.camera.position
    ).height;
  }

  return cameraHeight;
}

// 当前地图截图并转成base64返回
export async function exportMapImgBase64(viewer) {
  return new Promise(async (resolve, reject) => {
    await window.$viewer.render();
    var canvas = window.$viewer.scene.canvas;
    // 创建一个新的Canvas元素，与原来的Canvas大小一致
    var newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    var newContext = newCanvas.getContext("2d");

    // 在新Canvas上绘制原Canvas内容
    newContext.drawImage(canvas, 0, 0);

    var dataURL = newCanvas.toDataURL("image/png");
    resolve(dataURL);
  });
}

// 屏幕坐标转换经纬度
export function screenCoordinatesToDegrees(cartesian2) {
  // 获取 Cesium 的 Scene 对象
  const scene = window.$viewer.scene;
  // 获取 Cesium 的 Camera 对象
  const camera = scene.camera;
  // 获取 Cesium 的 Globe 对象
  const globe = scene.globe;

  // 判断当前模式
  const mode = scene.mode; // Cesium.SceneMode
  let cartesian;

  if (mode === Cesium.SceneMode.SCENE2D) {
    // 2D 模式：通过直接将屏幕坐标投影到地图平面获取经纬度
    const ray = camera.getPickRay(
      new Cesium.Cartesian2(cartesian2.x, cartesian2.y)
    );
    cartesian = globe.pick(ray, scene); // 2D 模式下有时会返回 undefined
    if (!cartesian) {
      // 直接计算屏幕坐标到地图平面的投影
      const position = camera.pickEllipsoid(
        new Cesium.Cartesian2(cartesian2.x, cartesian2.y),
        Cesium.Ellipsoid.WGS84
      );
      if (!position) {
        return undefined; // 无法拾取有效位置
      }
      cartesian = position;
    }
  } else {
    // 3D 或 Columbus View 模式：使用常规的 pick 方法
    const pickRay = camera.getPickRay(
      new Cesium.Cartesian2(cartesian2.x, cartesian2.y)
    );
    cartesian = globe.pick(pickRay, scene);
  }

  // 如果 pick 无法返回有效坐标
  if (!cartesian) {
    return undefined;
  }

  // 将椭球体坐标转换为地理坐标（经纬度）
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);

  // 返回经纬度值
  return {
    longitude: longitude,
    latitude: latitude,
    height: cartographic.height, // 高度信息
  };
}

// 经纬度坐标转换屏幕坐标
export function degreesToScreenCoordinates(longitude, latitude, viewer) {
  return new Promise((resolve, reject) => {
    // 将经纬度转换为世界坐标
    var position = Cesium.Cartesian3.fromDegrees(longitude, latitude);

    // 将世界坐标转换为屏幕坐标
    var screenCoordinates = new Cesium.Cartesian2();
    var success = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      position,
      screenCoordinates
    );

    if (success) {
      // 输出屏幕坐标
      resolve(screenCoordinates);
    } else {
      console.error("转换失败");
    }
  });
}

// 通过经纬度获取高度
export function getHeightByLonlat(longitude, latitude, viewer) {
  return new Promise((resolve, reject) => {
    var positions = [Cesium.Cartographic.fromDegrees(longitude, latitude)];
    try {
      Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions, true)
        .then(function (updatedPositions) {
          // 获取更新后的高度信息
          var height = updatedPositions[0].height;
          resolve(height);
        })
        .catch(function (error) {
          resolve(null);
        });
    } catch (error) {
      console.log(error);
      resolve(null);
    }
  });
}
/*
  params:
  minLon：最小经度、
  minLat：最小维度、
  maxLon：最大经度、
  maxLat：最大维度、
  minZoom：最小级别、
  maxZoom：最大级别
*/
export function calculateTileInfo(
  minLon,
  minLat,
  maxLon,
  maxLat,
  minZoom,
  maxZoom
) {
  function getResolution(zoom) {
    switch (zoom) {
      case 1:
        return "156.54公里";
      case 2:
        return "78.27公里";
      case 3:
        return "39.14公里";
      case 4:
        return "19.57公里";
      case 5:
        return "9.78公里";
      case 6:
        return "4.89公里";
      case 7:
        return "2.45公里";
      case 8:
        return "1.22公里";
      case 9:
        return "611.5米";
      case 10:
        return "305.75米";
      case 11:
        return "152.84米";
      case 12:
        return "76.44米";
      case 13:
        return "38.22米";
      case 14:
        return "19.11米";
      case 15:
        return "9.55米";
      case 16:
        return "4.78米";
      case 17:
        return "2.39米";
      case 18:
        return "1.19米";
      case 19:
        return "0.60米";
      case 20:
        return "0.30米";
      case 21:
        return "0.15米";
    }
  }

  function getPrintSize(zoom, tileCountX, tileCountY) {
    const printWidthSize = tileCountX * 9.05;
    const printHeightSize = tileCountY * 9.05;

    if (printWidthSize > 100 || printHeightSize > 100) {
      return (
        (printWidthSize / 100).toFixed(2) +
        "x" +
        (printHeightSize / 100).toFixed(2) +
        "米"
      );
    } else {
      return (
        printWidthSize.toFixed(2) + "x" + printHeightSize.toFixed(2) + "厘米"
      );
    }
  }

  function getMeasuringScale(zoom) {
    switch (zoom) {
      case 1:
        return "1:591.66百万";
      case 2:
        return "1:295.83百万";
      case 3:
        return "1:147.91百万";
      case 4:
        return "1:73.96百万";
      case 5:
        return "1:36.98百万";
      case 6:
        return "1:18.49百万";
      case 7:
        return "1:9.24百万";
      case 8:
        return "1:4.62百万";
      case 9:
        return "1:2.31百万";
      case 10:
        return "1:1.16百万";
      case 11:
        return "1:5.78十万";
      case 12:
        return "1:2.89十万";
      case 13:
        return "1:1.44十万";
      case 14:
        return "1:7.22万";
      case 15:
        return "1:3.61万";
      case 16:
        return "1:1.81万";
      case 17:
        return "1:9.03千";
      case 18:
        return "1:4.51千";
      case 19:
        return "1:2.26千";
      case 20:
        return "1:1.13千";
      case 21:
        return "1:564";
    }
  }
  function getTifSize(zoom, totalTiles) {
    var tifSize = totalTiles * 192;
    var compresstifSize = totalTiles * 27;

    return (
      formatFileSize(tifSize) +
      "(" +
      "约" +
      formatFileSize(compresstifSize) +
      ")"
    );
  }

  function formatFileSize(kb) {
    if (kb === 0) return "0KB";
    const k = 1024;
    const sizes = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(kb) / Math.log(k));
    return parseFloat((kb / Math.pow(k, i)).toFixed(2)) + sizes[i];
  }

  const merc = new SphericalMercator({
    size: 256, // Default tile size
  });
  var list = [];
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    // Calculate tile range for the given bounding box and zoom level
    const tileRange = merc.xyz([minLon, minLat, maxLon, maxLat], zoom);

    const tileCountX = tileRange.maxX - tileRange.minX + 1;
    const tileCountY = tileRange.maxY - tileRange.minY + 1;

    // Calculate the number of tiles
    const totalTiles = tileCountX * tileCountY;

    const tileInfos = {
      // 瓦片层级
      zoom: zoom,
      // 瓦片总数
      totalTiles: totalTiles,
      // 瓦片行数
      tileCountX: tileCountX,
      // 瓦片；列数
      tileCountY: tileCountY,
      // 像素尺寸
      pxSize: 9.0 * tileCountX + "x" + 9.0 * tileCountY,
      // 空间分辨率
      resolution: getResolution(zoom),
      // 打印尺寸
      printSize: getPrintSize(zoom, tileCountX, tileCountY),
      // 比例尺
      measuringScale: getMeasuringScale(zoom),
      // TIF文件(压缩)大小
      tifSize: getTifSize(zoom, totalTiles),
    };
    list.push(tileInfos);
  }
  return list;
}
