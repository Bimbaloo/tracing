<!--设备-->
<template>
    <div class="content-list" v-loading="loading" element-loading-text="拼命加载中">
        <div v-if="sErrorMessage" class="error">{{sErrorMessage}}</div>
		<div v-else class="analysis">
            <div id="equipments" :style="{height: panelHeight + 'px'}"></div>
            <div class="legend" v-if="!loading">
                <span v-for="state in states" :key="state.key" :style="{backgroundColor: state.color}">{{state.name}}</span>
            </div>
            <div class="selected-info" v-if="!loading">
                <div v-if="selectedEquipment">选中设备：{{this.equipments.filter(o => o.equipmentId == this.selectedEquipment)[0].equipmentName}}</div>
                <div>选中时间范围：{{datetime.realStart}}~{{datetime.realEnd}}</div>
            </div>
            <!--div @click="parameterButtonClick" class="parameter" v-if="selectedEquipment&&!loading" :style="{right: (legendRight+300) + 'px'}">
                <span class="icon icon-circle"></span><span>工艺</span>
            </div-->
            <div class="switch" v-if="!loading">
                <div v-if="show" @click="hideTooltip" class="switch-eye">
                    <i class="icon icon-16 icon-show"></i>
                    <div class="tip">隐藏悬浮框</div>
                </div>
                <div v-else @click="showTooltip" class="switch-eye">
                    <i class="icon icon-16 icon-hide"></i>
                    <div class="tip">显示悬浮框</div>
                </div>
            </div> 
            <!--各维度链接跳转按钮-->
            <div class="links" v-if="selectedEquipment&&!loading" :style="{right: (legendRight-10) + 'px'}">
                <div v-for="obj in dimension" :key="obj.type" :class="[obj.key, 'item', {'no-border':obj.list.length?false:true}]">
                    <div v-for="(item,index) in obj.list" @click="listButtonClick(item)" :key="index">{{item.name}}</div>
                </div>	
            </div>
            <div class="setting clear" v-if="!loading&&process">
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
            <div class="buttons" v-if="selectedEquipment&&!loading">
                <el-button  @click="showSuspiciousList" class="btn btn-plain" >可疑品</el-button>
                <el-button  @click="gotoTrack" class="btn btn-plain" v-if="trace">追踪</el-button>
            </div>	
            <!--提示面板数据-->
            <div class="tooltip-wrapper" :style="{width: chartWidth+'px', margin: grid[0] + 'px ' + grid[1] + 'px ' + grid[2] + 'px ' + grid[3] + 'px'}">
                <!--div class="tooltip-scroll" :style="{width:ratioW*100+'%', height:'100%', left:ratioL*100+'%'}"-->
                    <div v-for="compareData in compareList" 
                        :key="compareData.millisecond"              
                        @mouseenter="tooltipPanelMouseenterHandle(compareData.millisecond)" >
                        
                        <div class="tooltip-panel" :style="{left:compareData.left*100+'%', top: panelTop+'px', zIndex: compareData.zIndex}">
                            <!--div class="tooltip-time">{{compareData.time}}</div-->
                            <i class="btn-close el-icon-circle-close" @click="tooltipPanelClickHandle(compareData.millisecond)" ></i>
                            <div class="tooltip-list" v-for="(equipment,index) in compareData.list" :key="index" :style="{maxHeight: chartHeight*0.8 + 'px'}">
                                <div class="tooltip-title" :style="{color: equipment.color}">{{equipment.name}}&nbsp;&nbsp;{{equipment.series}}&nbsp;&nbsp;{{equipment.quantity}}</div>
                                <ul class="event-list">
                                    <li v-for="(event,index) in equipment.event" :key="index">
                                        <div :style="{color: equipment.color}">{{index+1}}.{{event.title}}&nbsp;&nbsp;<span v-if="event.group">事件组：{{event.group}}</span></div>
                                        <ul class="content-list">
                                            <li v-for="(content,index) in event.content" :key="index">
                                                {{content.name}}:&nbsp;&nbsp;{{content.value}}
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                
                            </div>
                            
                        </div>
                        <div class="line" :style="{left:compareData.left*100+'%', top: panelTop+'px', height: chartHeight + 'px', zIndex: compareData.zIndex}"></div>
                    </div>

                <!--/div-->
            </div> 
        </div>        		 
    </div>      
</template>

<script>
	import DateTime from 'components/basic/dateTime.vue'
    import $ from 'jquery'

    // 设备状态。
    const CHART_STATE_NAME = "状态"
    // 图形下margin。
    const CHART_MARGIN_BOTTOM = 20
    // tooltip距离鼠标的水平位置。
    const TOOLTIP_X_DISTANCE = 10
    // 悬浮框最小高度。
    const TOOLTIP_MIN_HEIGHT = 20
    // legend距右侧的距离。
    const LEGEND_RIGHT = 140
    // grid边距。
    const GRID_LEFT = 140
    const GRID_RIGHT = 140
    const GRID_TOP = 60
    const GRID_BOTTOM = 60
    // y轴标签换行的字符个数
    const Y_LABEL_LENGTH = 11
    // 标记线点的大小。
    const MARKLINE_SYSMBOL_SIZE = 8
    // 提示框面板z轴。
    const TOOLTIP_Z_INDEX = 100
    // finereport跳转地址。
    const sFineReportUrl = FINE_REPORT_HOST + "/WebReport/ReportServer?reportlet="
    // 设备分析接口地址。
    const EQUIPMENTS_EVENTS_URL = HOST + "/api/v1/trace/equipments-events"

    export default {
		props: {
			equipmentsId: {
                required: false,
            	type: Array
            },
            equipmentsCode: {
                required: false,
            	type: Object
            },
			datetime: Object,
            process: {
                required: false,
            	type: String
            }
		},
		components: {
			'v-datetime': DateTime
		},
        data () {
            return {
                equipments: [],
                // 判断是否为遏制页面。
                bRestrain: location.pathname.indexOf("restrain") > -1,
                // legend距右侧的距离。
                legendRight: LEGEND_RIGHT,
                // grid边距。
                grid: [GRID_TOP, GRID_RIGHT, GRID_BOTTOM, GRID_LEFT],
                // 判断是否为溯源页。
                trace: location.pathname.indexOf('traceIndex') > -1,
                // 悬浮框是否展示。
                show: true,
                // 选中的设备id。
                selectedEquipment: "",
				loading: false,
				sErrorMessage: "",
                url: EQUIPMENTS_EVENTS_URL,	
				// 比例。
                ratioW: 1,
                ratioL: 0,
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
                // 图形区域高
                panelHeight: 100,　
                // 提示框区域宽高
                chartHeight: 60,
                chartWidth: 60,
                markLine: [],
                // 提示框top。
                panelTop:　MARKLINE_SYSMBOL_SIZE/2,
                // 提示框数据。
                compareList: [],
                // 设备id列表。
                // {
                // value: o.equipmentName+ '+' + o.equipmentId + '+' + 0, // 最后一位代表是否选中这台设备
                // id: o.equipmentId
                // }
                categories: [],
                axisTooltipData: [],
                // 高亮的节点。
                highlightedData: null,
                // 只展示与起点相关的投产数据。
                onlyShowRelatedData: true,
				dimension: [{
					name: "工艺",
                    key: "parameter",
					type: "0",
                    color: "#FAC41B",
                    list: [{
						name: "工艺参数",
                        router: "",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  
                    }]
				}, {
					name: "质量",
                    key: "quality",
					type: "3",
                    color: "#d89add",
                    list: [{
						name: "质检",
						// cpt: "/QTReport.cpt",
                        // parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                        router: "/process/qtReport",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    },{
						name: "送检",
						// cpt: "/QCReport.cpt",
                        // parameter: ["equipmentId", "startTime", "endTime", "processCode"]  
                        router: "/process/qcReport",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    },{
						name: "FGB",
						// cpt: "/FGBReport.cpt&__bypagesize__=false",
                        // parameter: ["equipmentId", "startTime", "endTime", "processCode"]
                        // router: "/process/fgbReport",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]    

                    }]
				}, {
					name: "工单",
                    key: "work",
					type: "2",
                    color: "#66bc84",
                    list: []
				}, {
					name: "投产",
                    key: "pool",
					type: "7",
                    color: "#00a5a7",
                    list: [{
						name: "投产表",
						router: "/process/product",
						query: ["equipmentName", "equipmentIdList", "startTime", "endTime", "shiftStartTime", "shiftEndTime", "processCode"]  
                    }]
				}, {
					name: "事件",
                    key: "event",
					type: "4",
                    color: "#f9823e",
                    list: [{
						name: "事件记录",
						router: "/process/event",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
				}, {
					name: "维护",
                    key: "repair",
					type: "5",
                    color: "#5aa7c5",
                    list: [{
						name: "维护记录",
						router: "/process/repair",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
				}, {
					name: "工具",
                    key: "tool",
					type: "6",
                    color: "#86cccc",
                    list: [{
						name: "工具记录",
					//	router: "/process/tool",
						query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
				}]
            }
        },
        computed: {
			rawData () {
		    	return this.$store && this.$store.state.rawData
		  	},
			resize () {
		    	return this.$store && this.$store.state.resize
		    },
			resizeY () {
				return this.$store && this.$store.state.resizeY
			},
			fullscreen () {
				// 是否全屏
		    	return this.$store && this.$store.state.fullscreen
		    },
            option () {
                let oData = {
                    legend: {
                        data: this.dimension.map(o=>o.name),
                        // itemWidth: ,
                        // itemGap: 40,
                        // width: 320,
                        right: LEGEND_RIGHT,
                        align: 'left' 
                        // padding: [
                        //     5,  // 上
                        //     10, // 右
                        //     5,  // 下
                        //     10, // 左
                        // ]
                    },
                    grid:{
                        left: GRID_LEFT,
                        right: GRID_RIGHT,
                        top: GRID_TOP,
                        bottom: GRID_BOTTOM
                    },
                    // 悬浮框。
                    tooltip: {
                        trigger: 'none',
                        // padding: 10,
                        backgroundColor: 'rgba(245, 245, 245, 0.8)',//'rgba(44,52,60,0.7)',
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 4,
                        transitionDuration: 0,
                        // 鼠标是否可进入悬浮框。
                        enterable: true,
                        // show: function (value, index) {
                        //     console.log(arguments)

                        //     return true
                        // },
                        textStyle: {
                            fontSize: 12,
                            color: '#000'
                        },
                        show: this.show,
                        formatter: this.tooltipFormatter,
                        position: (pos, params, el, elRect, size) => {
                            if(this.markLine.filter(o => o.xAxis == params[0].axisValue).length) {
                                // 若该提示数据已存在。
                                // 隐藏tooltip
                                return {
                                    left: -1000
                                }
                            }

                            if(pos[1] > this.chart.getHeight()/3) {
                                // 若鼠标位置在下半部分,将悬浮框靠近上面显示。
                                pos[1] = 0;
                            }else {
                                // 若鼠标位置在上半部分,将悬浮框靠近下面显示。
                                pos[1] = size.viewSize[1]-size.contentSize[1];
                            }
                            pos[0] = pos[0] + TOOLTIP_X_DISTANCE;
                            
                            if(pos[0] + size.contentSize[0] > size.viewSize[0]) {
                                // 若超出x轴范围
                                pos[0] = pos[0] - TOOLTIP_X_DISTANCE*2 - size.contentSize[0]
                            }
                            // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 60;
                            // obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 20;

                            return pos;                            
                        },
                        extraCssText: 'max-height:200px;overflow-y:auto'
                    },    
                    // 缩放轴。         
                    dataZoom: [{
                        // x轴滚轮缩放。
                        type: 'inside',
                        filterMode: 'weakFilter',
                        xAxisIndex: [0]
                    }],
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
                                    i = 0,
                                    l = Math.floor(sValue.length/Y_LABEL_LENGTH);
                                // 设置大于10个字符换行。
                                for(; i < l; i++) {
                                    aValue.push(sValue.substr(i*Y_LABEL_LENGTH, Y_LABEL_LENGTH))                                    
                                }
                                let nLeft = sValue.length - i*Y_LABEL_LENGTH;
                                if(nLeft > 0) {
                                    aValue.push(sValue.substr(i*Y_LABEL_LENGTH, nLeft))
                                }
                                
                                return aValue.join("\n");
                            }
                        } 
                        
                    },
                    // 工具箱
                    toolbox: {
                        top: -3,
                        right: 30,
                        feature: {
                             dataZoom: {
                                yAxisIndex: 'none'
                            },
                        },
                        iconStyle: {
                            emphasis: {
                                borderColor: '#42AF8F',
                            }
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
                        // 标记线。
                        markLine: {
                            symbol: 'circle',//['circle', 'arrow']
                            symbolSize: MARKLINE_SYSMBOL_SIZE,
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
                            data: [],
                            animation: false
                        },
                        tooltip: {
                            trigger: 'item',
                            padding: 10,
                            formatter: function (params) {
                                let time = params.value[3]/1000,    
                                    hour = 0,
                                    munite = 0,
                                    second = 0;
                                
                                if(time/3600 >= 1) {
                                    hour = Math.floor(time/3600);
                                }

                                if(time/60 >=1) {
                                    munite = Math.floor(time%3600/60);
                                }

                                second = time%60;
                                
                                if(hour) {
                                    time = hour+"h"+munite+"\'"+second+"\'\'"
                                }else if(munite) {
                                    time = munite+"\'"+second+"\'\'"
                                }else {
                                    time = second+"\'\'"
                                }
                                
                                return `${params.marker}${params.name}：${time}<br/>
                                    ${params.value[4]}<br/>
                                    ${params.value[5]}`;
                            },
                            // 设置显示位置。
                            position: (pos, params, el, elRect, size) => {       
                                pos[0] = pos[0] + TOOLTIP_X_DISTANCE;
                                
                                if(pos[0] + size.contentSize[0] > size.viewSize[0]) {
                                    // 若超出x轴范围
                                    pos[0] = pos[0] - TOOLTIP_X_DISTANCE*2 - size.contentSize[0]
                                }

                                return pos;                            
                            },
                            extraCssText: 'height:auto;'
                        }               
                    }]
                };
                // 设置维度。
                this.dimension.forEach(o => oData.series.push({
                    name: o.name,
                    type: 'scatter',
                    symbol: 'circle', //'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'               
                    symbolSize: 14,
                    // 标注点。
                    markPoint: {
                        symbol: 'arrow', //'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'  
                        symbolSize: [8,14],
                        symbolOffset: [0, '50%'],
                        label: {
                            normal: {
                                show: false
                            }
                        },             
                        data: [],
                        itemStyle: {
                            normal: {
                                color: "#D53A35"
                            }
                        }
                    },
                    data: [],
                    animationDelay: function(idx) {
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
                                if(typeof value[2] === "object") {
                                    return value[2].value
                                }
                                return value[2];     
                            },
                            textStyle: {
                                fontSize: 14
                            }
                        }
                    }
                }))

                let oAxis = {
                    type: 'slider',
                    // 让 dataItem 部分超出坐标系边界的时候，不会整体被过滤掉。
                    filterMode: 'weakFilter',
                    // show: true,
                    // 展示图像缩略轴。
                    showDataShadow: true,
                    // top: 400,
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
                    showDataShadow: false
                }

                // 添加x轴缩放。
                oData.dataZoom.push(Object.assign({
                    xAxisIndex: [0],
                    height: 16,
                    labelFormatter: function(value) {
                        return new Date(value).Format()
                    }
                },oAxis))

                if(this.equipments.length > 1) {
                    // 若大于一台设备。
                    // 添加y轴缩放。
                    oData.dataZoom.push(Object.assign({
                        yAxisIndex: [0],
                        width: 16,
                        labelFormatter: function(index, value) {
                            return value.split("+")[0]
                        },
                        right: 50
                    },oAxis))
                }

                // 为缩放轴添加开始时间结束时间。
                if(this.datetime.realStart) {
                    oData.dataZoom[0].startValue = +new Date(this.datetime.realStart)
                }
                if(this.datetime.realEnd) {
                    oData.dataZoom[0].endValue = +new Date(this.datetime.realEnd)
                }

                if(!this.bRestrain) {
                    // 若不为遏制页面。
                    oData.graphic = [{
                        type: 'group',
                        id: 'group',
                        cursor: "pointer",
                        children: [{
                            // 箭头。
                            type: 'polygon',
                            id: 'polygon',
                            cursor: "pointer",
                            shape: {
                                points:[[5, 0], [10, 14], [5, 10], [0,14]],
                                
                            },
                            style: {
                                fill: "#D53A35",
                                lineWidth: 1,
                                stroke: "#D53A35"
                            },
                            left: 0,
                            top: 0
                        },{
                            // 文字。
                            type: 'text',
                            id: 'text',
                            cursor: "pointer",
                            style: {
                                text: "追溯相关投产",
                                fill: this.onlyShowRelatedData ? "#D53A35":"#333"
                            },
                            left: 15,
                            top: 0
                        }],     
                        left: '40%',
                        top: 5,
                        width: 100,
                        height: 20,
                        onclick: this.changePoolInAndOutVisibility
                    }]
                }

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
                debugger
                // 初始化图形。              
				this.setInitData();
                // 获取所有数据。
                this.fetchAllData();
				// 添加事件监听。
                this.addEvent();
			},
			// 初始化数据。
			setInitData() {		
				this.startIf = true;
				this.endIf = true;
		
                if(!this.bRestrain) {
                    this.equipments = this.equipmentsId
                }else {
                    this.equipments = []
                }			
				// let oData = {};
				// this.equipments.forEach(o => {
				// 	let sId = o.equipmentId;
				// 	oData[sId] = {			
				// 		status: []
				// 	}
                //     // 添加事件维度数据。
                //     this.dimension.forEach(d => oData[sId][d.key] = {})
				// })	
				// this.equipmentData = oData;
                
                this.initChart();
			},
            // 初始化图表。
            initChart() {
                this.setChartHeight();

                if(!this.chart) {
                    this.chart = this.$echarts.init(document.getElementById('equipments'));
                    this.setChartEvent();
                }else {
                    this.chart.clear()
                    this.markLine = []
                    this.compareList = []  
                    this.onlyShowRelatedData = true
                }      
            },
            // 添加事件监听。
            addEvent() {
                window.addEventListener("resize", this.resizeChart)
                
                $("#equipments").on("click", ".suspend-tooltip-wrapper", this.suspendTooltipClickHandle)
            },
            // 重置图形大小。
            resizeChart () {
                if(this.chart) {
                    this.setChartHeight();
                    this.chart.resize();
                    // 设置提示框的最大高度。
                    this.setTooltipHeight();
                }
            },
            // 设置提示框高度。
            setTooltipHeight () {
                if(this.option.series.filter(o => o.name===CHART_STATE_NAME)[0].data.length) {
                    this.chartHeight = this.chart.getHeight() - GRID_TOP - GRID_BOTTOM;
                    this.chartWidth = this.chart.getWidth() - GRID_LEFT - GRID_RIGHT;
                    // 若数据加载已完成。
                    let nHeight = this.chartHeight;//(this.chartHeight-80)*0.8;
                    nHeight = nHeight > TOOLTIP_MIN_HEIGHT ? nHeight:TOOLTIP_MIN_HEIGHT;
                    this.chart.setOption({
                        tooltip: {
                            extraCssText: `max-height:${nHeight}px;overflow-y:auto`
                        }
                    })
                }

            },
            // 设置图形高度。
            setChartHeight () {
                let jContent = $(".material-stock .router-content"),
                    jTitle = jContent.find(".content-title");
                
                this.panelHeight = jContent.height() - jTitle.outerHeight(true) - CHART_MARGIN_BOTTOM;
                $("#equipments").height(jContent.height() - jTitle.outerHeight(true) - CHART_MARGIN_BOTTOM);
            },
            // 数据转换。
            transformTooltipDataToCompareData (nTime, zIndex) {
                //     // 时间轴全长。
                // let nTimeLine = window.Rt.utils.DateDiff(this.datetime.start, this.datetime.end),
                //     // 提示框显示位置。
                //     nTimeLineLeft = window.Rt.utils.DateDiff(this.datetime.start, nTime),
                    // 缩放后的时间轴。
                let oXAxis = this.getScaledxAxis(),
                    // 缩放后的时间轴时长。
                    nScaledTimeLine = oXAxis.endValue - oXAxis.startValue,

                    nLeft = (nTime - oXAxis.startValue) / nScaledTimeLine

                return {
                    zIndex: zIndex || TOOLTIP_Z_INDEX,
                    millisecond: nTime,
                    left: nLeft,
                    time: new Date(nTime).Format(),
                    list: this.axisTooltipData.map(param => {
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
                                group: o.groupId == null?'':o.groupId,
                                title: o.title,
                                content: o.tooltipData
                            })
                        })
                        return oData;
                    })
                }   
            },
            // 设置投产可见性。
            changePoolInAndOutVisibility () {
                let sColor = "#333",
                    raletedData = Object.assign([], this.dimension.filter(o=> o.key === 'pool')[0].data)

                // 切换可见性。
                this.onlyShowRelatedData = !this.onlyShowRelatedData

                if(this.onlyShowRelatedData) {
                    // 若只展示起点相关。
                    sColor = "#D53A35"
                    raletedData = raletedData.filter(arr => arr[4])
                }

                this.chart.setOption({
                    series: [{
                        name: "投产",
                        data: raletedData
                    }],
                    graphic: {
                        id: 'text',
                        style: {
                            fill: sColor
                        }
                    }
                });       
            },
            // 散点图点击事件处理。
            scatterClickHandle (value) {
                if(!this.markLine.filter(o => o.xAxis===value[0]).length) {
                    // 若无该标记线,添加标记线。
                    this.markLine.push({ xAxis: value[0] });

                    // 设置标记线。
                    this.chart.setOption({
                        series: [{
                            name: CHART_STATE_NAME,//params.seriesName,
                            markLine: {
                                data: this.markLine
                            }
                        }]
                    }) 

                    this.compareList = this.compareList.map(o => {
                        o.zIndex = TOOLTIP_Z_INDEX
                        return o
                    })
                    // 添加对比数据。
                    this.compareList.push(this.transformTooltipDataToCompareData(value[0], TOOLTIP_Z_INDEX+1));
                   
                }
            },
            // 标记线点击事件。
            markLineClickHandle (value) {
                let nIndex = 0
                this.markLine.map((o,index) => o.xAxis === value?(nIndex = index):'')
                
                // 删除标记线。
                let oMark = this.markLine.splice(nIndex, 1)[0]
                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,//params.seriesName,
                        markLine: {
                            data: this.markLine
                        }
                    }]
                });

                // 删除提示框数据。
                let sTime = new Date(oMark.xAxis).Format();
                this.compareList.map((o,index) => o.time === sTime?(nIndex = index):'')
                this.compareList.splice(nIndex, 1)
            },
            // y轴点击事件。
            yAxisClickHandle (sEquipment) {
                let aValue = sEquipment.split("+"),
                    sName = aValue[0],
                    sId = aValue[1],
                    nSelected = Number(aValue[2]);

                if(nSelected) {
                    // 若已经选中，则取消选中。
                    this.selectedEquipment = '';
                    this.categories = this.categories.map(o => {                              
                        if(sEquipment === o.value) {
                            o.value = o.value.slice(0,-1)+0;
                        }
                        return o;
                    })

                }else {
                    // 若未选中，则选中。
                    this.selectedEquipment = sId;
                    this.categories = this.categories.map(o => {
                        if(sEquipment === o.value) {
                            o.value = o.value.slice(0,-1)+1;
                        }else {
                            o.value = o.value.slice(0,-1)+0;
                        }
                        return o;
                    })
                }
                this.chart.setOption({
                    yAxis: {
                        data: this.categories
                    }
                })
            },
            // 悬浮框点击事件。
            suspendTooltipClickHandle (event) {
                let nTime = this.axisTooltipData[0].value[0]
                // 添加标记线。
                this.markLine.push({ xAxis: nTime });

                // 设置标记线。
                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,//params.seriesName,
                        markLine: {
                            data: this.markLine
                        }
                    }]
                }) 

                this.compareList = this.compareList.map(o => {
                    o.zIndex = TOOLTIP_Z_INDEX
                    return o
                })
                // 添加对比数据。
                this.compareList.push(this.transformTooltipDataToCompareData(nTime, TOOLTIP_Z_INDEX+1));                
            },
            // echarts 点击事件。
            chartClickHandle (params) {
                let value = params.value

                if(params.componentType=="series" && params.seriesType=="scatter") {
                    // 若为散点图系列。
                    this.scatterClickHandle(value)

                }else if(params.componentType=="markLine") {
                    // 若为标记线。
                    this.markLineClickHandle(value)

                }else if(params.componentType=="yAxis") {
                    // 若为y轴。
                    this.yAxisClickHandle(value)

                }
            },
            chartZoomHandle (params) {
                if((params.dataZoomId && params.dataZoomId.indexOf("1")) || params.type === "datazoom") {
                    // x轴缩放 || 工具栏缩放按钮。
                    let oXAxis = this.getScaledxAxis(),
                        // 缩放后的时间轴时长。
                        nScaledTimeLine = oXAxis.endValue - oXAxis.startValue,
                        // 时间范围。
                        oTime = this.getRealTime()

                    this.datetime.realStart = oTime.start;
                    this.datetime.realEnd = oTime.end;

                    this.compareList = this.compareList.map(o => {
                        o.left = (o.millisecond - oXAxis.startValue) / nScaledTimeLine
                        return o
                    })
                }
            },
            // 鼠标悬停事件。
            chartMouseoverHandle (params) {
                // 若为标记线。
                if(params.componentType === "markLine") {
                    this.setCompareTooltipZIndex(params.value);
                }
            },
            // 设置提示框层级。
            setCompareTooltipZIndex(value) {
                this.compareList = this.compareList.map(o => {
                    if(o.millisecond === value) {
                        // 选中点。
                        o.zIndex = TOOLTIP_Z_INDEX + 1;
                    }else {
                        o.zIndex = TOOLTIP_Z_INDEX;
                    }   
                    return o; 
                })
            },
            // 删除提示框对比数据。
            deleteCompareListData (nTime) {
                // 获取该事件点在提示列表中的顺序。
                let nIndex = this.getIndex(this.compareList, "millisecond", nTime)
                this.compareList.splice(nIndex, 1)
            },
            // 删除标记线。
            deleteMarkLine (nTime) {
                // 获取该事件点在标记线中的顺序。
                let nIndex = this.getIndex(this.markLine, "xAxis", nTime)
                this.markLine.splice(nIndex, 1)

                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,
                        markLine: {
                            data: this.markLine
                        }
                    }]
                })
            },
            // 提示面板点击事件。
            tooltipPanelClickHandle (nTime) {

                // 面板对应时间点。
                // let nTime = Number(event.currentTarget.getAttribute("data-id"));

                // 删除提示框对比数据。
                this.deleteCompareListData(nTime)

                // 删除标记线。
                this.deleteMarkLine(nTime);

            },
            // 提示面板鼠标移入事件。
            tooltipPanelMouseenterHandle (nTime) {
                
                // 面板对应时间点。
                // let nTime = Number(event.currentTarget.getAttribute("data-id"))
                this.setCompareTooltipZIndex(nTime);
            },
            // 设置图表事件。
            setChartEvent () {
                this.chart.on("click", this.chartClickHandle)
                this.chart.on("datazoom", this.chartZoomHandle)
                this.chart.on("mouseover", this.chartMouseoverHandle)
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
				let oParam = {},
                    oDate = this.getRealTime()
				aQuery.forEach(param => {
					switch (param) {
                        case "equipmentName":
                            oParam[param] = this.equipments.filter(o => o.equipmentId == this.selectedEquipment)[0].equipmentName;
                            break;
						case "equipmentIdList":
							oParam[param] = this.selectedEquipment;
							break;
						case "equipmentId": 
							oParam[param] = this.selectedEquipment;
							break;
						case "startTime":
							oParam[param] = oDate.start;
							break;
						case "endTime":
							oParam[param] = oDate.end;
							break;
                        case "shiftStartTime":
							oParam[param] = this.datetime.start;
							break;
						case "shiftEndTime":
							oParam[param] = this.datetime.end;
							break;
						case "processCode":
							oParam[param] = this.process||'';
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
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu();
				}else {
					// 提示信息。
					this.sErrorMessage = "暂无数据";
					console.log(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
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

                let equipmentList = "",
                    sUrl = this.url

                if(this.bRestrain) {
                    // 若为设备编码。
                    equipmentList = this.equipmentsCode.equipmentCode
                    sUrl += "/by-code"
                }else if(this.equipmentsId){
                    // 若为设备id列表。
                    equipmentList = this.equipmentsId.reduce((prev, curr)=>[...prev, curr.equipmentId], []).join(',')
                    sUrl += "/by-id"
                }
                
				this.$post(sUrl, {
					equipmentList: equipmentList,
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

                        // 初始化图形数据。
                        this.initChartData(aoData);
                        // 添加图形数据。
                        this.setChartData();	

					});
				})
				.catch((err) => {
					this.loading = false;
				 	this.sErrorMessage = "暂无数据";
					console.log("查询出错");
				})
			},
            // 初始化图形数据。
            initChartData (aoData) {
                // 更改顺序。
                aoData.reverse();

                let nLength = aoData.length - 1

                aoData.forEach((o,index) => {
                    if(index === nLength) {
                        // 默认选中第一台设备。
                        this.selectedEquipment = o.equipmentId;
                    }

                    // 设置y轴数据。
                    this.categories.push({
                        id: o.equipmentId,
                        value: `${o.equipmentName}+${o.equipmentId}+`+(index===nLength?1:0)// 默认选中第一台设备。
                    })

                    this.equipmentData[o.equipmentId] = {
                        // 状态
                        status: o.equipStatusList||[],
                        // 工单
                        work: {
                            startWorkList: o.startWorkList||[],
                            finishWorkList: o.finishWorkList||[]
                        },
                        // 投产投产
                        pool: {
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
                    }    

                    if(this.bRestrain) {
                        // 若为遏制页面。
                        this.equipments.push({
                            equipmentId: o.equipmentId,
                            equipmentName: o.equipmentName,
                            shiftStartTime: this.equipmentsCode.shiftStartTime,
                            shiftEndTime: this.equipmentsCode.shiftEndTime
                        })
                    }            
                })	
            },
            // 设置图形数据。
            setChartData () {    
                debugger 
                // 设备状态。
                this.option.series.filter(o => o.name=="状态")[0].data = this.getStatusData()
                // 获取各事件维度数据。
                this.dimension.forEach(item => {
                    let oFilter = this.option.series.filter(o => o.name==item.name)[0],
                        oResult = this.getDimensionData(item.key)
                    if(oResult.markPoint.length) {
                        oFilter.markPoint.data = oResult.markPoint
                    }
                    
                    if(item.key === 'pool' &&　this.onlyShowRelatedData && !this.bRestrain) {
                        // 设置可见性，若只展示起点相关。              
                        oFilter.data = oResult.data.filter(arr => arr[4])                                                
                    }else {
                        oFilter.data = oResult.data
                    }
                    
                })

                this.chart.setOption(this.option, true);
                // 设置提示框的最大高度。
                this.setTooltipHeight();
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
                        o.timePoint = o.happenTime;
                        oResult.title = "工单启动";
                        oResult.tooltipData = [
                            {name: "工单号", value: o.doCode},
                            {name: "开始时间", value: o.happenTime},
                            {name: "操作人", value: o.personName},                       
                            {name: "工序", value: o.processName}
                        ];                                
                        break;
                        // 完工
                    case "finishWorkList":
                        oResult.time = +new Date(o.happenTime);
                        o.timePoint = o.happenTime;
                        oResult.title = "工单结束";
                        oResult.tooltipData = [
                            {name: "工单号", value: o.doCode},
                            {name: "完工时间", value: o.happenTime},
                            {name: "操作人", value: o.personName}
                        ];  
                        break;   
                        // 投料
                    case "poolInList": 
                        oResult.time = +new Date(o.happenTime);
                        o.timePoint = o.happenTime;
                        oResult.title = "投料";
                        oResult.tooltipData = [
                            {name: "条码", value: o.barcode},
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
                        o.timePoint = o.happenTime;
                        oResult.title = "产出";
                        oResult.tooltipData = [
                            {name: "条码", value: o.barcode},
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
                        o.timePoint = o.startTime;
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
                        o.timePoint = o.happenTime;
                        oResult.title = "送检";
                        oResult.tooltipData = [
                            {name: "送检时间", value: o.happenTime},
                            {name: "送检人", value: o.personName},                
                            {name: "工单号", value: o.doCode},
                            {name: "物料", value: o.materialName},
                            {name: "批次", value: o.batchNo},
                            {name: "检验人", value: o.checkPersonName},
                            {name: "检验结果", value: o.result}
                        ];
                        break;   
                        // 事件开始
                    case "startEquipWarningList": 
                        oResult.time = +new Date(o.startTime);
                        o.timePoint = o.startTime;
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
                        o.timePoint = o.endTime;
                        oResult.title = "事件结束";
                        oResult.tooltipData = [
                            {name: "结束时间", value: o.endTime}
                        ];
                        break; 
                        // 设备点检
                    case "spotCheckList": 
                        oResult.time = +new Date(o.happenTime);
                        o.timePoint = o.happenTime;
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
                        o.timePoint = o.startTime;
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
                        o.timePoint = o.endTime;
                        oResult.title = "设备维护结束";
                        oResult.tooltipData = [
                            {name: "结束时间", value: o.endTime}
                        ]; 
                        break;
                        // 上刀/模具
                    case "installToolList":
                        oResult.time = +new Date(o.happenTime);
                        o.timePoint = o.happenTime;
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
                        o.timePoint = o.happenTime;
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
                    aoMarkPoint = [],
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

                                let aPointer = [oData.time, nIndex, 1, [oData]];

                                if(sDimension === "pool" && !this.bRestrain) {
                                    if((key === "poolInList" && item.poolInTime.indexOf(o.happenTime) > -1) ||
                                    (key === "poolOutList" && item.poolOutTime.indexOf(o.happenTime) > -1)) {
                                        // 若为属于起点的投入或产出。
                                        // 设置标记点。
                                        aoMarkPoint.push({
                                            coord: [oData.time, nIndex]
                                        })
                                        // 设置与起点相关。
                                        aPointer.push(true)
                                    }
                                }
                                // 增加节点。
                                aoData.push(aPointer)
                            }                          
                        }) 
                    }

                })

                this.dimension.filter(o=> o.key === sDimension)[0].data = aoData;

                return {
                    markPoint: aoMarkPoint,
                    data: aoData
                };
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

                            if(oState) {
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
                            }else {
                                // 若不存在，即为未知状态。
                                aoData.push({
                                    name: '无数据',
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
                                            color: '#dedede'
                                        }
                                    }
                                });                                
                            }
      
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

                let sHtml = "",
                    oGroupId = {}
                    
                params.forEach(param => {
                    let aoValue = param.value,
                        sList = "",
                        yAxisIndex = aoValue[1],
                        oGroupIdList = new Set()

                    // 第一级设备。
                    oGroupId[yAxisIndex] = {}

                    // 事件列表
                    aoValue[3].forEach((o,index) => {
                        let sGroup = "";
                        // 保存分组id。
                        if(o.groupId != null && o.groupId !== "") {
                            oGroupIdList.add(o.groupId)
                            sGroup = o.groupId
                        }

                        if(sGroup) {
                            sList += `<div style="color:${param.color}">${index+1}.${o.title}&nbsp;&nbsp;事件组：${sGroup}</div>`;
                        }else {
                            sList += `<div style="color:${param.color}">${index+1}.${o.title}</div>`;
                        }
                        
                        o.tooltipData.forEach(tip => {
                            sList += `<div><span>${tip.name}:&nbsp;&nbsp;${this.parseData(tip.value)}<span></div>`                
                        })
                    })
                    // 设备列表
                    sHtml += `<div>
                        <div style="color:${param.color};font-weight:bold">${param.name.split("+")[0]}&nbsp;&nbsp;&nbsp;&nbsp;${param.seriesName}&nbsp;&nbsp;&nbsp;&nbsp;${aoValue[2]}</div>
                        <div style="margin-top:10px">${sList}</div>
                    </div>`

                    // 第二级事件。
                    oGroupId[yAxisIndex][param.seriesIndex] = [...oGroupIdList]
                })

                sHtml = `<div class="suspend-tooltip-wrapper" style="padding: 10px;">${sHtml}</div>`

                this.highlightGroup(oGroupId)

                return sHtml;             
            },
            // 设置组高亮。
            highlightGroup (oGroupId) {
                let aoSeries = this.chart.getOption().series,
                    highlightData = {}
                
                for(let eqId in oGroupId) {
                    for(let dim in oGroupId[eqId]) {
                        // 维度-1，因为绘图的数据维度多了状态这一维度。
                        // 找到设备维度。
                        let oEquipmentData = this.equipmentData[this.categories[eqId>>0].id],
                            // 事件类型。
                            sType = this.dimension[(dim>>0)-1].key,
                            // 事件数据。
                            oDimensionData = oEquipmentData[sType],
                            // 事件组id。
                            aGroupId = oGroupId[eqId][dim],
                            // 时间点。
                            sTime = new Set(),
                            aTime = []

                        // let aoGroupId = {}

                        for(let key in oDimensionData) {
                            let aoEvent = oDimensionData[key]
                            for(let i = 0, l = aoEvent.length; i < l ; i++) {
                                let oEvent = aoEvent[i]
                                if(aGroupId.indexOf(oEvent.groupId) > -1) {
                                    // if(!aoGroupId[oEvent.groupId]) {
                                    //     aoGroupId[oEvent.groupId] = []
                                    // }
                                    
                                    // 保存时间点。
                                    // aoGroupId[oEvent.groupId].push(+new Date(oEvent.timePoint))
                                    sTime.add(+new Date(oEvent.timePoint))
                                }
                            }
                            // oGroupId[eqId][dim] = aoGroupId
                        }

                        aTime = [...sTime]
                        // 找到散点图中应该高亮的点。 
                        aoSeries[dim].data.forEach((arr,index) => {
                            if(arr[1]==eqId && aTime.indexOf(arr[0])>-1) {
                                if(!highlightData[dim]) {
                                    highlightData[dim] = []
                                }
                                highlightData[dim].push(index)
                            }
                        })
                    }
     
                }

                this.setChartDataHighlight(highlightData)

            },
            // 设置图形高亮。
            setChartDataHighlight (highlightData) {
                if(this.highlightedData) {
                    // 取消之前设置的高亮。
                    this.chartHighlightSwitch(this.highlightedData, 'downplay')

                }
                // 设置新的高亮节点。
                this.chartHighlightSwitch(highlightData, 'highlight')
                this.highlightedData = Object.assign({}, highlightData)
            },
            // 节点高亮开关。
            chartHighlightSwitch (oData, sType) {                  
                Object.keys(oData).forEach(dim => {
                    // 若至少有一组数据才高亮显示。
                    if(oData[dim].length > 1) {
                        this.chart.dispatchAction({
                            type: sType,
                            // 可选，系列 index，可以是一个数组指定多个系列
                            seriesIndex: dim>>0,
                            // 可选，数据的 index
                            dataIndex: oData[dim]
                        }) 
                    }                
                })
            },
            // 显示悬浮框。
            showTooltip () {
                this.show = true;
                this.chart.setOption({
                    tooltip: {
                        show: true
                    }
                })
            },
            // 隐藏悬浮框。
            hideTooltip () {
                this.show = false;
                this.chart.setOption({
                    tooltip: {
                        show: false
                    }
                })                
            },
            // 数据格式化。
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
            },
            // 获取缩放后的X轴
            getScaledxAxis () {
                return this.chart.getOption().dataZoom.filter(o => o.type === "slider" && o.xAxisIndex.length === 1)[0]
            },
            // 获取实际缩放后的时间。
            getRealTime () {          
                let oDate = this.getScaledxAxis()

                return {
                    start: new Date(oDate.startValue).Format(),
                    end: new Date(oDate.endValue).Format()
                }  
            },
            // 可疑品列表。
			showSuspiciousList() {
                let oDate = this.getRealTime();
                // 根据设备+开始时间+结束时间，查询可疑品列表。
                this.$router.push({ path: "/process/restrain", query: {
                    equipmentName: this.equipments.filter(o => o.equipmentId == this.selectedEquipment)[0].equipmentName,
                    equipmentId: this.selectedEquipment,
                    startTime: oDate.start,
                    endTime: oDate.end,
                    shiftStartTime: this.datetime.start,
                    shiftEndTime: this.datetime.end
                }})				
			},
            // 跳转到追踪页面。
            gotoTrack() {
                let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                    oDate = this.getRealTime(),
                    oCondition = {
                        "keys": {
                            "equipmentId": this.selectedEquipment,//'493-017-2',
                            "startTime": oDate.start,
                            "endTime": oDate.end
                        }, 
                        "radio": "3",
                        "tab":"track"
                    }

                sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
                window.open("trackIndex.html?tag="+tag);
      
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

            &.no-border {
                border-left: none;
            }
        }     
    }

	.material-stock  {	  	
    	.content-list {
			// padding-top: 30px;
            position: relative;
            
            .analysis {
                position: relative;
            }

            .legend {
                position: absolute;
                top: 2px;

                span {
                    font-size: 12px;
                    display: inline-block;
                    width: 40px;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    color: #fff;

                    &+span {
                        margin-left: 20px;
                    }
                }
            }	

            .selected-info {
                position: absolute;
                top: 22px;
                left: 0;
                font: 12px/18px '微软雅黑';
                color: #D53A35;
            }	

            .buttons {
                width: 100%;
                text-align: center;
                position: absolute;
                bottom: -10px;
                left: 0;

                .btn-plain {
                    width: 50px;
                    height: 24px;
                    font-size: 12px;
                }
            }
            // 悬浮框显示隐藏开关。
            .switch {
                position: absolute;
                top: 5px;
                right: 85px;

                .switch-eye {
                    position: relative;
                    cursor: pointer;
                }
                .tip {
                    font-size: 12px;
                    color: #42af8f;
                    display: none;
                    position: absolute;
                    top: 22px;
                    left: -23px;
                    width: 60px;
                }
                &:hover {
                    .tip {
                        display: block;
                    }
                    .icon-show {
                        background-position: -16px 0;
                    }
                    .icon-show {
                        background-position: -16px -16px;
                    }
                }
            }

            .tooltip-wrapper {
                position: absolute;
                top: 0;
                // margin: 60px 100px;
     
                .line {
                    // left: 0;
                    // top: 0;
                    position: absolute;
                    width: 1px;
                    background-color: #D53A35;
                }
            }

            .tooltip-panel {
                // padding: 10px;
                background-color: rgba(245, 245, 245, 0.8);//rgba(44,52,60,0.7);
                font-size: 12px;
                position: absolute;
                // top: 60px;
                width: 220px;
                // z-index: 100;
                color: #000;//#fff;
                border: 1px solid #D53A35;

                // margin-right: 20px;
                
                // &.left {
                //     left: 0;
                // }
                // &.right {
                //     right: 0;
                // }
                &:hover {
                    background-color: #fff;
                }
                
                .btn-close {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    cursor: pointer;
                    font-size: 20px;
                    color: rgba(0,0,0,0.4);
                    z-index: 1;

                    &:hover {
                        color: rgba(0,0,0,0.8);
                    }
                }

                .tooltip-time {
                    color: #fff;
                    // font-size: 12px;
                    background-color: #D53A35;
                    // font-weight: bold;
                    // padding-bottom: 5px;
                    text-align: center;
                    height: 20px;
                    line-height: 20px;
                }

                .tooltip-list {
                    padding: 10px;
                    overflow-y: auto;
                    position: relative;
                    // border: 1px solid #D53A35;
                }

                .content-list {
                    padding-left: 10px;

                    li {
                        padding: 2px 0;
                    }
                }

                .tooltip-title {
                    font-weight: bold;
                    // font-size: 14px;
                    padding-bottom: 5px;
                }

            }
            // 工艺按钮
            // .parameter {
            //     position: absolute;
            //     cursor: pointer;
            //     top: 4px;
            //     right: 380px;
            //     font-size: 12px;

            //     .icon-circle {
            //         width: 14px;
            //         height: 14px;
            //         border-radius: 7px;
            //         background-color: #FAC41B;
            //         margin-right: 5px;
            //     }

            //     &:hover {
            //         color: #FAC41B;
            //     }

            //     span {
            //         vertical-align: middle;
            //     }
            // }
            // 链接。
            .links {
                position: absolute;
                top: 18px;
                // right: 60px;
                // width: 300px;
                // text-align: center;
                font-size: 0;
                // 工单
                .work {
                    .item-color(@work)
                }
                // 投产
                .pool {
                    .item-color(@pool)
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
                .parameter {
                    .item-color(@parameter)
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
