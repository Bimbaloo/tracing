<template>
    <div class="router-content">
        <div class="inner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                </div>
            </div>
            <!-- <h2 class="content-title" id='content-title'>
                <span>工艺参数</span>
            </h2> -->
            <div class='contentBox' :style="{ flexBasis: flexbase + 'px' }">
                <div v-if="!barcodeTableData.show && !chartShow" class="error">
                    {{ empty }}
                </div>
                <el-tabs v-else v-model="activeName" @tab-click="tabChange">
                    <el-tab-pane label="条码表" name="table" v-if="barcodeTableData.show" class="table">
                        <div class="barcode-input">
                            <el-form :model="ruleForm"  ref="ruleForm" class='el-form-input'>
                                <el-form-item label="条码：" > 
                                    <el-input v-model="ruleForm.input" placeholder="请输入条码"  @change="updateRow" ></el-input>
                                </el-form-item>
                            </el-form>
                            <span class='table-handle'>
                                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(barcodeTableData, $event)"></i>
                                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('barcodeTable', $event)"></i>
                            </span>
                        </div>
                        <div class="content-table" ref="barcodeTable">
                            <el-table 
                            :data="datas" 
                            stripe 
                            class="table" 
                            :row-key="barcodeTableData.data.barcode" 
                            v-loading="barcodeTableData.loading" 
                            element-loading-text="拼命加载中" 
                            style="width: 100%" 
                            ref="multipleTable" 
                            @expand="expandRow"> 
                            <!--:height="barcodeTableData.height"-->
                                <el-table-column 
                                v-if="!!column.show" 
                                v-for="column in columns" 
                                align="center" 
                                :type="column.type" 
                                :prop="column.prop" 
                                :label="column.name" 
                                :key="column.prop" 
                                :class-name="column.class" 
                                :width="column.width">
                                    <template scope="props">
                                        <el-form 
                                        label-position="left" 
                                         
                                        class="demo-table-expand expand-form" 
                                        v-if="column.type === 'expand'">                             
                                            <div v-if="props.row.list.length">
                                                <el-form-item                  
                                                :label="`${prop.description}${prop.varUnit}`" 
                                                v-for="(prop,index) in props.row.list" 
                                                :key="prop.varStdId">
                                                    <span v-for="(item,index) in prop.params" :key="index">&nbsp;{{ item.value}}({{item.pickTime}})&nbsp;</span>
                                                </el-form-item>
                                            </div>                                            
                                            <div v-else>{{detailTip}}</div>
                                        </el-form>
                                        <div v-else :class="[ 'cell-content']">
                                            {{ props.row[column.prop] }}
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="曲线图" name="chart" v-if="chartShow" class="chart">
                        <el-tabs v-loading="loading">
                            <el-tab-pane :label="chartData.filename" v-for="(chartData,index) in tableDatas" :key="index">
                                <el-switch
                                    v-model="chartData.value"
                                    on-color="#42af8f"
                                    off-color="#42af8f"
                                    on-text="图表"
                                    off-text="表格"
                                    on-value="表格"
                                    off-value="图形"
                                    v-for="(option,index) in options" 
                                    v-if="option.series[0].name === chartData.filename"
                                    :key="index">
                                </el-switch>
                                <div class="content-echarts" 
                                v-for="(option,index) in options" 
                                :key="index"
                                v-if="option.series[0].name === chartData.filename" 
                                v-show="chartData.value === '图形'">
                                    <div class="charts" :id="`charts`+index"></div>
                                </div>
                                <div class="content-tables" v-show="chartData.value === '表格'">
                                    <h2 class="content-title tableData">
                                        <span class='table-title'>
                                            <span>检验参数：{{chartData.varStdId}}</span>
                                            <span>单位：{{chartData.unit}}</span>
                                        </span>
                                        <span class='table-handle'>
                                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(chartData, $event)"></i>
                                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle(index, $event)"></i>
                                        </span>
                                    </h2>
                                    <div class="content-table" ref="tableDataindex">
                                        <v-table :table-data="chartData" :heights="tableHeight" :resize="tdResize"></v-table>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>             
                    </el-tab-pane>
                </el-tabs>
            </div>

        </div>
    </div>
</template>

<script>
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
import html2canvas from 'html2canvas'
import table from "components/basic/table.vue"
import rasterizeHTML from 'rasterizehtml'

// const url = HOST + "/api/v1/processparameter/by-equipment-time";
//const url = "http://192.168.20.102:8088/api/v1/processparameter/by-equipment-time";
const url = "static/echarts.json"
// 条码表接口
const BARCODE_TABLE_DATA = HOST + "/api/v1/processparameter/barcode-list"
// 曲线图接口
const CHART_DATA = HOST + "/api/v1/processparameter/by-equipment-time"
// 条码详情接口
const BARCODE_DETAIL_DATA = HOST + "/api/v1/processparameter/by-equipment-time-barcode"

export default {
    components: {
        'v-table': table
    },
    data() {
        return {
            // 条码筛选。
            barcode: '',
            // 条码详情无数据提示。
            detailTip: '',
            activeName: 'table',
            excel: true,
            print: true,
            loading: false,
            chartShow: true,
            sErrorMessage: "",
            empty: "暂无数据。",
            error: false,
            styleObject: {
                //  "min-width": "2000px"
            },
            tdResize: true, //是否允许拖动table大小
            condition: {},   // 显示的查询条件   
            oQuery: {}, // 查询条件。 
            filters: {},
            dataName: [      // 条件对应中文名
                {
                    itemCode: "equipmentName",
                    itemName: "设备"
                }, {
                    itemCode: "startTime",
                    itemName: "开始时间"
                }, {
                    itemCode: "endTime",
                    itemName: "结束时间"
                },
            ],
            /* echarts的配置文件 */
            options: [],
            /** */
            myEcharts: [],
            //  viewHeight:0
            routerContent: 0,
            flexbase: 200,
            tableDatas: [],
            chartFetched: false,
            tableHeight: 400,
            /* 条码表 */
            barcodeTableData: {
                loading: false,
                show: true,
                filename: '条码表',
                columns: [{
                    type: "expand",
                    width: "100",
                    show:true               //是否在表头显示
                }, {
                    name: "条码",
                    prop: "barcode",
                    show:true
                }, {
                    name: "开始时间",
                    prop: "minPickTime",
                    show:true
                }, {
                    name: "结束时间",
                    prop: "maxPickTime",
                    show:true
                }, {
                    name: "记录数",
                    prop: "total",
                    show:true
                }],
                data: [],
                height: 400
            },
            ruleForm:{
                input: ""
            },
        }

    },
    created() {
        this.fetchData();    
    },
    computed: {

        viewHeight: function() {
            return this.routerContent
        },
        resizeY: function() {
            return this.$store && this.$store.state.resizeY
        },
        resize: function() {
            return this.$store && this.$store.state.resize
        },
        fullscreen: function() {
            return this.$store && this.$store.state.fullscreen
        },

        /* 列信息 */
        columns: function() {
            return this.barcodeTableData.columns 
        },
        /* 显示的行信息 */
        datas: function() {
            if(this.ruleForm.input === ""){
                return this.barcodeTableData.data 
            }else {
                return this.updateRow(this.ruleForm.input)
            }
            
        }        
    },
    mounted() {
        this.addEvent(); //监听resize变化 触发 echarts.resize()
        this.routerContent = document.querySelector(".router-content").offsetHeight  //获取初始高度
        this.flexbase = this.adjustHeight()
        this.tableHeight = this.setTableHeight()
    },

    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': function(to, from) {
        	// 当是工艺参数时，更新数据
        	if(to.meta.title == 'parameter') {
        		this.fetchData();
        	}
        },
        resize: 'updateEcharts',
        /* 上下拖动时，重新设置flexBase大小变化 */
        "resizeY": function(){
        	if(this.$route.meta.title == 'parameter') {
	            this.setFlexBase()
	            this.tableHeight = this.setTableHeight()
        	}
        },
        /* 全屏大小时，重新设置flexBase大小 */
        "fullscreen": function(){
            if(this.$route.meta.title == 'parameter') {
	            this.setFlexBase()
	            this.tableHeight = this.setTableHeight()
        	}
        }
    },
    methods: {
        // 获取数据。
        fetchData() {
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {//equipmentIdList//equipmentList
                    this.oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })
            this.filters = this.getFilters()

            /* 测试数据 */
            this.oQuery = {
                "equipmentId": "216",
                "startTime": "2017-07-01 02:00:00",
                "endTime": "2017-07-01 04:00:00"
            }

            if(this.activeName === "table") {
                // 条码表。
                this.fetchBarcodeTableData();
            }else {
                // 获取曲线图数据。
                this.fetchChartData();
            }  
        },
        // 获取曲线图数据。
        fetchChartData() {
            this.loading = true
            this.chartFetched = true
            /* 设置显示信息和查询条件 */

            this.$register.sendRequest(this.$store, 
                                        this.$ajax, 
                                        CHART_DATA, 
                                        "get", 
                                        this.oQuery, 
                                        this.requestSucess, 
                                        this.requestFail, 
                                        this.requestError)
        },
        // 获取条码表数据。
        fetchBarcodeTableData() {
            this.barcodeTableData.loading = true
            this.detailTip = ''
            this.$register.sendRequest(this.$store, 
                                        this.$ajax, 
                                        BARCODE_TABLE_DATA, 
                                        "get", 
                                        this.oQuery, 
                                        this.requestBarcodeDataSucess, 
                                        this.requestBarcodeDataFail, 
                                        this.requestBarcodeDataError)

        },
        // 获取条码数据成功。
        requestBarcodeDataSucess(aoData) {
            this.barcodeTableData.loading = false
            if(aoData.length) {
                // 若有数据。
                this.barcodeTableData.show = true
                this.barcodeTableData.data = aoData.map(o => {
                    o.list = []
                    // 是否已请求详情数据。
                    o.fetched = false
                    return o
                })
            }else {
                // 若无数据，影藏tab。
                this.barcodeTableData.show = false
                // 激活曲线图。
                this.activeName = "chart"
                this.fetchChartData()

                this.detailTip = '暂无数据。'
            }
        },
        // 获取条码数据失败。
        requestBarcodeDataFail() {
            this.barcodeTableData.loading = false
            this.barcodeTableData.show = false
            this.detailTip = '暂无数据。'
            // 激活曲线图。
            this.activeName = "chart"
            this.fetchChartData()
        },
        // 获取条码数据错误。
        requestBarcodeDataError() {
            this.barcodeTableData.loading = false
            this.barcodeTableData.show = false
            this.detailTip = '暂无数据。'
            // 激活曲线图。
            this.activeName = "chart"
            this.fetchChartData()
        },
    	getFilters() {
            let filters = this.condition
            for (let i in filters) {
                if (filters[i] === '' || i === '_tag') {
                    delete filters[i]
                }
            }
            /* 为了将获取到的 barcode等转换为对应的中文 */
            let b = Object.entries(filters),
                a = this.dataName;

            b.forEach(o =>
                a.forEach(function(x) {
                    if (o[0] === x.itemCode) {
                        o[0] = x.itemName
                    }
                })
            )
            return b
            /* 为了将获取到的 barcode等转换为对应的中文 */
        },
        // 请求成功。
        requestSucess(oData) {
            debugger
            if (!oData.length) {  //如果查询结果为空
                this.error = true
                this.chartShow = false
            } else {
                this.error = false
            }
            let optionArr = [];
            let tableDataArr = [];
            this.loading = false;

            let optionsData = oData;  //获取到的data
            optionsData.map((data, index) => {
                if (data.valueType === 1) {
                    optionArr.push(this.initOption(data, index))
                    tableDataArr.push(this.setTableData(data, index))
                    return optionArr
                } else {
                    /* 做成表格 */
                    tableDataArr.push(this.setTableData(data, index))
                    return tableDataArr
                }

            })
            tableDataArr.forEach(e=>{
               let value =  optionArr.some(el=>{
                    return el.series[0].name === e.filename
                })
               
                if(!value) {
                    e.value = "表格"
                }
            })

            this.options = optionArr         // 将处理后的 option 放入 options 中
            this.tableDatas = tableDataArr   // 将处理后的 tableData 放入 tableData 中
            this.$nextTick(() => {
                let tabPanes = document.querySelectorAll(".chart .el-tab-pane")
                tabPanes.forEach(el=>el.style.display = "")
                this.options.forEach((el, index) => {
                    this.initEcharts(el, index)
                })
                tabPanes.forEach((el,i)=>{
                    if(i !== 0){
                        el.style.display = "none"
                    }
                })

            })
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            this.loading = false;
            this.error = true;
            this.chartShow = false
            // 提示信息。
            console.log(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            this.error = true;
            this.chartShow = false
            console.log("数据库查询出错。")
        },
        // 选中修改。
        tabChange(oTab) {
            if(oTab.name == "chart") {
                // 若为曲线图。
                if(!this.chartFetched) {
                    // 若未获取数据。
                    this.fetchChartData()
                }
            }
        },
        /* 根据刷选条件显示行 */
        updateRow(value) {
            let odata;
            if(value !== ""){
                let reg =new RegExp("\\w*" + value + "\\w*");
                odata = this.barcodeTableData.data.filter((el)=>{
                   return reg.test(el.barcode) === true
                })
            }else{
                odata = this.barcodeTableData.data
            }
            return odata
        },
        // 获取条码对应的详情数据。
        expandRow(row, expanded) {
            if(expanded) {
                // 若为展开。
                let rowData = this.barcodeTableData.data.filter(o => o.barcode === row.barcode)[0]

                if(!rowData.fetched) {
                    // 若为第一次打开，获取详情数据。
                    rowData.fetched = true
                    this.$register.sendRequest(this.$store, 
                            this.$ajax, 
                            BARCODE_DETAIL_DATA, 
                            "get", 
                            Object.assign({barcode: row.barcode}, this.oQuery), 
                            (aoData) => {  
                                
                                aoData.forEach(o => {
                                    let oFilter = rowData.list.filter(item => item.varStdId === o.varStdId)[0]
                                    if(oFilter) {
                                        oFilter.params.push({
                                            pickTime: new Date(o.pickTime).Format("hh:mm:ss"),
                                            value: o.value
                                        })
                                    }else {
                                        rowData.list.push({
                                            varStdId: o.varStdId,
                                            description: o.description,
                                            varUnit: o.varUnit,
                                            params: [{
                                                pickTime: new Date(o.pickTime).Format("hh:mm:ss"),
                                                value: o.value
                                            }]
                                        })
                                    }
                                })
                            })
                }
            }
        },
        /* 获取高度函数 */
        adjustHeight() {

            let getHeight = 0;
            getHeight = Math.floor(
                this.viewHeight
                - this.outerHeight(document.querySelector(".condition"))
                - this.outerHeight(document.querySelector("#content-title"))
            );
            return getHeight;
        },
        /* 获取元素实际高度(含margin) */
        outerHeight(el) {
            if (!el) {
                return 0;
            }
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        },
        /* 设置table实际高度 */
        setFlexBase() {
            this.routerContent = document.querySelector(".router-content").offsetHeight
            this.flexbase = this.adjustHeight()
        },
        setTableHeight(){
            let tabs = document.querySelector(".el-tabs")
            let tableHeight = this.viewHeight
                              -88
                              -48
                              -66   // tabs-head的高
                              -90   // table上面的标题
            return tableHeight
        },
        /* 处理每个tableData */
        setTableData(data, index) {
            debugger
            let tableData = {
                filename: "名称",
                unit: "",
                description: '',
                varStdId: '',
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: ""
                }, {
                    name: "检测值",
                    prop: "value",
                    width: ""
                }, {
                    name: "采集时间",
                    prop: "pickTime",
                    width: "",
                }],
                id: 0,
                data: [],
                value: "图形"
            }
            tableData.varStdId = data.varStdId
            tableData.unit = data.varUnit
            tableData.filename = data.description
            tableData.data = data.list.map((el) => {
                let arr = {}
                arr.value = el.value
                arr.pickTime = el.pickTime
                arr.barcode = el.barcode || ''
                return arr
            })
            debugger
            return tableData
        },
        /* 处理每个option */
        initOption(data, index) {
            /* 定义option模板 */
            let optionModal = {
                title: {
                    //text: 'XX 参数图表',
                    textStyle: {
                        fontSize: 16,
                        fontFamily: "Microsoft YaHei",
                        fontWeight: '400'
                    },
                    left: 4
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['XX参数']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        dataView: { readOnly: false },
                        magicType: { type: ['line', 'bar'] },
                        restore: {},
                        saveAsImage: {}
                    },
                    right: 2
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: [],
                    axisLine: {
                        lineStyle: {
                            color: "#999"
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#333'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    min: 50,
                    max: 400,
                    axisLabel: {
                        formatter: '{value} '
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#999"
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#333'
                        }
                    }
                },
                visualMap: {
                    show: false,
                    // pieces: [
                    // {
                    //     gt: 0,
                    //     lte: 4,
                    //     color: '#e60012'
                    // }, {
                    //     gt: 4,
                    //     lte: 21,
                    //     color: '#abcc52'
                    // }, {
                    //     gt: 21,
                    //     lte: 100,
                    //     color: '#e60012'
                    // }],
                    outOfRange: {
                        color: '#999'
                    }
                },
                series: [
                    {
                        name: 'XX参数',
                        type: 'line',
                        //  smooth: true,
                        //  smoothMonotone: "x",
                        //  symbol: 'circle',  //曲线
                        data: [],
                        markLine: {
                            // data: [
                            //     {
                            //         yAxis: 21,
                            //         name: '上限',
                            //         lineStyle: {
                            //             normal: {
                            //                 color: "#febf00",
                            //                 width: 2
                            //             }
                            //         }
                            //     },
                            //     {
                            //         yAxis: 4,
                            //         name: '下限',
                            //         lineStyle: {
                            //             normal: {
                            //                 color: "#febf00",
                            //                 width: 2
                            //             }
                            //         }
                            //     }
                            // ]
                        }
                    }
                ]
            };

            /* 设置option */
            //optionModal.title.text = data.description //设置图表名称
            optionModal.legend.data[0] = data.description //设置参数名称
            optionModal.xAxis.data = data.list.map((el) => { return el.pickTime }) //设置横坐标值
            optionModal.yAxis.axisLabel.formatter = data.varUnit ? ('{value}' + data.varUnit) : '{value}'      //设置纵坐标单位
            optionModal.series[0].name = data.description //设置参数名称
            optionModal.series[0].data = data.list.map((el) => { return el.value }) //设置纵坐标值

            /* 设置纵坐标的起始值 */
            const arrY = optionModal.series[0].data    //Y轴的所有值
            const yMax = Math.max(...arrY)             //获取Y轴最大值 
            const yMin = Math.min(...arrY)             //获取Y轴最小值
            const maximum = data.maxValue             //获取上限值 
            const minimum = data.minValue             //获取下限值 
            //debugger
            if (data.minValue === data.maxValue) {          // 没有上下限的时候（上限值 === 下限值）
                optionModal.visualMap.pieces = []
                optionModal.visualMap.pieces.push({
                    gt: yMin - 1,         //设置下限 
                    lte: yMax + 1,        //设置上限
                    color: '#abcc52'  //设置颜色
                })
                // optionModal.visualMap.pieces[0].gt = yMin   //设置下限  
                // optionModal.visualMap.pieces[0].lte = yMax  //设置上限
                // optionModal.visualMap.pieces[0].color = '#abcc52' //设置颜色
            } else {
                //debugger
                optionModal.series[0].markLine.data = []
                optionModal.series[0].markLine.data.push({
                    yAxis: data.maxValue,           //设置上限值
                    name: '上限',
                    lineStyle: { normal: { color: "#febf00", width: 2 } }  //上限的样式
                })
                // optionModal.series[0].markLine.data[0].yAxis = data.maxValue           //设置上限值
                // optionModal.series[0].markLine.data[0].name = '上限'                   
                // optionModal.series[0].markLine.data[0].lineStyle = { normal:{color: "#febf00",width: 2}}  //上限的样式

                optionModal.series[0].markLine.data.push({
                    yAxis: data.minValue,           //设置上限值
                    name: '下限',
                    lineStyle: { normal: { color: "#febf00", width: 2 } }  //下限的样式
                })
                // optionModal.series[0].markLine.data[1].yAxis = data.minValue           //设置下限值
                // optionModal.series[0].markLine.data[1].name = '下限'                   
                // optionModal.series[0].markLine.data[1].lineStyle = { normal:{color: "#febf00",width: 2}}  //下限的样式

                /* 设置颜色变化的上下限 */
                optionModal.visualMap.pieces = []
                optionModal.visualMap.pieces.push({
                    gt: (data.minValue - 100) < 0 ? 0 : (data.minValue - 100),
                    lte: data.minValue,                                         //设置下限 
                    color: '#e60012'                                            //设置低于下限颜色
                })
                // optionModal.visualMap.pieces[0].gt = (data.minValue - 100) < 0 ? 0 : (data.minValue - 100)
                // optionModal.visualMap.pieces[0].lte = data.minValue  //设置下限
                // optionModal.visualMap.pieces[0].color = '#e60012'    //设置低于下限颜色  

                optionModal.visualMap.pieces.push({
                    gt: data.minValue,      //设置下限
                    lte: data.maxValue,     //设置上限
                    color: '#abcc52'        //设置正常颜色
                })
                // optionModal.visualMap.pieces[1].gt = data.minValue   //设置下限
                // optionModal.visualMap.pieces[1].lte = data.maxValue  //设置上限
                // optionModal.visualMap.pieces[1].color = '#abcc52'    //设置正常颜色  

                optionModal.visualMap.pieces.push({
                    gt: data.minValue,            //设置上限
                    lte: data.maxValue + 100,
                    color: '#e60012'        //设置正常颜色
                })

                // optionModal.visualMap.pieces[2].gt = data.maxValue   //设置上限
                // optionModal.visualMap.pieces[2].lte = data.maxValue + 100
                // optionModal.visualMap.pieces[2].color = '#e60012'    //设置高于上限颜色
            }

            optionModal.yAxis.min = Math.ceil(Math.min(yMin, minimum) * 0.9)   //设置Y轴开始值为 最小值或最小合格值的0.9倍
            optionModal.yAxis.max = Math.ceil(Math.max(yMax, maximum) * 1.1)   //设置Y轴结束值为 最大值或最大合格值的1.1倍
            //console.log(optionModal)
            return optionModal
        },
        /* 绘制图表 */
        initEcharts(option, index) {
            let chart = document.getElementById('charts' + index);
            let echart = this.$echarts.init(chart);
            echart.setOption(option);
            this.myEcharts.push(echart)  //将生成的echarts实例对象放到 ' this.myEcharts ' 中
        },
        /* 当窗口大小变化，自适应大小 */
        updateEcharts() {

            let tabPanes = document.querySelectorAll(".chart .el-tab-pane")
            let index = 0   //记录当前tab页
            tabPanes.forEach((el,i)=>{      // 所有显示
                if( el.style.display !== "none" ){
                    index = i
                }
                el.style.display = ""
            })
            
            this.myEcharts.forEach((echart,i) => {
                echart.resize()
            })

            tabPanes.forEach((el,i)=>{
                if(i !== index ){
                    el.style.display = "none"
                }
            })

        },
        /* 监听窗口大小 更新echarts的大小 */
        addEvent() {
            window.addEventListener("resize", this.updateEcharts)
            window.addEventListener("resize", this.setFlexBase)
        },
        // 表格导出。
        exportExcelHandle(oData, event) {
            if (!oData) {
                return;
            }
            // 下载表格。
            window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
        },
        // 表格打印。
        printHandle(refTable, event) {
            //debugger
            let oTable = this.$refs.tableDataindex[refTable];

            if (!oTable) {
                return;
            }

            let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${oTable.querySelector(".el-table__header-wrapper").innerHTML}
                    </div>
                    <div class="el-table__body-wrapper">
                        ${oTable.querySelector(".el-table__body-wrapper").innerHTML}
                    </div>
                    <style>
                        .el-table td.is-center, .el-table th.is-center {
                            text-align: center;
                        }
                        .table thead th {
                            height: 36px;
                            background-color: #42af8f;
                        }
                        .table thead th .cell {
                            color: #fff;
                        }
                        .el-table__body-wrapper tr:nth-child(even) {
                            background-color: #fafafa;
                        }
                        .el-table__body-wrapper tr:nth-child(odd) {
                            background-color: #fff;
                        }
                        .el-table__body-wrapper td {
                        	white-space: normal;
    						word-break: break-all;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            // border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;	
                        }
                    </style>
                </div>
            `;

            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
        }
    }
}
</script>

<style lang="less">
.content-title.table-title {
    margin-top: 10px;
    margin-bottom: 0;
    color: #333;
    font-size: 14px;
    i {
        color: #ccc;
        float: right;
        &:first-child {
            transform: rotate(180deg);
            margin-left: 20px
        }
    }
}

.content-title {
    .icon-print {
        right: auto;
    }
}
.contentBox {
    &>.el-tabs {
        &>.el-tabs__header {
            border-bottom: none;
            margin: 0;

            .el-tabs__item {
                background-color: #fff;
                border: 2px solid #42AF8F;
                height: 30px;
                line-height: 30px;

                &.is-active {
                    background-color: #42AF8F;
                    color: #fff;
                }
            }
            .el-tabs__active-bar {
                display: none;
            }
        }
    }
    .chart {
        .el-tabs {
            .el-tabs__header {
                border-bottom-color: #ccc;
                .el-tabs__nav-wrap {
                    .el-tabs__nav-scroll {
                        .el-tabs__nav {
                            .el-tabs__item {
                                color: #666;
                                &:hover {
                                    color: #333;
                                }
                            }
                            .is-active {
                                color: #42AF8F
                            }
                        }
                    }
                }
            }
            .el-tabs__content {
                overflow: auto;
            }
        }
    }

}
.el-switch__label {
    span {
        font-size: 12px;
        top: 4.5px;
    }
}
</style>
<style lang="less" scoped>
.charts {
    width: 100%;
    box-sizing: border-box;
    min-height: 400px
}

.inner-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .content-title {
        margin-top: 0
    }
    .contentBox {
        display: flex;
        flex: 1 1;
        flex-direction: column;

        .el-tabs {
            display: flex;
            flex: 1;
            flex-direction: column;
        }

        .barcode-input {
            margin-top: 10px;
            .el-form {
                display: inline-block;

                .el-form-item {
                    margin-bottom: 0;
                }
                .el-input {
                    width: 300px;
                }
            }
            span {
                float: right;
                display: inline-block;
            }
        }

        .content-table {
            margin: 10px 0;
        }
    }
    .content-tables {
        margin-top: 0;
        margin-bottom: 20px;
        .tableData {
            display: flex;
            border-left: 0;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            margin-top: 20px;
            .table-handle {
                margin-right: 5px;
                i {
                    margin: 5px;
                    &:hover {
                        cursor: pointer
                    }
                }
            }
        }
    }
}

.table {
    .expand-form {
        .el-form-item {
            margin: 5px 10px;
        }
    }
}
</style>





