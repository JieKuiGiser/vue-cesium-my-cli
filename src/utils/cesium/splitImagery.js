
let leftImagery // 左边的影像
let rightImagery // 右边的影像

export class splitImagery {
  slider // 滑动分割线的div元素
  sliderWidth // 分割线的宽度
  target // 渲染cesium场景的元素
  viewer
  Cesium
  moveActive = false // 开启分割线位移
  imageryLayers = [] // 当前场景已有的影像图层
  constructor(arg) {
    this.target = arg.target
    this.viewer = arg.viewer
    this.Cesium = arg.Cesium
    this.leftLayer = arg.leftLayer
    this.leftLayerSrs = arg.leftLayerSrs
    this.rightLayer = arg.rightLayer
    this.rightLayerSrs = arg.rightLayerSrs
    this.MercatorScheme = new Cesium.WebMercatorTilingScheme();
    this.GeographicScheme = new Cesium.GeographicTilingScheme();

  }


  // 创建分割线的div元素
  spilitElement() {
    const cesiumCon = document.getElementById(this.target) // 获取地球渲染的target

    this.slider = document.createElement('div')
    this.sliderWidth = '5px' // 分割线的宽度

    this.slider.id = 'slider'
    this.slider.style.width = this.sliderWidth
    this.slider.style.height = '100%'
    this.slider.style.position = 'fixed'
    this.slider.style.left = '50%'
    this.slider.style.top = '0'
    this.slider.style.backgroundColor = '#3370FF'
    this.slider.style.zIndex = '10'
    this.slider.style.cursor = 'col-resize'

    // 将滑动条添加到页面中的元素内
    if (cesiumCon) {
      cesiumCon.appendChild(this.slider)
    } else {
      document.querySelector('body').appendChild(this.slider)
    }
  }

  // 设置分割线左侧展示的影像
  setLeftImagery(layer) {
    // if (leftImagery) { // 如果已经有图层了则销毁旧的加载新的
    //   this.viewer.imageryLayers.remove(leftImagery, true); // 移除图层
    // }
    // leftImagery = layer
    leftImagery = this.viewer.imageryLayers.addImageryProvider(layer)
    leftImagery.splitDirection = this.Cesium.SplitDirection.LEFT // 分割方向
  }

  // 设置分割线右侧展示的影像
  setRightImagery(layer) {
    // if (rightImagery) {
    //   this.viewer.imageryLayers.remove(rightImagery, true); // 移除图层
    // }
    // rightImagery = layer
    rightImagery = this.viewer.imageryLayers.addImageryProvider(layer)
    rightImagery.splitDirection = this.Cesium.SplitDirection.RIGHT // 分割方向
  }

  // 获取当前场景中所有的影像图层并保存到数组中
  saveImageryLayers() {
    const layers = this.viewer.imageryLayers;
    this.imageryLayers = []
    for (let i = 0; i < layers.length; i++) {
      this.imageryLayers.push(layers.get(i));
    }

    layers.removeAll(true) // 移除所有 ImageryLayer
  }

  // 重新加载之前保存的影像图层
  reloadImageryLayers() {
    const layers = this.viewer.imageryLayers;
    layers.removeAll(true) // 移除所有 ImageryLayer

    if (leftImagery) {
      this.viewer.imageryLayers.remove(leftImagery, true); // 移除图层
    }
    if (rightImagery) {
      this.viewer.imageryLayers.remove(rightImagery, true); // 移除图层
    }

    this.viewer.imageryLayers.addImageryProvider(
      new this.Cesium.UrlTemplateImageryProvider({
        url: this.leftLayer,
        tilingScheme: this.leftLayerSrs == 'EPSG:4326' ? this.GeographicScheme : this.MercatorScheme
      })
    )

    // for (let i = 0; i < this.imageryLayers.length; i++) {
    //   this.viewer.imageryLayers.addImageryProvider(this.imageryLayers[i])
    // }
  }

  // 开始卷
  actionSplit() {

    this.saveImageryLayers()

    const left = new this.Cesium.UrlTemplateImageryProvider({
      url: this.leftLayer,
      tilingScheme: this.leftLayerSrs == 'EPSG:4326' ? this.GeographicScheme : this.MercatorScheme
    })
    // 右边的图层，黑夜風格的OSM
    const right = new this.Cesium.UrlTemplateImageryProvider({
      url: this.rightLayer,
      tilingScheme: this.rightLayerSrs == 'EPSG:4326' ? this.GeographicScheme : this.MercatorScheme
    })
    this.spilitElement()
    this.setLeftImagery(left)
    this.setRightImagery(right)

    // 依据滑动条的默认位置设置场景的分割位置，值为0到1之间
    this.viewer.scene.splitPosition = this.slider.offsetLeft / this.slider.parentElement.offsetWidth

    this.handler = new this.Cesium.ScreenSpaceEventHandler(this.slider)

    this.handler.setInputAction(() => {
      this.moveActive = true
    }, this.Cesium.ScreenSpaceEventType.LEFT_DOWN) // 未适配PINCH、PINCH_START等操作

    this.handler.setInputAction(this._moveEvnet.bind(this), this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.handler.setInputAction(() => {
      this.moveActive = false
      // 不要让分割线超出界面了
      if (parseFloat(this.slider.style.left.replace('%', '')) > 100) {
        this.slider.style.left = `calc(100% - ${this.sliderWidth})`
      } else if (parseFloat(this.slider.style.left.replace('%', '')) < 0) {
        this.slider.style.left = '0%'
      }
    }, this.Cesium.ScreenSpaceEventType.LEFT_UP)

  }

  // 不卷了
  stopSplit() {
    if (!this.slider) {
      return
    }
    this.reloadImageryLayers()
    this.handler.removeInputAction(this.Cesium.ScreenSpaceEventType.LEFT_DOWN)
    this.handler.removeInputAction(this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.handler.removeInputAction(this.Cesium.ScreenSpaceEventType.LEFT_UP)

    const cesiumCon = document.getElementById(this.target) // 获取地球渲染的target
    if (cesiumCon) {
      cesiumCon.removeChild(this.slider)
    } else {
      document.querySelector('body').removeChild(this.slider)
    }
  }

  // 滑动事件： 修改滑动条的位置以及视图分割的位置
  _moveEvnet(movement) {
    if (!this.moveActive) {
      return
    }

    const relativeOffset = movement.endPosition.x
    const splitPosition = (this.slider.offsetLeft + relativeOffset) / this.slider.parentElement.offsetWidth

    this.slider.style.left = `${100.0 * splitPosition}%`
    this.viewer.scene.splitPosition = splitPosition
  }
}



/**
 * @description: 即调即用的简单版影像卷帘功能
 * @param {*} target - 挂载地球视图div元素
 * e.g. ImagerySplit()
 */
export function ImagerySplit(target = 'cesiumContainer') {
  const cesiumCon = document.getElementById(target) // 获取地球渲染的target
  const slider = document.createElement('div')
  const sliderWidth = '5px' // 分割线的宽度
  slider.id = 'slider'
  slider.style.width = sliderWidth
  slider.style.height = '100%'
  slider.style.position = 'fixed'
  slider.style.left = '50%'
  slider.style.top = '0'
  slider.style.backgroundColor = '#3370FF'
  slider.style.zIndex = '10'
  slider.style.cursor = 'col-resize'

  // 将滑动条添加到页面中的某个元素内
  if (cesiumCon) {
    cesiumCon.appendChild(slider) // 将slider元素添加到father元素的子元素列表中
  } else {
    document.querySelector('body').appendChild(slider)
  }

  // 左边的图层，標準風格的OSM
  const left = this.viewer.imageryLayers.addImageryProvider(
    new this.Cesium.UrlTemplateImageryProvider({
      url: this.leftLayer,
      tilingScheme: this.leftLayerSrs == 'EPSG:4326' ? GeographicScheme : MercatorScheme
    })
  )
  // 右边的图层，黑夜風格的OSM
  const right = this.viewer.imageryLayers.addImageryProvider(
    new this.Cesium.UrlTemplateImageryProvider({
      url: this.right,
      tilingScheme: this.rightLayerSrs == 'EPSG:4326' ? GeographicScheme : MercatorScheme
    })
  )

  // 设置切割的方向
  left.splitDirection = this.Cesium.SplitDirection.LEFT
  right.splitDirection = this.Cesium.SplitDirection.RIGHT

  // 依据滑动条的默认位置设置场景的分割位置，值为0到1之间
  this.viewer.scene.splitPosition = slider.offsetLeft / slider.parentElement.offsetWidth

  let moveActive = false

  // 滑动事件： 修改滑动条的位置以及视图分割的位置
  function moveEvnet(movement) {
    if (!moveActive) {
      return
    }

    const relativeOffset = movement.endPosition.x
    const splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth

    slider.style.left = `${100.0 * splitPosition}%`
    this.viewer.scene.splitPosition = splitPosition
  }

  // 中間那個分割綫的句柄
  const handler = new this.Cesium.ScreenSpaceEventHandler(slider)

  handler.setInputAction(() => {
    moveActive = true
  }, this.Cesium.ScreenSpaceEventType.LEFT_DOWN) // 未适配PINCH、PINCH_START等操作

  handler.setInputAction(moveEvnet, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(() => {
    moveActive = false
    // 不要让分割线超出界面了
    if (parseFloat(slider.style.left.replace('%', '')) > 100) {
      slider.style.left = `calc(100% - ${sliderWidth})`
    } else if (parseFloat(slider.style.left.replace('%', '')) < 0) {
      slider.style.left = '0%'
    }
  }, this.Cesium.ScreenSpaceEventType.LEFT_UP)
}
