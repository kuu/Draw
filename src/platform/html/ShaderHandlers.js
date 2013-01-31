/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var benri = global.benri;

  var HTMLCanvasSurface = benri.draw.platform.html.HTMLCanvasSurface;

  function getResourceIndex(pResources, pResource) {
    var tIndex = pResources.indexOf(pResource);
    if (tIndex !== -1) {
      return tIndex;
    }

    return pResources.push(pResource) - 1;
  }

  function handleShader(pSurface, pShader, pDrawCommand, pStyleProperty, pCode) {
    if (typeof pStyleProperty !== 'string') {
      return;
    }

    // Do nothing. Set to transparent.
    pCode.push('c.' + pStyleProperty + ' = \'rgba(0,0,0,0)\';');
    pCode.push('c.' + pDrawCommand + ';');
  }

  function handleColorShader(pSurface, pShader, pDrawCommand, pStyleProperty, pCode) {
    if (typeof pStyleProperty !== 'string') {
      return;
    }

    pCode.push('c.' + pStyleProperty + ' = \'' + pShader.color.toCSSString() + '\';');
    pCode.push('c.' + pDrawCommand + ';');
  }

  function handleLinearGradientShader(pSurface, pShader, pDrawCommand, pStyleProperty, pCode) {
    if (typeof pStyleProperty !== 'string') {
      return;
    }

    var tStartPoint = pShader.startPoint;
    var tEndPoint = pShader.endPoint;
    var tPositions = pShader.positions;
    var tColors = pShader.colors;
    var tMatrix = pShader.matrix;
    var i, il;

    pCode.push('var tGradient = c.createLinearGradient(' + tStartPoint.x + ',' + tStartPoint.y + ',' + tEndPoint.x + ',' + tEndPoint.y + ');');

    for (i = 0, il = tPositions.length; i < il; i++) {
      pCode.push('tGradient.addColorStop(' + tPositions[i] + ',\'' + tColors[i].toCSSString() + '\');');
    }

    pCode.push('c.' + pStyleProperty + ' = tGradient;');
    pCode.push('c.setTransform(' +
      tMatrix.a + ',' +
      tMatrix.b + ',' +
      tMatrix.c + ',' +
      tMatrix.d + ',' +
      tMatrix.e + ',' +
      tMatrix.f + ');'
    );
    pCode.push('c.' + pDrawCommand + ';');
  }

  function handleRadialGradientShader(pSurface, pShader, pDrawCommand, pStyleProperty, pCode) {
    if (typeof pStyleProperty !== 'string') {
      return;
    }

    var tStartPoint = pShader.startPoint;
    var tX = tStartPoint.x;
    var tY = tStartPoint.y;
    var tRadius = pShader.radius;
    var tPositions = pShader.positions;
    var tColors = pShader.colors;
    var tMatrix = pShader.matrix;
    var i, il;

    pCode.push('var tGradient = c.createRadialGradient(' + tX + ',' + tY + ',0,' + tX + ',' + tY + ',' + tRadius + ');');

    for (i = 0, il = tPositions.length; i < il; i++) {
      pCode.push('tGradient.addColorStop(' + tPositions[i] + ',\'' + tColors[i].toCSSString() + '\');');
    }

    pCode.push('c.' + pStyleProperty + ' = tGradient;');
    pCode.push('c.setTransform(' +
      tMatrix.a + ',' +
      tMatrix.b + ',' +
      tMatrix.c + ',' +
      tMatrix.d + ',' +
      tMatrix.e + ',' +
      tMatrix.f + ');'
    );
    pCode.push('c.' + pDrawCommand + ';');
  }

  function handleBitmapShader(pSurface, pShader, pDrawCommand, pStyleProperty, pCode) {
    if (typeof pStyleProperty !== 'string') {
      return;
    }

    var tMatrix = pShader.matrix;
    var tRepeat = pShader.tileMode === 'none' ? 'no-repeat' : 'repeat';

    pCode.push('c.' + pStyleProperty + ' = c.createPattern(this.resources[' + getResourceIndex(pSurface.resources, pShader.bitmap) + '], \'' + tRepeat + '\')');
    pCode.push('c.setTransform(' +
      tMatrix.a + ',' +
      tMatrix.b + ',' +
      tMatrix.c + ',' +
      tMatrix.d + ',' +
      tMatrix.e + ',' +
      tMatrix.f + ');'
    );
    pCode.push('c.' + pDrawCommand + ';');
  }

  function handleColorTransformShader(pSurface, pShader, pDrawCommand, pBitmap, pCode) {
    if (typeof pBitmap !== 'object') {
      return;
    }

    // TODO: This needs to support more record types... Right now its only fastbitmap
    // with an origin of 0,0. (Except for alpha only)

    var tHasAlpha = !!(pShader.alphaAdd !== 0 || pShader.alphaMultiplier !== 1);
    var tHasRed = !!(pShader.redAdd !== 0 || pShader.redMultiplier !== 1);
    var tHasGreen = !!(pShader.greenAdd !== 0 || pShader.greenMultiplier !== 1);
    var tHasBlue = !!(pShader.blueAdd !== 0 || pShader.blueMultiplier !== 1);

    if (tHasRed || tHasGreen || tHasBlue) {
      pCode.push('var tTransformedC = document.createElement(\'canvas\').getContext(\'2d\');');
      pCode.push('tTransformedC.canvas.width = ' + pBitmap.width + ';');
      pCode.push('tTransformedC.canvas.height = ' + pBitmap.height + ';');
      pCode.push('tTransformedC.drawImage(this.resources[' + getResourceIndex(pSurface.resources, pBitmap) + '], 0, 0);');
      pCode.push('var tImageData = tTransformedC.getImageData(0,0,' + pSurface.width + ',' + pSurface.height + ');');
      pCode.push('var tPixels = tImageData.data;');
      pCode.push('for (var i = 0, il = tPixels.length; i < il; i += 4) {');
      pCode.push('if (tPixels[i + 3] === 0) continue;');

      if (tHasRed) {
        pCode.push('tPixels[i] = ((((tPixels[i] * ' + pShader.redMultiplier + ') / 256) + ' + pShader.redAdd + ') * 255) | 0');
      }

      if (tHasGreen) {
        pCode.push('tPixels[i + 1] = ((((tPixels[i + 1] * ' + pShader.greenMultiplier + ') / 256) + ' + pShader.greenAdd + ') * 255) | 0');
      }

      if (tHasBlue) {
        pCode.push('tPixels[i + 2] = ((((tPixels[i + 2] * ' + pShader.blueMultiplier + ') / 256) + ' + pShader.blueAdd + ') * 255) | 0');
      }

      pCode.push('}');

      pCode.push('tTransformedC.putImageData(tImageData, 0, 0);');

      if (tHasAlpha) {
        pCode.push('var tGlobalAlpha = c.globalAlpha;');
        pCode.push('c.globalAlpha = ' + (pShader.alphaMultiplier + pShader.alphaAdd) + ';');
        pCode.push('c.drawImage(tTransformedC.canvas, 0, 0);');
        pCode.push('c.globalAlpha = tGlobalAlpha;');
      } else {
        pCode.push('c.drawImage(tTransformedC.canvas, 0, 0);');
      }

      pCode.push('tTransformedC = null;');
    } else if (tHasAlpha) {
      pCode.push('var tGlobalAlpha = c.globalAlpha;');
      pCode.push('c.globalAlpha = ' + (pShader.alphaMultiplier + pShader.alphaAdd) + ';');
      pCode.push('c.' + pDrawCommand + ';');
      pCode.push('c.globalAlpha = tGlobalAlpha;');
    } else {
      pCode.push('c.' + pDrawCommand + ';');
    }
  }

  function handleMaskShader(pSurface, pShader, pDrawCommand, pBitmap, pCode) {
    if (typeof pBitmap !== 'object') {
      return;
    }

    pCode.push('var tTransformedC = document.createElement(\'canvas\').getContext(\'2d\');');
    pCode.push('tTransformedC.canvas.width = ' + pBitmap.width + ';');
    pCode.push('tTransformedC.canvas.height = ' + pBitmap.height + ';');
    pCode.push('tTransformedC.drawImage(this.resources[' + getResourceIndex(pSurface.resources, pBitmap) + '], 0, 0);');
    pCode.push('tTransformedC.globalCompositeOperation = \'destination-in\';');
    pCode.push('tTransformedC.drawImage(this.resources[' + getResourceIndex(pSurface.resources, pShader.bitmap) + '], 0, 0);');
    pCode.push('c.drawImage(tTransformedC.canvas, 0, 0);');
    pCode.push('tTransformedC = null;');
  }

  HTMLCanvasSurface.addShaderHandler(benri.draw.Shader, handleShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.ColorShader, handleColorShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.LinearGradientShader, handleLinearGradientShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.RadialGradientShader, handleRadialGradientShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.BitmapShader, handleBitmapShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.ColorTransformShader, handleColorTransformShader);
  HTMLCanvasSurface.addShaderHandler(benri.draw.MaskShader, handleMaskShader);

}(this));