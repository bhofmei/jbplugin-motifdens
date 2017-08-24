define([
  'dojo/_base/declare',
  'JBrowse/Plugin'
  ],
  function (
    declare,
    JBrowsePlugin
  ) {
    return declare(JBrowsePlugin, {
      constructor: function (args) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        this.config.version = '2.0.0';
        console.log("MotifDensityPlugin plugin starting - v", this.config.version);

        // register track type
        browser.registerTrackType({
          label: 'MotifDensity',
          type: 'MotifDensityPlugin/View/Track/MotifDensity'
        });
      }
    });
  });
