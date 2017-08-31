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
            <h2 class="content-title inTitle">
                工艺参数
            </h2>
            <div class="content-table" ref="inputTable">
                <div class="charts" :id="`charts`+index" v-for="(option,index) in options">{{index}}</div>
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
            styleObject: {
                //  "min-width": "2000px"
            },
            loading: false,
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
            routerContent: 0
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
        this.addEvent();
    },

    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'fetchData',
        resize: 'updateEcharts'
    },
    methods: {
        // 判断调用接口是否成功。
        judgeLoaderHandler(param, fnSu, fnFail) {
            let bRight = param.data.errorCode;

            // 判断是否调用成功。
            if (!bRight) {
                // 调用成功后的回调函数。
                fnSu && fnSu();
            } else {
                // 提示信息。
                console.log(param.data.errorMsg.message)
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
        // 获取数据。
        fetchData() {

            this.loading = true;
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {//equipmentIdList//equipmentList
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })

            this.$get(url, oQuery)
                .then((res) => {
                    let optionArr = [];
                    this.loading = false;
                    this.judgeLoaderHandler(res, () => {
                        let optionsData = res.data.data;  //获取到的data
                        optionsData.map((data) => {
                            optionArr.push(this.initOption(data))
                            return optionArr
                        })
                        this.options = optionArr   // 将处理后的option放入options中

                        this.$nextTick(() => {
                            this.options.forEach((el, index) => {
                                this.initEcharts(el, index)
                            })

                        })
                    });
                })
                .catch((err) => {
                    this.loading = false;
                    this.styleObject.minWidth = 0;
                    console.log("数据库查询出错。")
                })
        },


        /*  */
        setEcharts() {
            let chart = document.getElementById('charts'),
                echart = this.$echarts.init(chart);
            this.myEcharts.push(echart)
            echart.setOption(option);
        },
        /* 处理每个option */
        initOption(data) {
            /* 定义option模板 */
            let optionModal = {
                title: {
                    text: 'XX 参数图表',
                    subtext: ''
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
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
                },
                yAxis: {
                    type: 'value',
                    min: 50,
                    max: 400,
                    axisLabel: {
                        formatter: '{value} '
                    }
                },
                visualMap: {
                    top: 25,
                    right: 10,
                    pieces: [{
                        gt: 0,
                        lte: 4,
                        color: '#e60012'
                    }, {
                        gt: 4,
                        lte: 21,
                        color: '#abcc52'
                    }, {
                        gt: 21,
                        lte: 100,
                        color: '#e60012'
                    }],
                    outOfRange: {
                        color: '#999'
                    }
                },
                series: [
                    {
                        name: 'XX参数',
                        type: 'line',
                        smooth: true,
                        smoothMonotone: "x",
                        symbol: 'circle',
                        data: [],
                        markLine: {
                            data: [
                                {
                                    yAxis: 21,
                                    name: '上限',
                                    lineStyle: {
                                        normal: {
                                            color: "#febf00"
                                        }
                                    }
                                },
                                {
                                    yAxis: 4,
                                    name: '下限',
                                    lineStyle: {
                                        normal: {
                                            color: "#febf00"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            };

            /* 设置option */
            optionModal.title.text = data.description //设置图表名称
            optionModal.legend.data[0] = data.varStdId //设置参数名称
            optionModal.xAxis.data = data.list.map((el) => { return el.pickTime }) //设置横坐标值
            optionModal.yAxis.axisLabel.formatter = '{value}' + data.varUnit      //设置纵坐标单位
            optionModal.series[0].name = data.varStdId //设置参数名称
            optionModal.series[0].data = data.list.map((el) => { return el.value }) //设置纵坐标值
            optionModal.series[0].markLine.data[0].yAxis = data.maxValue           //设置上限值
            optionModal.series[0].markLine.data[1].yAxis = data.minValue           //设置下限值

            /* 设置颜色变化的上下限 */
            optionModal.visualMap.pieces[0].gt = (data.minValue - 100) < 0 ? 0 : (data.minValue - 100)
            optionModal.visualMap.pieces[0].lte = data.minValue  //设置下限
            optionModal.visualMap.pieces[1].gt = data.minValue   //设置下限  
            optionModal.visualMap.pieces[1].lte = data.maxValue  //设置上限
            optionModal.visualMap.pieces[2].gt = data.maxValue   //设置上限
            optionModal.visualMap.pieces[2].lte = data.maxValue + 100

            /* 设置纵坐标的起始值 */
            const arrY = optionModal.series[0].data   //Y轴的所有值
            const yMax = Math.max(...arrY)             //获取Y轴最大值 
            const yMin = Math.min(...arrY)             //获取Y轴最小值
            const maximum = data.maxValue             //获取上限值 
            const minimum = data.minValue             //获取下限值 

            optionModal.yAxis.min = parseInt(Math.min(yMin, minimum) * 0.9)   //设置Y轴开始值为 最小值或最小合格值的0.9倍
            optionModal.yAxis.max = parseInt(Math.max(yMax, maximum) * 1.1)   //设置Y轴结束值为 最大值或最大合格值的1.1倍

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
            this.myEcharts.forEach((echart) => {
                echart.resize()
            })
        },
        /* 监听窗口大小 更新echarts的大小 */
        addEvent() {
            window.addEventListener("resize", this.updateEcharts)
        },
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

.table {
    .batch,
    .barcode,
    .material {
        cursor: pointer;
        color: #f90;

        .cell {
            font-weight: 600;

            &:empty {
                cursor: default;
            }
        }
    }
    .clicked {
        cursor: pointer;
        color: #f90;
    }
}
</style>
<style lang="less" scoped>
.charts {
    width:100%;
    box-sizing: border-box;
    min-height: 314px
}
</style>





