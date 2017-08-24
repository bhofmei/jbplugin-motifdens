# Change log
Note: Version numbering will begin with v2 to avoid confusion with version numbering from Nucleotide Density plugin

### [Unreasleased]

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