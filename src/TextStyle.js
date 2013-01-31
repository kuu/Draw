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
  var TextStyle = (function(pSuper) {
    function TextStyle() {
      pSuper.call(this);
      this.font = 'sans-serif';
      this.height = 12;
    }

    TextStyle.prototype = Object.create(pSuper.prototype);
    TextStyle.prototype.constructor = TextStyle;

    return TextStyle;
  })(global.benri.draw.Style);

  global.benri.draw.TextStyle = TextStyle;

}(this));