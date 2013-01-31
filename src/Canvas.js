/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var benri = global.benri;
  var Matrix = benri.geometry.Matrix2D;
  var Path = benri.geometry.Path;
  var Point = benri.geometry.Point;
  var Rect = benri.geometry.Rect;
  var Style = benri.draw.Style;
  var StrokeStyle = benri.draw.StrokeStyle;
  var TextStyle = benri.draw.TextStyle;

  benri.draw.Canvas = Canvas;

  /**
   * @constructor
   * @param {number} pWidth  The width of the canvas.
   * @param {number} pHeight The height of the canvas.
   */
  function Canvas(pWidth, pHeight) {
    this.width = pWidth;
    this.height = pHeight;
    this.matrix = new Matrix();
    this._clip = null;
    this._stack = [];
    this.records = [];
    this.surface = null;
    this._lastPath = null;
    this._lastPaint = null;//TODO
    this._lastMatrix = this.matrix.clone();
    this._layerStates = [];
  }

  Canvas.defaultSurface = null;

  Canvas.prototype.setSurface = function(pSurface) {
    this.surface = pSurface;
  };

  function copyRecords(pSrc, pDest) {
    for (var i = 0, il = pSrc.length; i < il; i++) {
      pDest.push(pSrc[i]);
    }
  }

  Canvas.prototype.isDirty = function() {
    return this.records.length !== 0;
  };

  Canvas.prototype._syncMatrix = function() {
    if (!this.matrix.equals(this._lastMatrix)) {
      this.records.push({
        type: 'matrix',
        matrix: this.matrix.clone()
      });

      this._lastMatrix = this.matrix.clone();
    }
  };

  Canvas.prototype.fillPath = function(pPath, pStyle) {
    var tRecords = this.records;

    this._syncMatrix();

    tRecords.push({
      type: 'path'
    });

    copyRecords(pPath.records, tRecords);

    tRecords.push({
      type: 'fill',
      style: pStyle || new Style()
    });
  };

  Canvas.prototype.strokePath = function(pPath, pStrokeStyle) {
    var tRecords = this.records;

    this._syncMatrix();

    tRecords.push({
      type: 'path'
    });

    copyRecords(pPath.records, tRecords);

    tRecords.push({
      type: 'stroke',
      style: pStrokeStyle || new StrokeStyle()
    });
  };

  Canvas.prototype.fillRect = function(pRect, pStyle) {
    this.fillPath(pRect.getPath(), pStyle);
  };

  Canvas.prototype.strokeRect = function(pRect, pStrokeStyle) {
    this.strokePath(pRect.getPath(), pStrokeStyle);
  };

  Canvas.prototype.drawBitmap = function(pBitmap, pDestX, pDestY, pStyle) {
    this._syncMatrix();
    this.records.push({
      type: 'fastBitmap',
      bitmap: pBitmap,
      point: new Point(pDestX || 0, pDestY || 0),
      style: pStyle || new Style()
    });
  };

  Canvas.prototype.drawBitmapWithRects = function(pBitmap, pDestRect, pSourceRect, pStyle) {
    this._syncMatrix();
    this.records.push({
      type: 'bitmap',
      bitmap: pBitmap,
      destRect: pDestRect,
      srcRect: pSourceRect,
      style: pStyle
    });
  };

  Canvas.prototype.setClip = function(pPath) {

  };

  Canvas.prototype.drawText = function(pText, pTextStyle) {
    this._syncMatrix();
    this.records.push(
      {
        type: 'text',
        text: pText,
        style: pTextStyle
      }
    );
  };

  Canvas.prototype.clear = function(pColor) {
    if (this.surface !== null) {
      this.surface.clearRecords();
    }

    this.records.length = 0;

    this._syncMatrix();

    this.records.push({
      type: 'clearColor',
      color: pColor
    });
  };

  Canvas.prototype.flush = function() {
    var tSurface = this.surface;

    if (!tSurface) {
      if (benri.draw.Canvas.defaultSurface !== null) {
        tSurface = this.surface = new benri.draw.Canvas.defaultSurface(this.width, this.height);
      } else {
        return;
      }
    }

    if (!this.isDirty()) {
      return;
    }

    tSurface.addRecords(this.records);

    this.records.length = 0;
  };

  Canvas.prototype.getBitmap = function() {
    this.flush();

    if (this.surface === null) {
      return null;
    }

    return this.surface.getBitmap();
  };

  Canvas.prototype.save = function() {
    this._stack.push({
      matrix: this.matrix.clone(),
      clip: this.clip ? this.clip.clone() : null
    });
  };

  Canvas.prototype.enterLayer = function(pRect) {
    this._syncMatrix();

    // TODO: Not handling this Rect yet. Need to implement 100%.

    this.records.push({
      type: 'layer',
      rect: pRect || new Rect(new Point(0, 0), this.width, this.height),
      matrix: this.matrix
    });

    this._layerStates.push({
      matrix: this.matrix.clone(),
      clip: this.clip ? this.clip.clone() : null
    });
  };

  Canvas.prototype.leaveLayer = function() {
    var tState = this._layerStates.pop();
    this.matrix = tState.matrix;
    this.clip = tState.clip;

    this.records.push({
      type: 'endLayer'
    });
  };

  Canvas.prototype.restore = function() {
    var tState = this._stack.pop();
    this.matrix = tState.matrix;
    this.clip = tState.clip;
  };

}(this));