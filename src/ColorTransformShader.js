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
  var ColorTransformShader = (function(pSuper) {
    function ColorTransformShader(pRedMult, pGreenMult, pBlueMult, pAlphaMult, pRedAdd, pGreenAdd, pBlueAdd, pAlphaAdd) {
      pSuper.call(this);
      this.redMultiplier = pRedMult;
      this.greenMultiplier = pGreenMult;
      this.blueMultiplier = pBlueMult;
      this.alphaMultiplier = pAlphaMult;
      this.redAdd = pRedAdd;
      this.greenAdd = pGreenAdd;
      this.blueAdd = pBlueAdd;
      this.alphaAdd = pAlphaAdd;
    }

    ColorTransformShader.prototype = Object.create(pSuper.prototype);
    ColorTransformShader.prototype.constructor = ColorTransformShader;

    return ColorTransformShader;
  })(benri.draw.Shader);

  benri.draw.ColorTransformShader = ColorTransformShader;

}(this));