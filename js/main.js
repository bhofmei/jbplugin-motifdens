define([
  'dojo/_base/declare',
  'JBrowse/Plugin',
  'dijit/form/Button',
  'dijit/registry',
  'MotifDensityPlugin/View/Dialog/MotifDensityDialog'
  ],
  function (
    declare,
    JBrowsePlugin,
    dijitButton,
    dijitRegistry,
    MotifDensDialog
  ) {
    return declare(JBrowsePlugin, {
      constructor: function (args) {
        var browser = args.browser;
        var thisB = this;

        // do anything you need to initialize your plugin here
        this.config.version = '2.1.2';
        console.log("MotifDensityPlugin plugin starting - v" + this.config.version);

        this.config.dialog = false;
        if (args.dialogMode !== undefined)
          this.config.dialog = args.dialogMode;
        this.config.dialogColors = args.dialogColors || 'random';
        this.config.dialogMotifs = args.dialogMotifs || ["CG", "CHG", "CHH", "AT"];

        // register track type
        browser.registerTrackType({
          label: 'MotifDensity',
          type: 'MotifDensityPlugin/View/Track/MotifDensity'
        });

        if(this.config.dialog){
          var button;
        browser.afterMilestone('initView', function () {
          // create screenshot button (possibly tools menu)
          var menuBar = browser.menuBar;

          function showMotifDialog() {
            new MotifDensDialog({
              setCallback: function (ws, wd, minsc, maxsc, m, clr) {},
              windowSize: 100,
              windowDelta: 10,
              minScore: 0,
              maxScore: 1,
              motifs: thisB.config.dialogMotifs,
              colors: thisB.config.dialogColors
            }).show();
          }
            button = new dijitButton({
              innerHTML: 'M',
              id: 'motif-button',
              onClick: showMotifDialog
            });
            menuBar.appendChild(button.domNode);
        });
        browser.afterMilestone('completely initialized', function () {
            if (browser.view.tracks.length < 1) {
              setTimeout(function () {
                button.onClick();
              }, 700)
            }
        });
        } // end if config.dialog
      }
    });
  });
