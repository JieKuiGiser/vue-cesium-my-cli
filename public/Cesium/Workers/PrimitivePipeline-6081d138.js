define(['exports', './Transforms-b527bb09', './ComponentDatatype-cf1fa08e', './defaultValue-fe22d8c0', './Check-6ede7e26', './Matrix3-41c58dde', './GeometryAttribute-a5b6275b', './GeometryAttributes-ad136444', './GeometryPipeline-fa9e6ffc', './IndexDatatype-2643aa47', './Matrix2-e1298525', './WebMercatorProjection-13ed1a6e'], (function (exports, Transforms, ComponentDatatype, defaultValue, Check, Matrix3, GeometryAttribute, GeometryAttributes, GeometryPipeline, IndexDatatype, Matrix2, WebMercatorProjection) { 'use strict';

  /**
   * Value and type information for per-instance geometry attribute that determines the geometry instance offset
   *
   * @alias OffsetGeometryInstanceAttribute
   * @constructor
   *
   * @param {number} [x=0] The x translation
   * @param {number} [y=0] The y translation
   * @param {number} [z=0] The z translation
   *
   * @private
   *
   * @see GeometryInstance
   * @see GeometryInstanceAttribute
   */
  function OffsetGeometryInstanceAttribute(x, y, z) {
    x = defaultValue.defaultValue(x, 0);
    y = defaultValue.defaultValue(y, 0);
    z = defaultValue.defaultValue(z, 0);

    /**
     * The values for the attributes stored in a typed array.
     *
     * @type Float32Array
     */
    this.value = new Float32Array([x, y, z]);
  }

  Object.defineProperties(OffsetGeometryInstanceAttribute.prototype, {
    /**
     * The datatype of each component in the attribute, e.g., individual elements in
     * {@link OffsetGeometryInstanceAttribute#value}.
     *
     * @memberof OffsetGeometryInstanceAttribute.prototype
     *
     * @type {ComponentDatatype}
     * @readonly
     *
     * @default {@link ComponentDatatype.FLOAT}
     */
    componentDatatype: {
      get: function () {
        return ComponentDatatype.ComponentDatatype.FLOAT;
      },
    },

    /**
     * The number of components in the attributes, i.e., {@link OffsetGeometryInstanceAttribute#value}.
     *
     * @memberof OffsetGeometryInstanceAttribute.prototype
     *
     * @type {number}
     * @readonly
     *
     * @default 3
     */
    componentsPerAttribute: {
      get: function () {
        return 3;
      },
    },

    /**
     * When <code>true</code> and <code>componentDatatype</code> is an integer format,
     * indicate that the components should be mapped to the range [0, 1] (unsigned)
     * or [-1, 1] (signed) when they are accessed as floating-point for rendering.
     *
     * @memberof OffsetGeometryInstanceAttribute.prototype
     *
     * @type {boolean}
     * @readonly
     *
     * @default false
     */
    normalize: {
      get: function () {
        return false;
      },
    },
  });

  /**
   * Creates a new {@link OffsetGeometryInstanceAttribute} instance given the provided an enabled flag and {@link DistanceDisplayCondition}.
   *
   * @param {Cartesian3} offset The cartesian offset
   * @returns {OffsetGeometryInstanceAttribute} The new {@link OffsetGeometryInstanceAttribute} instance.
   */
  OffsetGeometryInstanceAttribute.fromCartesian3 = function (offset) {
    //>>includeStart('debug', pragmas.debug);
    Check.Check.defined("offset", offset);
    //>>includeEnd('debug');

    return new OffsetGeometryInstanceAttribute(offset.x, offset.y, offset.z);
  };

  /**
   * Converts a distance display condition to a typed array that can be used to assign a distance display condition attribute.
   *
   * @param {Cartesian3} offset The cartesian offset
   * @param {Float32Array} [result] The array to store the result in, if undefined a new instance will be created.
   * @returns {Float32Array} The modified result parameter or a new instance if result was undefined.
   *
   * @example
   * const attributes = primitive.getGeometryInstanceAttributes('an id');
   * attributes.modelMatrix = Cesium.OffsetGeometryInstanceAttribute.toValue(modelMatrix, attributes.modelMatrix);
   */
  OffsetGeometryInstanceAttribute.toValue = function (offset, result) {
    //>>includeStart('debug', pragmas.debug);
    Check.Check.defined("offset", offset);
    //>>includeEnd('debug');

    if (!defaultValue.defined(result)) {
      result = new Float32Array([offset.x, offset.y, offset.z]);
    }

    result[0] = offset.x;
    result[1] = offset.y;
    result[2] = offset.z;
    return result;
  };

  function transformToWorldCoordinates(
    instances,
    primitiveModelMatrix,
    scene3DOnly
  ) {
    let toWorld = !scene3DOnly;
    const length = instances.length;
    let i;

    if (!toWorld && length > 1) {
      const modelMatrix = instances[0].modelMatrix;

      for (i = 1; i < length; ++i) {
        if (!Matrix2.Matrix4.equals(modelMatrix, instances[i].modelMatrix)) {
          toWorld = true;
          break;
        }
      }
    }

    if (toWorld) {
      for (i = 0; i < length; ++i) {
        if (defaultValue.defined(instances[i].geometry)) {
          GeometryPipeline.GeometryPipeline.transformToWorldCoordinates(instances[i]);
        }
      }
    } else {
      // Leave geometry in local coordinate system; auto update model-matrix.
      Matrix2.Matrix4.multiplyTransformation(
        primitiveModelMatrix,
        instances[0].modelMatrix,
        primitiveModelMatrix
      );
    }
  }

  function addGeometryBatchId(geometry, batchId) {
    const attributes = geometry.attributes;
    const positionAttr = attributes.position;
    const numberOfComponents =
      positionAttr.values.length / positionAttr.componentsPerAttribute;

    attributes.batchId = new GeometryAttribute.GeometryAttribute({
      componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
      componentsPerAttribute: 1,
      values: new Float32Array(numberOfComponents),
    });

    const values = attributes.batchId.values;
    for (let j = 0; j < numberOfComponents; ++j) {
      values[j] = batchId;
    }
  }

  function addBatchIds(instances) {
    const length = instances.length;

    for (let i = 0; i < length; ++i) {
      const instance = instances[i];
      if (defaultValue.defined(instance.geometry)) {
        addGeometryBatchId(instance.geometry, i);
      } else if (
        defaultValue.defined(instance.westHemisphereGeometry) &&
        defaultValue.defined(instance.eastHemisphereGeometry)
      ) {
        addGeometryBatchId(instance.westHemisphereGeometry, i);
        addGeometryBatchId(instance.eastHemisphereGeometry, i);
      }
    }
  }

  function geometryPipeline(parameters) {
    const instances = parameters.instances;
    const projection = parameters.projection;
    const uintIndexSupport = parameters.elementIndexUintSupported;
    const scene3DOnly = parameters.scene3DOnly;
    const vertexCacheOptimize = parameters.vertexCacheOptimize;
    const compressVertices = parameters.compressVertices;
    const modelMatrix = parameters.modelMatrix;

    let i;
    let geometry;
    let primitiveType;
    let length = instances.length;

    for (i = 0; i < length; ++i) {
      if (defaultValue.defined(instances[i].geometry)) {
        primitiveType = instances[i].geometry.primitiveType;
        break;
      }
    }

    //>>includeStart('debug', pragmas.debug);
    for (i = 1; i < length; ++i) {
      if (
        defaultValue.defined(instances[i].geometry) &&
        instances[i].geometry.primitiveType !== primitiveType
      ) {
        throw new Check.DeveloperError(
          "All instance geometries must have the same primitiveType."
        );
      }
    }
    //>>includeEnd('debug');

    // Unify to world coordinates before combining.
    transformToWorldCoordinates(instances, modelMatrix, scene3DOnly);

    // Clip to IDL
    if (!scene3DOnly) {
      for (i = 0; i < length; ++i) {
        if (defaultValue.defined(instances[i].geometry)) {
          GeometryPipeline.GeometryPipeline.splitLongitude(instances[i]);
        }
      }
    }

    addBatchIds(instances);

    // Optimize for vertex shader caches
    if (vertexCacheOptimize) {
      for (i = 0; i < length; ++i) {
        const instance = instances[i];
        if (defaultValue.defined(instance.geometry)) {
          GeometryPipeline.GeometryPipeline.reorderForPostVertexCache(instance.geometry);
          GeometryPipeline.GeometryPipeline.reorderForPreVertexCache(instance.geometry);
        } else if (
          defaultValue.defined(instance.westHemisphereGeometry) &&
          defaultValue.defined(instance.eastHemisphereGeometry)
        ) {
          GeometryPipeline.GeometryPipeline.reorderForPostVertexCache(
            instance.westHemisphereGeometry
          );
          GeometryPipeline.GeometryPipeline.reorderForPreVertexCache(
            instance.westHemisphereGeometry
          );

          GeometryPipeline.GeometryPipeline.reorderForPostVertexCache(
            instance.eastHemisphereGeometry
          );
          GeometryPipeline.GeometryPipeline.reorderForPreVertexCache(
            instance.eastHemisphereGeometry
          );
        }
      }
    }

    // Combine into single geometry for better rendering performance.
    let geometries = GeometryPipeline.GeometryPipeline.combineInstances(instances);

    length = geometries.length;
    for (i = 0; i < length; ++i) {
      geometry = geometries[i];

      // Split positions for GPU RTE
      const attributes = geometry.attributes;
      if (!scene3DOnly) {
        for (const name in attributes) {
          if (
            attributes.hasOwnProperty(name) &&
            attributes[name].componentDatatype === ComponentDatatype.ComponentDatatype.DOUBLE
          ) {
            const name3D = `${name}3D`;
            const name2D = `${name}2D`;

            // Compute 2D positions
            GeometryPipeline.GeometryPipeline.projectTo2D(
              geometry,
              name,
              name3D,
              name2D,
              projection
            );
            if (defaultValue.defined(geometry.boundingSphere) && name === "position") {
              geometry.boundingSphereCV = Transforms.BoundingSphere.fromVertices(
                geometry.attributes.position2D.values
              );
            }

            GeometryPipeline.GeometryPipeline.encodeAttribute(
              geometry,
              name3D,
              `${name3D}High`,
              `${name3D}Low`
            );
            GeometryPipeline.GeometryPipeline.encodeAttribute(
              geometry,
              name2D,
              `${name2D}High`,
              `${name2D}Low`
            );
          }
        }
      } else {
        for (const name in attributes) {
          if (
            attributes.hasOwnProperty(name) &&
            attributes[name].componentDatatype === ComponentDatatype.ComponentDatatype.DOUBLE
          ) {
            GeometryPipeline.GeometryPipeline.encodeAttribute(
              geometry,
              name,
              `${name}3DHigh`,
              `${name}3DLow`
            );
          }
        }
      }

      // oct encode and pack normals, compress texture coordinates
      if (compressVertices) {
        GeometryPipeline.GeometryPipeline.compressVertices(geometry);
      }
    }

    if (!uintIndexSupport) {
      // Break into multiple geometries to fit within unsigned short indices if needed
      let splitGeometries = [];
      length = geometries.length;
      for (i = 0; i < length; ++i) {
        geometry = geometries[i];
        splitGeometries = splitGeometries.concat(
          GeometryPipeline.GeometryPipeline.fitToUnsignedShortIndices(geometry)
        );
      }

      geometries = splitGeometries;
    }

    return geometries;
  }

  function createPickOffsets(instances, geometryName, geometries, pickOffsets) {
    let offset;
    let indexCount;
    let geometryIndex;

    const offsetIndex = pickOffsets.length - 1;
    if (offsetIndex >= 0) {
      const pickOffset = pickOffsets[offsetIndex];
      offset = pickOffset.offset + pickOffset.count;
      geometryIndex = pickOffset.index;
      indexCount = geometries[geometryIndex].indices.length;
    } else {
      offset = 0;
      geometryIndex = 0;
      indexCount = geometries[geometryIndex].indices.length;
    }

    const length = instances.length;
    for (let i = 0; i < length; ++i) {
      const instance = instances[i];
      const geometry = instance[geometryName];
      if (!defaultValue.defined(geometry)) {
        continue;
      }

      const count = geometry.indices.length;

      if (offset + count > indexCount) {
        offset = 0;
        indexCount = geometries[++geometryIndex].indices.length;
      }

      pickOffsets.push({
        index: geometryIndex,
        offset: offset,
        count: count,
      });
      offset += count;
    }
  }

  function createInstancePickOffsets(instances, geometries) {
    const pickOffsets = [];
    createPickOffsets(instances, "geometry", geometries, pickOffsets);
    createPickOffsets(
      instances,
      "westHemisphereGeometry",
      geometries,
      pickOffsets
    );
    createPickOffsets(
      instances,
      "eastHemisphereGeometry",
      geometries,
      pickOffsets
    );
    return pickOffsets;
  }

  /**
   * @private
   */
  const PrimitivePipeline = {};

  /**
   * @private
   */
  PrimitivePipeline.combineGeometry = function (parameters) {
    let geometries;
    let attributeLocations;
    const instances = parameters.instances;
    const length = instances.length;
    let pickOffsets;

    let offsetInstanceExtend;
    let hasOffset = false;
    if (length > 0) {
      geometries = geometryPipeline(parameters);
      if (geometries.length > 0) {
        attributeLocations = GeometryPipeline.GeometryPipeline.createAttributeLocations(
          geometries[0]
        );
        if (parameters.createPickOffsets) {
          pickOffsets = createInstancePickOffsets(instances, geometries);
        }
      }
      if (
        defaultValue.defined(instances[0].attributes) &&
        defaultValue.defined(instances[0].attributes.offset)
      ) {
        offsetInstanceExtend = new Array(length);
        hasOffset = true;
      }
    }

    const boundingSpheres = new Array(length);
    const boundingSpheresCV = new Array(length);
    for (let i = 0; i < length; ++i) {
      const instance = instances[i];
      const geometry = instance.geometry;
      if (defaultValue.defined(geometry)) {
        boundingSpheres[i] = geometry.boundingSphere;
        boundingSpheresCV[i] = geometry.boundingSphereCV;
        if (hasOffset) {
          offsetInstanceExtend[i] = instance.geometry.offsetAttribute;
        }
      }

      const eastHemisphereGeometry = instance.eastHemisphereGeometry;
      const westHemisphereGeometry = instance.westHemisphereGeometry;
      if (defaultValue.defined(eastHemisphereGeometry) && defaultValue.defined(westHemisphereGeometry)) {
        if (
          defaultValue.defined(eastHemisphereGeometry.boundingSphere) &&
          defaultValue.defined(westHemisphereGeometry.boundingSphere)
        ) {
          boundingSpheres[i] = Transforms.BoundingSphere.union(
            eastHemisphereGeometry.boundingSphere,
            westHemisphereGeometry.boundingSphere
          );
        }
        if (
          defaultValue.defined(eastHemisphereGeometry.boundingSphereCV) &&
          defaultValue.defined(westHemisphereGeometry.boundingSphereCV)
        ) {
          boundingSpheresCV[i] = Transforms.BoundingSphere.union(
            eastHemisphereGeometry.boundingSphereCV,
            westHemisphereGeometry.boundingSphereCV
          );
        }
      }
    }

    return {
      geometries: geometries,
      modelMatrix: parameters.modelMatrix,
      attributeLocations: attributeLocations,
      pickOffsets: pickOffsets,
      offsetInstanceExtend: offsetInstanceExtend,
      boundingSpheres: boundingSpheres,
      boundingSpheresCV: boundingSpheresCV,
    };
  };

  function transferGeometry(geometry, transferableObjects) {
    const attributes = geometry.attributes;
    for (const name in attributes) {
      if (attributes.hasOwnProperty(name)) {
        const attribute = attributes[name];

        if (defaultValue.defined(attribute) && defaultValue.defined(attribute.values)) {
          transferableObjects.push(attribute.values.buffer);
        }
      }
    }

    if (defaultValue.defined(geometry.indices)) {
      transferableObjects.push(geometry.indices.buffer);
    }
  }

  function transferGeometries(geometries, transferableObjects) {
    const length = geometries.length;
    for (let i = 0; i < length; ++i) {
      transferGeometry(geometries[i], transferableObjects);
    }
  }

  // This function was created by simplifying packCreateGeometryResults into a count-only operation.
  function countCreateGeometryResults(items) {
    let count = 1;
    const length = items.length;
    for (let i = 0; i < length; i++) {
      const geometry = items[i];
      ++count;

      if (!defaultValue.defined(geometry)) {
        continue;
      }

      const attributes = geometry.attributes;

      count +=
        7 +
        2 * Transforms.BoundingSphere.packedLength +
        (defaultValue.defined(geometry.indices) ? geometry.indices.length : 0);

      for (const property in attributes) {
        if (
          attributes.hasOwnProperty(property) &&
          defaultValue.defined(attributes[property])
        ) {
          const attribute = attributes[property];
          count += 5 + attribute.values.length;
        }
      }
    }

    return count;
  }

  /**
   * @private
   */
  PrimitivePipeline.packCreateGeometryResults = function (
    items,
    transferableObjects
  ) {
    const packedData = new Float64Array(countCreateGeometryResults(items));
    const stringTable = [];
    const stringHash = {};

    const length = items.length;
    let count = 0;
    packedData[count++] = length;
    for (let i = 0; i < length; i++) {
      const geometry = items[i];

      const validGeometry = defaultValue.defined(geometry);
      packedData[count++] = validGeometry ? 1.0 : 0.0;

      if (!validGeometry) {
        continue;
      }

      packedData[count++] = geometry.primitiveType;
      packedData[count++] = geometry.geometryType;
      packedData[count++] = defaultValue.defaultValue(geometry.offsetAttribute, -1);

      const validBoundingSphere = defaultValue.defined(geometry.boundingSphere) ? 1.0 : 0.0;
      packedData[count++] = validBoundingSphere;
      if (validBoundingSphere) {
        Transforms.BoundingSphere.pack(geometry.boundingSphere, packedData, count);
      }

      count += Transforms.BoundingSphere.packedLength;

      const validBoundingSphereCV = defaultValue.defined(geometry.boundingSphereCV)
        ? 1.0
        : 0.0;
      packedData[count++] = validBoundingSphereCV;
      if (validBoundingSphereCV) {
        Transforms.BoundingSphere.pack(geometry.boundingSphereCV, packedData, count);
      }

      count += Transforms.BoundingSphere.packedLength;

      const attributes = geometry.attributes;
      const attributesToWrite = [];
      for (const property in attributes) {
        if (
          attributes.hasOwnProperty(property) &&
          defaultValue.defined(attributes[property])
        ) {
          attributesToWrite.push(property);
          if (!defaultValue.defined(stringHash[property])) {
            stringHash[property] = stringTable.length;
            stringTable.push(property);
          }
        }
      }

      packedData[count++] = attributesToWrite.length;
      for (let q = 0; q < attributesToWrite.length; q++) {
        const name = attributesToWrite[q];
        const attribute = attributes[name];
        packedData[count++] = stringHash[name];
        packedData[count++] = attribute.componentDatatype;
        packedData[count++] = attribute.componentsPerAttribute;
        packedData[count++] = attribute.normalize ? 1 : 0;
        packedData[count++] = attribute.values.length;
        packedData.set(attribute.values, count);
        count += attribute.values.length;
      }

      const indicesLength = defaultValue.defined(geometry.indices)
        ? geometry.indices.length
        : 0;
      packedData[count++] = indicesLength;

      if (indicesLength > 0) {
        packedData.set(geometry.indices, count);
        count += indicesLength;
      }
    }

    transferableObjects.push(packedData.buffer);

    return {
      stringTable: stringTable,
      packedData: packedData,
    };
  };

  /**
   * @private
   */
  PrimitivePipeline.unpackCreateGeometryResults = function (
    createGeometryResult
  ) {
    const stringTable = createGeometryResult.stringTable;
    const packedGeometry = createGeometryResult.packedData;

    let i;
    const result = new Array(packedGeometry[0]);
    let resultIndex = 0;

    let packedGeometryIndex = 1;
    while (packedGeometryIndex < packedGeometry.length) {
      const valid = packedGeometry[packedGeometryIndex++] === 1.0;
      if (!valid) {
        result[resultIndex++] = undefined;
        continue;
      }

      const primitiveType = packedGeometry[packedGeometryIndex++];
      const geometryType = packedGeometry[packedGeometryIndex++];
      let offsetAttribute = packedGeometry[packedGeometryIndex++];
      if (offsetAttribute === -1) {
        offsetAttribute = undefined;
      }

      let boundingSphere;
      let boundingSphereCV;

      const validBoundingSphere = packedGeometry[packedGeometryIndex++] === 1.0;
      if (validBoundingSphere) {
        boundingSphere = Transforms.BoundingSphere.unpack(
          packedGeometry,
          packedGeometryIndex
        );
      }

      packedGeometryIndex += Transforms.BoundingSphere.packedLength;

      const validBoundingSphereCV = packedGeometry[packedGeometryIndex++] === 1.0;
      if (validBoundingSphereCV) {
        boundingSphereCV = Transforms.BoundingSphere.unpack(
          packedGeometry,
          packedGeometryIndex
        );
      }

      packedGeometryIndex += Transforms.BoundingSphere.packedLength;

      let length;
      let values;
      let componentsPerAttribute;
      const attributes = new GeometryAttributes.GeometryAttributes();
      const numAttributes = packedGeometry[packedGeometryIndex++];
      for (i = 0; i < numAttributes; i++) {
        const name = stringTable[packedGeometry[packedGeometryIndex++]];
        const componentDatatype = packedGeometry[packedGeometryIndex++];
        componentsPerAttribute = packedGeometry[packedGeometryIndex++];
        const normalize = packedGeometry[packedGeometryIndex++] !== 0;

        length = packedGeometry[packedGeometryIndex++];
        values = ComponentDatatype.ComponentDatatype.createTypedArray(componentDatatype, length);
        for (let valuesIndex = 0; valuesIndex < length; valuesIndex++) {
          values[valuesIndex] = packedGeometry[packedGeometryIndex++];
        }

        attributes[name] = new GeometryAttribute.GeometryAttribute({
          componentDatatype: componentDatatype,
          componentsPerAttribute: componentsPerAttribute,
          normalize: normalize,
          values: values,
        });
      }

      let indices;
      length = packedGeometry[packedGeometryIndex++];

      if (length > 0) {
        const numberOfVertices = values.length / componentsPerAttribute;
        indices = IndexDatatype.IndexDatatype.createTypedArray(numberOfVertices, length);
        for (i = 0; i < length; i++) {
          indices[i] = packedGeometry[packedGeometryIndex++];
        }
      }

      result[resultIndex++] = new GeometryAttribute.Geometry({
        primitiveType: primitiveType,
        geometryType: geometryType,
        boundingSphere: boundingSphere,
        boundingSphereCV: boundingSphereCV,
        indices: indices,
        attributes: attributes,
        offsetAttribute: offsetAttribute,
      });
    }

    return result;
  };

  function packInstancesForCombine(instances, transferableObjects) {
    const length = instances.length;
    const packedData = new Float64Array(1 + length * 19);
    let count = 0;
    packedData[count++] = length;
    for (let i = 0; i < length; i++) {
      const instance = instances[i];
      Matrix2.Matrix4.pack(instance.modelMatrix, packedData, count);
      count += Matrix2.Matrix4.packedLength;
      if (defaultValue.defined(instance.attributes) && defaultValue.defined(instance.attributes.offset)) {
        const values = instance.attributes.offset.value;
        packedData[count] = values[0];
        packedData[count + 1] = values[1];
        packedData[count + 2] = values[2];
      }
      count += 3;
    }
    transferableObjects.push(packedData.buffer);

    return packedData;
  }

  function unpackInstancesForCombine(data) {
    const packedInstances = data;
    const result = new Array(packedInstances[0]);
    let count = 0;

    let i = 1;
    while (i < packedInstances.length) {
      const modelMatrix = Matrix2.Matrix4.unpack(packedInstances, i);
      let attributes;
      i += Matrix2.Matrix4.packedLength;
      if (defaultValue.defined(packedInstances[i])) {
        attributes = {
          offset: new OffsetGeometryInstanceAttribute(
            packedInstances[i],
            packedInstances[i + 1],
            packedInstances[i + 2]
          ),
        };
      }
      i += 3;

      result[count++] = {
        modelMatrix: modelMatrix,
        attributes: attributes,
      };
    }

    return result;
  }

  /**
   * @private
   */
  PrimitivePipeline.packCombineGeometryParameters = function (
    parameters,
    transferableObjects
  ) {
    const createGeometryResults = parameters.createGeometryResults;
    const length = createGeometryResults.length;

    for (let i = 0; i < length; i++) {
      transferableObjects.push(createGeometryResults[i].packedData.buffer);
    }

    return {
      createGeometryResults: parameters.createGeometryResults,
      packedInstances: packInstancesForCombine(
        parameters.instances,
        transferableObjects
      ),
      ellipsoid: parameters.ellipsoid,
      isGeographic: parameters.projection instanceof Transforms.GeographicProjection,
      elementIndexUintSupported: parameters.elementIndexUintSupported,
      scene3DOnly: parameters.scene3DOnly,
      vertexCacheOptimize: parameters.vertexCacheOptimize,
      compressVertices: parameters.compressVertices,
      modelMatrix: parameters.modelMatrix,
      createPickOffsets: parameters.createPickOffsets,
    };
  };

  /**
   * @private
   */
  PrimitivePipeline.unpackCombineGeometryParameters = function (
    packedParameters
  ) {
    const instances = unpackInstancesForCombine(packedParameters.packedInstances);
    const createGeometryResults = packedParameters.createGeometryResults;
    const length = createGeometryResults.length;
    let instanceIndex = 0;

    for (let resultIndex = 0; resultIndex < length; resultIndex++) {
      const geometries = PrimitivePipeline.unpackCreateGeometryResults(
        createGeometryResults[resultIndex]
      );
      const geometriesLength = geometries.length;
      for (
        let geometryIndex = 0;
        geometryIndex < geometriesLength;
        geometryIndex++
      ) {
        const geometry = geometries[geometryIndex];
        const instance = instances[instanceIndex];
        instance.geometry = geometry;
        ++instanceIndex;
      }
    }

    const ellipsoid = Matrix3.Ellipsoid.clone(packedParameters.ellipsoid);
    const projection = packedParameters.isGeographic
      ? new Transforms.GeographicProjection(ellipsoid)
      : new WebMercatorProjection.WebMercatorProjection(ellipsoid);

    return {
      instances: instances,
      ellipsoid: ellipsoid,
      projection: projection,
      elementIndexUintSupported: packedParameters.elementIndexUintSupported,
      scene3DOnly: packedParameters.scene3DOnly,
      vertexCacheOptimize: packedParameters.vertexCacheOptimize,
      compressVertices: packedParameters.compressVertices,
      modelMatrix: Matrix2.Matrix4.clone(packedParameters.modelMatrix),
      createPickOffsets: packedParameters.createPickOffsets,
    };
  };

  function packBoundingSpheres(boundingSpheres) {
    const length = boundingSpheres.length;
    const bufferLength = 1 + (Transforms.BoundingSphere.packedLength + 1) * length;
    const buffer = new Float32Array(bufferLength);

    let bufferIndex = 0;
    buffer[bufferIndex++] = length;

    for (let i = 0; i < length; ++i) {
      const bs = boundingSpheres[i];
      if (!defaultValue.defined(bs)) {
        buffer[bufferIndex++] = 0.0;
      } else {
        buffer[bufferIndex++] = 1.0;
        Transforms.BoundingSphere.pack(boundingSpheres[i], buffer, bufferIndex);
      }
      bufferIndex += Transforms.BoundingSphere.packedLength;
    }

    return buffer;
  }

  function unpackBoundingSpheres(buffer) {
    const result = new Array(buffer[0]);
    let count = 0;

    let i = 1;
    while (i < buffer.length) {
      if (buffer[i++] === 1.0) {
        result[count] = Transforms.BoundingSphere.unpack(buffer, i);
      }
      ++count;
      i += Transforms.BoundingSphere.packedLength;
    }

    return result;
  }

  /**
   * @private
   */
  PrimitivePipeline.packCombineGeometryResults = function (
    results,
    transferableObjects
  ) {
    if (defaultValue.defined(results.geometries)) {
      transferGeometries(results.geometries, transferableObjects);
    }

    const packedBoundingSpheres = packBoundingSpheres(results.boundingSpheres);
    const packedBoundingSpheresCV = packBoundingSpheres(
      results.boundingSpheresCV
    );
    transferableObjects.push(
      packedBoundingSpheres.buffer,
      packedBoundingSpheresCV.buffer
    );

    return {
      geometries: results.geometries,
      attributeLocations: results.attributeLocations,
      modelMatrix: results.modelMatrix,
      pickOffsets: results.pickOffsets,
      offsetInstanceExtend: results.offsetInstanceExtend,
      boundingSpheres: packedBoundingSpheres,
      boundingSpheresCV: packedBoundingSpheresCV,
    };
  };

  /**
   * @private
   */
  PrimitivePipeline.unpackCombineGeometryResults = function (packedResult) {
    return {
      geometries: packedResult.geometries,
      attributeLocations: packedResult.attributeLocations,
      modelMatrix: packedResult.modelMatrix,
      pickOffsets: packedResult.pickOffsets,
      offsetInstanceExtend: packedResult.offsetInstanceExtend,
      boundingSpheres: unpackBoundingSpheres(packedResult.boundingSpheres),
      boundingSpheresCV: unpackBoundingSpheres(packedResult.boundingSpheresCV),
    };
  };
  var PrimitivePipeline$1 = PrimitivePipeline;

  exports.PrimitivePipeline = PrimitivePipeline$1;

}));
//# sourceMappingURL=PrimitivePipeline-6081d138.js.map
