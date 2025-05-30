define(['exports', './Transforms-b527bb09', './Matrix3-41c58dde', './ComponentDatatype-cf1fa08e', './defaultValue-fe22d8c0', './Check-6ede7e26', './GeometryAttribute-a5b6275b', './GeometryAttributes-ad136444', './GeometryOffsetAttribute-9ad0019c', './IndexDatatype-2643aa47', './Math-0a2ac845'], (function (exports, Transforms, Matrix3, ComponentDatatype, defaultValue, Check, GeometryAttribute, GeometryAttributes, GeometryOffsetAttribute, IndexDatatype, Math$1) { 'use strict';

  const defaultRadii = new Matrix3.Cartesian3(1.0, 1.0, 1.0);
  const cos = Math.cos;
  const sin = Math.sin;

  /**
   * A description of the outline of an ellipsoid centered at the origin.
   *
   * @alias EllipsoidOutlineGeometry
   * @constructor
   *
   * @param {object} [options] Object with the following properties:
   * @param {Cartesian3} [options.radii=Cartesian3(1.0, 1.0, 1.0)] The radii of the ellipsoid in the x, y, and z directions.
   * @param {Cartesian3} [options.innerRadii=options.radii] The inner radii of the ellipsoid in the x, y, and z directions.
   * @param {number} [options.minimumClock=0.0] The minimum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
   * @param {number} [options.maximumClock=2*PI] The maximum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
   * @param {number} [options.minimumCone=0.0] The minimum angle measured from the positive z-axis and toward the negative z-axis.
   * @param {number} [options.maximumCone=PI] The maximum angle measured from the positive z-axis and toward the negative z-axis.
   * @param {number} [options.stackPartitions=10] The count of stacks for the ellipsoid (1 greater than the number of parallel lines).
   * @param {number} [options.slicePartitions=8] The count of slices for the ellipsoid (Equal to the number of radial lines).
   * @param {number} [options.subdivisions=128] The number of points per line, determining the granularity of the curvature.
   *
   * @exception {DeveloperError} options.stackPartitions must be greater than or equal to one.
   * @exception {DeveloperError} options.slicePartitions must be greater than or equal to zero.
   * @exception {DeveloperError} options.subdivisions must be greater than or equal to zero.
   *
   * @example
   * const ellipsoid = new Cesium.EllipsoidOutlineGeometry({
   *   radii : new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0),
   *   stackPartitions: 6,
   *   slicePartitions: 5
   * });
   * const geometry = Cesium.EllipsoidOutlineGeometry.createGeometry(ellipsoid);
   */
  function EllipsoidOutlineGeometry(options) {
    options = defaultValue.defaultValue(options, defaultValue.defaultValue.EMPTY_OBJECT);

    const radii = defaultValue.defaultValue(options.radii, defaultRadii);
    const innerRadii = defaultValue.defaultValue(options.innerRadii, radii);
    const minimumClock = defaultValue.defaultValue(options.minimumClock, 0.0);
    const maximumClock = defaultValue.defaultValue(options.maximumClock, Math$1.CesiumMath.TWO_PI);
    const minimumCone = defaultValue.defaultValue(options.minimumCone, 0.0);
    const maximumCone = defaultValue.defaultValue(options.maximumCone, Math$1.CesiumMath.PI);
    const stackPartitions = Math.round(defaultValue.defaultValue(options.stackPartitions, 10));
    const slicePartitions = Math.round(defaultValue.defaultValue(options.slicePartitions, 8));
    const subdivisions = Math.round(defaultValue.defaultValue(options.subdivisions, 128));

    //>>includeStart('debug', pragmas.debug);
    if (stackPartitions < 1) {
      throw new Check.DeveloperError("options.stackPartitions cannot be less than 1");
    }
    if (slicePartitions < 0) {
      throw new Check.DeveloperError("options.slicePartitions cannot be less than 0");
    }
    if (subdivisions < 0) {
      throw new Check.DeveloperError(
        "options.subdivisions must be greater than or equal to zero."
      );
    }
    if (
      defaultValue.defined(options.offsetAttribute) &&
      options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.TOP
    ) {
      throw new Check.DeveloperError(
        "GeometryOffsetAttribute.TOP is not a supported options.offsetAttribute for this geometry."
      );
    }
    //>>includeEnd('debug');

    this._radii = Matrix3.Cartesian3.clone(radii);
    this._innerRadii = Matrix3.Cartesian3.clone(innerRadii);
    this._minimumClock = minimumClock;
    this._maximumClock = maximumClock;
    this._minimumCone = minimumCone;
    this._maximumCone = maximumCone;
    this._stackPartitions = stackPartitions;
    this._slicePartitions = slicePartitions;
    this._subdivisions = subdivisions;
    this._offsetAttribute = options.offsetAttribute;
    this._workerName = "createEllipsoidOutlineGeometry";
  }

  /**
   * The number of elements used to pack the object into an array.
   * @type {number}
   */
  EllipsoidOutlineGeometry.packedLength = 2 * Matrix3.Cartesian3.packedLength + 8;

  /**
   * Stores the provided instance into the provided array.
   *
   * @param {EllipsoidOutlineGeometry} value The value to pack.
   * @param {number[]} array The array to pack into.
   * @param {number} [startingIndex=0] The index into the array at which to start packing the elements.
   *
   * @returns {number[]} The array that was packed into
   */
  EllipsoidOutlineGeometry.pack = function (value, array, startingIndex) {
    //>>includeStart('debug', pragmas.debug);
    if (!defaultValue.defined(value)) {
      throw new Check.DeveloperError("value is required");
    }
    if (!defaultValue.defined(array)) {
      throw new Check.DeveloperError("array is required");
    }
    //>>includeEnd('debug');

    startingIndex = defaultValue.defaultValue(startingIndex, 0);

    Matrix3.Cartesian3.pack(value._radii, array, startingIndex);
    startingIndex += Matrix3.Cartesian3.packedLength;

    Matrix3.Cartesian3.pack(value._innerRadii, array, startingIndex);
    startingIndex += Matrix3.Cartesian3.packedLength;

    array[startingIndex++] = value._minimumClock;
    array[startingIndex++] = value._maximumClock;
    array[startingIndex++] = value._minimumCone;
    array[startingIndex++] = value._maximumCone;
    array[startingIndex++] = value._stackPartitions;
    array[startingIndex++] = value._slicePartitions;
    array[startingIndex++] = value._subdivisions;
    array[startingIndex] = defaultValue.defaultValue(value._offsetAttribute, -1);

    return array;
  };

  const scratchRadii = new Matrix3.Cartesian3();
  const scratchInnerRadii = new Matrix3.Cartesian3();
  const scratchOptions = {
    radii: scratchRadii,
    innerRadii: scratchInnerRadii,
    minimumClock: undefined,
    maximumClock: undefined,
    minimumCone: undefined,
    maximumCone: undefined,
    stackPartitions: undefined,
    slicePartitions: undefined,
    subdivisions: undefined,
    offsetAttribute: undefined,
  };

  /**
   * Retrieves an instance from a packed array.
   *
   * @param {number[]} array The packed array.
   * @param {number} [startingIndex=0] The starting index of the element to be unpacked.
   * @param {EllipsoidOutlineGeometry} [result] The object into which to store the result.
   * @returns {EllipsoidOutlineGeometry} The modified result parameter or a new EllipsoidOutlineGeometry instance if one was not provided.
   */
  EllipsoidOutlineGeometry.unpack = function (array, startingIndex, result) {
    //>>includeStart('debug', pragmas.debug);
    if (!defaultValue.defined(array)) {
      throw new Check.DeveloperError("array is required");
    }
    //>>includeEnd('debug');

    startingIndex = defaultValue.defaultValue(startingIndex, 0);

    const radii = Matrix3.Cartesian3.unpack(array, startingIndex, scratchRadii);
    startingIndex += Matrix3.Cartesian3.packedLength;

    const innerRadii = Matrix3.Cartesian3.unpack(array, startingIndex, scratchInnerRadii);
    startingIndex += Matrix3.Cartesian3.packedLength;

    const minimumClock = array[startingIndex++];
    const maximumClock = array[startingIndex++];
    const minimumCone = array[startingIndex++];
    const maximumCone = array[startingIndex++];
    const stackPartitions = array[startingIndex++];
    const slicePartitions = array[startingIndex++];
    const subdivisions = array[startingIndex++];
    const offsetAttribute = array[startingIndex];

    if (!defaultValue.defined(result)) {
      scratchOptions.minimumClock = minimumClock;
      scratchOptions.maximumClock = maximumClock;
      scratchOptions.minimumCone = minimumCone;
      scratchOptions.maximumCone = maximumCone;
      scratchOptions.stackPartitions = stackPartitions;
      scratchOptions.slicePartitions = slicePartitions;
      scratchOptions.subdivisions = subdivisions;
      scratchOptions.offsetAttribute =
        offsetAttribute === -1 ? undefined : offsetAttribute;
      return new EllipsoidOutlineGeometry(scratchOptions);
    }

    result._radii = Matrix3.Cartesian3.clone(radii, result._radii);
    result._innerRadii = Matrix3.Cartesian3.clone(innerRadii, result._innerRadii);
    result._minimumClock = minimumClock;
    result._maximumClock = maximumClock;
    result._minimumCone = minimumCone;
    result._maximumCone = maximumCone;
    result._stackPartitions = stackPartitions;
    result._slicePartitions = slicePartitions;
    result._subdivisions = subdivisions;
    result._offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;

    return result;
  };

  /**
   * Computes the geometric representation of an outline of an ellipsoid, including its vertices, indices, and a bounding sphere.
   *
   * @param {EllipsoidOutlineGeometry} ellipsoidGeometry A description of the ellipsoid outline.
   * @returns {Geometry|undefined} The computed vertices and indices.
   */
  EllipsoidOutlineGeometry.createGeometry = function (ellipsoidGeometry) {
    const radii = ellipsoidGeometry._radii;
    if (radii.x <= 0 || radii.y <= 0 || radii.z <= 0) {
      return;
    }

    const innerRadii = ellipsoidGeometry._innerRadii;
    if (innerRadii.x <= 0 || innerRadii.y <= 0 || innerRadii.z <= 0) {
      return;
    }

    const minimumClock = ellipsoidGeometry._minimumClock;
    const maximumClock = ellipsoidGeometry._maximumClock;
    const minimumCone = ellipsoidGeometry._minimumCone;
    const maximumCone = ellipsoidGeometry._maximumCone;
    const subdivisions = ellipsoidGeometry._subdivisions;
    const ellipsoid = Matrix3.Ellipsoid.fromCartesian3(radii);

    // Add an extra slice and stack to remain consistent with EllipsoidGeometry
    let slicePartitions = ellipsoidGeometry._slicePartitions + 1;
    let stackPartitions = ellipsoidGeometry._stackPartitions + 1;

    slicePartitions = Math.round(
      (slicePartitions * Math.abs(maximumClock - minimumClock)) /
        Math$1.CesiumMath.TWO_PI
    );
    stackPartitions = Math.round(
      (stackPartitions * Math.abs(maximumCone - minimumCone)) / Math$1.CesiumMath.PI
    );

    if (slicePartitions < 2) {
      slicePartitions = 2;
    }
    if (stackPartitions < 2) {
      stackPartitions = 2;
    }

    let extraIndices = 0;
    let vertexMultiplier = 1.0;
    const hasInnerSurface =
      innerRadii.x !== radii.x ||
      innerRadii.y !== radii.y ||
      innerRadii.z !== radii.z;
    let isTopOpen = false;
    let isBotOpen = false;
    if (hasInnerSurface) {
      vertexMultiplier = 2.0;
      // Add 2x slicePartitions to connect the top/bottom of the outer to
      // the top/bottom of the inner
      if (minimumCone > 0.0) {
        isTopOpen = true;
        extraIndices += slicePartitions;
      }
      if (maximumCone < Math.PI) {
        isBotOpen = true;
        extraIndices += slicePartitions;
      }
    }

    const vertexCount =
      subdivisions * vertexMultiplier * (stackPartitions + slicePartitions);
    const positions = new Float64Array(vertexCount * 3);

    // Multiply by two because two points define each line segment
    const numIndices =
      2 *
      (vertexCount +
        extraIndices -
        (slicePartitions + stackPartitions) * vertexMultiplier);
    const indices = IndexDatatype.IndexDatatype.createTypedArray(vertexCount, numIndices);

    let i;
    let j;
    let theta;
    let phi;
    let index = 0;

    // Calculate sin/cos phi
    const sinPhi = new Array(stackPartitions);
    const cosPhi = new Array(stackPartitions);
    for (i = 0; i < stackPartitions; i++) {
      phi =
        minimumCone + (i * (maximumCone - minimumCone)) / (stackPartitions - 1);
      sinPhi[i] = sin(phi);
      cosPhi[i] = cos(phi);
    }

    // Calculate sin/cos theta
    const sinTheta = new Array(subdivisions);
    const cosTheta = new Array(subdivisions);
    for (i = 0; i < subdivisions; i++) {
      theta =
        minimumClock + (i * (maximumClock - minimumClock)) / (subdivisions - 1);
      sinTheta[i] = sin(theta);
      cosTheta[i] = cos(theta);
    }

    // Calculate the latitude lines on the outer surface
    for (i = 0; i < stackPartitions; i++) {
      for (j = 0; j < subdivisions; j++) {
        positions[index++] = radii.x * sinPhi[i] * cosTheta[j];
        positions[index++] = radii.y * sinPhi[i] * sinTheta[j];
        positions[index++] = radii.z * cosPhi[i];
      }
    }

    // Calculate the latitude lines on the inner surface
    if (hasInnerSurface) {
      for (i = 0; i < stackPartitions; i++) {
        for (j = 0; j < subdivisions; j++) {
          positions[index++] = innerRadii.x * sinPhi[i] * cosTheta[j];
          positions[index++] = innerRadii.y * sinPhi[i] * sinTheta[j];
          positions[index++] = innerRadii.z * cosPhi[i];
        }
      }
    }

    // Calculate sin/cos phi
    sinPhi.length = subdivisions;
    cosPhi.length = subdivisions;
    for (i = 0; i < subdivisions; i++) {
      phi = minimumCone + (i * (maximumCone - minimumCone)) / (subdivisions - 1);
      sinPhi[i] = sin(phi);
      cosPhi[i] = cos(phi);
    }

    // Calculate sin/cos theta for each slice partition
    sinTheta.length = slicePartitions;
    cosTheta.length = slicePartitions;
    for (i = 0; i < slicePartitions; i++) {
      theta =
        minimumClock +
        (i * (maximumClock - minimumClock)) / (slicePartitions - 1);
      sinTheta[i] = sin(theta);
      cosTheta[i] = cos(theta);
    }

    // Calculate the longitude lines on the outer surface
    for (i = 0; i < subdivisions; i++) {
      for (j = 0; j < slicePartitions; j++) {
        positions[index++] = radii.x * sinPhi[i] * cosTheta[j];
        positions[index++] = radii.y * sinPhi[i] * sinTheta[j];
        positions[index++] = radii.z * cosPhi[i];
      }
    }

    // Calculate the longitude lines on the inner surface
    if (hasInnerSurface) {
      for (i = 0; i < subdivisions; i++) {
        for (j = 0; j < slicePartitions; j++) {
          positions[index++] = innerRadii.x * sinPhi[i] * cosTheta[j];
          positions[index++] = innerRadii.y * sinPhi[i] * sinTheta[j];
          positions[index++] = innerRadii.z * cosPhi[i];
        }
      }
    }

    // Create indices for the latitude lines
    index = 0;
    for (i = 0; i < stackPartitions * vertexMultiplier; i++) {
      const topOffset = i * subdivisions;
      for (j = 0; j < subdivisions - 1; j++) {
        indices[index++] = topOffset + j;
        indices[index++] = topOffset + j + 1;
      }
    }

    // Create indices for the outer longitude lines
    let offset = stackPartitions * subdivisions * vertexMultiplier;
    for (i = 0; i < slicePartitions; i++) {
      for (j = 0; j < subdivisions - 1; j++) {
        indices[index++] = offset + i + j * slicePartitions;
        indices[index++] = offset + i + (j + 1) * slicePartitions;
      }
    }

    // Create indices for the inner longitude lines
    if (hasInnerSurface) {
      offset =
        stackPartitions * subdivisions * vertexMultiplier +
        slicePartitions * subdivisions;
      for (i = 0; i < slicePartitions; i++) {
        for (j = 0; j < subdivisions - 1; j++) {
          indices[index++] = offset + i + j * slicePartitions;
          indices[index++] = offset + i + (j + 1) * slicePartitions;
        }
      }
    }

    if (hasInnerSurface) {
      let outerOffset = stackPartitions * subdivisions * vertexMultiplier;
      let innerOffset = outerOffset + subdivisions * slicePartitions;
      if (isTopOpen) {
        // Draw lines from the top of the inner surface to the top of the outer surface
        for (i = 0; i < slicePartitions; i++) {
          indices[index++] = outerOffset + i;
          indices[index++] = innerOffset + i;
        }
      }

      if (isBotOpen) {
        // Draw lines from the top of the inner surface to the top of the outer surface
        outerOffset += subdivisions * slicePartitions - slicePartitions;
        innerOffset += subdivisions * slicePartitions - slicePartitions;
        for (i = 0; i < slicePartitions; i++) {
          indices[index++] = outerOffset + i;
          indices[index++] = innerOffset + i;
        }
      }
    }

    const attributes = new GeometryAttributes.GeometryAttributes({
      position: new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: positions,
      }),
    });

    if (defaultValue.defined(ellipsoidGeometry._offsetAttribute)) {
      const length = positions.length;
      const offsetValue =
        ellipsoidGeometry._offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE
          ? 0
          : 1;
      const applyOffset = new Uint8Array(length / 3).fill(offsetValue);
      attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 1,
        values: applyOffset,
      });
    }

    return new GeometryAttribute.Geometry({
      attributes: attributes,
      indices: indices,
      primitiveType: GeometryAttribute.PrimitiveType.LINES,
      boundingSphere: Transforms.BoundingSphere.fromEllipsoid(ellipsoid),
      offsetAttribute: ellipsoidGeometry._offsetAttribute,
    });
  };

  exports.EllipsoidOutlineGeometry = EllipsoidOutlineGeometry;

}));
//# sourceMappingURL=EllipsoidOutlineGeometry-ba5c7ee2.js.map
