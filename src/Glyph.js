/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  global.benri.draw.Glyph = Glyph;

  /**
   * A class holding glyph data.
   * @class
   * @constructor
   * @param {string} pCharCode Character code assigned to this glyph.
   */
  function Glyph(pCharCode) {
    /**
     * Character code assigned to this glyph.
     * @type {string}
     */
    this.code = pCharCode;

    /**
     * Glyph data.
     * @type {Object}
     */
    this.data = null;

    /**
     * Glyph advance in the em square coordinates.
     * @type {number}
     */
    this.advance = 0;

  }

}(this));