/**
 * @author Jason Parrott
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  var benri = global.benri;

  var HTMLCanvasSurface = benri.draw.platform.html.HTMLCanvasSurface;

  function handleStyle(pSurface, pStyle, pCode) {
    var tCompositor = pStyle.compositor;
    pCode.push('c.globalCompositeOperation = \'' + tCompositor + '\';');
  }

  function handleStrokeStyle(pSurface, pStyle, pCode) {
    handleStyle(pSurface, pStyle, pCode);

    pCode.push('c.lineWidth = ' + pStyle.width + ';');
    pCode.push('c.lineCap = \'' + pStyle.cap + '\';');
    pCode.push('c.lineJoin = \'' + pStyle.join + '\';');

    if (pStyle.join === 'miter') {
      pCode.push('c.miterLimit = ' + pStyle.miter + ';');
    }
  }

  function handleTextStyle(pStyle, pCode) {
    handleStyle(pSurface, pStyle, pCode);
  }

  HTMLCanvasSurface.addStyleHandler(benri.draw.Style, handleStyle);
  HTMLCanvasSurface.addStyleHandler(benri.draw.StrokeStyle, handleStrokeStyle);
  HTMLCanvasSurface.addStyleHandler(benri.draw.TextStyle, handleTextStyle);

}(this));