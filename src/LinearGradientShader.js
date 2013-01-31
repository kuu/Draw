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
  benri.draw.LinearGradientShader = (function(pSuper) {
    function LinearGradientShader(pStartPoint, pEndPoint, pPositions, pColors) {
      pSuper.call(this);
      this.startPoint = pStartPoint;
      this.endPoint = pEndPoint;
      this.matrix = new Matrix2D();
      pPositions = pPositions || [];
      pColors = pColors || [];

      if (pPositions.length !== pColors.length) {
        throw new Error('Positions and colors length do not match');
      }

      this.positions = pPositions;
      this.colors = pColors;
    }

    LinearGradientShader.prototype = Object.create(pSuper.prototype);
    LinearGradientShader.prototype.constructor = LinearGradientShader;

    LinearGradientShader.prototype.addStop = function(pPosition, pColor) {
      this.positions.push(pPosition);
      this.colors.push(pColor);
    };

    return LinearGradientShader;
  })(benri.draw.Shader);

}(this));