<!--设备-->
<template>
    <div class="content-list" v-loading="loading" element-loading-text="拼命加载中">
        <div v-if="sErrorMessage" class="error">{{sErrorMessage}}</div>
		<div v-else class="analysis">
            <div id="equipments" :style="{height: panelHeight + 'px'}"></div>
            <div class="illustration" 
                :title="showState?'隐藏设备状态':'显示设备状态'"
                v-if="!loading" 
                :style="{bottom: selectedEquipmentId?'40px':'16px'}" 
                @click="toggleStateHandle">
                <div v-for="state in states" :key="state.key" :style="{color: showState?'#333':'#ccc'}" ><i :class="['icon icon-16', `icon-${state.key}`, showState?'':'unselected']"></i>{{state.name}}</div>
            </div>
            <!--维度按钮-->
            <div class="legend" v-if="!loading">
                <div 
                    v-for="(obj,index) in dimension" 
                    :class="[obj.show ? `dimension dimension-${obj.key}` : 'dimension']"
                    :key="index"            
                    @mouseenter="obj.listShow=true" 
                    @mouseleave="obj.listShow=false">                
                    <span class="name" @click="legendClickHandle(obj)">{{obj.name}}</span>               
                    <el-collapse-transition>
                        <div class="dimension-links" v-show="selectedEquipmentId && obj.listShow && obj.show" v-if="obj.list.length">
                            <div class="line">|</div>
                            <div class="circle"><span></span></div>
                            <ul>
                                <li v-for="(item,index) in obj.list" @click="listButtonClick(item)" :key="index">{{item.name}}</li>                        
                            </ul>
                        </div>
                    </el-collapse-transition>                                    
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
            <div class="buttons" v-show="selectedEquipmentId&&!loading">
                <el-button  @click="showSuspiciousList" class="btn btn-plain" >可疑品</el-button>
                <el-button  @click="gotoTrack" class="btn btn-plain" v-if="trace">追踪</el-button>
            </div>	
            <!--提示面板数据-->
            <div class="tooltip-wrapper" :style="{width: chartWidth+'px', margin: grid[0] + 'px ' + grid[1] + 'px ' + grid[2] + 'px ' + grid[3] + 'px'}">
                <div v-for="compareData in compareList" 
                    :key="compareData.millisecond"              
                    @mouseenter="tooltipPanelMouseenterHandle(compareData.millisecond)" 
                    v-show="dimension.filter(o => o.key === compareData.dimension)[0].show && (compareData.dimension==='pool'?(!onlyShowRelatedData || (compareData.related && onlyShowRelatedData)):true)">                    
                    <div :class="['tooltip-panel', compareData.reverse ? 'left':'right']" :style="{left:compareData.position*100+'%', top: panelTop+'px', zIndex: compareData.zIndex}">
                        <div class="tooltip-time">{{compareData.time}}</div>
                        <i class="btn-close icon icon-14 icon-close" title="关闭" @click="tooltipPanelClickHandle(compareData.millisecond)" ></i>
                        <i class="btn-reverse icon icon-14 icon-reverse" title="翻转" @click="reversePanelClickHandle(compareData)" ></i>
                        <div class="tooltip-list" v-for="(equipment,index) in compareData.list" :key="index" :style="{maxHeight: chartHeight*0.8-20 + 'px'}">
                            <div class="tooltip-title" 
                            :style="{color: equipment.color}">
                            {{equipment.name}}&nbsp;&nbsp;{{equipment.series}}&nbsp;&nbsp;{{`${compareData.dimension==='pool'?(onlyShowRelatedData?equipment.relatedQuantity:equipment.quantity):equipment.quantity}条记录`}}
                            </div>
                            <ul class="event-list">
                                <li v-for="(event,index) in equipment.event"
                                :key="index" 
                                v-if="compareData.dimension==='pool'?(!onlyShowRelatedData ||(onlyShowRelatedData && event.related)):true">
                                    <div :style="{color: equipment.color}">{{(onlyShowRelatedData && event.related)?event.relatedIndex:event.index}}.{{event.title}}&nbsp;&nbsp;<span v-if="event.group">事件组：{{event.group}}</span><i v-if="!!event.related" class="icon icon-arrow-tag"></i></div>
                                    <ul class="content-list">
                                        <li v-for="(content,index) in event.content" :key="index">
                                            {{content.name}}:&nbsp;&nbsp;{{parseData(content.value)}}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            
                        </div>
                        
                    </div>
                    <div class="line" :style="{left:compareData.left*100+'%', top: panelTop+'px', height: chartHeight-3 + 'px', zIndex: compareData.zIndex}"></div>
                </div>
            </div> 
        </div>        		 
    </div>      
</template>

<script>
    import pin from 'assets/img/icon-pin.png'
	import DateTime from 'components/basic/dateTime.vue'
    import $ from 'jquery'

    // 设备状态。
    const CHART_STATE_NAME = "状态"
    // 图形下margin。
    const CHART_MARGIN_BOTTOM = 40
    // tooltip距离鼠标的水平位置。
    const TOOLTIP_X_DISTANCE = 10
    // tooltip距离鼠标的水平位置。
    const TOOLTIP_Y_DISTANCE = 10
    // 悬浮框最小高度。
    const TOOLTIP_MIN_HEIGHT = 20
    // legend距右侧的距离。
    const LEGEND_RIGHT = 140
    // grid边距。
    const GRID_LEFT = 220
    const GRID_RIGHT = 220
    const GRID_TOP = 60
    const GRID_BOTTOM = 40
    // y轴缩放距右侧的距离。
    const Y_AXIS_ZOOM_RIGHT = 50
    // y轴标签换行的字符个数
    const Y_LABEL_LENGTH = 7
    // 标记线点的大小。
    const MARKLINE_SYSMBOL_SIZE = 8
    // 提示框面板z轴。
    const TOOLTIP_Z_INDEX = 100
    // 提示框面板宽度。
    const TOOLTIP_WIDTH = 220-2
    // 主题色。
    const GREEN = "#42AF8F"
    // 提示框背景色。
    const TOOLTIP_BGCOLOR = 'rgba(164, 184, 204, 0.2)'//'rgba(255, 255, 255, 0.2)'//
    // 提示框边框色。
    const TOOLTIP_BORDERCOLOR = '#a8b8cc'
    // 设备分析接口地址。
    const EQUIPMENTS_EVENTS_URL = HOST + "/api/v1/trace/equipments-events"
    // 默认选中的维度。
    const DEFAULT_SELECTED_DIMENSION = ["quality", "pool", "parameter"]

    // 缩放轴
    var oAxis = {
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
    };

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
                // 是否展示设备状态。
                showState: true,
                // 设备。
                equipments: [],
                // 判断是否为遏制页面。
                bRestrain: location.pathname.indexOf("restrain") > -1,
                // legend距右侧的距离。
                legendRight: LEGEND_RIGHT,
                // grid边距。
                grid: [GRID_TOP, GRID_RIGHT, GRID_BOTTOM, GRID_LEFT],
                // 判断是否为溯源页。
                trace: location.pathname.indexOf('traceIndex') > -1,
                // 区域缩放是否激活。
                zoomActive: false,
                // 选中的设备id。
                selectedEquipmentId: "",
				loading: false,
				sErrorMessage: "",
                url: EQUIPMENTS_EVENTS_URL,	
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
                // 是否创建开始时间编辑框。			
				startIf: true,
                // 是否创建结束时间编辑框。
				endIf: true,
                // 设备对应的维度数据。
				equipmentData: {},
                // 图形。
                chart: null,
                // 图形区域高
                panelHeight: 100,　
                // 提示框区域宽高
                chartHeight: 60,
                chartWidth: 60,
                // 提示框标记。
                markLine: [],
                // 提示框top。
                panelTop:　MARKLINE_SYSMBOL_SIZE/2,
                // 提示框数据。
                compareList: [],
                /**
                 * 设备id列表。
                 * {
                 * value: o.equipmentName+ '+' + o.equipmentId + '+' + 0, // 最后一位代表是否选中这台设备
                 * id: o.equipmentId
                 * }
                 */
                categories: [],
                // 选中的提示框数据。
                axisTooltipData: [],
                // 高亮的节点。
                highlightedData: null,
                // 只展示与起点相关的投产数据。
                onlyShowRelatedData: true,
                // 当前页面数据存储，用于页面跳转后的参数变化保存。
                storageData: null,
                // 维度数据。
                dimension: [{
                    show: true,
                    name: "质量",
                    key: "quality",
                    type: "3",
                    color: "#d89cdd",
                    listShow: false,
                    list: [{
                        name: "质检",
                        router: "/process/qtReport",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    },{
                        name: "送检",
                        router: "/process/qcReport",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    },{
                        name: "FGB",
                        router: "/process/fgbReport",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]    

                    }]
                }, {
                    show: true,
                    name: "投产",
                    key: "pool",
                    type: "7",
                    color: "#15a5a7",
                    listShow: false,
                    list: [{
                        name: "投产表",
                        router: "/process/product",
                        query: ["doOutIdList", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]
                        // ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime", "processCode"]  
                    }]
                }, {
                    show: false,
                    name: "工单",
                    key: "work",
                    type: "2",
                    color: "#5ca637",
                    listShow: false,
                    list: []
                }, {
                    show: false,
                    name: "事件",
                    key: "event",
                    type: "4",
                    color: "#f98141",
                    listShow: false,
                    list: [{
                        name: "事件记录",
                        router: "/process/event",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
                }, {
                    show: false,
                    name: "维护",
                    key: "repair",
                    type: "5",
                    color: "#b3b200",
                    listShow: false,
                    list: [{
                        name: "维修记录",
                        router: "/process/repair",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }, {
                        name: "点检记录",
                        router: "/process/spotReport",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
                }, {
                    show: false,
                    name: "工具",
                    key: "tool",
                    type: "6",
                    color: "#6979b7",
                    listShow: false,
                    list: [{
                        name: "工具记录",
                        router: "/process/tool",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  

                    }]
                }, {
                    show: true,
                    name: "工艺",
                    key: "parameter",
                    type: "0",
                    color: "#f9c331",
                    listShow: false,
                    list: [{
                        name: "工艺参数",
                        router: "/process/parameter",
                        query: ["equipmentName", "equipmentId", "startTime", "endTime", "shiftStartTime", "shiftEndTime"]  
                    }]
                }]                
            }
        },
        computed: {
            tag () {
                return window.Rt.utils.getParam("tag");
            },
            // 选中的设备名称。
            selectedEquipmentName () {
                return this.equipments.filter(o => o.equipmentId == this.selectedEquipmentId)[0].equipmentName
            },
            // 产出id。
            doOutIdList () {
                return this.equipments.filter(o => o.equipmentId == this.selectedEquipmentId)[0].poolOutId
            },
            // 与起点相关的标记线。
            relatedMarkLine () {
                return this.markLine.filter(o => o.related)
            },
            // 原始请求数据。
			rawData () {
		    	return this.$store && this.$store.state.rawData
		  	},
            // 左右缩放。
			resize () {
		    	return this.$store && this.$store.state.resize
		    },
            // 上下缩放。
			resizeY () {
				return this.$store && this.$store.state.resizeY
			},
            // 是否全屏。
			fullscreen () {			
		    	return this.$store && this.$store.state.fullscreen
		    },
		    // 树的数据全屏。
		   	treeFullscreen () {
		   		return this.$store && this.$store.state.treeFullscreen
			},         
            // echarts图形参数。
            option () {
                let oSelected = {},
                    aoName = this.dimension.map(o=> {
                    oSelected[o.name] = o.show;
                    return o.name
                });

                let oData = {
                    legend: {
                        show: false,
                        data: aoName,
                        // itemWidth: ,
                        // itemGap: 40,
                        // width: 320,
                        // right: LEGEND_RIGHT,
                        selected: oSelected,
                        // align: 'center' 
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
                        // triggerOn: "click",
                        // padding: 10,
                        backgroundColor: TOOLTIP_BGCOLOR,//'rgba(164, 184, 204, 0.2)',
                        borderColor: TOOLTIP_BORDERCOLOR,//'#a8b8cc',
                        borderWidth: 1,
                        borderRadius: 4,
                        transitionDuration: 0,
                        // 鼠标是否可进入悬浮框。
                        enterable: true,
                        textStyle: {
                            fontSize: 12,
                            color: '#000'
                        },
                        // show: this.show,
                        formatter: this.tooltipFormatter,
                        position: this.tooltipPosition,
                        // extraCssText: 'max-height:200px;overflow-y:auto'
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
                                fontSize: 16,
                                color: function (value, index) {
                                    // 最后一位代表是否点击选中。
                                    return Number(value.split("+")[2]) ? GREEN: '#666'//d53a35
                                }
                            },
                            formatter: (value)=> {
                                return value.split("+")[0].trim();
                            }
                        } 
                        
                    },
                    // 工具箱
                    toolbox: {
                        top: -3,
                        right: 22,
                        feature: {
                            dataZoom: {
                                title: {
                                    zoom: !this.zoomActive ? "区域缩放":"取消区域缩放"
                                },
                                yAxisIndex: 'none'
                            },
                        },
                        iconStyle: {
                            normal: {
                                borderWidth: 1
                            },
                            emphasis: {
                                borderWidth: 2,
                                borderColor: GREEN,
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
                        markLine: {
                            // 不响应点击事件。
                            silent: true,
                            animation: false,
                            label: {
                                normal: {
                                    show: true,
                                    position:　'start'
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: GREEN,
                                    opacity: 0
                                }
                            },
                            data: []
                        },
                        tooltip: {
                            trigger: 'item',
                            padding: 10,
                            // 设置显示格式。
                            formatter: this.stateTooltipFormatter,
                            // 设置显示位置。
                            position: this.stateTooltipPosition,
                            extraCssText: 'height:auto;',
                            // 鼠标是否可进入悬浮框。
                            enterable: false
                        }               
                    }]
                };
                // 设置维度。
                this.dimension.forEach(o => oData.series.push({
                    name: o.name,
                    type: 'scatter',
                    symbol: 'circle', //'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'               
                    symbolSize: 8,
                    // 标注点。
                    markPoint: {
                        symbol: 'image://'+pin, //'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'  
                        symbolSize: 16,//[8,14],
                        symbolOffset: [0, '-80%'],
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
                            color: o.color,
                            borderColor: "rgba(255,255,255,0.7)",//rgba(44,52,60,0.7)
                            borderWidth: 1
                        },
                        emphasis: {
                            color: o.color,
                            borderColor: o.color,
                            borderWidth: 1
                        }
                    },
                    // 文本标签
                    label: {
                        emphasis: {
                            color: o.color,
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

                // 添加x轴缩放。
                oData.dataZoom.push(Object.assign({
                    xAxisIndex: [0],
                    height: 16,
                    labelFormatter: function(value) {
                        return new Date(value).Format()
                    },
                    bottom: 0
                },oAxis))
                
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
                            type: 'image',
                            id: 'polygon',
                            cursor: "pointer",
                            style: {
                                image: pin
                            },
                            left: 0,
                            top: 0
                        },{
                            // 文字。
                            type: 'text',
                            id: 'text',
                            cursor: "pointer",
                            style: {
                                text: this.onlyShowRelatedData ? "相关投产":"全部投产",//D53A35,
                                font: 'normal bold 16px 微软雅黑',
                                fill: this.onlyShowRelatedData ? GREEN:"#333"//D53A35
                            },
                            left: 20,
                            top: 0
                        }],     
                        left: 0,
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
			'$route': 'updateData',
            fullscreen: 'resizeChart',
            treeFullscreen: 'resizeChart',
            resize: 'resizeChart',
            resizeY: 'resizeChart'
        },
        methods: {
			init() {                  
                this.getSessionStorage();     
                // 初始化图形。              
				this.setInitData();
                // 获取所有数据。
                this.fetchAllData();
				// 添加事件监听。
                this.addEvent();
			},
            // 获取存储的数据。
            getSessionStorage() {
                if(!("startTime" in this.$route.query)) {
                    // 不含时间的跳转为初始跳转。
                    sessionStorage.removeItem("equipment_analysis_" + this.tag);
                    return;
                }
                let sAnalysis = sessionStorage.getItem("equipment_analysis_" + this.tag);
                if(sAnalysis) {
                    this.storageData = JSON.parse(sAnalysis);

                    // 选中的维度。
                    let aoSelectedDimension = this.storageData.selectedDimension;
                    this.dimension.forEach(o => {
                        if(aoSelectedDimension.indexOf(o.key) > -1) {
                            o.show = true;
                        }else {
                            o.show = false;
                        }
                    })

                    // 选中的设备。
                    this.selectedEquipmentId = this.storageData.selectedEquipmentId;
                    // 相关投产标记。
                    this.onlyShowRelatedData = this.storageData.onlyShowRelatedData; 
                    // 显示的提示框。
                    this.markLine = this.storageData.markLine;
                    // 是否显示设置状态。
                    this.showState = this.storageData.showState;
                }
            },
            // 保存数据到本地。
            setSessionStorage() {
                this.storageData = {};

                // 选中的维度。
                let aoSelectedDimension = [];
                
                this.dimension.forEach(o => {
                    if(o.show) {
                        aoSelectedDimension.push(o.key)
                    }
                })

                this.storageData.selectedDimension = aoSelectedDimension;

                // 选中的时间。
                this.storageData.datetime = this.datetime;
                // 选中的设备。
                this.storageData.selectedEquipmentId = this.selectedEquipmentId;
                // 相关投产标记。
                this.storageData.onlyShowRelatedData = this.onlyShowRelatedData;
                // 显示的提示框。
                this.storageData.markLine = this.markLine;
                // 是否显示设置状态。
                this.storageData.showState = this.showState;

                sessionStorage.setItem("equipment_analysis_" + this.tag, JSON.stringify(this.storageData));
            },
            // 路由变化更新数据。
            updateData() {
                // 重置数据。
                this.resetData();
			       
            },
            // 重置数据。
            resetData() {
                this.sErrorMessage = "";
                this.startIf = true;
				this.endIf = true;
                // 区域缩放是否激活。
                this.zoomActive = false;

                if(!this.bRestrain) {
                    this.equipments = this.equipmentsId
                }else {
                    this.equipments = []
                }	

                // 选中的维度。
                this.dimension.forEach(o => {
                    if(DEFAULT_SELECTED_DIMENSION.indexOf(o.key) > -1) {
                        o.show = true;
                    }else {
                        o.show = false;
                    }
                })
                this.markLine = [];
                this.compareList = []; 
                this.onlyShowRelatedData = true;
                this.showState = true;
                // 清空本地存储数据。
                this.storageData = null;
                sessionStorage.removeItem("equipment_analysis_" + this.tag);

                this.$nextTick(function() {
                    this.chart.clear();
                    this.chart = null;
                    this.initChart()
                    // this.setChartHeight();
                    // this.chart.clear();
                    // 获取所有数据。
                    this.fetchAllData();
                })
            },
			// 初始化数据。
			setInitData() {	
                if(!this.bRestrain) {
                    this.equipments = this.equipmentsId
                }else {
                    this.equipments = []
                }			
                
                this.initChart();
			},
            // 初始化图表。
            initChart() {                
                this.setChartHeight();
                this.chart = this.$echarts.init(document.getElementById('equipments'));
                this.setChartEvent();    
            },
            // 添加事件监听。
            addEvent() {
                window.addEventListener("resize", this.resizeChart)
                
                $("#equipments").on("click", ".suspend-tooltip-wrapper", this.suspendTooltipClickHandle)          
            },
            // 重置图形大小。
            resizeChart () {
                if(this.chart && this.chart.getOption()) {
                    this.setChartHeight();
                    this.chart.resize();
                    // 设置提示框的最大高度。
                    this.setTooltipHeight();
                }
            },
            // 设置提示框高度。
            setTooltipHeight () {       
                // if(this.option.series.filter(o => o.name===CHART_STATE_NAME)[0].data.length) {
                    this.chartHeight = this.chart.getHeight() - GRID_TOP - GRID_BOTTOM;
                    this.chartWidth = this.chart.getWidth() - GRID_LEFT - GRID_RIGHT;
                    // 若数据加载已完成。
                    let nHeight = this.chartHeight;//(this.chartHeight-80)*0.8;
                    nHeight = nHeight > TOOLTIP_MIN_HEIGHT ? nHeight:TOOLTIP_MIN_HEIGHT;
                    this.chart.setOption({
                        tooltip: {
                            extraCssText: `max-height:${nHeight}px;overflow-x:hidden;overflow-y:auto;white-space:normal;word-break:break-all;padding:0;left:auto;right:0;`
                        }
                    })
                // }

            },
            // 设置图形高度。
            setChartHeight () {
                
                let jContent = $(".router-content"),
                    jTitle = jContent.find(".content-title"),
                    jSetting = jContent.find(".setting"),
                    jButtons = jContent.find(".buttons");
                    
                this.panelHeight = jContent.height() - (jTitle.outerHeight(true)||0) - (jSetting.outerHeight(true)||0) - (jButtons.outerHeight(true)||0)//CHART_MARGIN_BOTTOM;
                $("#equipments").height(this.panelHeight);
            }, 
            // 获取当前数据列表。
            getCurrentDataList(nTime) {
                let aoCurrentList = [];
                                
                if((!this.axisTooltipData.length) || (nTime !== this.axisTooltipData[0].value[0])) {
                    // 若点击的数据点与移动轴不一致。
                    this.dimension.forEach(obj => {             
                        let oCurrent = obj.data.filter(o => o[0] === nTime)[0],
                            oData = {};

                        if(oCurrent) {
                            oData.name = this.categories[oCurrent[1]].value.split("+")[0]; // 设备名称。
                            oData.color = obj.color; // 维度颜色。
                            oData.series = obj.name; // 维度名称。
                            oData.quantity = oCurrent[3].length; // 事件数量。
                            oData.relatedQuantity = oCurrent[5]; // 起点相关数量。 
                            oData.event = [];

                            let relatedIndex = 0;
                            // 事件列表
                            oCurrent[3].forEach((o,index) => {
                                if(o.related) {
                                    relatedIndex++;
                                }
                                oData.event.push({
                                    // 起点相关标记。
                                    index: index+1,
                                    relatedIndex: relatedIndex,
                                    related: o.related,
                                    group: o.groupId == null?'':o.groupId,
                                    title: o.title,
                                    content: o.tooltipData
                                })
                            });

                            aoCurrentList.push(oData);
                        }

                    });                    
                }else {
                    aoCurrentList = this.axisTooltipData.map(param => {
                        let aoValue = param.value,
                            oData = {};

                        oData.name = param.name.split("+")[0];
                        oData.color = param.color;
                        oData.series = param.seriesName;
                        oData.quantity = aoValue[2];
                        // 起点相关数量。
                        oData.relatedQuantity = aoValue[5];
                        oData.event = [];

                        let relatedIndex = 0;
                        // 事件列表
                        aoValue[3].forEach((o,index) => {
                            if(o.related) {
                                relatedIndex++;
                            }
                            oData.event.push({
                                // 起点相关标记。
                                index: index+1,
                                relatedIndex: relatedIndex,
                                related: o.related,
                                group: o.groupId == null?'':o.groupId,
                                title: o.title,
                                content: o.tooltipData
                            })
                        })
                        return oData;
                    })                    
                }

                return aoCurrentList;
            },      
            /**
             * 数据转换。
             * @param {Number} nTime 时间
             * @param {Boolean} bRelated 是否与起点相关
             * @param {String} sDimension 维度
             * @param {Number} zIndex z-level
             * @return {Object} 数据对象
             */
            transformTooltipDataToCompareData (nTime, bRelated, sDimension, zIndex) {
                //     // 时间轴全长。
                // let nTimeLine = window.Rt.utils.DateDiff(this.datetime.start, this.datetime.end),
                //     // 提示框显示位置。
                //     nTimeLineLeft = window.Rt.utils.DateDiff(this.datetime.start, nTime),
                    // 缩放后的时间轴。
                let oXAxis = this.getScaledxAxis(),
                    // 缩放后的时间轴时长。
                    nScaledTimeLine = oXAxis.endValue - oXAxis.startValue,
                    // 距左侧距离。
                    nLeft = (nTime - oXAxis.startValue) / nScaledTimeLine,
                    nRealLeft = nLeft,
                    // 数据面板宽度。
                    nViewWidth = document.getElementById("equipments").clientWidth - GRID_LEFT - GRID_RIGHT,
                    // 提示框距左侧距离。
                    nPanelLeft = nLeft -TOOLTIP_WIDTH/nViewWidth,
                    nRealPanelLeft = nPanelLeft;

                if(nLeft < 0) {
                    nRealLeft = -1;
                }else if(nLeft > 1) {
                    nRealLeft = 2;
                }

                return {
                    reverse: false,
                    related: bRelated,
                    dimension: sDimension,
                    zIndex: zIndex || TOOLTIP_Z_INDEX,
                    millisecond: nTime,
                    position: nRealLeft,
                    left: nRealLeft,
                    panelLeft: nRealPanelLeft,
                    time: new Date(nTime).Format(),
                    list: this.getCurrentDataList(nTime)
                }   
            },
            // 设置投产可见性。
            changePoolInAndOutVisibility () {
                
                let sColor = "#333",
                    sText = "全部投产",
                    raletedData = $.extend(true, [], this.dimension.filter(o=> o.key === 'pool')[0].data),
                    oOption = {
                        series: []
                    }

                // 切换可见性。
                this.onlyShowRelatedData = !this.onlyShowRelatedData

                if(this.onlyShowRelatedData) {
                    // 若只展示起点相关。
                    sColor = GREEN;
                    sText = "相关投产";
                    raletedData = raletedData.filter(arr => arr[5]);
                    raletedData = raletedData.map(arr => {
                        arr[2] = arr[5];
                        return arr;
                    })
                }

                // 投产点。
                oOption.series.push({
                    name: "投产",
                    data: raletedData
                })
                // 按钮字体颜色。
                oOption.graphic = {
                    id: 'text',
                    style: {
                        fill: sColor,
                        text: sText
                    }
                }

                this.chart.setOption(oOption);       
            },
            // 散点图点击事件处理。
            scatterClickHandle (value) {       
                if(!this.markLine.filter(o => o.xAxis===value[0]).length) {
                    let bRelated = !!value[5]
                    // 若无该标记线，添加标记线，并标记是否与起点相关。
                    this.markLine.push({ xAxis: value[0], related: bRelated, dimension: value[4]});

                    this.compareList = this.compareList.map(o => {
                        o.zIndex = TOOLTIP_Z_INDEX
                        return o
                    })
                    // 添加对比数据。
                    this.compareList.push(this.transformTooltipDataToCompareData(value[0], bRelated, value[4], TOOLTIP_Z_INDEX+1));
                   
                }
            },
            // 标记线点击事件。
            markLineClickHandle (value) {
                let nIndex = 0
                this.markLine.map((o,index) => o.xAxis === value?(nIndex = index):'')
                
                // 删除标记线。
                let oMark = this.markLine.splice(nIndex, 1)[0]

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
                    this.selectedEquipmentId = '';
                    this.categories = this.categories.map(o => {                              
                        if(sEquipment === o.value) {
                            o.value = o.value.slice(0,-1)+0;
                        }
                        return o;
                    })
                }else {
                    // 若未选中，则选中。
                    this.selectedEquipmentId = sId;
                    this.categories = this.categories.map((o, index) => {
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

                // 设置选中的时间。
                this.setSelectedTime();
            },
            // 悬浮框点击事件。
            suspendTooltipClickHandle (event) {
                let aData = this.axisTooltipData[0].value,
                    nTime = aData[0],
                    bRelated = !!aData[5];

                // 添加标记线。
                this.markLine.push({ xAxis: nTime, related: bRelated, dimension: value[4]});

                this.compareList = this.compareList.map(o => {
                    o.zIndex = TOOLTIP_Z_INDEX
                    return o
                })
                // 添加对比数据。
                this.compareList.push(this.transformTooltipDataToCompareData(nTime, bRelated, aData[4], TOOLTIP_Z_INDEX+1));                
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
            // 图形缩放处理。
            chartZoomHandle (params) {
                if((params.dataZoomId && params.dataZoomId.indexOf("1")) || params.type === "datazoom") {
                    // x轴缩放 || 工具栏缩放按钮。
                    let oXAxis = this.getScaledxAxis(),
                        // 缩放后的时间轴时长。
                        nScaledTimeLine = oXAxis.endValue - oXAxis.startValue,
                        // 时间范围。
                        oTime = this.getRealTime(),
                        
                        // 数据面板宽度。
                        nViewWidth = document.getElementById("equipments").clientWidth - GRID_LEFT - GRID_RIGHT,
                        // 提示框宽度占比。
                        nViewLeft = TOOLTIP_WIDTH/nViewWidth;

                    this.datetime.realStart = oTime.start;
                    this.datetime.realEnd = oTime.end;
                    // 设置选中的时间。
                    this.setSelectedTime();

                    this.compareList = this.compareList.map(o => {
                        // 距左侧距离。            
                        let nLeft = (o.millisecond - oXAxis.startValue) / nScaledTimeLine,
                            nRealLeft = nLeft,
                            // 提示框距左侧距离。
                            nPanelLeft = nLeft -nViewLeft,
                            nRealPanelLeft = nPanelLeft;

                        if(!o.reverse) {
                            // 若朝右。
                            if(nLeft < 0) {
                                nRealLeft = -1;
                            }else if(nLeft > 1) {
                                nRealLeft = 2;
                            }

                            o.position = nRealLeft
                        }else {
                            // 若朝作左。
                            if(nLeft < 0) {
                                nRealLeft = -1;
                                nRealPanelLeft = -1;
                            }else if(nLeft > 1) {
                                nRealLeft = 2;
                                nRealPanelLeft = 2
                            }
                            o.position = nRealPanelLeft
                        }

                        o.left = nRealLeft;
                        o.panelLeft = nRealPanelLeft;
                        return o;
                    })
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
            reversePanelClickHandle (compareData) {
                compareData.reverse = !compareData.reverse;                
                compareData.position = compareData.reverse ? compareData.panelLeft:compareData.left;
            },
            // 提示面板鼠标移入事件。
            tooltipPanelMouseenterHandle (nTime) {
                
                // 面板对应时间点。
                // let nTime = Number(event.currentTarget.getAttribute("data-id"))
                this.setCompareTooltipZIndex(nTime);
            },
            /**
             * 维度点击事件。
             * @param {Object} item
             * @return {void}
             */
            legendClickHandle(item) {
                if(item.key === "parameter") {
                    return false;
                }
                let sType;
                if(item.show) {
                    sType = 'legendUnSelect'
                }else {
                    sType = 'legendSelect';
                }

                item.show = !item.show;

                // 触发维度选择事件。
                this.chart.dispatchAction({
                    type: sType,
                    name: item.name
                })
            },
            
            // 设置图表事件。
            setChartEvent () {
                this.chart.on("click", this.chartClickHandle)
                this.chart.on("datazoom", this.chartZoomHandle)
            },
            /**
			 * 跳转按钮点击事件。
			 * @param {Object} oData
			 * @return {void}
			 */
			listButtonClick(oData) {
				if(oData.router) {				
					let oQuery = this.getParamter(oData.query);
					
                    // 保存数据都本地。
                    this.setSessionStorage();
					this.$router.replace({path: oData.router, query: oQuery});
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
                            oParam[param] = this.selectedEquipmentName;
                            break;
						// case "equipmentList"://equipmentIdList
						// 	oParam[param] = this.selectedEquipmentId;
                        // 	break;
                        case "doOutIdList": 
							oParam[param] = this.doOutIdList;
							break;
						case "equipmentId": 
							oParam[param] = this.selectedEquipmentId;
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
			// 显示提示信息。
			showMessage() {
				this.$message({
					message: this.sErrorMessage,
					duration: 3000
				});
            },
            // 请求成功。
            requestSucess(oData) {
                this.loading = false;
                this.categories = [];
                // 保存数据。		
                let aoData = oData;

                if(!aoData.length) {
                    return;
                }

                // 初始化图形数据。
                this.initChartData(aoData);
                // 添加图形数据。
                this.setChartData();	
            },
            // 请求失败。
            requestFail(sErrorMessage) {
                this.loading = false;
                this.categories = [];
                // 提示信息。
				this.sErrorMessage = "暂无数据";
				console.log(sErrorMessage);
            },
            // 请求错误。
            requestError(err) {
                this.loading = false;
				this.sErrorMessage = "暂无数据";
				console.log("查询出错");
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
                
                this.$register.sendRequest(this.$store, this.$ajax, sUrl, "post", {
					equipmentList: equipmentList, //equipmentIdList
					startTime: this.datetime.start,
					endTime: this.datetime.end,
					type: 0
                }, this.requestSucess, this.requestFail, this.requestError)
			},
            // 过滤异常数据(组号为-1)。
            filterAbnormalData(aoData) {
                if(aoData) {
                    return aoData.filter((out)=>(out.groupId !== -1));
                }else {
                    return []
                }
            },
            // 初始化图形数据。
            initChartData (aoData) {
                // 更改顺序。
                aoData.reverse();

                let nLength = aoData.length - 1

                aoData.forEach((o,index) => {
                    if(index === nLength) {
                        // 默认选中第一台设备。
                        this.selectedEquipmentId = o.equipmentId;
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
                            startWorkList: this.filterAbnormalData(o.startWorkList),
                            finishWorkList: this.filterAbnormalData(o.finishWorkList)
                        },
                        // 投产投产
                        pool: {
                            poolInList: this.filterAbnormalData(o.poolInList),
                            poolOutList: this.filterAbnormalData(o.poolOutList)
                        },
                        // 质量
                        quality: {
                            qcList: this.filterAbnormalData(o.qcList),
                            submitQcList: this.filterAbnormalData(o.submitQcList)
                        },
                        // 事件
                        event: {
                            startEquipWarningList: this.filterAbnormalData(o.startEquipWarningList),
                            endEquipWarningList: this.filterAbnormalData(o.endEquipWarningList)
                        },
                        // 维护
                        repair: {
                            spotCheckList: this.filterAbnormalData(o.spotCheckList),
                            startEquipRepairList: this.filterAbnormalData(o.startEquipRepairList),
                            endEquipRepairList: this.filterAbnormalData(o.endEquipRepairList)
                        },
                        // 工具
                        tool: {
                            installToolList: this.filterAbnormalData(o.installToolList),
                            removeToolList: this.filterAbnormalData(o.removeToolList)
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
            // 设备状态显示切换。
            toggleStateHandle() {
                this.showState = !this.showState;

                if(this.showState) {
                    this.showStateHandle();
                }else {
                    this.hideStateHandle();
                }
            },
            // 显示状态。
            showStateHandle() {         
                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,
                        data: this.getStatusData(),
                        tooltip: {
                            trigger: 'item'
                        }
                    }]       
                });
            },
            // 隐藏状态。
            hideStateHandle() {
                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,
                        data: this.getVisualStateData(),
                        tooltip: {
                            trigger: 'none'
                        }

                    }]
                });
            },
            // 设置图形数据。
            setChartData () {  
                               
                // 设备状态。
                this.option.series.filter(o => o.name===CHART_STATE_NAME)[0].data = this.showState ? this.getStatusData(): this.getVisualStateData();
                
                // 获取各事件维度数据。
                this.dimension.forEach(item => {
                    let oFilter = this.option.series.filter(o => o.name==item.name)[0],
                        oResult = $.extend(true, {}, this.getDimensionData(item.key));
                    if(oResult.markPoint.length) {
                        oFilter.markPoint.data = oResult.markPoint
                    }
                    
                    if(item.key === 'pool' &&　this.onlyShowRelatedData && !this.bRestrain) {
                        // 设置可见性，若只展示起点相关。              
                        oFilter.data = oResult.data.filter(arr => arr[5]);
                        // 设置数值显示为起点相关的数量。     
                        oFilter.data = oFilter.data.map(arr => {
                            arr[2] = arr[5]
                            return arr;
                        })                                            
                    }else {
                        oFilter.data = oResult.data
                    }
                    
                })

                if(this.equipments.length > 1) {
                    // 若大于一台设备。
                    // 添加y轴缩放。
                    this.option.dataZoom.push(Object.assign({
                        yAxisIndex: [0],
                        width: 16,
                        labelFormatter: function(index, value) {
                            return value.split("+")[0]
                        },
                        right: Y_AXIS_ZOOM_RIGHT,
                        // showDetail: false
                    },oAxis))
                }

                this.chart.setOption(this.option, true);
                // 设置提示框的最大高度。
                this.setTooltipHeight();

                // 设置选中设备时间范围。
                this.setSelectedTime();
                // 设置提示框数据。
                this.setTooltip();
                
            },
            // 设置提示框。
            setTooltip() {
                this.markLine.forEach(o => {
                    // 添加对比数据。
                    this.compareList.push(this.transformTooltipDataToCompareData(o.xAxis, o.related, o.dimension, TOOLTIP_Z_INDEX));
                })
            },
            // 设置选中时间。
            setSelectedTime() {
                let aoLine = [];
                if(this.selectedEquipmentId) {
                    let nIndex;
                    this.categories.some((o,index) => {
                        if(o.id == this.selectedEquipmentId) {
                            nIndex = index;
                            return false;
                        }
                    }) 

                    aoLine = [{yAxis: nIndex}];            
                }

                this.chart.setOption({
                    series: [{
                        name: CHART_STATE_NAME,                           
                        markLine: {
                            label: {
                                normal: {
                                    formatter: () => {
                                        return `\n\n\n${new Date(this.datetime.realStart).Format("MM-dd hh:mm:ss")}~${new Date(this.datetime.realEnd).Format("MM-dd hh:mm:ss")}`
                                    }
                                }
                            },
                            data: aoLine
                        }
                    }]
                })
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
                        groupId: o.groupId,
                        doId: o.doId
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
                            {name: "投入时间", value: o.happenTime},
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
                            {name: "数量", value: o.quantity},
                            {name: "质量", value: o.qualityType}
                        ];
                        break;
                        // 质检
                    case "qcList": 
                        oResult.time = +new Date(o.startTime);
                        o.timePoint = o.startTime;
                        oResult.title = "质检-" + o.method;
                        oResult.tooltipData = [
                            {name: "开始时间", value: o.startTime},
                            {name: "结束时间", value: o.endTime},
                            {name: "检验人", value: o.personName},
                            {name: "检验结果", value: o.result}
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
                            {name: "事件类型", value: o.eventType},
                            {name: "事件原因", value: o.reason},
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
                            {name: "结束时间", value: o.endTime},
                            {name: "操作人", value: o.personName},
                            {name: "维护原因", value: o.reason}
                        ]; 
                        break;
                        // 上刀/模具
                    case "installToolList":
                        oResult.time = +new Date(o.happenTime);
                        o.timePoint = o.happenTime;
                        if(o.toolType == "刀具") {
                            sTitle = "上刀";
                        }else if(o.toolType == "模具") {
                            sTitle = "上模";
                        }else {
                            sTitle = "其他";
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
                            sTitle = "下刀";
                        }else if(o.toolType == "模具"){
                            sTitle = "下模";
                        }else {
                            sTitle = "其他";
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
                                oMap[sKey]++;                          
                                let oFilter = aoData.filter(aData => aData[0]===oData.time&&aData[1]===nIndex)[0];
                                oFilter[2]++;
   
                                if(sDimension === "pool" && !this.bRestrain) {
                                    // 若为投产，非遏制。
                                    if((key === "poolInList" && item.poolInId.indexOf(o.doId) > -1) ||
                                    (key === "poolOutList" && item.poolOutId.indexOf(o.doId) > -1)) {
                                        // 若为属于起点的投入或产出。
                                        if(!oFilter[5]) {
                                            // 若未被标记。
                                            // 设置标记点。
                                            aoMarkPoint.push({
                                                coord: [oData.time, nIndex]
                                            })
                                        }
                                        
                                        // 设置与起点相关。
                                        oData.related = true;
                                        oFilter[5]++;
                                    }
                                }

                                oFilter[3].push(oData);

                            }else {
                                oMap[sKey] = 1;      

                                let nTag = 0;

                                if(sDimension === "pool" && !this.bRestrain) {
                                    if((key === "poolInList" && item.poolInId.indexOf(o.doId) > -1) ||
                                    (key === "poolOutList" && item.poolOutId.indexOf(o.doId) > -1)) {
                                        // 若为属于起点的投入或产出。
                                        // 设置标记点。
                                        aoMarkPoint.push({
                                            coord: [oData.time, nIndex]
                                        })
                                        // 设置与起点相关。
                                        // aPointer.push(true)
                                        oData.related = true;
                                        nTag++;
                                    }
                                }

                                let aPointer = [oData.time, nIndex, 1, [oData], sDimension, nTag];
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
            // 设置无数据状态。
            getVisualStateData() {
                return this.equipments.map((item, index) => {
                    return {
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
                    };    
                })
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
                        return;
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
                this.datetime.realStart = this.datetime.start;
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
                this.datetime.realEnd= this.datetime.end;
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
            // 提示框显示位置设置。
            tooltipPosition(pos, params, el, elRect, size) {
                return {
                    right: 2,
                    top: GRID_TOP
                }                                          
            },
            // 数据提示。
            tooltipFormatter (params) {
                
                if(this.markLine.filter(o => o.xAxis === params[0].axisValue).length) {
                    // 若已存在提示面板。
                    return;
                }

                // 保存提示框数据。            
                this.axisTooltipData = params;

                let sHtml = "",
                    oGroupId = {};
                    
                    
                params.forEach(param => {
                    let aoValue = param.value,
                        sList = "",
                        yAxisIndex = aoValue[1],
                        oGroupIdList = new Set(),
                        nIndex = 0;
                        // sColor = (this.dimension.filter(o => o.name === param.seriesName)[0]).color;

                    // 第一级设备。
                    oGroupId[yAxisIndex] = {}

                    // 事件列表
                    aoValue[3].forEach((o,index) => {
                        if(aoValue[4]!=="pool" || (aoValue[4]==="pool" && !this.onlyShowRelatedData) || (this.onlyShowRelatedData && o.related)) {
                            // 若展示全部，或只展示与起点相关，且当前点与起点相关。
                            let sGroup = "",
                                sTag = "";

                            // 保存分组id。
                            if(o.groupId != null && o.groupId !== "") {
                                oGroupIdList.add(o.groupId)
                                sGroup = o.groupId
                            }

                            if(o.related) {
                                // 若为起点相关。
                                sTag = `<i class="icon icon-arrow-tag"></i>`;
                            }
                            if(sGroup) {
                                sList += `<div style="color:${param.color}">${++nIndex}.${o.title}&nbsp;&nbsp;事件组：${sGroup}${sTag}</div>`;
                            }else {
                                sList += `<div style="color:${param.color}">${++nIndex}.${o.title}${sTag}</div>`;
                            }
                            
                            o.tooltipData.forEach(tip => {
                                sList += `<div style="padding:0 5px;"><span>${tip.name}:&nbsp;&nbsp;${this.parseData(tip.value)}<span></div>`                
                            })
                        }

                    })

                    // 设备列表
                    sHtml += `<div>
                        <div style="color:${param.color};font-weight:bold">${param.name.split("+")[0]}&nbsp;&nbsp;&nbsp;&nbsp;${param.seriesName}&nbsp;&nbsp;&nbsp;&nbsp;${(this.onlyShowRelatedData&&aoValue[4]==="pool")?aoValue[5]:aoValue[2]}条记录</div>
                        <div style="margin-top:10px">${sList}</div>
                    </div>`

                    // 第二级事件。
                    oGroupId[yAxisIndex][param.seriesIndex] = [...oGroupIdList]
                })

                sHtml = `<div class="suspend-tooltip-wrapper" style="width:188px;padding:10px;">${sHtml}</div>`

                this.highlightGroup(oGroupId)

                return sHtml;             
            },
            stateTooltipPosition(pos, params, el, elRect, size) {       
                pos[0] = pos[0] + TOOLTIP_X_DISTANCE;
                
                if(pos[0] + size.contentSize[0] > size.viewSize[0]) {
                    // 若超出x轴范围
                    pos[0] = pos[0] - TOOLTIP_X_DISTANCE*2 - size.contentSize[0]
                }

                return pos;                            
            },
            // 状态提示。
            stateTooltipFormatter(params) {
                // if(!params.name) {
                //     return '';
                // }
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
            // 数据格式化。
            parseData(value) {
                if(value == null || value === "") {
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
                // 跳转之前保存数据。
                this.setSessionStorage();
                let oDate = this.getRealTime();
                // 根据设备+开始时间+结束时间，查询可疑品列表。
                this.$router.replace({ path: "/process/restrain", query: {
                    equipmentName: this.selectedEquipmentName,
                    equipmentId: this.selectedEquipmentId,
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
                            "equipmentId": this.selectedEquipmentId,//'493-017-2',
                            "equipmentName": this.selectedEquipmentName,
                            "startTime": oDate.start,
                            "endTime": oDate.end
                        }, 
                        "type": "time"
                    }

                sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
                window.open("trackIndex.html?tag="+tag);
      
            }
        }
    }  
</script>

<style lang="less">   
    @import "../../assets/css/base.less";

    .name-color(@color) {
        .name {
            border-color: @color;

            &:hover {
                background-color: @color;
                color: #fff;
            }
        }
    }

    .links-color(@color) {
        .dimension-links {
            .line {
                color: @color;
            }

            .circle {
                span {
                    background-color: @color;
                }
                
            }

            ul {
                border-color: @color;

                li {
                    &:hover {
                        color: @color;
                    }
                }
            }
        }
    }

    .dimension-color(@color) {
        .name-color(@color);
        .links-color(@color);
    }

	#router-echart  {	  	
    	.content-list {
			// padding-top: 30px;
            position: relative;
            
            // .analysis {
            //     position: relative;
            // }

            .illustration {
                position: absolute;
                left: 0;
                font-size: 12px;
                cursor: pointer;

                &>div {
                    padding: 5px 0;

                    &>.icon {
                        margin-right: 5px;
                    }
                }
            }

            .legend {
                position: absolute;
                margin: 0 10%;
                width: 80%;
                top: 5px;
                text-align: center;
                z-index: 102;

                .dimension {
                    display: inline-block;
                    margin: 0 10px;
                    text-align: center;
                    color: #999;
                    position: relative;

                    .name {
                        display: inline-block;
                        width: 70px;
                        border: 2px solid #ccc;
                        height: 20px;
                        line-height: 20px;
                        cursor: pointer; 

                        &:hover {
                            background-color: #ccc;
                            color: #fff;
                        }                       
                    }

                    .dimension-links {
                        position:absolute;

                        .line {
                            height: 12px;
                            line-height: 12px;
                            font-size: 14px;
                            color: #ccc;
                            font-weight: bold;
                        }

                        .circle {
                            height: 4px;
                            line-height: 4px;

                            span {
                                display: inline-block;
                                width: 6px;
                                height: 6px;
                                border-radius: 3px;
                                background-color: #ccc;
                            }
                            
                        }

                        ul {
                            width: 72px;
                            border: 1px solid #ccc;
                            background-color: rgba(255, 255, 255, 0.7);

                            li {
                                padding: 5px 0;
                                cursor: pointer;
                            }
                        }
                    }
                }

                .dimension-quality {
                    // 质量。
                    color: #333;
                    .dimension-color(@quality)
                }
                .dimension-pool {
                    // 投产。
                    color: #333;
                    .dimension-color(@pool)
                }
                .dimension-work {
                    // 工单。
                    color: #333;
                    .dimension-color(@work)
                }
                .dimension-event {
                    // 事件。
                    color: #333;
                    .dimension-color(@event)
                }
                .dimension-tool {
                    // 工具。
                    color: #333;
                    .dimension-color(@tool)
                }
                .dimension-repair {
                    // 维护。
                    color: #333;
                    .dimension-color(@repair)
                }
                .dimension-parameter {
                    // 工艺。
                    color: #333;

                    .name {
                        border-color:@parameter;
                        cursor: default;

                        &:hover {
                            background-color: #fff;
                            color: #333;
                        }
                    }
                    .links-color(@parameter)
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
                margin-bottom: 10px;
                text-align: center;
                // position: absolute;
                // bottom: -10px;

                .btn-plain {
                    width: 70px;
                    height: 24px;
                    font-size: 12px;
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
                    width: 2px;
                    border-left: 2px dashed @tooltip;
                    box-sizing: border-box;
                    // background-color: @tooltip;
                }
            }

            .tooltip-panel {
                // padding: 10px;
                background-color: rgba(255, 255, 255, 0.6);
                font-size: 12px;
                line-height: 14px;
                position: absolute;
                // top: 60px;
                width: 220px;
                box-sizing: border-box;
                // z-index: 100;
                color: #000;//#fff;
                border: 2px solid @tooltip;
                word-break: break-all;

                &:hover {
                    background-color: #fff;
                }

                .btn-close, .btn-reverse {
                    position: absolute;
                    top: 4px;        
                    cursor: pointer;
                    
                }

                .btn-close {
                    right: 2px;
                }

                .btn-reverse {
                    right: 22px;
                }

                .tooltip-time {
                    color: #fff;
                    // font-size: 12px;
                    background-color: @tooltip;
                    // font-weight: bold;
                    // padding-bottom: 5px;
                    // text-align: center;
                    text-indent: 10px;
                    height: 24px;
                    line-height: 24px;
                    cursor: pointer;
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

            .setting {
                // position: absolute;
                // bottom: 0px;
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
                    margin-left: 107px;
                }
                .end {
                    float: right;
                    margin-right: 126px;
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

    .icon-arrow-tag {
        margin: -2px 5px 0 5px;
        width: 12px;
        height: 12px;
        background: url(../../assets/img/icon-pin.png);
        background-size: 12px 12px;
    }
</style>
