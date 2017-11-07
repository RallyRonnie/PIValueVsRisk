PIValueVsRisk
===============

![Alt text](https://raw.github.com/RallyRonnie/PIValueVsRisk/master/Screenshot.png)

##Overview

This is a Rally SDK 2 app that measures risk vs value on certain any Portfolio Item type. You can click on each item in the legend to toggle if the group (series) will show or not. When you hover over any graph item, you can see the details. In addition, you can also print the graph and save the graph in a variety of formats (PNG, JPEG, PDF, SVG). 

##How to Use

If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard. Then copy deploy/App.html or deploy/App-uncompressed.html from the deploy folder into the HTML text area. That's it, it should be ready to use.

App Settings are available under the App gear icon -> Edit App Settings. A screeshot is below. The Bubble Divisor devided the bubble size which is based on (100 * PreliminaryEstimate Value - set in the field properties). Sane values are 1 to 100. NOTE: setting to 0 will cause an error.

![Alt text](https://raw.github.com/RallyRonnie/PIValueVsRisk/master/Settings.png)


##License

This app is released under the MIT license.

##Documentation for SDK

You can find the documentation on our help [site.](https://help.rallydev.com/apps/2.1/doc/)
