import $ from "jquery";
import GlobeTooltip from './GlobeTooltip';

var GlobeRectangleDrawer = function () {
    this.init.apply(this, arguments);
};

GlobeRectangleDrawer.prototype = {
    viewer: null,
    scene: null,
    clock: null,
    canvas: null,
    camera: null,
    ellipsoid: null,
    tooltip: null,
    entity: null,
    positions: [],
    drawHandler: null,
    modifyHandler: null,
    okHandler: null,
    cancelHandler: null,
    dragIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sKHAksIgfSpw8AAAFQSURBVBjTlZC/axphAIaf+87e5dTUkCGSDoIVuzUgZBM3hyCCAef0PxQiBRMhBgx26ODSUgIedJAG1BAI5Ls7vu+7H12iuw+88A7P8r6wB9a29Pt917KsM+AzcAi8AX+zLPs1GAzUTu71eq4Q4qLb7V42m812Pp8vB0Gwns1md6PR6DpN09vhcKhsgHq9ft7pdK5arda3KIpKYRjacRx/rFarZ4D2ff/fYrF4ygEYY740Go32er0WWZahtcYYQ5qmolartY0xE+BnDkBrXbIs60RKiZQhSRLvRjmOc6K1LgHkAJRSwWbz8hxFySfbdrFtdyeHYfCslAoAxLvsT6fTB887TF23wDaOU0jn8/mDUsoHsAHK5fLm8fHPhyTJstPTyrHnFQ+klJv7+/F4Mrn5LoS4W61W8e7nSqXiSSmbwFfgCHgFfheLxR/L5TJiX/4DB6mbvqBlRUAAAAAASUVORK5CYII=",
    dragIconLight: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAY1BMVEX///+4t624t63BRkbbj4//9/fbjIz/6+v/5+f/5ub/3d3/1dX/0ND/z8/bgYH/xsb/vb3/urr/tLT/qqr/qKj/kpL/cHD/XFz/WFjbaWn/dnb/YGD/WVn/ior/bm7bb2////8vWcu1AAAAA3RSTlMAAIAXzkf+AAAAAWJLR0QAiAUdSAAAAAd0SU1FB9sFEhYZAAV2IPIAAACASURBVBjTjc7JEoMgEEVR0895wmiYRf//L4WiSVV2uRuKs+lXVX/0iiGWXgagbpo6UQa0XT8MfdeiwDjNyzJPIwNWsb1jm1iRQezHJ3bsgkEqbWJaSQbr/GnM6Z3NQAiX19pfAcRX7uCUcuEuZwmwUlqAylKiNJ3oOz1R+jL89gAYeAaPM7P+sgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNi0yOFQyMjozNDowMyswODowMByu+LsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTEtMDUtMThUMjI6MjU6MDArMDg6MDAs8HGJAAAAQ3RFWHRzb2Z0d2FyZQAvdXNyL2xvY2FsL2ltYWdlbWFnaWNrL3NoYXJlL2RvYy9JbWFnZU1hZ2ljay03Ly9pbmRleC5odG1svbV5CgAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxp/+7LwAAABd0RVh0VGh1bWI6OkltYWdlOjpIZWlnaHQAMTYdr15vAAAAFnRFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADE25QCe4gAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxMzA1NzI4NzAwvZ5IOQAAABB0RVh0VGh1bWI6OlNpemUANDM2QnL66p4AAABedEVYdFRodW1iOjpVUkkAZmlsZTovLy9ob21lL3d3d3Jvb3QvbmV3c2l0ZS93d3cuZWFzeWljb24ubmV0L2Nkbi1pbWcuZWFzeWljb24uY24vc3JjLzM0Ny8zNDc1MS5wbmfjEwQRAAAAAElFTkSuQmCC",
    material: null,
    outlineMaterial: null,
    fill: true,
    outline: true,
    outlineWidth: 3,
    extrudedHeight: 0,
    toolBarIndex: null,
    layerId: "globeEntityDrawerLayer",
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.tooltip = new GlobeTooltip(viewer.container);
    },
    clear: function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
        }
        var objs = $("#shapeEditContainer");
        objs.remove();
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
    },
    showModifyRectangle: function (positions, okHandler, cancelHandler) {
        var _this = this;
        _this.positions = positions;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this._showModifyRegion2Map();
        _this._startModify();
    },
    startDrawRectangle: function (okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        var floatingPoint = null;
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var num = _this.positions.length;
            if (num == 0) {
                _this.positions.push(cartesian);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }
            _this.positions.push(cartesian);
            var oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);
            if (num > 1) {
                _this.positions.pop();
                _this.viewer.entities.remove(floatingPoint);
                _this.tooltip.setVisible(false);
                _this._startModify();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            _this.tooltip.showAt(position, "<p>选择终点</p>");

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            floatingPoint.position.setValue(cartesian);
            _this.positions.pop();
            _this.positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    _startModify: function () {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        _this._showToolBar();

        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.modifyHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                pickedAnchor.position.setValue(cartesian);
                var oid = pickedAnchor.oid;
                _this.positions[oid] = cartesian;
                _this.tooltip.setVisible(false);
            } else {
                var pickedObject = _this.scene.pick(position);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                var entity = pickedObject.id;
                if (entity.layerId != _this.layerId || entity.flag != "anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                _this.tooltip.showAt(position, "<p>移动控制点</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            _this.tooltip.showAt(position, "<p>移动控制点</p>");

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.positions[oid] = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    _createPoint: function (cartesian, oid) {
        var _this = this;
        var viewer = _this.viewer;
        var point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    },
    _showRegion2Map: function () {
        var _this = this;
        if (_this.material == null) {
            _this.material = Cesium.Color.fromCssColorString('#f00').withAlpha(0.3);
        }
        if (_this.outlineMaterial == null) {
            _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 0,
                color: Cesium.Color.fromCssColorString('#f00').withAlpha(1)
            });
        }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            } else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.rectangle.extrudedHeight = _this.extrudedHeight;
            bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.rectangle.closeTop = true;
            bData.rectangle.closeBottom = true;
            bData.rectangle.outline = false;
            bData.rectangle.outlineWidth = 0;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    },
    _showModifyRegion2Map: function () {
        var _this = this;
        if (_this.material == null) {
            _this.material = Cesium.Color.fromCssColorString('#f00').withAlpha(0.3);
        }
        if (_this.outlineMaterial == null) {
            _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 0,
                color: Cesium.Color.fromCssColorString('#f00').withAlpha(1)
            });
        }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            } else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.rectangle.extrudedHeight = _this.extrudedHeight;
            bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.rectangle.closeTop = true;
            bData.rectangle.closeBottom = true;
            bData.rectangle.outline = false;
            bData.rectangle.outlineWidth = 0;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.positions;
        for (var i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    },
    _computeRectangle: function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var rect = Cesium.Rectangle.fromCartesianArray([p1, p2]);
        return rect;
    },
    _showToolBar: function () {
        var _this = this;
        _this._createToolBar();
        var width = $(window).width();
        var wTop = 60;
        var wLeft = parseInt((width - 145) / 2);
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditContainer"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner"
        });
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    },
    _createToolBar: function () {
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
            + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> <i class="layui-icon"></i> 确定 </button>'
            + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> <i class="layui-icon">ဆ</i> 取消 </button>'
            + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
            + '    </div>'
            + '</div>';
        $("body").append(html);

        var btnOK = $("#shapeEditContainer button[name='btnOK']");
        var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                _this.okHandler(_this.positions);
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
            }
        });
    },
    _isSimpleXYZ: function (p1, p2) {
        if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            return true;
        }
        return false;
    },
    _clearMarkers: function (layerName) {
        var _this = this;
        var viewer = _this.viewer;
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    },
    CLASS_NAME: "GlobeRectangleDrawer"
};

export default GlobeRectangleDrawer