/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  /**
   * @class
   * @extends {benri.draw.Style}
   */
  var StrokeStyle = (function(pSuper) {
    function StrokeStyle(pWidth) {
      pSuper.call(this);
      this.width = typeof pWidth === 'number' ? pWidth : 1;
      this.cap = 'round';
      this.join = 'round';
      this.miter = 10;
    }

    StrokeStyle.prototype = Object.create(pSuper.prototype);
    StrokeStyle.prototype.constructor = StrokeStyle;

    return StrokeStyle;
  })(global.benri.draw.Style);

  global.benri.draw.StrokeStyle = StrokeStyle;

}(this));