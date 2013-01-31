/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  /**
   * @class
   * @extends {Number}
   */
  var Color = (function(pSuper) {
    function Color(pRed, pGreen, pBlue, pAlpha) {
      this.value =
        ((pRed ? pRed << 24 : 0) +
        (pGreen ? pGreen << 16 : 0) +
        (pBlue ? pBlue << 8 : 0) +
        (pAlpha ? pAlpha : 0)) >>> 0;
    }

    Color.prototype = Object.create(pSuper.prototype);
    Color.prototype.constructor = Color;

    Color.prototype.valueOf = function() {
      return this.value;
    };

    Color.prototype.toString = function() {
      return pSuper.prototype.toString.apply(this.value, arguments);
    }

    Color.prototype.toCSSString = function() {
      var tValue = this.value;
      return 'rgba(' +
        (tValue >>> 24 & 0xFF) + ',' +
        (tValue >>> 16 & 0xFF) + ',' +
        (tValue >>> 8 & 0xFF) + ',' +
        ((tValue & 0xFF) / 255) + ')';
    };

    Color.prototype.setRGBA = function(pRed, pGreen, pBlue, pAlpha) {
      this.value =
        ((pRed ? pRed << 24 : 0) +
        (pGreen ? pGreen << 16 : 0) +
        (pBlue ? pBlue << 8 : 0) +
        (pAlpha ? pAlpha : 0)) >>> 0;
    };

    Color.prototype.getRGBA = function() {
      var tValue = this.value;
      return [
        tValue >>> 24 & 0xFF,
        tValue >>> 16 & 0xFF,
        tValue >>> 8 & 0xFF,
        tValue & 0xFF
      ];
    };

    return Color;
  })(Number);

  global.benri.draw.Color = Color;

}(this));