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
			fetch: ['FormattedID', 'Name', 'PreliminaryEstimate', 'PreliminaryEstimateValue', app.getSetting('groupByField'), riskField = app.getSetting('riskField'), riskField = app.getSetting('valueField') ],
			sorters: [{
				property: 'InvestmentCategory',
				direction: 'ASC'
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

			if (record.get(groupField) !== currentSeries.name) {
				currentSeries = {
					name: record.get(groupField),
					data: [],
					color: app._getColor(ccount++)
				};
				series.push(currentSeries);
			}
			var bubbleSize = 5;
			var sizeText = "Unknown";
			if (record.get('PreliminaryEstimate')) {
				bubbleSize = (100 * record.get('PreliminaryEstimateValue')) / bubbleDiv;
				sizeText = record.get('PreliminaryEstimate').Name;
			}
//			console.log(record);
			currentSeries.data.push({
				name: record.get('FormattedID') + ": " + record.get('Name'),
				x: record.get('ValueScore'),
				y: record.get('RiskScore'),
				z: bubbleSize,
				size: sizeText,
			});
		});
		// console.log(series);
		this._drawChart({series: series});
	},
	_drawChart: function (data) {
        if ( this._myBoard ) { this._myBoard.destroy(); }
		//                    console.log(data);
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
					text: 'Value'
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Risk'
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
			{
                name: 'valueField',
                xtype: 'rallytextfield',
                margin: '0 0 15 50',
                label : "Value Field (Numeric):",
                labelWidth: 200
			},
			{
                name: 'riskField',
                xtype: 'rallytextfield',
                margin: '0 0 15 50',
                label : "Risk Field (Numeric):",
                labelWidth: 200
			},
			{
                name: 'groupByField',
                xtype: 'rallytextfield',
                margin: '0 0 15 50',
                label : "Group By Field (Color Coded):",
                labelWidth: 200
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
			riskField: 'RiskScore'

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