define(['./defaultValue-fe22d8c0', './EllipsoidOutlineGeometry-ba5c7ee2', './Transforms-b527bb09', './Matrix3-41c58dde', './Check-6ede7e26', './Math-0a2ac845', './Matrix2-e1298525', './RuntimeError-ef395448', './combine-d9581036', './ComponentDatatype-cf1fa08e', './WebGLConstants-0b1ce7ba', './GeometryAttribute-a5b6275b', './GeometryAttributes-ad136444', './GeometryOffsetAttribute-9ad0019c', './IndexDatatype-2643aa47'], (function (defaultValue, EllipsoidOutlineGeometry, Transforms, Matrix3, Check, Math, Matrix2, RuntimeError, combine, ComponentDatatype, WebGLConstants, GeometryAttribute, GeometryAttributes, GeometryOffsetAttribute, IndexDatatype) { 'use strict';

  function createEllipsoidOutlineGeometry(ellipsoidGeometry, offset) {
    if (defaultValue.defined(ellipsoidGeometry.buffer)) {
      ellipsoidGeometry = EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.unpack(
        ellipsoidGeometry,
        offset
      );
    }
    return EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidOutlineGeometry;

}));
//# sourceMappingURL=createEllipsoidOutlineGeometry.js.map
