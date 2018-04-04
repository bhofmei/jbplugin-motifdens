# Change log
Note: Version numbering will begin with v2 to avoid confusion with version numbering from Nucleotide Density plugin

### [Unreleased]
- FIXED issue where dialog callback would fail when changing from 'random' colors to 'indiv' colors

### [v2.2.2] - 2018-03-30
- FIXED issue where svg density rects would be deleted if y-scale for another track was rendered after the motif density track
  - use svg path instead of svg rect to build the density blocks
- ADDED clip_marker_color option rather than always being black

### [v2.2.1] - 2018-03-19
- ADDED max block query size so it doesn't try generating a heatmap for large regions
  - this is extremely slow even with large window size
  - Default is 250000 per block or 1.5 MB across total view
- REMOVED dojo/domReady dependency (caused issues with JBrowse 1.13.0)
- UPDATED package name to match jbrowse plugin name scheme
  

### [v2.2.0] - 2017-11-06
- FIXED typos in README and test data trackList.json
- ADDED automatic window size/delta when viewing very large regions
  - avoids out of memory errors
  - can be faster
  - when window size/delta are changed, black lines appear above/below the track
- ADDED option to force the window size/delta and not automatically adjust (see above)
  - when zoomed too far out, gives warning message

### [v2.1.0] - 2017-09-26
- bug fixes
- ADDED dialog mode to be able to take screenshots of the dialog box
  - optional dialogColors parameter to set colors used in dialog
  - optional dialogMotifs parameter to set motifs used in dialog

### [v2.0.0] - 2017-08-24
- Renamed/import from previous Nucleotide Density plugin

## Release Notes from previous Nucleotide Density Plugin
### [v1.1.0] - 2017-08-22
- ADDED SVG density tracks (useful for screenshots)

### [v1.0.4] - 2017-07-17
- FIXED show/hide track sublabels (the contexts) without redrawing entire track

### [v1.0.3] - 2017-07-14
- CHANGED realigned the density values in the track view to be centered on the region computed for
- ADDED jasmine testing

### [v1.0.2] - 2017-06-23
- FIXED issue when using color values names; all CSS3 color names are supported

### [v1.0.1] - 2017-06-21
- FIXED issue with dialog and array colors
- ADDED sample dataset to test plugin is installed correctly

### [v1.0.0] - 2017-03-16
- ADDED random color generation based on number of contexts
- ADDED uses chroma.js for color conversions in ColorHandler

### [v0.0.6] - 2016-11-21
- ADDED on hover over track, show density score for sequence contexts
- ADDED scores are listed in order of context and color coded
- ADDED option to show/hide scores

### [v0.0.5] - 2016-11-21
- functional dialog box to add/remove contexts, set colors, change window size/delta, and min/max density
- check box in track menu to use both strands or forward only to compute density
- REMOVED non-functional "Change score range" option in track menu

### [v0.2] - 2016-11-10
- allows specifiying unlimited number of nucleotide contexts
- multiple options to specify color of contexts default to random (not truly random but equidistant colors)
- ability to compute density using forward strand or both strands