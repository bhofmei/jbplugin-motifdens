define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang'
],
  function (
    declare,
    array,
    lang
  ) {
    /*
        Utility class dealing with degenerate nucleotide sequences
    */
    var Util;

    var ntable = {
      "A": ["A"],
      "C": ["C"],
      "G": ["G"],
      "T": ["T"],
      "U": ["T"],
      "R": ["A", "G"],
      "Y": ["C", "T"],
      "S": ["C", "G"],
      "W": ["A", "T"],
      "K": ["G", "T"],
      "M": ["A", "C"],
      "B": ["C", "G", "T"],
      "D": ["A", "G", "T"],
      "H": ["A", "C", "T"],
      "V": ["A", "C", "G"],
      "N": ["A", "C", "G", "T"]
    }

    Util = {

      _transformMotif: function (inStr) {
        var n = inStr.length;
        var outAr = [''];
        var i;
        for (i = 0; i < n; i++) {
          var p = inStr.charAt(i).toUpperCase();
          var v = ntable[p];
          var newAr = [];
          array.forEach(outAr, function (item) {
            var m = array.map(v, function (nuc) {
              return item + nuc;
            });
            newAr.push.apply(newAr, m);
          });

          outAr = newAr;
        }
        return outAr;
      },

      _reverseComplement: function (inStr) {
        var baseAr = ['A', 'C', 'G', 'T'];
        var out = '';
        var i, k;
        for (i = 0; i < inStr.length; i++) {
          k = array.indexOf(baseAr, inStr.charAt(i).toUpperCase());
          if (k === -1)
            out = 'X' + out;
          else
            out = baseAr[3 - k] + out;
        }
        return out;
      },

      getPossibilities: function (inStr, bothStrands) {
        // first get forward possibilities
        var motifArray = Util._transformMotif(inStr);
        // get reverse
        if (bothStrands) {
          var revAr = array.map(motifArray, function (x) {
            return Util._reverseComplement(x);
          });
          // combine
          motifArray.push.apply(motifArray, revAr);
        }
        return motifArray;
      }
    }
    return Util;
  });
