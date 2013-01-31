/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var ColorShader = global.benri.draw.ColorShader;

  function Style() {
    this.shader = null;
    this.compositor = 'source-over';
  }

  Style.prototype.setColor = function(pColor) {
    this.shader = new ColorShader(pColor);
  };

  Style.prototype.getColor = function() {
    return this.shader.color;
  }

  global.benri.draw.Style = Style;

}(this));