<template>
	<div id="app">
		<v-header></v-header>
		<div class="content">
			
			<div id="charts" class="charts"></div>
			
		</div>
	</div>
</template>

<script>
	import header from 'components/header/header.vue'
	
	let sNormal= "#73b633";			// 正常节点		颜色+边框
	let sBroke = "#db572d";			// 断链节点		颜色+边框
	let sRecovered = "#fe9500";		// 已修复节点		颜色+边框
	let sCanDo = "#424aaf";	// "#42afa0";			// 可修复节点		边框
	let sActived = "#7642af";		// 选中节点		边框
	
	export default {
		components: {
			'v-header': header
		},
		data() {
			return {
				chart: null,
				pageData: {}
			}
		},
		mounted() {
			this.init();
		},
		computed: {
			allNodeLine: function() {
				return this.getAllNodeLines();
			},
			// 获取所有可连线的节点 [1,2,3,4,5]
			allFilterNode: function() {
				return this.pageData.doInOuts;
			},
			option() {
				return {
					title: {
				        text: '笛卡尔坐标系上的 Graph'
				    },
				    tooltip: {},
				    dataZoom: [{
                            type: 'slider',
                            // 让 dataItem 部分超出坐标系边界的时候，不会整体被过滤掉。
                            filterMode: 'weakFilter',
                            xAxisIndex: 0,
                            // show: true,
                            // 展示图像缩略轴。
                            showDataShadow: true,
                            // top: 400,
                            height: 16,
                            // borderColor: 'transparent',
                            // backgroundColor: '#e2e2e2',
                            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
                            handleSize: 16,
                            handleStyle: {
                                shadowBlur: 6,
                                shadowOffsetX: 1,
                                shadowOffsetY: 2,
                                shadowColor: '#fff'
                            }
                        },{
                            type: 'slider',
                            filterMode: 'weakFilter',
                            // show: true,
                            yAxisIndex: 0,
                            showDataShadow: true,
                            width: 16,
                            // borderColor: 'transparent',
                            // backgroundColor: '#e2e2e2',
                            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
                            handleSize: 16,
                            handleStyle: {
                                shadowBlur: 6,
                                shadowOffsetX: 1,
                                shadowOffsetY: 2,
                                shadowColor: '#fff'
                            }
                        },{
				            type: 'inside',
				            xAxisIndex: 0,
				            filterMode: 'empty'
				        },{
				            type: 'inside',
				            yAxisIndex: 0,
				            filterMode: 'empty'
				        }],
				    xAxis: {
				        type : 'category',
				        boundaryGap : false,
				        data : []
				    },
				    yAxis: {
				        type : 'category',
				        data: []
				    },
				    series: [{
			            type: 'graph',
			            layout: 'none',
			            coordinateSystem: 'cartesian2d',
			            symbolSize: 12,
			            label: {
			                normal: {
			                    show: false
			                }
			            },
			            edgeSymbol: ['none', 'arrow'],
			            data: [],
			            links: [],
			            lineStyle: {
			                normal: {
			                    color: '#2f4554'
			                }
			            }
			        }]
    			}
			}
		},
		methods: {
			init() {
				this.setInitData();

                // 获取所有数据。
                this.fetchAllData();
			},
			setInitData() {
				this.initChart();
			},
			initChart() {
				if(!this.chart) {
					
                    this.chart = this.$echarts.init(document.getElementById('charts'));
                    this.setChartEvent();
                }else {
                    this.chart.clear();
                }
			},
			fetchAllData() {
				let _that = this;
				
				this.$ajax.get('static/chain.json').then( (res) => {
			   		_that.pageData = res.data.data;
			        
			        _that.$nextTick(() => {
			        	_that.setChartData();
			        })
			   	})
			},
			// 显示图形。
			setChartData() {
				
				// 设置x轴的值。
				let axAxisProcess = this.getProcessData(),
					that = this,
					ayAxisData = [];
					
				// 设置series中data的值。
				let aSeriesData = this.allFilterNode.map( o => {
					let sProcess = that.getNodeProcessCode(o).processName,
						sInHappenTime = o.inHappenTime;
						
					// 不存在，则将开始时间加入。
					if(!ayAxisData.includes(sInHappenTime)) {
						ayAxisData.push(sInHappenTime);
					}
					// 返回节点数据。
					return {
						name: o.id,
						value: [sProcess, sInHappenTime],
						data: o,
						label:　"",
						itemStyle: {
							normal: that.getNodeType(o).style
						}
					}
				});
				
				// 设置series中links的值。
				let aSeriesLinkData = this.allNodeLine.map( o => {
					return {
						source: o[0],
						target: o[1],
						lineStyle: {
							normal: that.getNodeLineType(o).style
						}
					}
				});
				console.log(1)
				// y轴投入时间的处理，并排序。
				ayAxisData = ayAxisData.sort(function(sA, sB) {
					return +new Date(sB) - +new Date(sA);
				});
				
				this.option.yAxis.data = ayAxisData;
				this.option.xAxis.data = axAxisProcess;
				this.option.series[0].data = aSeriesData;
				this.option.series[0].links = aSeriesLinkData;
				this.chart.setOption(this.option, true);
			},
			/**
    		 * 获取工序节点的工序值。
    		 * @param {Object} oNode
    		 * @return {String} sProcessCode
    		 */
    		getNodeProcessCode(oNode) {
    			// 返回工序节点的工序值。
    			return {
    				processCode: oNode.parentProcessCode || oNode.inProcessCode,
    				processName: oNode.parentProcessName || oNode.inProcessName
    			};
    		},
			// 获取x轴工序的数据。
			getProcessData() {
    			// 返回数据。
    			var aoNewData = [];
    			
    			// 工序数据格式处理。 select显示-- label value
    			this.pageData.basicInfoDto.processArr.forEach((oData) => {
    				aoNewData.push({
    					name: oData.processCode,
    					value: oData.processName,
    					seq: oData.processSeq
    				});
    			});
    			
    			aoNewData = aoNewData.sort( (oA, oB) => oA.seq-oB.seq)
    			// 返回工序转换后的数据。
    			return aoNewData;
    			
    		},
    		// 获取节点的类型。
    		/**
    		 * 获取节点类型。
    		 * @param {Object} o 节点数据。
    		 * @return {Object}
    		 */
    		getNodeType(o) {
    			let // 修复
    				nIsRecovered = o.repairType,
    				// 断链。
    				nIsBroken = o.isBroke,
    				// 返工。
    				nIsRework = o.isRework,
    				oStyle = {
    					type: '',
    					style: {
    						color: '',
    						borderColor: ''
    					}
    				}
    			
    			if(!nIsBroken && !nIsRecovered) {
    				// 正常节点。
    				oStyle = {
    					type: 'normal',
    					style: {
    						color: sNormal,
    						borderColor: sNormal
    					}
    				}
    			}else if(nIsBroken) {
    				// 断链节点。
    				oStyle = {
    					type: 'broken',
    					style: {
    						color: sBroke,
    						borderColor: sBroke
    					}
    				}
    			}else if(nIsRecovered) {
    				// 修复节点。
    				oStyle = {
    					type: 'recovered',
    					style: {
    						color: sRecovered,
    						borderColor: sRecovered
    					}
    				}
    			}
    			
    			// 投入修复 或产出修复。
    			if(o.isInCanRepair || o.isOutCanRepair) {
    				oStyle.type += 'canDo';
    				oStyle.style.borderColor = sCanDo
    			}
    			
    			// 返回节点的类型。
    			return oStyle;
    		},
    		/**
    		 * 获取节点线的样式。
    		 * @param {Array} aLine
    		 * @return {Object}
    		 */
    		getNodeLineType(aLine) {
    			console.log("22222")
    			let _that = this,
    				oStyle = {
    					type: 'normal',
    					style: {
    						color: sNormal,
    						borderColor: sNormal
    					}
    				};
    				
    			// 上道工序修复为2，3，或下道工序修复为1，3
    			aLine.forEach( function(sNode, nIndex) {
    				let sValue = _that.getNodeInfoById(sNode).repairType;
    				
    				if( sValue == "3" || (!nIndex && sValue == "2") || (nIndex && sValue == "1")) {
    					oStyle = {
	    					type: 'recovered',
	    					style: {
	    						color: sRecovered,
	    						borderColor: sRecovered
	    					}
	    				};
    				}
    			});
    			
    			// 返回节点的类型。
    			return oStyle;
    		},
    		/**
    		 * 通过节点id，获取节点信息。
    		 * @param {String} sNodeId
    		 * @return {Object}
    		 */
    		getNodeInfoById(sNodeId) {
    			// 当前节点信息。
    			let aNode = [];
    			
    			aNode = this.pageData.doInOuts.filter( o => o.id == sNodeId)
    			
    			// 返回数据。
    			if(aNode.length) {
    				return aNode[0]
    			}else {
    				return {}
    			}
    		},
    		// 获取所有链节点。
    		getAllNodeLines() {
    			// 获取所有节点的线。
    			var aLine = [];
    			
    			console.log("=====2")
    			// 获取所有的单线。
    			this.pageData.doInOuts.forEach(function(oData) {
    				var sPrevId = oData.sourceIds,
    					sCurrentId = oData.id+"";
    			    				
    				if(sPrevId) {
    					// 存在上级工序。
    					let aPrev = sPrevId.split(",");
    					
    					// 如果存在多个投入工序，则拆分。
    					aPrev.forEach(function(sId) {
	    					aLine.push([sId,sCurrentId]);
    					});
    				}
    			});
    			
    			// 返回链式节点。
    			return aLine;    			
    		},
			// 图形事件。 节点，线点击事件。
			setChartEvent() {}
		}
	}
</script>

<style lang="less">
	html,
	body {
		height: 100%;
	}
	
	body {
		background-color: #f2f2f2;
		font-family: 微软雅黑;
		color: #333;
		font-size: 14px;
		overflow: hidden;
	}
	
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		
		.content {
			flex: 1;
			margin: 20px;
			background-color: #FFFFFF;
			
			
			.charts {
				width: 100%;
				height: 100%;
			}
			
		}
	}
	
</style>