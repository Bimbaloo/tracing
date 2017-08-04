<!--设备-->
<template>
    <div class="content-list" v-loading="loading">
        <div v-if="sErrorMessage" class="error">{{sErrorMessage}}</div>
		<div v-else class="analysis" id="equipments"></div>
        <div class="links" v-if="selectedEquipment">
            <div v-for="obj in dimension" :key="obj.type" :class="[obj.key, 'item']">
                <div v-for="item in obj.list" @click="listButtonClick(item)">{{item.name}}</div>
            </div>	
        </div>
        <div class="tooltip left" v-if="compareData.left.time" :style="{'max-height': (chartHeight-60-20) + 'px'}">
            <div class="tooltip-time">{{compareData.left.time}}</div>
            <div class="tooltip-list" v-for="equipment in compareData.left.list">
                <div class="tooltip-title" :style="{color: equipment.color}">{{equipment.name}}&nbsp;&nbsp;&nbsp;&nbsp;{{equipment.series}}&nbsp;&nbsp;&nbsp;&nbsp;{{equipment.quantity}}</div>
                <ul class="event-list">
                    <li v-for="(event,index) in equipment.event">
                        <div>{{index+1}}.{{event.title}}</div>
                        <ul class="content-list">
                            <li v-for="content in event.content">
                                {{content.name}}:&nbsp;&nbsp;{{content.value}}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <div class="tooltip right" v-if="compareData.right.time" :style="{'max-height': (chartHeight-60-20) + 'px'}">
            <div class="tooltip-time">{{compareData.right.time}}</div>
            <div class="tooltip-list" v-for="equipment in compareData.right.list">
                <div class="tooltip-title" :style="{color: equipment.color}">{{equipment.name}}&nbsp;&nbsp;&nbsp;&nbsp;{{equipment.series}}&nbsp;&nbsp;&nbsp;&nbsp;{{equipment.quantity}}</div>
                <ul class="event-list">
                    <li v-for="(event,index) in equipment.event">
                        <div>{{index+1}}.{{event.title}}</div>
                        <ul class="content-list">
                            <li v-for="content in event.content">
                                {{content.name}}:&nbsp;&nbsp;{{content.value}}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>        
		<div class="setting clear" v-if="!sErrorMessage&&!loading">
            <div class="start">	    
                <span v-if="startIf" @click="startIf=false">{{datetime.start}}</span>
                <div v-else class="edit">
                    <v-datetime :form-data="datetime" key-data="start"></v-datetime>
                    <span class="edit-icon">
                        <i class="el-icon-circle-check" @click="saveStart"></i>
                        <i class="el-icon-circle-cross" @click="cancelStart"></i>
                    </span>
                </div>
            </div>
            <div class="end">
                <span v-if="endIf" @click="endIf=false">{{datetime.end}}</span>
                <div v-else class="edit">
                    <v-datetime :form-data="datetime" key-data="end"></v-datetime>
                    <span class="edit-icon">
                        <i class="el-icon-circle-check" @click="saveEnd"></i>
                        <i class="el-icon-circle-cross" @click="cancelEnd"></i>
                    </span>
                </div>
            </div>
		</div>					 
    </div>      
</template>

<script>
	import DateTime from 'components/basic/dateTime.vue'
    import $ from 'jquery'

    const CHART_STATE_NAME = "状态"
    const sFineReportUrl = FINE_REPORT_HOST + "/WebReport/ReportServer?reportlet="

    export default {
		props: {
			equipments: Array,
			datetime: [Object],
            process: String
		},
		components: {
			'v-datetime': DateTime
		},
        data () {
            return {
                // 选中的设备id。
                selectedEquipment: "",
				loading: false,
				sErrorMessage: "",
                url: HOST + "/api/v1/trace/equipments-events",	
				// 比例。
				ratio: 1,
				// 设备状态。
				states: [{
					key: "run",
					name: "加工",
					color: "#72b733"
				},{
					key: "stop",
					name: "停机",
					color: "#fac41b"
				},{
					key: "debug",
					name: "调试",
					color: "#009aff"
				},{
					key: "close",
					name: "关机",
					color: "#999"
				}],				
				startIf: true,
				endIf: true,
				equipmentData: {},
                chart: null,
                chartHeight: 60,
                markLine: [],
                compareData: {
                    left: {
                        time: "",
                        list: []
                    },
                    right: {
                        time: "",
                        list: []
                    },
                },
                // 设备id列表。
                // {
                // value: o.equipmentName+ '+' + o.equipmentId + '+' + 0, // 最后一位代表是否选中这台设备
                // id: o.equipmentId
                // }
                categories: [],
                axisTooltipData: [],
				dimension: [{
					name: "质量",
                    key: "quality",
					type: "3",
                    color: "#d89add",
                    list: [{
						name: "质检",
						cpt: "/QTReport.cpt",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "送检",
						cpt: "/QCReport.cpt",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    },{
						name: "FGB",
						cpt: "/FGBReport.cpt&__bypagesize__=false",
						parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                    }]
				}, {
					name: "加工",
                    key: "work",
					type: "2",
                    color: "#66bc84",
                    list: [{
						name: "投产表",
						router: "/process/product",
						query: ["equipmentIdList", "startTime", "endTime"]  
                    }]
				}, {
					name: "事件",
                    key: "event",
					type: "4",
                    color: "#f9823e",
                    list: [{
						name: "事件记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "维护",
                    key: "repair",
					type: "5",
                    color: "#5aa7c5",
                    list: [{
						name: "维护记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}, {
					name: "工具",
                    key: "tool",
					type: "6",
                    color: "#86cccc",
                    list: [{
						name: "工具记录",
						path: "",
						parameter: ["equipmentId", "startTime", "endTime"]  
                    }]
				}]
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		  	},
			resize () {
		    	return this.$store.state.resize
		    },
			resizeY () {
				return this.$store.state.resizeY
			},
			fullscreen () {
				// 是否全屏
		    	return this.$store.state.fullscreen
		    },
            // categories () {
            //     return this.equipments.map(o => {
            //         return {
            //             value: o.equipmentName+ '+' + o.equipmentId + '+' + 0, 
            //             id: o.equipmentId    
            //         }
            //     })
            // },
            option () {
                let oData = {
                    legend: {
                        data: this.dimension.map(o=>o.name),
                        // itemWidth: ,
                        // itemGap: 40,
                        // width: 320,
                        right: 70,
                        align: 'left' 
                        // padding: [
                        //     5,  // 上
                        //     10, // 右
                        //     5,  // 下
                        //     10, // 左
                        // ]
                    },
                    grid:{
                        left: 100,
                        right: 100
                    },
                    tooltip: {
                        trigger: 'none',
                        padding: [10, 20, 10, 20],
                        backgroundColor: 'rgba(44,52,60,0.7)',
                        borderColor: '#ccc',
                        borderWidth: 2,
                        borderRadius: 4,
                        transitionDuration: 0,
                        // extraCssText: 'width: 300px; white-space: normal',
                        textStyle: {
                            fontSize: 12
                        },
                        formatter: this.tooltipFormatter
                    },             
                    dataZoom: [
                        {
                            type: 'slider',
                            // 让 dataItem 部分超出坐标系边界的时候，不会整体被过滤掉。
                            filterMode: 'weakFilter',
                            xAxisIndex: [0],
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
                            },
                            labelFormatter: function(value) {
                                return new Date(value).Format()
                            }
                        }, 
                        {
                            type: 'slider',
                            filterMode: 'weakFilter',
                            // show: true,
                            yAxisIndex: [0],
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
                            },
                            labelFormatter: function(index, value) {
                                return value.split("+")[0]
                            }
                        }, {
                            type: 'inside',
                            filterMode: 'weakFilter',
                            xAxisIndex: [0],
                        },
                        {
                            type: 'inside',
                            filterMode: 'weakFilter',
                            yAxisIndex: [0],
                        }
                    ],
                    xAxis: {
                        type: 'value',
                        min: 'dataMin',
                        max: 'dataMax',
                        scale: true,
                        axisLabel: {
                            formatter: function (val, index) {
                                return new Date(val).Format()
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        // 移动坐标。
                        axisPointer: {
                            show: true,
                            snap: true,
                            lineStyle: {
                                type: 'dashed'
                            },
                            label: {
                                show: true,
                                margin: 6,
                                backgroundColor: '#556',
                                textStyle: {
                                    color: '#fff'
                                },
                                formatter: function ({value}) {
                                    return new Date(value).Format();                     
                                }
                            }
                        },   
                    },
                    yAxis: {
                        type: 'category',
                        data: this.categories,
                        triggerEvent: true,
                        axisLabel: {
                            textStyle: {
                                color: function (value, index) {
                                    // 最后一位代表是否点击选中。
                                    return Number(value.split("+")[2]) ? '#d53a35': '#666'
                                }
                            },
                            formatter: (value)=> {
                                
                                let sValue = value.split("+")[0].trim(),
                                    aValue = [],
                                    nLength = 7,
                                    i = 0,
                                    l = Math.floor(sValue.length/nLength);
                                // 设置大于7个字符换行。
                                for(; i < l; i++) {
                                    aValue.push(sValue.substr(i*nLength, nLength))                                    
                                }
                                let nLeft = sValue.length - i*nLength;
                                if(nLeft > 0) {
                                    aValue.push(sValue.substr(i*nLength, nLeft))
                                }
                                
                                return aValue.join("\n");
                            }
                        } 
                        
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {}
                        }
                    },
                    series: [{
                        type: 'custom',
                        name: CHART_STATE_NAME,
                        renderItem: this.renderItem,
                        itemStyle: {
                            normal: {
                                opacity: 0.8
                            }
                        },
                        encode: {
                            x: [1, 2],
                            y: 0
                        },
                        data: [],
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                let time = params.value[3]/1000,    
                                    hour = 0,
                                    munite = 0,
                                    secend = 0;
                                
                                if(time/3600 >= 1) {
                                    hour = Math.floor(time/3600);
                                }

                                if(time/60 >=1) {
                                    munite = Math.floor(time%3600/60);
                                }

                                secend = time%60;
                                
                                if(hour) {
                                    time = hour+"h"+munite+"\'"+secend+"\'\'"
                                }else if(munite) {
                                    time = munite+"\'"+secend+"\'\'"
                                }else {
                                    time = secend+"\'\'"
                                }
                                
                                return `${params.marker}${params.name}：${time}<br/>
                                    ${params.value[4]}<br/>
                                    ${params.value[5]}`;
                            }
                        }               
                    }]
                };
                // 设置维度。
                this.dimension.forEach(o => oData.series.push({
                    name: o.name,
                    type: 'scatter',
                    symbol: 'circle', //'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
                    // symbolSize: function (val) {
                    //      return val[2];
                    // },
                    data: [],
                    animationDelay: function (idx) {
                        return idx * 10;
                    },
                    itemStyle: {
                        normal: {
                            color: o.color
                        }
                    },
                    // 文本标签
                    label: {
                        normal: {
                            // 是否显示。
                            show: true,
                            // 显示位置。
                            position: 'top',
                            // 显示位置偏移。
                            // offset: [0, 10],
                            // 标签内容格式器。
                            formatter: function({value}) {
                                return value[2];                        
                                // return value[2] > 1 ? value[2]: "";
                            },
                            // textStyle: {
                            //     color: "#333"
                            // }
                        }
                    }
                }))

                return oData
            }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了			
			
        },
        mounted () {
            this.init();
        },
        watch: {
			// 为了每次点击都会查询。
			'$route': 'init',
            fullscreen: 'resizeChart',
            resize: 'resizeChart',
            resizeY: 'resizeChart'
        },
        methods: {
			init() {
				this.setInitData();

                // 获取所有数据。
                this.fetchAllData();
				
                window.addEventListener("resize", this.resizeChart)
			},
			// 初始化数据。
			setInitData() {		
				this.startIf = true;
				this.endIf = true;
					
				let oData = {};
				this.equipments.forEach(o => {
					let sId = o.equipmentId;
					oData[sId] = {			
						status: []
					}
                    // 添加事件维度数据。
                    this.dimension.forEach(d => oData[sId][d.key] = {})
				})	
				this.equipmentData = oData;
                
                this.initChart();
			},
            // 初始化图表。
            initChart() {
                this.setChartHeight();

                if(!this.chart) {
                    this.chart = this.$echarts.init(document.getElementById('equipments'));
                    this.setChartEvent();
                    
                }else {
                    this.chart.clear();
                    this.markLine = [];
                    this.compareData = {
                        left: {
                            time: "",
                            list: []
                        },
                        right: {
                            time: "",
                            list: []
                        }
                    }
                    this.selectedEquipment = '';
                }        
            },
            // 重置图形大小。
            resizeChart () {
                this.setChartHeight();
                this.chart && this.chart.resize();
            },
            // 设置图形高度。
            setChartHeight () {
                
                let jContent = $(".material-stock .router-content"),
                    jTitle = jContent.find(".content-title");
                
                this.chartHeight = jContent.height() - jTitle.outerHeight(true);
                $("#equipments").height(jContent.height() - jTitle.outerHeight(true));
            },
            // 设置图表事件。
            setChartEvent () {
                let self = this;
                this.chart.on("click", function(params) {
                    // console.log(params);
                    if(params.componentType=="series" && params.seriesType=="scatter") {
                        // 若为散点图系列。
                        if(!self.markLine.filter(o => o.xAxis===params.value[0]).length) {
                            // 若无该标记线。
                            self.markLine.push({ xAxis: params.value[0] });
                            
                            // 数据格式转换。
                            let oTooltipData = {
                                time: new Date(params.value[0]).Format(),
                                list: self.axisTooltipData.map(param => {
                                    let aoValue = param.value,
                                        oData = {};

                                    oData.name = param.name.split("+")[0];
                                    oData.color = param.color;
                                    oData.series = param.seriesName;
                                    oData.quantity = aoValue[2];
                                    oData.event = []
                                    // 事件列表
                                    aoValue[3].forEach(o => {
                                        oData.event.push({
                                            title: o.title,
                                            content: o.tooltipData
                                        })
                                    })
                                    return oData;
                                })
                            }                          

                            if(self.markLine.length == 1) {
                                // 若只有一条数据，设置左侧提示框。
                                self.compareData.left =  oTooltipData;
                            }else if(self.markLine.length == 2) {
                                if(self.markLine[1].xAxis > self.markLine[0].xAxis) {
                                    // 新增数据较大，设置右侧提示框。
                                    if(self.compareData.right.time) {
                                        // 若有设置，先将数据换到左侧。
                                        self.compareData.left = Object.assign({}, self.compareData.right)
                                    }
                                    self.compareData.right = oTooltipData;                                  
                                }else {
                                    // 新增数据较小，设置左侧数据。
                                     if(self.compareData.left.time) {
                                        // 若有设置，先将数据换到右侧。
                                        self.compareData.right = Object.assign({}, self.compareData.left)
                                    }
                                    self.compareData.left = oTooltipData;
                                }
                            }else {
                                // 大于两条数据。
                                // 删除第一条数据。
                                let oShift = self.markLine.shift();

                                if(new Date(oShift.xAxis).Format() === self.compareData.left.time) {
                                    // 若左侧删除，保留右侧数据。
                                    if(self.markLine[0].xAxis > self.markLine[1].xAxis) {
                                        // 若新增的数据小于右侧的数据。
                                        self.compareData.left = oTooltipData;
                                    }else {
                                        // 若新增的数据大于右侧的数据。
                                        self.compareData.left = Object.assign({}, self.compareData.right)
                                        self.compareData.right = oTooltipData;          
                                    }
                                }else {
                                    // 若右侧删除，保留左侧数据。
                                    if(self.markLine[0].xAxis < self.markLine[1].xAxis) {
                                        // 若新增的数据大于左侧的数据。
                                        self.compareData.right = oTooltipData;
                                    }else {
                                        // 若新增的数据小于左侧的数据。
                                        self.compareData.right = Object.assign({}, self.compareData.left)
                                        self.compareData.left = oTooltipData;          
                                    }
                                }
                            }
                            
                            
                            self.chart.setOption({
                                series: [{
                                    name: CHART_STATE_NAME,//params.seriesName,
                                    markLine: {
                                        symbol: ['circle','arrow'],
                                        symbolSize: [8, 12],
                                        label: {
                                            normal: {
                                                formatter: function({value}){
                                                    return new Date(value).Format()
                                                }
                                            },
                                            emphasis: {
                                                formatter: function({value}){
                                                    return new Date(value).Format()
                                                }
                                            }
                                        },
                                        lineStyle: {
                                            normal: {
                                                type: 'solid'
                                            }
                                        },
                                        data: self.markLine
                                    }
                                }]
                            })
                        }
                    }else if(params.componentType=="markLine") {
                        // 若为标记线。
                        let nIndex = 0;
                        self.markLine.map((o,index) => o.xAxis === params.value?(nIndex = index):'')
                        let oMark = self.markLine.splice(nIndex, 1)[0];
                        // 删除提示框数据。
                        let sTime = new Date(oMark.xAxis).Format();
                        ["left", "right"].forEach(position => {
                            if(self.compareData[position].time === sTime) {
                                self.compareData[position].time = "";
                                self.compareData[position].list = [];
                            }
                        })
   
                        self.chart.setOption({
                            series: [{
                                name: CHART_STATE_NAME,//params.seriesName,
                                markLine: {
                                    data: self.markLine
                                }
                            }]
                        });
                    }else if(params.componentType=="yAxis") {
                        // 若为y轴。
                        let sEquipment = params.value,
                            aValue = sEquipment.split("+"),
                            sName = aValue[0],
                            sId = aValue[1],
                            nSelected = Number(aValue[2]);

                        if(nSelected) {
                            // 若已经选中，则取消选中。
                            self.selectedEquipment = '';
                            self.categories = self.categories.map(o => {                              
                                if(sEquipment === o.value) {
                                    o.value = o.value.slice(0,-1)+0;
                                }
                                return o;
                            })

                        }else {
                            // 若未选中，则选中。
                            self.selectedEquipment = sId;
                            self.categories = self.categories.map(o => {
                                if(sEquipment === o.value) {
                                    o.value = o.value.slice(0,-1)+1;
                                }else {
                                    o.value = o.value.slice(0,-1)+0;
                                }
                                return o;
                            })
                        }
                        self.chart.setOption({
                            yAxis: {
                                data: self.categories
                            }
                        })
                        
                    }
                })
            },

            /**
			 * 跳转按钮点击事件。
			 * @param {Object} oData
			 * @return {void}
			 */
			listButtonClick(oData) {
				if(oData.router) {				
					let oQuery = this.getParamter(oData.query);
					
					this.$router.push({path: oData.router, query: oQuery});
				}

				if(oData.cpt) {
					let oParam = this.getParamter(oData.parameter),
						sPath = sFineReportUrl + oData.cpt;

					oData.parameter.forEach(p => {
						if(oParam[p]) {
							sPath += "&" + p + "=" + oParam[p]
						}						
					});
					window.open(sPath , "_blank");
				}
			},

            /**
			 * @param {Array}
			 * @return {Object}
			 */
			getParamter (aQuery) {
				let oParam = {};
				aQuery.forEach(param => {
					switch (param) {
						case "equipmentIdList":
							oParam[param] = this.selectedEquipment;
							break;
						case "equipmentId": 
							oParam[param] = this.selectedEquipment;
							break;
						case "startTime":
							oParam[param] = this.datetime.start;
							break;
						case "endTime":
							oParam[param] = this.datetime.end;
							break;
						case "processCode":
							oParam[param] = this.process;
							break;
						default:;
					}
				})
				return oParam;
			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param,fnSu,fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(bRight != "0") {
					// 提示信息。
					this.sErrorMessage = "暂无数据";
					console.log(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}else {
					// 调用成功后的回调函数。
					fnSu && fnSu();
				}
			},
			// 显示提示信息。
			showMessage() {
				this.$message({
					message: this.sErrorMessage,
					duration: 3000
				});
			},
			// 获取设备所有数据。
			fetchAllData() {
				this.loading = true;	
                this.sErrorMessage = "";
				// setTimeout(() => {
				// 	this.loading = false;
					
				// 	this.eventData = Object.assign({}, this.oTest);;
				// 	["1", "2", "3", "4", "5", "6"].forEach(type => this.formatEquipmentData(type, this.eventData[type]));
					
				// }, 1000)	
				
				this.$post(this.url, {
					equipmentIdList: this.equipments.reduce((prev, curr)=>[...prev, curr.equipmentId], []).join(','),
					startTime: this.datetime.start,
					endTime: this.datetime.end,
					type: 0
				})
				.then((res) => {
					this.loading = false;
                    this.categories = [];
					this.judgeLoaderHandler(res, () => {
						// 保存数据。		
						let aoData = res.data.data;

						if(!aoData.length) {
							return;
						}
                        
                        aoData.forEach(o => {
                            this.categories.push({
                                id: o.equipmentId,
                                value: `${o.equipmentName}+${o.equipmentId}+0`
                            })
                            let oData = this.equipmentData[o.equipmentId];
                            if(oData) {
                                Object.assign(oData, {
                                    // 状态
                                    status: o.equipStatusList||[],
                                    // 加工
                                    work: {
                                        startWorkList: o.startWorkList||[],
                                        finishWorkList: o.finishWorkList||[],
                                        poolInList: o.poolInList||[],
                                        poolOutList: o.poolOutList||[]
                                    },
                                    // 质量
                                    quality: {
                                        qcList: o.qcList||[],
							            submitQcList: o.submitQcList||[]
                                    },
                                    // 事件
                                    event: {
                                        startEquipWarningList: o.startEquipWarningList||[],
							            endEquipWarningList: o.endEquipWarningList||[]
                                    },
                                    // 维护
                                    repair: {
                                        spotCheckList: o.spotCheckList||[],
							            startEquipRepairList: o.startEquipRepairList||[],
							            endEquipRepairList: o.endEquipRepairList||[]
                                    },
                                    // 工具
                                    tool: {
                                        installToolList: o.installToolList||[],
							            removeToolList: o.removeToolList||[]
                                    }
                                });                           
                            }                        
                        })	

                        this.setChartData();		
					});
				})
				.catch((err) => {
					this.loading = false;
				 	this.sErrorMessage = "暂无数据";
					console.log("查询出错");
				})
			},
            // 设置图形数据。
            setChartData () {
                
                // 设备状态。
                this.option.series.filter(o => o.name=="状态")[0].data = this.getStatusData();
                // 获取各事件维度数据。
                this.dimension.forEach(item => {
                    let oFilter = this.option.series.filter(o => o.name==item.name)[0];
                    let oResult = this.getDimensionData(item.key);
                    oFilter.data = oResult
                })
    
                this.chart.setOption(this.option, true);
            },
            // 获取数组顺序。
            getIndex (arr, key, value) {
                for(let i = 0, l = arr.length; i < l; i++) {
                    if(arr[i][key] === value) {
                        return i;
                    }
                }
              
            },
            // 获取提示数据。
            getToolTipData (key, o) {
                
                let oResult = {
                        groupId: o.groupId
                    },
                    sTitle = "";
                switch (key) {
                        // 开始加工
                    case "startWorkList": 
                        oResult.time = +new Date(o.happenTime);
                        
                        oResult.title = "加工";
                        oResult.tooltipData = [
                            {name: "开始时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},
                            {name: "工单号", value: o.doCode},
                            {name: "工序", value: o.processName}
                        ];                                
                        break;
                        // 完工
                    case "finishWorkList":
                        oResult.time = +new Date(o.happenTime);
                        oResult.title = "完工";
                        oResult.tooltipData = [
                            {name: "完工时间", value: o.happenTime},
                            {name: "操作人", value: o.personName}
                        ];  
                        break;   
                        // 投料
                    case "poolInList": 
                        oResult.time = +new Date(o.happenTime);
                        oResult.title = "投料";
                        oResult.tooltipData = [
                            {name: "开始时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},
                            {name: "工单号", value: o.doCode},
                            {name: "物料", value: o.materialName},
                            {name: "批次", value: o.batchNo},
                            {name: "数量", value: o.quantity}
                        ];
                        break;
                        // 产出
                    case "poolOutList":
                        oResult.time = +new Date(o.happenTime);
                        oResult.title = "产出";
                        oResult.tooltipData = [
                            {name: "产出时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},
                            {name: "工单号", value: o.doCode},
                            {name: "物料", value: o.materialName},
                            {name: "批次", value: o.batchNo},
                            {name: "数量", value: o.quantity}
                        ];
                        break;
                        // 质检
                    case "qcList": 
                        oResult.time = +new Date(o.startTime);
                        oResult.title = "质检";
                        oResult.tooltipData = [
                            {name: "质检时间", value: o.startTime},
                            {name: "操作人", value: o.personName},
                            {name: "三检类型", value: o.method},
                            {name: "质检结果", value: o.result}
                        ];
                        break;
                        // 送检
                    case "submitQcList":
                        oResult.time = +new Date(o.happenTime);
                        oResult.title = "送检";
                        oResult.tooltipData = [
                            {name: "送检时间", value: o.happenTime},
                            {name: "检验人", value: o.checkPersonName},
                            {name: "工单号", value: o.doCode},
                            {name: "物料", value: o.materialName},
                            {name: "批次", value: o.batchNo},
                            {name: "送检结果", value: o.result}
                        ];
                        break;   
                        // 事件开始
                    case "startEquipWarningList": 
                        oResult.time = +new Date(o.startTime);
                        oResult.title = "事件开始";
                        oResult.tooltipData = [
                            {name: "发生时间", value: o.startTime},
                            {name: "上报时间", value: o.reportTime},
                            {name: "上报人", value: o.reportName},
                            {name: "事件类型", value: o.eventType},
                            {name: "事件原因", value: o.reason},
                            {name: "状态", value: o.status}
                        ];
                        break;
                        // 事件结束
                    case "endEquipWarningList":
                        oResult.time = +new Date(o.endTime);
                        oResult.title = "事件结束";
                        oResult.tooltipData = [
                            {name: "结束时间", value: o.endTime}
                        ];
                        break; 
                        // 设备点检
                    case "spotCheckList": 
                        oResult.time = +new Date(o.happenTime);
                        oResult.title = "设备点检";
                        oResult.tooltipData = [
                            {name: "发生时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},                                       
                            {name: "点检结果", value: o.result}
                        ];
                        break;
                        // 设备维护开始                                
                    case "startEquipRepairList":
                        oResult.time = +new Date(o.startTime);
                        oResult.title = "设备维护开始";
                        oResult.tooltipData = [
                            {name: "开始时间", value: o.startTime},
                            {name: "操作人", value: o.personName},                                       
                            {name: "维护原因", value: o.reason}
                        ];
                        break; 
                        // 设备维护结束  
                    case "endEquipRepairList":
                        oResult.time = +new Date(o.endTime);
                        oResult.title = "设备维护结束";
                        oResult.tooltipData = [
                            {name: "结束时间", value: o.endTime}
                        ]; 
                        break;
                        // 上刀/模具
                    case "installToolList":
                        oResult.time = +new Date(o.happenTime);
                        if(o.toolType == "刀具") {
                            sTitle = "上刀";
                        }else {
                            sTitle = "上模";
                        }
                        oResult.title = sTitle;
                        oResult.tooltipData = [
                            {name: "发生时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},                                       
                            {name: "工具类型", value: o.toolType},
                            {name: "工具编码", value: o.toolCode},
                            {name: "原因", value: o.reason}
                        ];
                        break;
                        // 下刀/模具
                    case "removeToolList": 
                        oResult.time = +new Date(o.happenTime);
                        if(o.toolType == "刀具") {
                            sTitle = "上刀";
                        }else {
                            sTitle = "上模";
                        }
                        oResult.title = sTitle;
                        oResult.tooltipData = [
                            {name: "发生时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},                                       
                            {name: "工具类型", value: o.toolType},
                            {name: "工具编码", value: o.toolCode},
                            {name: "原因", value: o.reason}
                        ];
                        break;
                    default:;
                }
                return oResult;
            },

            // 获取事件维度数据。
            getDimensionData (sDimension) {
                let aoData = [],
                    oMap = {};
                this.equipments.forEach((item, index) => {
                    // 拿到维度数据。
                    let singleData = this.equipmentData[item.equipmentId][sDimension], 
                    // y轴设备顺序。                  
                        nIndex = this.getIndex(this.categories, "id", item.equipmentId);

                    if(nIndex == null) {
                        return;
                    }
     
                    for(let key in singleData) {
                        // 事件列表。
                        let aoList = singleData[key];

                        aoList.forEach((o,n) => {
                            // 拼接scatter数据。[x, y, value, tooltip-data]
                            let oData = this.getToolTipData(key, o),
                                sKey = oData.time + '' + nIndex;
                            if(oMap[sKey]) {
                                // 若存在。
                                oMap[sKey]++                          
                                let oFilter = aoData.filter(aData => aData[0]===oData.time&&aData[1]===nIndex)[0];
                                oFilter[2]++;
                                oFilter[3].push(oData);
                            }else {
                                oMap[sKey] = 1;
                                
                                // 增加节点。
                                aoData.push([
                                    oData.time,
                                    nIndex,
                                    1,
                                    [oData]
                                ])
                            }                          
                        }) 
                    }

                })

                return aoData;
            },
            // 获取设备状态。
            getStatusData () {
                let aoData = [];
                this.equipments.forEach((item, index) => {
                    
                    // 拿到状态数据。
                    let singleData = this.equipmentData[item.equipmentId].status;

                    if(!singleData.length) {
                        // 若无数据
                        aoData.push({
                            name: '',
                            value: [
                                index,
                                +new Date(this.datetime.start),
                                +new Date(this.datetime.end),
                                +new Date(this.datetime.end) - +new Date(this.datetime.start),
                                this.datetime.start,
                                this.datetime.end
                            ],
                            itemStyle: {
                                normal: {
                                    color: '#dedede'
                                }
                            }
                        });    
                    }else {
                        singleData.map(o => {
                            let oState = this.states.filter(state => state.key === o.type)[0];
                            aoData.push({
                                name: oState.name,
                                value: [
                                    index,
                                    +new Date(o.startTime),
                                    +new Date(o.endTime),
                                    +new Date(o.endTime) - +new Date(o.startTime),
                                    o.startTime,
                                    o.endTime
                                ],
                                itemStyle: {
                                    normal: {
                                        color: oState.color
                                    }
                                }
                            });        
                        })
                    }
                    
                })

                return aoData;
            },
			// 保存开始时间。
			saveStart () {
				this.datetime.start = new Date(this.datetime.start).Format();
				this.datetime.initStart = this.datetime.start;
				this.startIf=true;

				this.refreshData();
			},
			// 取消保存开始时间。
			cancelStart () {
				this.datetime.start = this.datetime.initStart;
				this.startIf=true;
			},
			// 保存结束时间。
			saveEnd () {
				this.datetime.end = new Date(this.datetime.end).Format();
				this.datetime.initEnd = this.datetime.end;
				this.endIf=true;

				this.refreshData();
			},
			// 取消保存结束时间。
			cancelEnd () {
				this.datetime.end = this.datetime.initEnd;
				this.endIf=true;
			},
			
			/**
			 * 数据刷新。
			 * @return {void}
			 */
			refreshData () {
				
				this.fetchAllData();
				
			},
            // 数据提示。
            tooltipFormatter (params) {
                // 保存提示框数据。
                
                this.axisTooltipData = params;
                
                let sHtml = "";
                params.forEach(param => {
                    let aoValue = param.value,
                        sList = "";
                    // 事件列表
                    aoValue[3].forEach(o => {
                        sList += `<div style="color:${param.color}">${o.title}</div>`;
                        o.tooltipData.forEach(tip => {
                            sList += `<div><span>${tip.name}:&nbsp;&nbsp;${this.parseData(tip.value)}<span></div>`                
                        })
                    })
                    // 设备列表
                    sHtml += `<div style="margin-top:10px">
                        <div style="color:${param.color};font-weight:bold">${param.name.split("+")[0]}&nbsp;&nbsp;&nbsp;&nbsp;${param.seriesName}&nbsp;&nbsp;&nbsp;&nbsp;${aoValue[2]}</div>
                        <div style="margin-top:10px">${sList}</div>
                    </div>`

                })
                return sHtml;             
            },
            parseData(value) {
                if(value == null) {
                    return "-";
                }else {
                    return value;
                }
            },
            // 渲染函数。
            renderItem(params, api) {
                // 对于 data 中的每个 dataItem，都会调用这个 renderItem 函数。
                // （但是注意，并不一定是按照 data 的顺序调用）

                // 这里进行一些处理，例如，坐标转换。
                // 这里使用 api.value(0) 取出当前 dataItem 中第一个维度的数值。
                var categoryIndex = api.value(0);
                // 这里使用 api.coord(...) 将数值在当前坐标系中转换成为屏幕上的点的像素值。
                var startPoint = api.coord([api.value(1), categoryIndex]);
                var endPoint = api.coord([api.value(2), categoryIndex]);
                // 这里使用 api.size(...) 获得 Y 轴上数值范围为 1 的一段所对应的像素长度。
                var height = 14;//api.size([0, 1])[1] * 0.6

                // 这里返回为这个 dataItem 构建的图形元素定义。
                return {
                    // 表示这个图形元素是矩形。还可以是 'circle', 'sector', 'polygon' 等等。
                    type: 'rect',
                    // shape 属性描述了这个矩形的像素位置和大小。
                    // 其中特殊得用到了 echarts.graphic.clipRectByRect，意思是，
                    // 如果矩形超出了当前坐标系的包围盒，则剪裁这个矩形。
                    shape: this.$echarts.graphic.clipRectByRect({
                        // 矩形的位置和大小。
                        x: startPoint[0],
                        y: startPoint[1] - height / 2,
                        width: endPoint[0] - startPoint[0],
                        height: height
                    }, {
                        // 当前坐标系的包围盒。
                        x: params.coordSys.x,
                        y: params.coordSys.y,
                        width: params.coordSys.width,
                        height: params.coordSys.height
                    }),
                    // 用 api.style(...) 得到默认的样式设置。这个样式设置包含了
                    // option 中 itemStyle 的配置和视觉映射得到的颜色。
                    style: api.style()
                };
            }
        }
    }  
</script>

<style lang="less">   
    @import "../../assets/css/base.less";

    .item-color(@color) {
        &.item {
            font-size: 12px;
            vertical-align: top;
            border-left: 1px solid @color;
            text-align: left;
            padding-top: 10px;
            padding-right: 2px;
            width: 58px;
            box-sizing: border-box;
            display: inline-block;

            div {
                border-right: 1px solid @color;
                border-top: 1px solid @color;
                padding: 2px;
                cursor: pointer;

                &:last-child {
                    border-bottom: 1px solid @color;
                }
                &:hover {
                    color: #fff;
                    background-color: @color;
                }
            }
        }     
    }

	.material-stock  {	  	
    	.content-list {
			// padding-top: 30px;
            position: relative;

            .tooltip {
                padding: 10px 20px;
                background-color: rgba(44,52,60,0.7);
                border-color: #ccc;
                border-width: 2px;
                border-radius: 4px;
                font-size: 12px;
                position: absolute;
                top: 60px;
                width: 200px;
                z-index: 100;
                color: #fff;
                overflow-y: auto;

                &.left {
                    left: 0;
                }
                &.right {
                    right: 0;
                }

                .tooltip-time {
                    // color: #D53A35;
                    font-size: 14px;
                    // font-weight: bold;
                    padding-bottom: 5px;
                }

                .content-list {
                    padding-left: 10px;

                    li {
                        padding: 2px 0;
                    }
                }

                .tooltip-title {
                    font-weight: bold;
                    font-size: 14px;
                    padding-bottom: 5px;
                }

            }

            .links {
                position: absolute;
                top: 18px;
                right: 50px;
                width: 300px;
                // text-align: center;
                font-size: 0;

                .work {
                    .item-color(@work)
                }
                .quality {
                    .item-color(@quality)
                }
                .event {
                    .item-color(@event)
                }
                .repair {
                    .item-color(@repair)
                }
                .tool {
                    .item-color(@tool)
                }
            }

            .setting {
                position: absolute;
                bottom: 0px;
                height: 20px;
                line-height: 20px;
                width: 100%;
                font-size: 12px;

                .start,.end {
                    width: 166px;
                    text-align: center;
                    cursor: pointer;
                }
                .start {
                    float: left;
                    margin-left: 40px;
                }
                .end {
                    float: right;
                    margin-right: 40px;
                }
                .edit {
                    position: relative;

                    .edit-icon {
                        position: absolute;
                        right: -40px;
                        top: 0;
                        i {
                            cursor: pointer;
                            color: #bfd9d4;
                            &:hover {
                                color: #42af8f;
                            }
                        }
                        i + i {
                            margin-left: 5px;
                        }
                    }
                }
                .el-input__inner {
                    height: 20px;
                    border-radius: 0;
                    font-size: 12px;
                }

            }
    	}
    }
</style>
