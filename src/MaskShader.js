/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  /**
   * @class
   * @extends {benri.draw.Shader}
   */
  var MaskShader = (function(pSuper) {
    function MaskShader(pBitmap) {
      pSuper.call(this);
      this.bitmap = pBitmap;
    }

    MaskShader.prototype = Object.create(pSuper.prototype);
    MaskShader.prototype.constructor = MaskShader;

    return MaskShader;
  })(benri.draw.Shader);

  benri.draw.MaskShader = MaskShader;

}(this));