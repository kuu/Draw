/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

/**
 * @class
 * @extends {benri.draw.Shader}
 */
benri.draw.ColorShader = (function(pSuper) {
  function ColorShader(pColor) {
    pSuper.call(this);
    this.color = pColor;
  }

  ColorShader.prototype = Object.create(pSuper.prototype);
  ColorShader.prototype.constructor = ColorShader;

  return ColorShader;
})(benri.draw.Shader);
