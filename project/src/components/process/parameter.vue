<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                </div>
            </div>
            <h2 class="content-title" id='content-title'>
                <span>工艺参数</span>
            </h2>
            <div class='contentBox' :style="{ flexBasis: flexbase + 'px' }">
                <el-tabs  >
                    <el-tab-pane :label="tableData.filename" v-for="(tableData,index) in tableDatas">
                        <div class="content-echarts" v-for="(option,index) in options" v-if="option.series[0].name === tableData.filename">
                            <div class="charts" :id="`charts`+index"></div>
                        </div>
                        <div class="content-tables">
                            <h2 class="content-title tableData">
                                <span class='table-title'>
                                    <span>检验参数：{{tableData.varStdId}}</span>
                                    <span>单位：{{tableData.unit}}</span>
                                </span>
                                <span class='table-handle'>
                                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle(index, $event)"></i>
                                </span>
                            </h2>
                            <div class="content-table" ref="tableDataindex">
                                <v-table :table-data="tableData" :max-height="400" :loading="loading" :resize="tdResize"></v-table>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
                <div v-if="error" class="error">
                    {{ empty }}
                </div>
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

//const url = HOST + "/api/v1/processparameter/by-equipment-time";
//const url = "http://192.168.20.102:8088/api/v1/processparameter/by-equipment-time";
const url = "static/echarts.json"

export default {
    components: {
        'v-table': table
    },
    data() {
        return {
            excel: true,
            print: true,
            loading: false,
            sErrorMessage: "",
            empty: "暂无数据。",
            error: false,
            styleObject: {
                //  "min-width": "2000px"
            },
            tdResize: true, //是否允许拖动table大小
            condition: {},   // 显示的查询条件    
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
            tableDatas: []
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
        /* 查询条件转数组中文 */
        filters: function() {
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
        }
    },
    mounted() {
        this.addEvent(); //监听resize变化 触发 echarts.resize()
        this.routerContent = document.querySelector(".router-content").offsetHeight  //获取初始高度
        this.flexbase = this.adjustHeight()
    },

    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'fetchData',
        resize: 'updateEcharts',
        /* 上下拖动时，重新设置flexBase大小变化 */
        "resizeY": 'setFlexBase',
        /* 全屏大小时，重新设置flexBase大小 */
        "fullscreen": 'setFlexBase'
    },
    methods: {
        // 请求成功。
        requestSucess(oData) {
            if (!oData.length) {  //如果查询结果为空
                this.error = true
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
            this.options = optionArr         // 将处理后的 option 放入 options 中
            this.tableDatas = tableDataArr   // 将处理后的 tableData 放入 tableData 中
            this.$nextTick(() => {
                let tabPanes = document.querySelectorAll(".el-tab-pane")
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
            // 提示信息。
            console.log(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            this.error = true;
            console.log("数据库查询出错。")
        },
        // 获取数据。
        fetchData() {

            this.loading = true;
            /* 设置显示信息和查询条件 */
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {//equipmentIdList//equipmentList
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })
            /* 测试数据 */
            // oQuery = {
            //     "equipmentId": "25",
            //     "startTime": "2017-08-11 01:27:37",
            //     "endTime": "2017-08-11 01:35:37"
            // }
            this.$register.sendRequest(this.$store, this.$ajax, url, "get", oQuery, this.requestSucess, this.requestFail, this.requestError)

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
        /* 处理每个tableData */
        setTableData(data, index) {
            let tableData = {
                filename: "名称",
                unit: "",
                description: '',
                varStdId: '',
                columns: [{
                    name: "检测值",
                    prop: "value",
                    width: ""
                }, {
                    name: "采集时间",
                    prop: "pickTime",
                    width: "",
                }],
                id: 0,
                data: []
            }
            tableData.varStdId = data.varStdId
            tableData.unit = data.varUnit
            tableData.filename = data.description
            tableData.data = data.list.map((el) => {
                let arr = {}
                arr.value = el.value
                arr.pickTime = el.pickTime
                return arr
            }
            )
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
            let echartDivs = document.querySelectorAll(".charts")
            let index = 0
            echartDivs.forEach((el,i)=>{
                if(el.parentNode.parentNode.style.display !== "none"){
                    index = i
                }
            })
            this.myEcharts.forEach((echart,i) => {
                if(i === index){
                    echart.resize()
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
</style>
<style lang="less" scoped>
.charts {
    width: 100%;
    box-sizing: border-box;
    min-height: 400px
}

.innner-content {
    display: flex;
    flex-direction: column;
    .content-title {
        margin-top: 0
    }
    .contentBox {
        display: flex;
        flex-direction: column;
        .el-tabs {
            display: flex;
            flex: 1;
            flex-direction: column;
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
</style>





