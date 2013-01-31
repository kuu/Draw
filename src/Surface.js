/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var benri = global.benri;

  benri.draw.Surface = Surface;

  function Surface(pWidth, pHeight) {
    this.width = pWidth;
    this.height = pHeight;
  }

  Surface.prototype.setSize = function(pWidth, pHeight) {
    this.width = pWidth;
    this.height = pHeight;
  };

  Surface.prototype.addRecords = function(pRecords) {

  };

  Surface.prototype.clearRecords = function() {

  };

  Surface.prototype.flush = function() {

  };

  Surface.prototype.getBitmap = function() {
    return null;
  };

}(this));