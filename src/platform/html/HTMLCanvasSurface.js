/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var document = global.document;
  var benri = global.benri;
  var Uniform = benri.draw.Uniform;

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
      this.hasUniforms = false;
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

    function checkForUniforms(pRecords) {
      var i, il, k;
      var tRecord;

      for (i = 0, il = pRecords.length; i < il; i++) {
        tRecord = pRecords[i];
        for (k in tRecord) {
          if (tRecord[k] instanceof Uniform) {
            return true;
          }
        }
      }
    }

    HTMLCanvasSurface.prototype.addRecords = function(pRecords) {
      if (this.drawFunction !== null) {
        this.drawFunction = null;
      }

      this.hasUniforms = checkForUniforms(pRecords);

      this.records = this.records.concat(pRecords);
    };

    HTMLCanvasSurface.prototype.clearRecords = function() {
      this.records = [];
      this.drawFunction = null;
      this.hasUniforms = false;
      this.resources = [];
    };

    HTMLCanvasSurface.prototype.flush = function() {
      var tRecords;
      var tRecord;
      var tType;
      var i, il;
      var tHandlers;

      if (this.hasUniforms === true) {
        if (this.drawFunction === null) {
          this.generateDrawFunction();
        }

        this.drawFunction(this.context);
      } else {
        tRecords = this.records;
        tHandlers = HTMLCanvasSurface.recordHandlers;
        this.resources = [];

        for (i = 0, il = tRecords.length; i < il; i++) {
          tRecord = tRecords[i];
          tType = tRecord.type;

          if (tType in tHandlers) {
            tHandlers[tType].call(this, tRecord, false, null);
          }
        }
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
          tHandlers[tType].call(this, tRecord, true, tCode);
        }
      }

      this.drawFunction = new Function('c', tCode.join('\n'));
    };

    HTMLCanvasSurface.prototype.resource = function(pResource) {
      var tResources = this.resources;
      var tIndex = tResources.indexOf(pResource);

      if (tIndex === -1) {
        tIndex = pResources.push(pResource) - 1;
      }

      return 'this.resources[' + tIndex + ']';
    };

    return HTMLCanvasSurface;
  })(benri.draw.Surface);


  HTMLCanvasSurface.recordHandlers = {
    matrix: function(pRecord, pCompiledMode, pCode) {
      var tMatrix = pRecord.matrix;

      if (pCompiledMode) {
        if (tMatrix instanceof Uniform) {
          pCode.push('var m = ' + this.resource(tMatrix) + '.value;');
          pCode.push('c.setTransform(m.a,m.b,m.c,m.d,m.e,m.f);');
        } else {
          pCode.push('c.setTransform(' +
            tMatrix.a + ',' +
            tMatrix.b + ',' +
            tMatrix.c + ',' +
            tMatrix.d + ',' +
            tMatrix.e + ',' +
            tMatrix.f + ');'
          );
        }
      } else {
        this.context.setTransform(
          tMatrix.a,
          tMatrix.b,
          tMatrix.c,
          tMatrix.d,
          tMatrix.e,
          tMatrix.f
        );
      }
    },

    move: function(pRecord, pCompiledMode, pCode) {
      var tPoint = pRecord.point;

      if (pCompiledMode) {
        if (tPoint instanceof Uniform) {
          pCode.push('var p = ' + this.resource(tPoint) + '.value;');
          pCode.push('c.moveTo(p.x, p.y);');
        } else {
          pCode.push('c.moveTo(' + tPoint.x + ',' + tPoint.y + ');');
        }
      } else {
        this.context.moveTo(tPoint.x, tPoint.y);
      }
    },

    line: function(pRecord, pCompiledMode, pCode) {
      var tPoint = pRecord.point;

      if (pCompiledMode) {
        if (tPoint instanceof Uniform) {
          pCode.push('var p = ' + this.resource(tPoint) + '.value;');
          pCode.push('c.lineTo(p.x, p.y);');
        } else {
          pCode.push('c.lineTo(' + tPoint.x + ',' + tPoint.y + ');');
        }
      } else {
        this.context.lineTo(tPoint.x, tPoint.y);
      }
    },

    quadraticCurve: function(pRecord, pCompiledMode, pCode) {
      var tControlPoint = pRecord.controlPoint;
      var tPoint = pRecord.point;

      if (pCompiledMode) {
        if (tPoint instanceof Uniform || tControlPoint instanceof Uniform) {
          pCode.push('var cp = ' + this.resource(tControlPoint) + '.value;');
          pCode.push('var p = ' + this.resource(tPoint) + '.value;');
          pCode.push('c.quadraticCurveTo(cp.x, cp.y, p.x, p.y);');
        } else {
          pCode.push('c.quadraticCurveTo(' + tControlPoint.x + ',' + tControlPoint.y + ',' + tPoint.x + ',' + tPoint.y + ');');
        }
      } else {
        this.context.quadraticCurveTo(tControlPoint.x, tControlPoint.y, tPoint.x, tPoint.y);
      }
    },

    path: function(pRecord, pCompiledMode, pCode) {
      if (pCompiledMode) {
        pCode.push('c.beginPath();');
      } else {
        this.context.beginPath();
      }
    },

    fastBitmap: function(pRecord, pCompiledMode, pCode) {
      handleStyle(this, pRecord.style, pRecord, drawImage, pCompiledMode, pCode);
    },

    bitmap: function(pRecord, pCompiledMode, pCode) {
      throw Error('Not Implemented');
    },

    stroke: function(pRecord, pCompiledMode, pCode) {
      handleStyle(this, pRecord.style, pRecord, stroke, pCompiledMode, pCode);
    },

    fill: function(pRecord, pCompiledMode, pCode) {
      handleStyle(this, pRecord.style, pRecord, fill, pCompiledMode, pCode);
    },

    text: function(pRecord, pCompiledMode, pCode) {
      //var tText = pRecord.text;
      //handleStyle(this, pRecord.style, 'c.fillText(this.resources[' + getResourceIndex(this.resources, tText) + '])', 'fillStyle', pCode);
    },

    clearColor: function(pRecord, pCompiledMode, pCode) {
      var tWidth = this.width;
      var tHeight = this.height;
      var tColor = pRecord.color;
      var tContext;

      if (pCompiledMode) {
        pCode.push('c.clearRect(0,0,' + this.width + ',' + this.height + ');');

        if (tColor instanceof Uniform) {
          pCode.push('c.fillStyle = ' + this.resource(tColor) + '.value;');
        } else {
          pCode.push('c.fillStyle = "' + tColor.toCSSString() + '";');
        }

        pCode.push('c.fillRect(0,0,' + this.width + ',' + this.height + ');');
      } else {
        tContext = this.context;
        tContext.clearRect(0, 0, tWidth, tHeight);
        tContext.fillStyle = tColor.toCSSString();
        tContext.fillRect(0, 0, tWidth, tHeight);
      }
    },

    layer: function(pRecord, pCompiledMode, pCode) {
      var tMatrix = pRecord.matrix;
      var tContext;

      if (pCompiledMode) {
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
      } else {
        tContext = this.context;
        this.layers.push(tContext);
        this.context = tContext = document.createElement('canvas').getContext('2d');
        tContext.canvas.width = this.width;
        tContext.canvas.height = this.height;

        tContext.setTransform(
          tMatrix.a,
          tMatrix.b,
          tMatrix.c,
          tMatrix.d,
          tMatrix.e,
          tMatrix.f
        );
      }
    },

    endLayer: function(pRecord, pCompiledMode, pCode) {
      if (pCompiledMode) {
        pCode.push('var lc = c;');
        pCode.push('c = this.layers.pop();');
        pCode.push('c.drawImage(lc.canvas, 0, 0);');
        pCode.push('lc = null;');
      } else {
        var tLayerContext = this.context;
        var tContext = this.context = this.layers.pop();
        tContext.drawImage(tLayerContext.canvas, 0, 0);
      }
    }
  };


  function drawImage(pSurface, pRecord, pCompiledMode, pCode) {
    var tPoint = pRecord.point;
    var tBitmap = pRecord.bitmap;

    if (pCompiledMode) {
      if (tPoint instanceof Uniform || tBitmap instanceof Uniform) {
        pCode.push('var p = ' + this.resource(tPoint) + '.value;');
        pCode.push('c.drawImage(' + this.resource(tBitmap) + '.value,p.x,p.y);');
      } else {
        pCode.push('c.drawImage(' + pSurface.resource(tBitmap) + ',' + tPoint.x + ',' + tPoint.y + ');');
      }
    } else {
      pSurface.context.drawImage(tBitmap, tPoint.x, tPoint.y);
    }
  }

  function fill(pSurface, pRecord, pCompiledMode, pCode) {
    if (pCompiledMode) {
      pCode.push('c.fill();');
    } else {
      pSurface.context.fill();
    }
  }

  function stroke(pSurface, pRecord, pCompiledMode, pCode) {
    if (pCompiledMode) {
      pCode.push('c.stroke();');
    } else {
      pSurface.context.stroke();
    }
  }


  function handleStyle(pSurface, pStyle, pRecord, pFunction, pCompiledMode, pCode) {
    var tShader;
    var tStyleMode;
    var tIndex = mStyleHandlerClasses.indexOf(pStyle.constructor);

    if (tIndex !== -1) {
      mStyleHandlers[tIndex](pSurface, pStyle, pCompiledMode, pCode);
    } else {
      console.warn('No HTMLCanvasSurface handler for style: ' + pStyle);
    }

    if (pFunction === fill) {
      tStyleMode = 'fill';
    } else if (pFunction === stroke) {
      tStyleMode = 'stroke';
    } else {
      tStyleMode = 'bitmap';
    }

    tShader = pStyle.shader;

    if (!tShader) {
      if (pFunction === fill) {
        if (pCompiledMode) {
          pCode.push('c.fillStyle = \'red\';');
        } else {
          pSurface.context.fillStyle = 'red';
        }
      } else if (pFunction === stroke) {
        if (pCompiledMode) {
          pCode.push('c.strokeStyle = \'red\';');
        } else {
          pSurface.context.strokeStyle = 'red';
        }
      }

      pFunction(pSurface, pRecord, pCompiledMode, pCode);

      return;
    }

    tIndex = mShaderHandlerClasses.indexOf(tShader.constructor);

    if (tIndex !== -1) {
      mShaderHandlers[tIndex](pSurface, tShader, pRecord, tStyleMode, pFunction, pCompiledMode, pCode);
    } else {
      console.warn('No HTMLCanvasSurface handler for shader: ' + tShader);
      pFunction(pSurface, pRecord, pCompiledMode, pCode);
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