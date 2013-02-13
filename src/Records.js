/**
 * @author Kuu Miyazaki
 *
 * Copyright (C) 2013 BenriJS Project.
 * This code is licensed under the zlib license. See LICENSE for details.
 */

(function(global) {

  global.benri.draw.Records = Records;

  /**
   * A class that encapsulates draw command records and provides methods to access it.
   * @class
   * @constructor
   */
  function Records(pData) {

    /**
     * Draw commands
     * @type {Array}
     */
    this._data = pData;
  }

  /**
   * Filters record of specific type(s).
   * @param {string} pType Type name concerned.
   *  The string can contain multiple type names separated by space.
   * @param {function} pCallback Function to be invoked for each element of the type.
   *  The callback function is invoked with three arguments:
   *    pCallback(records[i], i, records)
   * @param {object} pContext An optional value on which pCallback is invoked.
   */
  Records.prototype.filter = function(pType, pCallback, pContext) {

    var tTypes = pType.split(' '),
        tRecords = this._data, tRecord,
        tContext = pContext || this;

    for (var i = 0, il = tRecords.length; i < il; i++) {
      tRecord = tRecords[i];
      for (var j = 0, jl = tTypes.length; j < jl; j++) {
        if (tRecord.type === tTypes[j]) {
          pCallback.call(tContext, tRecord, i, tRecords);
        }
      }
    }
  };

  /**
   * Concatenate records.
   * @param {benri.draw.Records} pRecord Records to be appended to this record.
   */
  Records.prototype.concat = function(pRecords) {
    var tSrc = pRecords._data,
        tDst = this._data;
    for (var i = 0, il = tSrc.length; i < il; i++) {
      tDst.push(tSrc[i]);
    }
  };

}(this));
