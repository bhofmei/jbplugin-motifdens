define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/dom-attr',
    'dojo/on',
    'dijit/focus',
    "dijit/registry",
    'dijit/form/NumberSpinner',
  'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dijit/form/ValidationTextBox',
    'dijit/form/TextBox',
    'JBrowse/View/Dialog/WithActionBar',
    'MotifDensityPlugin/View/ColorHandler'
],
  function (
    declare,
    array,
    lang,
    dom,
    domConstr,
    domStyle,
    domAttr,
    on,
    focus,
    registry,
    NumberSpinner,
    dijitCheckBox,
    Button,
    dijitRadioButton,
    ValidationTextBox,
    TextBox,
    ActionBarDialog,
    ColorHandler
  ) {
    return declare(ActionBarDialog, {
      title: 'Set Motif Density Track Options',

      constructor: function (args) {
        this.windowSize = args.windowSize || 100;
        this.windowDelta = args.windowDelta || 10;
        this.minScore = args.minScore || 0;
        this.forceWindow = args.forceWindow || false;
        this.maxScore = args.maxScore || 1;
        this.browser = args.browser;
        this.motifs = args.motifs || [];
        this.colors = args.colors;
        this.colorType = ColorHandler.getColorType(this.colors);
        this.singleColor = this.colorType === 'single' ? this.colors : 'red';
        this.randomColors = ColorHandler.generateNColors(this.motifs.length);
        var thisB = this;
        this.indivColors = array.map(this.motifs, function (m) {
          if (thisB.colorType === 'individual' && thisB.colors.hasOwnProperty(m))
            return thisB.colors[m];
          else
            return ColorHandler.motifToColorFromList(m, thisB.motifs, thisB.colors, false);
        });

        this.setCallback = args.setCallback || function () {};
        this.cancelCallback = args.cancelCallback || function () {};
      },

      _fillActionBar: function (actionBar) {
        new Button({
          label: 'OK',
          onClick: lang.hitch(this, function () {
            var windowSize = +this.windowSizeSpinner.getValue();
            var windowDelta = +this.windowDeltaSpinner.getValue();
            var minScore = +this.minDensitySpinner.getValue();
            var maxScore = +this.maxDensitySpinner.getValue();
            var forceWindow = +this.forceWindowCheckBox.get('checked');
            if (isNaN(windowSize) || isNaN(windowDelta) || isNaN(minScore) || isNaN(maxScore)) {
              return;
            }
            var returnCtxA = array.map(this.motifInputs, function (input) {
              return input.value.toUpperCase();
            });
            //console.log(returnCtxA);
            var returnCtx = array.filter(returnCtxA, function (ctx) {
              return ctx !== '';
            });
            //console.log(returnCtx);
            var returnClr = this._getColorCallback();

            this.setCallback && this.setCallback(windowSize, windowDelta, forceWindow, minScore, maxScore, returnCtx, returnClr);
            this.hide();
          })
        }).placeAt(actionBar);

        new Button({
          label: 'Cancel',
          onClick: lang.hitch(this, function () {
            this.cancelCallback && this.cancelCallback();
            this.hide();
          })
        }).placeAt(actionBar);
      },

      show: function ( /* callback */ ) {
        dojo.addClass(this.domNode, 'motif-dens-dialog');

        var topPane = domConstr.create('div', {
          id: 'motif-dens-parameters'
        });
        this._createTopPane(topPane);

        var bottomPane = domConstr.create('div', {
          id: 'moitf-dens-contexts'
        });
        this._createBottomPane(bottomPane);

        this.set('content', [
                topPane,
                bottomPane
            ]);

        this._setColorType(this.colorType);
        this.inherited(arguments);
      },

      _createTopPane: function (obj) {
        var thisB = this;
        // create table for these parameters
        var tblo = domConstr.create('table', {
          id: 'motif-dens-tbl-param',
          className: 'motif-dens-dialog-tbl'
        }, obj);
        var widths = [100, 75, 75, 50];
        // delete, ctx, color preview, color input
        for (var i = 0; i < widths.length; i++) {
          domConstr.create('col', {
            width: widths[i] + 'px'
          }, tblo);
        }
        var tbl = domConstr.create('tbody', {}, tblo);
        var row, data0, data1, data2, data3;

        // row 1 - window size and min score
        row = domConstr.create('tr', {}, tbl);
        // window size
        data0 = domConstr.create('td', {}, row);
        domConstr.create('span', {
          className: 'motif-dens-param-lbl',
          innerHTML: 'Window size (bp)'
        }, data0);
        data1 = domConstr.create('td', {
          className: 'motif-dens-param-wnd-spin-col'
        }, row);
        this.windowSizeSpinner = new NumberSpinner({
          value: thisB.windowSize,
          smallDelta: 10,
          style: 'width:70px;'
        });
        this.windowSizeSpinner.placeAt(data1);

        // min density
        data2 = domConstr.create('td', {
          className: 'motif-dens-param-dens-col'
        }, row);
        domConstr.create('span', {
          className: 'mtoif-dens-param-lbl',
          innerHTML: 'Min. density'
        }, data2);
        data3 = domConstr.create('td', {}, row);
        this.minDensitySpinner = new NumberSpinner({
          value: thisB.minScore,
          smallDelta: 0.1,
          constraints: {
            min: 0,
            max: 1
          },
          style: 'width:50px;'
        });
        this.minDensitySpinner.placeAt(data3);

        // row 2 - window delta and max score
        row = domConstr.create('tr', {}, tbl);
        // window delta
        data0 = domConstr.create('td', {}, row);
        domConstr.create('span', {
          className: 'motif-dens-param-lbl',
          innerHTML: 'Window delta (bp)'
        }, data0);
        data1 = domConstr.create('td', {
          className: 'motif-dens-param-wnd-spin-col'
        }, row);
        this.windowDeltaSpinner = new NumberSpinner({
          value: thisB.windowDelta,
          smallDelta: 10,
          style: 'width:70px;'
        });
        this.windowDeltaSpinner.placeAt(data1);

        // min density
        data2 = domConstr.create('td', {
          className: 'motif-dens-param-dens-col'
        }, row);
        domConstr.create('span', {
          className: 'motif-dens-param-lbl',
          innerHTML: 'Max. density'
        }, data2);
        data3 = domConstr.create('td', {}, row);
        this.maxDensitySpinner = new NumberSpinner({
          value: thisB.maxScore,
          smallDelta: 0.1,
          constraints: {
            min: 0,
            max: 1
          },
          style: 'width:50px;'
        });
        this.maxDensitySpinner.placeAt(data3);

        // row 3 - force window size
        row = domConstr.create('tr', {}, tbl);
        data0 = domConstr.create('td', {
          colspan: 2
        }, row);
        domConstr.create('span', {
          className: 'motif-dens-param-lbl',
          id: 'motif-dens-param-force',
          innerHTML: 'Force exact window size'
        }, data0);
        //data1 = domConstr.create('td',{className: 'motif-dens-param-check'}, row);
        this.forceWindowCheckBox = new dijitCheckBox({
          checked: thisB.forceWindow,
          style: 'float: right;'
        });

        this.forceWindowCheckBox.placeAt(data0);

      },

      _createBottomPane: function (obj) {
        var thisB = this;
        var tblo = domConstr.create('table', {
          id: 'motif-dens-tbl',
          className: 'motif-dens-dialog-tbl'
        }, obj);
        var widths = [25, 75, 100, 100];
        // delete, ctx, color preview, color input
        for (var i = 0; i < widths.length; i++) {
          domConstr.create('col', {
            width: widths[i] + 'px'
          }, tblo);
        }
        var tbl = domConstr.create('tbody', {}, tblo);
        domConstr.create('tr', {
          innerHTML: '<td rowspan="3"></td><td></td><th class="motif-dens-tbl-header" colspan="2">Color</th><td></td>'
        }, tbl);
        var row, data1, data2, data3, dbtn;

        // row of radio buttons to determine color type
        row = domConstr.create('tr', {}, tbl);
        data1 = domConstr.create('th', {
          innerHTML: "Sequence<br>Motif",
          rowspan: 2
        }, row);
        data2 = domConstr.create('td', {
          id: 'motif-dens-tbl-clrtype',
          className: 'motif-dens-tbl-clr-view-col',
          colspan: 2
        }, row);
        var types = ['random', 'single', 'individual'];
        array.forEach(types, function (t) {
          var btn = new dijitRadioButton({
            checked: t === thisB.colorType,
            value: t,
            name: 'motif-dens-tbl-clrtype-btn',
            id: 'motif-dens-tbl-clrtype-btn-' + t
          });
          btn.onClick = lang.hitch(thisB, '_setColorType', btn);
          domConstr.create('span', {
            innerHTML: t
          }, data2);
          data2.appendChild(btn.domNode);
        });

        // text box for single color
        row = domConstr.create('tr', {}, tbl);
        //data1 = domConstr.create('td',{}, row);
        data2 = domConstr.create('td', {
          colspan: 3,
          className: 'motif-dens-tbl-clr-view-col'
        }, row);
        var clrtext = new TextBox({
          name: 'motif-dens-sngl-clr',
          className: 'motif-dens-tbl-txt',
          id: 'motif-dens-sngl-clr-txt',
          intermediateChanges: true,
          value: thisB.singleColor
        });
        clrtext.placeAt(data2);
        clrtext.onChange = lang.hitch(thisB, '_updateSingleColor', clrtext);
        domConstr.create('td', {}, row);

        // row of contexts with color
        var cnt = 0;
        thisB.motifInputs = [];
        thisB.colorInputs = [];
        thisB.colorPreviews = [];
        thisB.deleteButtons = [];
        array.forEach(thisB.motifs, function (motif) {
          var row = domConstr.create('tr', {
            className: 'motif-dens-tbl-row'
          }, tbl);
          thisB._createRow(row, motif, cnt);
          cnt++;
        });
        // add btn row
        row = domConstr.create('tr', {
          className: 'motif-dens-tbl-row'
        }, tbl);
        thisB._createAddBtnRow(row);
      },

      _createRow: function (row, motif, cnt) {
        // create sequence motif row that includes delete btn, text input for context,
        // color preview, and text box for color
        var data0, data1, data2, data3, dbtn;
        var thisB = this;

        data0 = domConstr.create('td', {
          class: 'motif-dens-tbl-del-col'
        }, row);
        // delete button
        dbtn = new Button({
          '_index': cnt,
          iconClass: 'motifDensRemoveIcon',
          className: 'motif-dens-tbl-btn',
          title: 'Delete motif'
        });
        dbtn.placeAt(data0);
        thisB.deleteButtons.push(dbtn);
        dbtn.onClick = lang.hitch(thisB, '_removeRow', dbtn);

        // motif
        data1 = domConstr.create('td', {
          className: 'motif-dens-tbl-ctx-col'
        }, row);
        var txt = new ValidationTextBox({
          className: 'motif-dens-tbl-txt',
          value: motif,
          intermediateChanges: true,
          '_index': cnt,
          placeholder: 'sequence',
          regExpGen: function () {
            return '[ACGTURYSWKMBDHVNacgturyswkmbdhvn]*'
          },
          invalidMessage: 'Not valid nucleotide sequence'
        });
        txt.placeAt(data1);
        txt.onChange = lang.hitch(thisB, '_updateMotif', txt);
        thisB.motifInputs.push(txt);

        // color preview
        var clrHex = thisB._getColor((motif === '' ? cnt : motif));
        data2 = domConstr.create('td', {
          className: 'motif-dens-tbl-clr-view-col'
        }, row);
        var clrPre = domConstr.create('div', {
          style: 'background-color:' + clrHex + ';',
          className: 'motif-dens-tbl-clr-view',
          '_index': cnt
        }, data2);
        thisB.colorPreviews.push(clrPre);

        // color input text box
        data3 = domConstr.create('td', {
          className: 'motif-dens-tbl-clr-col'
        }, row);
        var clr = new TextBox({
          className: 'motif-dens-tbl-txt',
          value: clrHex,
          intermediateChanges: true,
          '_index': cnt
        });
        clr.placeAt(data3);
        clr.onChange = lang.hitch(thisB, '_updateIndividualColor', clr);
        thisB.colorInputs.push(clr);
      },

      _createAddBtnRow: function (row) {
        // add row to bottom of table which has button to add more contexts
        var thisB = this;
        var data0, dbtn;
        data0 = domConstr.create('td', {
          className: 'motif-dens-tbl-del-col'
        }, row);
        dbtn = new Button({
          iconClass: 'motifDensAddIcon',
          className: 'motif-dens-tbl-btn',
          title: 'Add additional motif'
        });
        dbtn.placeAt(data0);
        dbtn.onClick = lang.hitch(thisB, '_addRow', dbtn);
      },

      _getColor: function (motif) {
        // if motif is int, that means motif is empty, use number
        if (this.colorType === 'single')
          return this.singleColor;
        else if (typeof motif === 'string')
          return ColorHandler.motifToColorFromList(motif, this.motifs, (this.colorType === 'random' ? this.randomColors : this.indivColors), false);
        else
          return ColorHandler.intToColorFromList(motif, (this.colorType === 'random' ? this.randomColors : this.indivColors), false);
      },

      _setColorType: function (input) {
        // input is either a widget with value attribute or string with input type (from initialization)
        var singleId = 'motif-dens-sngl-clr-txt';
        var thisB = this;

        var val, init;
        if (typeof input === 'string') {
          val = input;
          init = true;
        } else {
          val = input.value;
          init = false;
        }
        // hide single if random or indiv
        // hide color inputs if single
        if (((val === 'single' ? 1 : 0) ^ (thisB.colorType === 'single' ? 1 : 0)) || init) {
          domStyle.set(registry.byId(singleId).domNode, 'visibility', (val === 'single' ? 'visible' : 'hidden'));
          array.forEach(thisB.colorInputs, function (clrInputs) {
            domStyle.set(clrInputs.domNode, 'visibility', (val === 'single' ? 'hidden' : 'visible'));
          });
        }

        if (val === 'random' && !init) {
          this._updateRandomColor();
          this.indivColors = lang.clone(thisB.randomColors);
        } else if (val === 'single' && !init && thisB.singleColor)
          this._updateSingleColor({
            value: thisB.singleColor
          });

        else if (val === 'individual' && !init) {
          array.forEach(this.colorInputs, function (clrInputs) {
            thisB._updateIndividualColor(clrInputs);
          });
        }
        this.colorType = lang.clone(val);

      },

      _updateRandomColor: function () {
        //console.log('update random colors', this.randomColors);
        var thisB = this;
        var cnt = 0;
        var clr;
        // update color previews and inputs
        array.forEach(this.colorPreviews, function (clrPre) {
          clr = thisB.randomColors[cnt];
          domStyle.set(clrPre, 'backgroundColor', clr);
          // to avoid calling the onChange method of colorInput
          // set _onChangeActive to false, make change, reset to true
          thisB.colorInputs[cnt].set('_onChangeActive', false);
          thisB.colorInputs[cnt].set("value", clr);
          thisB.colorInputs[cnt].set('_onChangeActive', true);
          cnt++;

        });
      },

      _updateSingleColor: function (input) {
        if (input.hasOwnProperty('value')) {
          array.forEach(this.colorPreviews, function (clrPre) {
            domStyle.set(clrPre, 'backgroundColor', input.value);
          });
        }
        this.singleColor = input.value;
      },

      _updateIndividualColor: function (input) {
        var thisB = this;
        var idx = input._index;
        var clrPre = this.colorPreviews[idx];
        if ((input.hasOwnProperty('value'))) {
          domStyle.set(clrPre, 'backgroundColor', input.value);
          this.indivColors[idx] = input.value;
        }

        // if colorType not indiv before, set indiv now
        if (thisB.colorType !== 'individual') {
          var prevClrType = lang.clone(this.colorType);
          registry.byId('motif-dens-tbl-clrtype-btn-' + prevClrType).set("checked", false);
          registry.byId('motif-dens-tbl-clrtype-btn-individual').set("checked", true);
          thisB.colorType = 'individual';
        }
      },

      _updateMotif: function (input) {
        var idx = input._index;
        this.motifs[idx] = input.value;
      },

      _removeRow: function (deleteBtn) {
        var idx = deleteBtn._index;
        // update indexes of all rows after idx
        for (var i = idx + 1; i < this.motifs.length; i++) {
          this.deleteButtons[i]['_index']--;
          this.motifInputs[i]['_index']--;
          this.colorPreviews[i]['_index']--;
          this.colorInputs[i]['_index']--;
        }
        // pop elements of row and destory
        var rmWid = [];
        var rm = this.deleteButtons.splice(idx, 1);
        rmWid.concat(rm);
        rm = this.motifInputs.splice(idx, 1);
        rmWid.concat(rm);
        rm = this.colorInputs.splice(idx, 1);
        rmWid.concat(rm);
        this.colorPreviews.splice(idx, 1);
        array.forEach(rmWid, function (wid) {
          wid.destroy();
        });
        // remove from motifs, invidual colors, and update random colors
        this.motifs.splice(idx, 1);
        this.indivColors.splice(idx, 1);
        this.randomColors = ColorHandler.generateNColors(this.motifs.length);
        // remove row
        var tbl = dom.byId('motif-dens-tbl');
        tbl.deleteRow(idx + 3);
        // update random color preview if necessary
        if (this.colorType === 'random')
          this._updateRandomColor();
      },

      _addRow: function () {
        var newIndex = this.motifs.length;
        var insertPoint = newIndex + 3;
        // update motif list, random colors list, individual color list
        this.motifs.push('');
        this.randomColors = ColorHandler.generateNColors(newIndex + 1);
        this.indivColors.push(this.randomColors[newIndex]);
        // get tbl, create row
        var tbl = dom.byId('motif-dens-tbl');
        var row = tbl.insertRow(insertPoint);
        this._createRow(row, '', newIndex);

        if (this.colorType === 'random')
          this._updateRandomColor();
        if (this.colorType === 'single')
          domStyle.set(this.colorInputs[newIndex].domNode, 'visibility', 'hidden');
      },

      _getColorCallback: function () {
        var thisB = this;
        if (this.colorType === 'random')
          return 'random';
        else if (this.colorType === 'single')
          return this.singleColor;
        else {
          var outObj = {};
          var cnt = 0;
          // loop through motif inputs
          array.forEach(thisB.motifInputs, function (motif) {
            if (motif.value !== '') {
              outObj[motif.value] = thisB.indivColors[cnt];
            }
            cnt++;
          });
          return outObj;
        }
      },

      hide: function () {
        this.inherited(arguments);
        window.setTimeout(lang.hitch(this, 'destroyRecursive'), 500);
      }
    });
  });
