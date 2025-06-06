define(['exports', './Transforms-b527bb09', './Matrix2-e1298525', './Matrix3-41c58dde', './ComponentDatatype-cf1fa08e', './defaultValue-fe22d8c0', './Check-6ede7e26', './GeometryAttribute-a5b6275b', './GeometryAttributes-ad136444', './GeometryOffsetAttribute-9ad0019c', './IndexDatatype-2643aa47', './Math-0a2ac845', './VertexFormat-030f11ff'], (function (exports, Transforms, Matrix2, Matrix3, ComponentDatatype, defaultValue, Check, GeometryAttribute, GeometryAttributes, GeometryOffsetAttribute, IndexDatatype, Math$1, VertexFormat) { 'use strict';

  const scratchPosition = new Matrix3.Cartesian3();
  const scratchNormal = new Matrix3.Cartesian3();
  const scratchTangent = new Matrix3.Cartesian3();
  const scratchBitangent = new Matrix3.Cartesian3();
  const scratchNormalST = new Matrix3.Cartesian3();
  const defaultRadii = new Matrix3.Cartesian3(1.0, 1.0, 1.0);

  const cos = Math.cos;
  const sin = Math.sin;

  /**
   * A description of an ellipsoid centered at the origin.
   *
   * @alias EllipsoidGeometry
   * @constructor
   *
   * @param {object} [options] Object with the following properties:
   * @param {Cartesian3} [options.radii=Cartesian3(1.0, 1.0, 1.0)] The radii of the ellipsoid in the x, y, and z directions.
   * @param {Cartesian3} [options.innerRadii=options.radii] The inner radii of the ellipsoid in the x, y, and z directions.
   * @param {number} [options.minimumClock=0.0] The minimum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
   * @param {number} [options.maximumClock=2*PI] The maximum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
   * @param {number} [options.minimumCone=0.0] The minimum angle measured from the positive z-axis and toward the negative z-axis.
   * @param {number} [options.maximumCone=PI] The maximum angle measured from the positive z-axis and toward the negative z-axis.
   * @param {number} [options.stackPartitions=64] The number of times to partition the ellipsoid into stacks.
   * @param {number} [options.slicePartitions=64] The number of times to partition the ellipsoid into radial slices.
   * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
   *
   * @exception {DeveloperError} options.slicePartitions cannot be less than three.
   * @exception {DeveloperError} options.stackPartitions cannot be less than three.
   *
   * @see EllipsoidGeometry#createGeometry
   *
   * @example
   * const ellipsoid = new Cesium.EllipsoidGeometry({
   *   vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
   *   radii : new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0)
   * });
   * const geometry = Cesium.EllipsoidGeometry.createGeometry(ellipsoid);
   */
  function EllipsoidGeometry(options) {
    options = defaultValue.defaultValue(options, defaultValue.defaultValue.EMPTY_OBJECT);

    const radii = defaultValue.defaultValue(options.radii, defaultRadii);
    const innerRadii = defaultValue.defaultValue(options.innerRadii, radii);
    const minimumClock = defaultValue.defaultValue(options.minimumClock, 0.0);
    const maximumClock = defaultValue.defaultValue(options.maximumClock, Math$1.CesiumMath.TWO_PI);
    const minimumCone = defaultValue.defaultValue(options.minimumCone, 0.0);
    const maximumCone = defaultValue.defaultValue(options.maximumCone, Math$1.CesiumMath.PI);
    const stackPartitions = Math.round(defaultValue.defaultValue(options.stackPartitions, 64));
    const slicePartitions = Math.round(defaultValue.defaultValue(options.slicePartitions, 64));
    const vertexFormat = defaultValue.defaultValue(options.vertexFormat, VertexFormat.VertexFormat.DEFAULT);

    //>>includeStart('debug', pragmas.debug);
    if (slicePartitions < 3) {
      throw new Check.DeveloperError(
        "options.slicePartitions cannot be less than three."
      );
    }
    if (stackPartitions < 3) {
      throw new Check.DeveloperError(
        "options.stackPartitions cannot be less than three."
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
    this._vertexFormat = VertexFormat.VertexFormat.clone(vertexFormat);
    this._offsetAttribute = options.offsetAttribute;
    this._workerName = "createEllipsoidGeometry";
  }

  /**
   * The number of elements used to pack the object into an array.
   * @type {number}
   */
  EllipsoidGeometry.packedLength =
    2 * Matrix3.Cartesian3.packedLength + VertexFormat.VertexFormat.packedLength + 7;

  /**
   * Stores the provided instance into the provided array.
   *
   * @param {EllipsoidGeometry} value The value to pack.
   * @param {number[]} array The array to pack into.
   * @param {number} [startingIndex=0] The index into the array at which to start packing the elements.
   *
   * @returns {number[]} The array that was packed into
   */
  EllipsoidGeometry.pack = function (value, array, startingIndex) {
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

    VertexFormat.VertexFormat.pack(value._vertexFormat, array, startingIndex);
    startingIndex += VertexFormat.VertexFormat.packedLength;

    array[startingIndex++] = value._minimumClock;
    array[startingIndex++] = value._maximumClock;
    array[startingIndex++] = value._minimumCone;
    array[startingIndex++] = value._maximumCone;
    array[startingIndex++] = value._stackPartitions;
    array[startingIndex++] = value._slicePartitions;
    array[startingIndex] = defaultValue.defaultValue(value._offsetAttribute, -1);

    return array;
  };

  const scratchRadii = new Matrix3.Cartesian3();
  const scratchInnerRadii = new Matrix3.Cartesian3();
  const scratchVertexFormat = new VertexFormat.VertexFormat();
  const scratchOptions = {
    radii: scratchRadii,
    innerRadii: scratchInnerRadii,
    vertexFormat: scratchVertexFormat,
    minimumClock: undefined,
    maximumClock: undefined,
    minimumCone: undefined,
    maximumCone: undefined,
    stackPartitions: undefined,
    slicePartitions: undefined,
    offsetAttribute: undefined,
  };

  /**
   * Retrieves an instance from a packed array.
   *
   * @param {number[]} array The packed array.
   * @param {number} [startingIndex=0] The starting index of the element to be unpacked.
   * @param {EllipsoidGeometry} [result] The object into which to store the result.
   * @returns {EllipsoidGeometry} The modified result parameter or a new EllipsoidGeometry instance if one was not provided.
   */
  EllipsoidGeometry.unpack = function (array, startingIndex, result) {
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

    const vertexFormat = VertexFormat.VertexFormat.unpack(
      array,
      startingIndex,
      scratchVertexFormat
    );
    startingIndex += VertexFormat.VertexFormat.packedLength;

    const minimumClock = array[startingIndex++];
    const maximumClock = array[startingIndex++];
    const minimumCone = array[startingIndex++];
    const maximumCone = array[startingIndex++];
    const stackPartitions = array[startingIndex++];
    const slicePartitions = array[startingIndex++];
    const offsetAttribute = array[startingIndex];

    if (!defaultValue.defined(result)) {
      scratchOptions.minimumClock = minimumClock;
      scratchOptions.maximumClock = maximumClock;
      scratchOptions.minimumCone = minimumCone;
      scratchOptions.maximumCone = maximumCone;
      scratchOptions.stackPartitions = stackPartitions;
      scratchOptions.slicePartitions = slicePartitions;
      scratchOptions.offsetAttribute =
        offsetAttribute === -1 ? undefined : offsetAttribute;
      return new EllipsoidGeometry(scratchOptions);
    }

    result._radii = Matrix3.Cartesian3.clone(radii, result._radii);
    result._innerRadii = Matrix3.Cartesian3.clone(innerRadii, result._innerRadii);
    result._vertexFormat = VertexFormat.VertexFormat.clone(vertexFormat, result._vertexFormat);
    result._minimumClock = minimumClock;
    result._maximumClock = maximumClock;
    result._minimumCone = minimumCone;
    result._maximumCone = maximumCone;
    result._stackPartitions = stackPartitions;
    result._slicePartitions = slicePartitions;
    result._offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;

    return result;
  };

  /**
   * Computes the geometric representation of an ellipsoid, including its vertices, indices, and a bounding sphere.
   *
   * @param {EllipsoidGeometry} ellipsoidGeometry A description of the ellipsoid.
   * @returns {Geometry|undefined} The computed vertices and indices.
   */
  EllipsoidGeometry.createGeometry = function (ellipsoidGeometry) {
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
    const vertexFormat = ellipsoidGeometry._vertexFormat;

    // Add an extra slice and stack so that the number of partitions is the
    // number of surfaces rather than the number of joints
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

    let i;
    let j;
    let index = 0;

    // Create arrays for theta and phi. Duplicate first and last angle to
    // allow different normals at the intersections.
    const phis = [minimumCone];
    const thetas = [minimumClock];
    for (i = 0; i < stackPartitions; i++) {
      phis.push(
        minimumCone + (i * (maximumCone - minimumCone)) / (stackPartitions - 1)
      );
    }
    phis.push(maximumCone);
    for (j = 0; j < slicePartitions; j++) {
      thetas.push(
        minimumClock + (j * (maximumClock - minimumClock)) / (slicePartitions - 1)
      );
    }
    thetas.push(maximumClock);
    const numPhis = phis.length;
    const numThetas = thetas.length;

    // Allow for extra indices if there is an inner surface and if we need
    // to close the sides if the clock range is not a full circle
    let extraIndices = 0;
    let vertexMultiplier = 1.0;
    const hasInnerSurface =
      innerRadii.x !== radii.x ||
      innerRadii.y !== radii.y ||
      innerRadii.z !== radii.z;
    let isTopOpen = false;
    let isBotOpen = false;
    let isClockOpen = false;
    if (hasInnerSurface) {
      vertexMultiplier = 2.0;
      if (minimumCone > 0.0) {
        isTopOpen = true;
        extraIndices += slicePartitions - 1;
      }
      if (maximumCone < Math.PI) {
        isBotOpen = true;
        extraIndices += slicePartitions - 1;
      }
      if ((maximumClock - minimumClock) % Math$1.CesiumMath.TWO_PI) {
        isClockOpen = true;
        extraIndices += (stackPartitions - 1) * 2 + 1;
      } else {
        extraIndices += 1;
      }
    }

    const vertexCount = numThetas * numPhis * vertexMultiplier;
    const positions = new Float64Array(vertexCount * 3);
    const isInner = new Array(vertexCount).fill(false);
    const negateNormal = new Array(vertexCount).fill(false);

    // Multiply by 6 because there are two triangles per sector
    const indexCount = slicePartitions * stackPartitions * vertexMultiplier;
    const numIndices =
      6 *
      (indexCount +
        extraIndices +
        1 -
        (slicePartitions + stackPartitions) * vertexMultiplier);
    const indices = IndexDatatype.IndexDatatype.createTypedArray(indexCount, numIndices);

    const normals = vertexFormat.normal
      ? new Float32Array(vertexCount * 3)
      : undefined;
    const tangents = vertexFormat.tangent
      ? new Float32Array(vertexCount * 3)
      : undefined;
    const bitangents = vertexFormat.bitangent
      ? new Float32Array(vertexCount * 3)
      : undefined;
    const st = vertexFormat.st ? new Float32Array(vertexCount * 2) : undefined;

    // Calculate sin/cos phi
    const sinPhi = new Array(numPhis);
    const cosPhi = new Array(numPhis);
    for (i = 0; i < numPhis; i++) {
      sinPhi[i] = sin(phis[i]);
      cosPhi[i] = cos(phis[i]);
    }

    // Calculate sin/cos theta
    const sinTheta = new Array(numThetas);
    const cosTheta = new Array(numThetas);
    for (j = 0; j < numThetas; j++) {
      cosTheta[j] = cos(thetas[j]);
      sinTheta[j] = sin(thetas[j]);
    }

    // Create outer surface
    for (i = 0; i < numPhis; i++) {
      for (j = 0; j < numThetas; j++) {
        positions[index++] = radii.x * sinPhi[i] * cosTheta[j];
        positions[index++] = radii.y * sinPhi[i] * sinTheta[j];
        positions[index++] = radii.z * cosPhi[i];
      }
    }

    // Create inner surface
    let vertexIndex = vertexCount / 2.0;
    if (hasInnerSurface) {
      for (i = 0; i < numPhis; i++) {
        for (j = 0; j < numThetas; j++) {
          positions[index++] = innerRadii.x * sinPhi[i] * cosTheta[j];
          positions[index++] = innerRadii.y * sinPhi[i] * sinTheta[j];
          positions[index++] = innerRadii.z * cosPhi[i];

          // Keep track of which vertices are the inner and which ones
          // need the normal to be negated
          isInner[vertexIndex] = true;
          if (i > 0 && i !== numPhis - 1 && j !== 0 && j !== numThetas - 1) {
            negateNormal[vertexIndex] = true;
          }
          vertexIndex++;
        }
      }
    }

    // Create indices for outer surface
    index = 0;
    let topOffset;
    let bottomOffset;
    for (i = 1; i < numPhis - 2; i++) {
      topOffset = i * numThetas;
      bottomOffset = (i + 1) * numThetas;

      for (j = 1; j < numThetas - 2; j++) {
        indices[index++] = bottomOffset + j;
        indices[index++] = bottomOffset + j + 1;
        indices[index++] = topOffset + j + 1;

        indices[index++] = bottomOffset + j;
        indices[index++] = topOffset + j + 1;
        indices[index++] = topOffset + j;
      }
    }

    // Create indices for inner surface
    if (hasInnerSurface) {
      const offset = numPhis * numThetas;
      for (i = 1; i < numPhis - 2; i++) {
        topOffset = offset + i * numThetas;
        bottomOffset = offset + (i + 1) * numThetas;

        for (j = 1; j < numThetas - 2; j++) {
          indices[index++] = bottomOffset + j;
          indices[index++] = topOffset + j;
          indices[index++] = topOffset + j + 1;

          indices[index++] = bottomOffset + j;
          indices[index++] = topOffset + j + 1;
          indices[index++] = bottomOffset + j + 1;
        }
      }
    }

    let outerOffset;
    let innerOffset;
    if (hasInnerSurface) {
      if (isTopOpen) {
        // Connect the top of the inner surface to the top of the outer surface
        innerOffset = numPhis * numThetas;
        for (i = 1; i < numThetas - 2; i++) {
          indices[index++] = i;
          indices[index++] = i + 1;
          indices[index++] = innerOffset + i + 1;

          indices[index++] = i;
          indices[index++] = innerOffset + i + 1;
          indices[index++] = innerOffset + i;
        }
      }

      if (isBotOpen) {
        // Connect the bottom of the inner surface to the bottom of the outer surface
        outerOffset = numPhis * numThetas - numThetas;
        innerOffset = numPhis * numThetas * vertexMultiplier - numThetas;
        for (i = 1; i < numThetas - 2; i++) {
          indices[index++] = outerOffset + i + 1;
          indices[index++] = outerOffset + i;
          indices[index++] = innerOffset + i;

          indices[index++] = outerOffset + i + 1;
          indices[index++] = innerOffset + i;
          indices[index++] = innerOffset + i + 1;
        }
      }
    }

    // Connect the edges if clock is not closed
    if (isClockOpen) {
      for (i = 1; i < numPhis - 2; i++) {
        innerOffset = numThetas * numPhis + numThetas * i;
        outerOffset = numThetas * i;
        indices[index++] = innerOffset;
        indices[index++] = outerOffset + numThetas;
        indices[index++] = outerOffset;

        indices[index++] = innerOffset;
        indices[index++] = innerOffset + numThetas;
        indices[index++] = outerOffset + numThetas;
      }

      for (i = 1; i < numPhis - 2; i++) {
        innerOffset = numThetas * numPhis + numThetas * (i + 1) - 1;
        outerOffset = numThetas * (i + 1) - 1;
        indices[index++] = outerOffset + numThetas;
        indices[index++] = innerOffset;
        indices[index++] = outerOffset;

        indices[index++] = outerOffset + numThetas;
        indices[index++] = innerOffset + numThetas;
        indices[index++] = innerOffset;
      }
    }

    const attributes = new GeometryAttributes.GeometryAttributes();

    if (vertexFormat.position) {
      attributes.position = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: positions,
      });
    }

    let stIndex = 0;
    let normalIndex = 0;
    let tangentIndex = 0;
    let bitangentIndex = 0;
    const vertexCountHalf = vertexCount / 2.0;

    let ellipsoid;
    const ellipsoidOuter = Matrix3.Ellipsoid.fromCartesian3(radii);
    const ellipsoidInner = Matrix3.Ellipsoid.fromCartesian3(innerRadii);

    if (
      vertexFormat.st ||
      vertexFormat.normal ||
      vertexFormat.tangent ||
      vertexFormat.bitangent
    ) {
      for (i = 0; i < vertexCount; i++) {
        ellipsoid = isInner[i] ? ellipsoidInner : ellipsoidOuter;
        const position = Matrix3.Cartesian3.fromArray(positions, i * 3, scratchPosition);
        const normal = ellipsoid.geodeticSurfaceNormal(position, scratchNormal);
        if (negateNormal[i]) {
          Matrix3.Cartesian3.negate(normal, normal);
        }

        if (vertexFormat.st) {
          const normalST = Matrix2.Cartesian2.negate(normal, scratchNormalST);
          st[stIndex++] =
            Math.atan2(normalST.y, normalST.x) / Math$1.CesiumMath.TWO_PI + 0.5;
          st[stIndex++] = Math.asin(normal.z) / Math.PI + 0.5;
        }

        if (vertexFormat.normal) {
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
        }

        if (vertexFormat.tangent || vertexFormat.bitangent) {
          const tangent = scratchTangent;

          // Use UNIT_X for the poles
          let tangetOffset = 0;
          let unit;
          if (isInner[i]) {
            tangetOffset = vertexCountHalf;
          }
          if (
            !isTopOpen &&
            i >= tangetOffset &&
            i < tangetOffset + numThetas * 2
          ) {
            unit = Matrix3.Cartesian3.UNIT_X;
          } else {
            unit = Matrix3.Cartesian3.UNIT_Z;
          }
          Matrix3.Cartesian3.cross(unit, normal, tangent);
          Matrix3.Cartesian3.normalize(tangent, tangent);

          if (vertexFormat.tangent) {
            tangents[tangentIndex++] = tangent.x;
            tangents[tangentIndex++] = tangent.y;
            tangents[tangentIndex++] = tangent.z;
          }

          if (vertexFormat.bitangent) {
            const bitangent = Matrix3.Cartesian3.cross(normal, tangent, scratchBitangent);
            Matrix3.Cartesian3.normalize(bitangent, bitangent);

            bitangents[bitangentIndex++] = bitangent.x;
            bitangents[bitangentIndex++] = bitangent.y;
            bitangents[bitangentIndex++] = bitangent.z;
          }
        }
      }

      if (vertexFormat.st) {
        attributes.st = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: st,
        });
      }

      if (vertexFormat.normal) {
        attributes.normal = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: normals,
        });
      }

      if (vertexFormat.tangent) {
        attributes.tangent = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: tangents,
        });
      }

      if (vertexFormat.bitangent) {
        attributes.bitangent = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: bitangents,
        });
      }
    }

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
      primitiveType: GeometryAttribute.PrimitiveType.TRIANGLES,
      boundingSphere: Transforms.BoundingSphere.fromEllipsoid(ellipsoidOuter),
      offsetAttribute: ellipsoidGeometry._offsetAttribute,
    });
  };

  let unitEllipsoidGeometry;

  /**
   * Returns the geometric representation of a unit ellipsoid, including its vertices, indices, and a bounding sphere.
   * @returns {Geometry} The computed vertices and indices.
   *
   * @private
   */
  EllipsoidGeometry.getUnitEllipsoid = function () {
    if (!defaultValue.defined(unitEllipsoidGeometry)) {
      unitEllipsoidGeometry = EllipsoidGeometry.createGeometry(
        new EllipsoidGeometry({
          radii: new Matrix3.Cartesian3(1.0, 1.0, 1.0),
          vertexFormat: VertexFormat.VertexFormat.POSITION_ONLY,
        })
      );
    }
    return unitEllipsoidGeometry;
  };

  exports.EllipsoidGeometry = EllipsoidGeometry;

}));
//# sourceMappingURL=EllipsoidGeometry-07e99d2d.js.map
