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
  var BitmapShader = (function(pSuper) {
    function BitmapShader(pBitmap) {
      pSuper.call(this);
      this.bitmap = pBitmap;
      this.matrix = new Matrix2D();
    }

    BitmapShader.prototype = Object.create(pSuper.prototype);
    BitmapShader.prototype.constructor = BitmapShader;

    return BitmapShader;
  })(benri.draw.Shader);

  benri.draw.BitmapShader = BitmapShader;

}(this));