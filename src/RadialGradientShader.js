/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var benri = global.benri;
  var Matrix2D = benri.geometry.Matrix2D;

  /**
   * @class
   * @extends {benri.draw.Shader}
   */
  benri.draw.RadialGradientShader = (function(pSuper) {
    function RadialGradientShader(pStartPoint, pRadius, pPositions, pColors) {
      pSuper.call(this);
      this.startPoint = pStartPoint;
      this.radius = pRadius;
      this.matrix = new Matrix2D();
      pPositions = pPositions || [];
      pColors = pColors || [];

      if (pPositions.length !== pColors.length) {
        throw new Error('Positions and colors length do not match');
      }

      this.positions = pPositions;
      this.colors = pColors;
    }

    RadialGradientShader.prototype = Object.create(pSuper.prototype);
    RadialGradientShader.prototype.constructor = RadialGradientShader;

    RadialGradientShader.prototype.addStop = function(pPosition, pColor) {
      this.positions.push(pPosition);
      this.colors.push(pColor);
    };

    return RadialGradientShader;
  })(benri.draw.Shader);

}(this));