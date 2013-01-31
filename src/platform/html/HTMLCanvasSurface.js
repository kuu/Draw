/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var document = global.document;
  var benri = global.benri;

  var mStyleHandlerClasses = [];
  var mStyleHandlers = [];
  var mShaderHandlerClasses = [];
  var mShaderHandlers = [];

  /**
   * @class
   * @extends {benri.draw.Surface}
   */
  var HTMLCanvasSurface = (function(pSuper) {
    function HTMLCanvasSurface(pWidth, pHeight) {
      pSuper.call(this, pWidth, pHeight);
      var tCanvas = this.canvas = document.createElement('canvas');
      tCanvas.width = pWidth;
      tCanvas.height = pHeight;
      this.context = this.canvas.getContext('2d');
      this.resources = [];

      this.records = [];
      this.drawFunction = null;
      this.layers = [];
    }

    HTMLCanvasSurface.prototype = Object.create(pSuper.prototype);
    HTMLCanvasSurface.prototype.constructor = HTMLCanvasSurface;

    HTMLCanvasSurface.prototype.setSize = function(pWidth, pHeight) {
      this.width = pWidth;
      this.height = pHeight;

      var tCanvas = this.canvas;
      tCanvas.width = pWidth;
      tCanvas.height = pHeight;
    };

    HTMLCanvasSurface.prototype.addRecords = function(pRecords) {
      if (this.drawFunction !== null) {
        this.drawFunction = null;
      }

      this.records = this.records.concat(pRecords);

      // TODO: Make this MUCH more efficient
      this.generateDrawFunction();
    };

    HTMLCanvasSurface.prototype.clearRecords = function() {
      this.records = [];
      this.drawFunction = null;
      this.resources = [];
    };

    HTMLCanvasSurface.prototype.flush = function() {
      if (this.drawFunction !== null) {
        this.drawFunction(this.context);
      }
    };

    HTMLCanvasSurface.prototype.getBitmap = function() {
      this.flush();
      return this.canvas;
    };

    HTMLCanvasSurface.prototype.generateDrawFunction = function() {
      var tRecords = this.records;
      var tRecord;
      var tType;
      var tCode = [];
      var i, il;
      var tHandlers = HTMLCanvasSurface.recordHandlers;

      this.resources = [];

      for (i = 0, il = tRecords.length; i < il; i++) {
        tRecord = tRecords[i];
        tType = tRecord.type;

        if (tType in tHandlers) {
          tHandlers[tType].call(this, tRecord, tCode);
        }
      }

      this.drawFunction = new Function('c', tCode.join('\n'));
    };

    return HTMLCanvasSurface;
  })(benri.draw.Surface);

  function getResourceIndex(pResources, pResource) {
    var tIndex = pResources.indexOf(pResource);
    if (tIndex !== -1) {
      return tIndex;
    }

    return pResources.push(pResource) - 1;
  }

  HTMLCanvasSurface.recordHandlers = {
    matrix: function(pRecord, pCode) {
      var tMatrix = pRecord.matrix;
      pCode.push('c.setTransform(' +
        tMatrix.a + ',' +
        tMatrix.b + ',' +
        tMatrix.c + ',' +
        tMatrix.d + ',' +
        tMatrix.e + ',' +
        tMatrix.f + ');'
      );
    },

    move: function(pRecord, pCode) {
      var tPoint = pRecord.point;
      pCode.push('c.moveTo(' + tPoint.x + ',' + tPoint.y + ');');
    },

    line: function(pRecord, pCode) {
      var tPoint = pRecord.point;
      pCode.push('c.lineTo(' + tPoint.x + ',' + tPoint.y + ');');
    },

    quadraticCurve: function(pRecord, pCode) {
      var tControlPoint = pRecord.controlPoint;
      var tPoint = pRecord.point;
      pCode.push('c.quadraticCurveTo(' + tControlPoint.x + ',' + tControlPoint.y + ',' + tPoint.x + ',' + tPoint.y + ');');
    },

    path: function(pRecord, pCode) {
      pCode.push('c.beginPath();');
    },

    fastBitmap: function(pRecord, pCode) {
      var tPoint = pRecord.point;
      handleStyle(this, pRecord.style, 'drawImage(this.resources[' + getResourceIndex(this.resources, pRecord.bitmap) + '],' + tPoint.x + ',' + tPoint.y + ')', pRecord.bitmap, pCode);
    },

    bitmap: function(pRecord, pCode) {
      throw Error('Not Implemented');
    },

    stroke: function(pRecord, pCode) {
      handleStyle(this, pRecord.style, 'stroke()', 'strokeStyle', pCode);
    },

    fill: function(pRecord, pCode) {
      handleStyle(this, pRecord.style, 'fill()', 'fillStyle', pCode);
    },

    text: function(pRecord, pCode) {
      var tText = pRecord.text;
      handleStyle(this, pRecord.style, 'c.fillText(this.resources[' + getResourceIndex(this.resources, tText) + '])', 'fillStyle', pCode);
    },

    clearColor: function(pRecord, pCode) {
      pCode.push('c.clearRect(0,0,' + this.width + ',' + this.height + ');');
      pCode.push('c.fillStyle = "' + pRecord.color.toCSSString() + '";');
      pCode.push('c.fillRect(0,0,' + this.width + ',' + this.height + ');');
    },

    layer: function(pRecord, pCode) {
      pCode.push('this.layers.push(c);');
      pCode.push('c = document.createElement(\'canvas\').getContext(\'2d\');');
      pCode.push('c.canvas.width = this.width;');
      pCode.push('c.canvas.height = this.height;');

      var tMatrix = pRecord.matrix;
      pCode.push('c.setTransform(' +
        tMatrix.a + ',' +
        tMatrix.b + ',' +
        tMatrix.c + ',' +
        tMatrix.d + ',' +
        tMatrix.e + ',' +
        tMatrix.f + ');'
      );
    },

    endLayer: function(pRecord, pCode) {
      pCode.push('var lc = c;');
      pCode.push('c = this.layers.pop();');
      pCode.push('c.drawImage(lc.canvas, 0, 0);');
      pCode.push('lc = null;');
    }
  };

  function handleStyle(pSurface, pStyle, pDrawCommand, pStyleProperty, pCode) {
    var tShader;
    var tIndex = mStyleHandlerClasses.indexOf(pStyle.constructor);

    if (tIndex !== -1) {
      mStyleHandlers[tIndex](pSurface, pStyle, pCode);
    } else {
      console.warn('No HTMLCanvasSurface handler for style: ' + pStyle);
    }

    if (!pStyle.shader) {
      if (typeof pStyleProperty === 'string') {
        pCode.push('c.' + pStyleProperty + ' = \'red\';');
      }

      pCode.push('c.' + pDrawCommand  + ';');

      return;
    }

    tShader = pStyle.shader;

    tIndex = mShaderHandlerClasses.indexOf(tShader.constructor);

    if (tIndex !== -1) {
      mShaderHandlers[tIndex](pSurface, tShader, pDrawCommand, pStyleProperty, pCode);
    } else {
      console.warn('No HTMLCanvasSurface handler for shader: ' + tShader);
      if (typeof pStyleProperty === 'string') {
        pCode.push('c.' + pStyleProperty + ' = \'red\';');
      }
    }
  }


  HTMLCanvasSurface.addStyleHandler = function(pStyle, pHandler) {
    mStyleHandlerClasses.push(pStyle);
    mStyleHandlers.push(pHandler);
  };

  HTMLCanvasSurface.removeStyleHandler = function(pStyle, pHandler) {
    for (var i = 0, il = mStyleHandlerClasses.length; i < il; i++) {
      if (mStyleHandlerClasses[i] === pStyle && mStyleHandlers[i] === pHandler) {
        mStyleHandlerClasses.splice(i, 1);
        mStyleHandlers.splice(i, 1);
        return;
      }
    }
  };

  HTMLCanvasSurface.addShaderHandler = function(pShader, pHandler) {
    mShaderHandlerClasses.push(pShader);
    mShaderHandlers.push(pHandler);
  };

  HTMLCanvasSurface.removeShaderHandler = function(pShader, pHandler) {
    for (var i = 0, il = mShaderHandlerClasses.length; i < il; i++) {
      if (mShaderHandlerClasses[i] === pShader && mShaderHandlers[i] === pHandler) {
        mShaderHandlerClasses.splice(i, 1);
        mShaderHandlers.splice(i, 1);
        return;
      }
    }
  };


  benri.draw.platform.html = benri.draw.platform.html || {};

  benri.draw.platform.html.HTMLCanvasSurface = HTMLCanvasSurface;

  benri.draw.Canvas.defaultSurface = HTMLCanvasSurface;

  HTMLCanvasElement.prototype.getBenriJSSurface = function() {
    var tSurface = new HTMLCanvasSurface(0, 0);
    tSurface.canvas = this;
    tSurface.context = this.getContext('2d');
    tSurface.width = this.width;
    tSurface.height = this.height;

    return tSurface;
  };

}(this));