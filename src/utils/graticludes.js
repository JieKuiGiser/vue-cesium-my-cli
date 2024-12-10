'use strict';
// 经纬网
var Cesium;
var mins

function gridPrecision(dDeg) {
    if (dDeg < 0.01) return 3;
    if (dDeg < 0.1) return 2;
    if (dDeg < 1) return 1;
    return 0;
}

function convertDEGToDMS(deg, isLat) {
    var absolute = Math.abs(deg);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = Math.round((absolute - degrees) * 60) / 10;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(0);
    var minSec = "";
    if (minutes || seconds !== "0") minSec += minutes + "'";
    if (seconds !== "0") minSec += seconds + '"';
    return degrees + "°" + minSec.padStart(2, '0') + (isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W");
}

var Graticules = (function () {

    function Graticules(viewer, options) {
        if (Cesium == undefined) {
            Cesium = window.$Cesium;
        }
        if (mins == undefined) {
            mins = [
                0.00675,
                0.0125,
                0.025,
                0.05,
                0.1,
                0.2,
                0.5,
                1.0,
                2.0,
                5.0,
                10.0
            ].map(Cesium.Math.toRadians);
        }
        if (!viewer)
            throw new Error('undefined viewer');
        this._viewer = viewer;
        this._scene = viewer.scene;
        this._color = options.color || Cesium.Color.WHITE.withAlpha(0.5);
        this._meridiansColor = options.meridiansColor || Cesium.Color.YELLOW;
        this._gridCount = options.gridCount || 15;
        this._meridians = options.meridians !== false;
        this._labelOptions = {
            font: 'bold 1rem Arial',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 4,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE
        };
        if (options.labelOptions) {
            for (var key in options.labelOptions) {
                this._labelOptions[key] = options.labelOptions[key];
            }
        }
        this._labels = new Cesium.LabelCollection();
        viewer.scene.primitives.add(this._labels);
        this._polylines = new Cesium.PolylineCollection();
        viewer.scene.primitives.add(this._polylines);
        this._ellipsoid = viewer.scene.globe.ellipsoid;
        this._lastRefresh = 0;
        this._visible = true;
        this._debounce = options.debounce || 500;
        this._granularity = Cesium.Math.toRadians(3);
        this._destroyed = false;
        this.show();
    }
    Object.defineProperty(Graticules.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (val) {
            if (this._visible === val)
                return;
            if (val === false) {
                this.hide();
            }
            else {
                this.show();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graticules.prototype, "isDestroyed", {
        get: function () {
            return this._destroyed;
        },
        enumerable: true,
        configurable: true
    });
    Graticules.prototype._getExtentView = function () {
        var camera = this._scene.camera;
        var canvas = this._scene.canvas;
        var corners = [
            camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), this._ellipsoid),
            camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth, 0), this._ellipsoid),
            camera.pickEllipsoid(new Cesium.Cartesian2(0, canvas.clientHeight), this._ellipsoid),
            camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight), this._ellipsoid)
        ];
        for (var index = 0; index < 4; index++) {
            if (corners[index] === undefined) {
                return Cesium.Rectangle.MAX_VALUE;
            }
        }
        return Cesium.Rectangle.fromCartographicArray(this._ellipsoid.cartesianArrayToCartographicArray(corners));
    };

    Graticules.prototype.destory = function () {
        this.hide();
        this._destroyed = true;
        this.show = undefined;
        this.hide = undefined;
    };
    Graticules.prototype.show = function () {
        this._viewer.camera.percentageChanged = 0.01;
        if (this._renderBind == undefined) {
            this._renderBind = this._render.bind(this);
        }
        this._viewer.scene.camera.changed.addEventListener(this._renderBind);
        this._viewer.container.addEventListener("resize", this._renderBind);
        this._render();
        this._visible = true;
        this._scene.requestRender();
    };

    Graticules.prototype.hide = function () {
        if (this._viewer.isDestroyed()) return;
        this._polylines.removeAll();
        this._labels.removeAll();
        if (this._renderBind) {
            this._viewer.scene.camera.changed.removeEventListener(this._renderBind);
            this._viewer.container.removeEventListener("resize", this._renderBind);
        }
        this._visible = false;
        this._scene.requestRender();
    };

    Graticules.prototype.destory = function () {
        this.hide();
        this._destroyed = true;
        this.show = null;
        this.hide = null;
    };

    Graticules.prototype._makeLabel = function (lng, lat, text, isLat) {
        var _this = this;
        if (this._meridians) {
            if (text === "0°00N") text = "Equator";
            if (text === "0°00E") text = "Prime Meridian";
            if (text === "180°00W" || text === "180°00E") text = "Antimeridian";
        }
        var range = this._getScreenViewRange();
        var center = Cesium.Cartographic.fromCartesian(this._screenCenterPosition());
        var carto = new Cesium.Cartographic(lng, lat);

        var addLabel = function (carto, isLat, pos) {
            var position = _this._ellipsoid.cartographicToCartesian(carto);
            var label = _this._labels.add({
                position: position,
                text: text,
                pixelOffset: new Cesium.Cartesian2(isLat ? 0 : 4, isLat ? -6 : 0),
                eyeOffset: Cesium.Cartesian3.ZERO,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: isLat ? Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP,
                scaleByDistance: new Cesium.NearFarScalar(1, 0.85, 8.0e6, .75),
                ..._this._labelOptions
            });
            label["isLat"] = isLat;
            label["pos"] = pos;
            return label;
        };

        if (isLat) {
            if (range.east === undefined && range.west === undefined) {
                carto.longitude = center.longitude;
                addLabel(carto, isLat, 'center');
            } else {
                ['east', 'west'].forEach(function (item) {
                    if (range[item]) {
                        carto.longitude = range[item];
                        addLabel(carto, isLat, item);
                    }
                });
            }
        } else {
            if (range.south === undefined && range.north === undefined) {
                carto.latitude = center.latitude;
                addLabel(carto, isLat, 'center');
            } else {
                ['south', 'north'].forEach(function (item) {
                    if (range[item]) {
                        carto.latitude = range[item];
                        addLabel(carto, isLat, item);
                    }
                });
            }
        }
    };

    Graticules.prototype._drawGrid = function (extent) {
        var _this = this;
        if (!extent) {
            extent = this._getExtentView();
        }
        var MAX_VALUE = Cesium.Rectangle.MAX_VALUE;
        var center = Cesium.Cartographic.fromCartesian(this._screenCenterPosition());
        var east = extent.east, west = extent.west, south = extent.south, north = extent.north;

        // Handling exception boundaries
        var wrapLng;
        if (center.longitude > east && center.longitude < west && east < west) {
            [east, west] = [west, east];
        }

        if ((west < east) && ((center.longitude > east && center.longitude > west) || (center.longitude < east && center.longitude < west))) {
            [east, west] = [west, east];
        }

        if (east < west) {
            wrapLng = MAX_VALUE.east + Math.abs(-MAX_VALUE.east - east);
        };

        this._polylines.removeAll();
        this._labels.removeAll();

        var dLat = mins[0], dLng = mins[0], index;

        // get the nearest to the calculated value
        for (
            index = 0;
            index < mins.length && dLat < (north - south) / this._gridCount;
            index++
        ) {
            dLat = mins[index];
        }

        for (
            index = 0;
            index < mins.length && dLng < ((wrapLng === undefined ? east : wrapLng) - west) / this._gridCount;
            index++
        ) {
            dLng = mins[index];
        }
        if (dLng !== dLat) {
            dLng = dLat = Math.min(dLat, dLng);
        }
        // if (center.latitude > Cesium.Math.toRadians(75) || center.latitude < Cesium.Math.toRadians(-75)) {
        // } else 

        // round iteration limits to the computed grid interval
        var minLng = ~~(west / dLng) * dLng;
        var maxLng = ~~(east / dLng) * dLng;
        var minLat = ~~(south / dLat) * dLat;
        var maxLat = ~~(north / dLat) * dLat;

        // extend to make sure we cover for non refresh of tiles
        minLng = Math.max(minLng - 2 * dLng, -Math.PI);
        maxLng = Math.min(maxLng + 2 * dLng, Math.PI);
        minLat = Math.max(minLat - 2 * dLat, -Cesium.Math.PI_OVER_TWO);
        maxLat = Math.min(maxLat + 2 * dLat, Cesium.Math.PI_OVER_TWO);

        var lineGraphicsObj = function (positions, color) {
            return {
                positions: _this._ellipsoid.cartographicArrayToCartesianArray(positions),
                width: 0.5,
                material: Cesium.Material.fromType('Color', { color: color })
            }
        };

        var latitudeText = minLat + ~~((maxLat - minLat) / dLat / 2) * dLat;
        var tLng = wrapLng === undefined ? maxLng : wrapLng;
        var countLng = 0;
        for (var _lng = minLng; _lng < tLng - dLng; _lng += dLng) {
            var lng = maxLng > MAX_VALUE.east ? east - (_lng - MAX_VALUE.east) : _lng;
            lng = (lng + Cesium.Math.PI) % (Cesium.Math.PI * 2) - Cesium.Math.PI;
            var path = [];
            for (var lat = minLat; lat < maxLat; lat += this._granularity) {
                path.push(new Cesium.Cartographic(lng, lat));
            }
            path.push(new Cesium.Cartographic(lng, maxLat));
            var degLng = Cesium.Math.toDegrees(lng);
            var text = _this._meridians && (text === "0°00E" || text === "180°00W" || text === "180°00E") ? _this._meridiansColor : _this._color;
            if (text) {
                var color = countLng % 2 === 0 ? text : _this._color;
                _this._polylines.add(lineGraphicsObj(path, color));
                if (countLng % 2) {
                    _this._makeLabel(lng, latitudeText, Cesium.Math.toDegrees(lng).toFixed(gridPrecision(dLng)), false);
                }
                countLng++;
            }
        }

        var longitudeText = minLng + ~~((tLng - minLng) / dLng / 2) * dLng;
        var countLat = 0;
        for (var lat = minLat; lat < maxLat; lat += dLat) {
            var path = [];
            for (var _lng = minLng; _lng < tLng; _lng += this._granularity) {
                path.push(new Cesium.Cartographic(_lng, lat));
            }
            path.push(new Cesium.Cartographic(tLng, lat));
            var degLat = Cesium.Math.toDegrees(lat);
            var text = lat === 0 ? _this._meridiansColor : _this._color;
            _this._polylines.add(lineGraphicsObj(path, text));
            if (countLat % 2) {
                _this._makeLabel(longitudeText, lat, Cesium.Math.toDegrees(lat).toFixed(gridPrecision(dLat)), true);
            }
            countLat++;
        }
    };

    Graticules.prototype._getScreenViewRange = function () {
        var camera = this._scene.camera;
        var canvas = this._scene.canvas;
        var height = camera.positionCartographic.height;
        var offsetX = 190, offsetY = 40;
        if (height < 36000) {
            offsetX = 250;
        }

        var corners = {
            north: camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth / 2, 15), this._ellipsoid),
            south: camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight - offsetY), this._ellipsoid),
            west: camera.pickEllipsoid(new Cesium.Cartesian2(120, canvas.clientHeight / 2), this._ellipsoid),
            east: camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth - offsetX, canvas.clientHeight / 2), this._ellipsoid)
        }
        var result = {
            north: corners.north ? Cesium.Cartographic.fromCartesian(corners.north).latitude : undefined,
            south: corners.south ? Cesium.Cartographic.fromCartesian(corners.south).latitude : undefined,
            west: corners.west ? Cesium.Cartographic.fromCartesian(corners.west).longitude : undefined,
            east: corners.east ? Cesium.Cartographic.fromCartesian(corners.east).longitude : undefined,
        }
        console.log(offsetX, 'offsetX');
        console.log(offsetY, 'offsetY');
        console.log(corners, 'corners');
        console.log(result, 'result');
        return result;
    };

    Graticules.prototype._screenCenterPosition = function () {
        var canvas = this._scene.canvas;
        var center = new Cesium.Cartesian2(
            Math.round(canvas.clientWidth / 2),
            Math.round(canvas.clientHeight / 2)
        );
        var cartesian = this._scene.camera.pickEllipsoid(center);
        if (!cartesian) cartesian = new Cesium.Cartesian3.fromDegrees(0, 0, 0);
        return cartesian;
    };

    Graticules.prototype._updateLabelPositions = function () {
        var range = this._getScreenViewRange();
        var center = Cesium.Cartographic.fromCartesian(this._screenCenterPosition());
        var len = this._labels.length;
        for (var i = 0; i < len; ++i) {
            var label = this._labels.get(i);
            var carto = Cesium.Cartographic.fromCartesian(label.position);
            if (label["isLat"]) {
                carto.longitude = range[label['pos']] ? range[label['pos']] : center.longitude;
            } else {
                carto.latitude = range[label['pos']] ? range[label['pos']] : center.latitude;
            }
            label.position = this._ellipsoid.cartographicToCartesian(carto);
        }
    };

    Graticules.prototype._render = function () {
        var now = new Date().getTime();
        if (now - this._lastRefresh < this._debounce) return;
        this._updateLabelPositions();
        var extent = this._getExtentView();
        var shouldRefresh = true;
        if (this._currentExtent) {
            var w = Math.abs(extent.west - this._currentExtent.west),
                s = Math.abs(extent.south - this._currentExtent.south),
                e = Math.abs(extent.east - this._currentExtent.east),
                n = Math.abs(extent.north - this._currentExtent.north);
            var m = 0.0001;
            if (w < m && s < m && e < m && n < m) shouldRefresh = false;
        }
        if (!shouldRefresh && this._labels.length) return;
        this._currentExtent = extent;
        this._drawGrid(extent);
        this._lastRefresh = now;
    };
    return Graticules;
})();

export default Graticules;
// module.exports = Graticules;