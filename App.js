Ext.define('PIValueVsRisk', {
	extend: 'Rally.app.App',
	componentCls: 'app',
	launch: function () {
        app = this;
		typeComboBox = this.add({
			xtype: 'rallyportfolioitemtypecombobox',
			listeners: {
				select: function(combobox) {
					// console.log(typeComboBox.getRecord());
					var piType = typeComboBox.getRecord().get('TypePath');
					this._getPIChartData(piType);
				},
				scope: this
			}
		});
	},
	_getPIChartData: function (piType) {
        if ( this._myStore ) { this._myStore.destroy(); }
		this.myStore = Ext.create('Rally.data.wsapi.Store', {
			model: piType,
			autoLoad: true,
			fetch: ['FormattedID', 'Name', 'PreliminaryEstimate', 'PreliminaryEstimateValue', app.getSetting('groupByField'), riskField = app.getSetting('riskField'), riskField = app.getSetting('valueField'), app.getSetting('bubbleSizeField') ],
			sorters: [{
				property: app.getSetting('groupByField'),
				direction: 'DESC'
            }],
            filters:  app.getQueryFilter(),	
			listeners: {
				load: this._onDataLoaded,
				scope: this
			}
		});
	},
	_onDataLoaded: function (store, data) {
		var bubbleDiv = app.getSetting('PIBubbleDiv');
		var groupField = app.getSetting('groupByField');
		var riskField = app.getSetting('riskField');
		var valueField = app.getSetting('valueField');
		var series = [];
		var ccount = 0;
		var currentSeries = {
			name: null
		};
		var records = _.map(data, function (record) {
			// console.log(record);
			if (record.get(groupField) != null) { // some fields, no-entry is set to null
				rec = (record.get(groupField)._type === undefined )  ? record.get(groupField) : record.get(groupField)._refObjectName ;
			} else {
				rec = '--No Entry--';
			}
			if (rec !== currentSeries.name) {
				currentSeries = {
					name: rec,
					data: [],
					color: app._getColor(ccount++)
				};
				series.push(currentSeries);
			}
			var bubbleSize = 5;
			var sizeText = "Unknown";
			if (app.getSetting('bubbleSizeField') === 'PreliminaryEstimate') {
				bsizeName = 'PreliminaryEstimate';
				bsizeValue = record.get('PreliminaryEstimateValue');
				if (record.get(bsizeName)) {
					bubbleSize = (100 * bsizeValue) / bubbleDiv;
					sizeText = record.get(bsizeName).Name;
				}
			} else {
// console.log(record);
				bsizeName = app.getSetting('bubbleSizeField');
				bsizeValue = record.get(bsizeName);
				if (record.get(bsizeName)) {
// console.log(bsizeName, bsizeValue);
					bubbleSize = (100 * bsizeValue) / bubbleDiv;
					sizeText = record.get(bsizeName);
				}
			}
//			console.log(record);
			currentSeries.data.push({
				name: record.get('FormattedID') + ": " + record.get('Name'),
				x: record.get(valueField),
				y: record.get(riskField),
				z: bubbleSize,
				size: sizeText,
			});
		});
// console.log(series);
		this._drawChart({series: series});
	},
	_drawChart: function (data) {
        if ( this._myBoard ) { this._myBoard.destroy(); }
//  console.log(data);
		this._myBoard = this.add({
			xtype: 'rallychart',
			loadMask: false,
			chartData: data,
			chartConfig: this._getChartConfig()
		});
	},
	_getColor: function (index) {
		var COLORS = [
			'rgba(204,  0,  0, .6)',
			'rgba(204,204,  0, .6)',
			'rgba(  0,204,  0, .6)',
			'rgba(  0,102,204, .6)',
			'rgba(102,  0,204, .6)',
			'rgba( 96, 96, 96, .6)',
			'rgba(204,102,  0, .6)',
			'rgba(  0,  0,204, .6)'
		];
		return COLORS[index];
	},
	/**
	 * Generate a valid Highcharts configuration object to specify the column chart
	 */
	_getChartConfig: function () {
		return {
			chart: {
                type: 'bubble',
                plotBorderWidth: 1,
				zoomType: 'xy',
			},
			title: {
				text: 'Value vs. Risk'
			},
			xAxis: {
				min: 0,
				title: {
					text: app.getSetting('valueField')
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: app.getSetting('riskField')
				}
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.point.name + '</b><br/>' +
						'Value: ' + this.x + ', Risk: ' + this.y + ', Size: ' + this.point.size;
				}
			},
			plotOptions: {
				scatter: {
					marker: {
						radius: 10,
						symbol: 'circle',
						states: {
							hover: {
								enabled: false
							}
						}
					},
					states: {
						hover: {
							marker: {
								enabled: true
							}
						}
					}
				}
			},
		};
    },
    getSettingsFields: function() {
        var values = [
			{   // Card Field Picker
				xtype: 'rallyfieldcombobox',
				name: 'riskField',
				fieldLabel: 'Risk Field:',
				model: 'PortfolioItem',
				boxLabelAlign: 'after',
				margin: '0 0 15 10',
				labelStyle: "width:100px;"
			},
			{   // Card Field Picker
				xtype: 'rallyfieldcombobox',
				name: 'valueField',
				fieldLabel: 'Value Field:',
				model: 'PortfolioItem',
				boxLabelAlign: 'after',
				margin: '0 0 15 10',
				labelStyle: "width:100px;"
			},
			{   // Card Field Picker
				xtype: 'rallyfieldcombobox',
				name: 'groupByField',
				fieldLabel: 'Group By Field:',
				model: 'PortfolioItem',
				boxLabelAlign: 'after',
				margin: '0 0 15 10',
				labelStyle: "width:100px;"
			},
			{
				xtype: 'label',
				forId: 'myFieldId1',
				text: 'Bubble Size',
				margin: '0 0 0 10'
			},
        	{
                name: 'PIBubbleDiv',
                xtype: 'rallynumberfield',
                margin: '0 0 15 50',
                label : "Bubble size divisor (increase for smaller bubbles)",
                labelWidth: 200
			},
			{   // Card Field Picker
				xtype: 'rallyfieldcombobox',
				name: 'bubbleSizeField',
				fieldLabel: 'Bubble Size Field:',
				model: 'PortfolioItem',
				boxLabelAlign: 'after',
				margin: '0 0 15 50',
				labelStyle: "width:200px;"
			},
			{ type: 'query' }
        ];
        return values;
    },
    config: {
        defaultSettings : {
			PIBubbleDiv : 1,
			groupByField: 'InvestmentCategory',
			valueField: 'ValueScore',
			riskField: 'RiskScore',
			bubbleSizeField: 'PreliminaryEstimate'

        }
	},
	getQueryFilter: function() {
        var queries = [];
        if (app.getSetting('query')) {
            queries.push(Rally.data.QueryFilter.fromQueryString(app.getSetting('query')));
        }
        return queries;
    }  
});