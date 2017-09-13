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
            <h2 class="content-title tableData">
                <span class='table-title'>送检记录</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('qcTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="qcTable">
                <v-table :table-data="tableData" :heights="tableData.height" :loading="loading" :resize="tdResize"></v-table>
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
// import {host} from 'assets/js/configs.js'

// var HOST = window.HOST ? window.HOST: host
const url = HOST + "/api/v1/quality/send-inspect/by-equipment-time";
//const url =  `http://rapapi.org/mockjsdata/24404/quality/send-inspect/by-equipment-time?`
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
            tdResize: true, // 是否允许拖动table大小
            condition: {},   // 查询条件    
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
            /* 投入 */
            tableData: {
                filename: "送检",
                columns: [{
                    name: "送检ID",
                    prop: "requestId",
                    width: "120",
                }, {
                    name: "设备名称",
                    prop: "equipmentName",
                    width: "120"
                }, {
                    name: "派工单号",
                    prop: "doCode",
                    width: "120"
                }, {
                    name: "工序",
                    prop: "processName",
                    width: "120",
                }, {
                    name: "式样号",
                    prop: "sampleIdentification",
                    width: "120",
                }, {
                    name: "物料批次",
                    prop: "batchNo",
                    width: "120"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "120"
                }, {
                    name: "送检时间",
                    prop: "createTime",
                    width: "200"
                }, {
                    name: "送检结果",
                    prop: "passTypeName",
                    width: "120"
                }, {
                    name: "送检报告名称",
                    prop: "reportName",
                    width: ""
                }, {
                    name: "文件名称",
                    prop: "fileName",
                    width: "120"
                }, {
                    name: "文件大小",
                    prop: "fileSize",
                    width: "120"
                }, {
                    name: "操作",
                    prop: "handle",
                    width: "120",
                    class: "handle",
                    cellClick: this.fileDownload
                }],
                height: 1,
                data: []
            },
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
        this.routerContent = document.querySelector(".router-content").offsetHeight  //获取初始高度
        this.tableData.height = this.adjustHeight()

    },
    updated() {

    },
    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'fetchData',
        /* 上下拖动时，重新设置table大小变化 */
        "resizeY": 'setTbaleHeight',
        /* 全屏大小时，重新设置table大小 */
        "fullscreen": 'setTbaleHeight'
    },
    methods: {
        // 判断调用接口是否成功。
        // judgeLoaderHandler(param, fnSu, fnFail) {
        //     let bRight = param.data.errorCode;

        //     // 判断是否调用成功。
        //     if (!bRight) {
        //         // 调用成功后的回调函数。
        //         fnSu && fnSu();
        //     } else {
        //         // 提示信息。
        //         console.log(param.data.errorMsg.message)
        //         // 失败后的回调函。
        //         fnFail && fnFail();
        //     }
        // },
        // 显示提示信息。
        // showMessage() {
        //     this.$message({
        //         message: this.sErrorMessage,
        //         duration: 3000
        //     });
        // },
        // 请求成功。
        requestSucess(oData) {
            this.loading = false;
            this.tableData.data = oData
            this.tableData.data.forEach((el) => {
                el["handle"] = "下载"
            })                     
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            this.loading = false;
            // 提示信息。
            console.log(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            console.log("数据库查询出错。")
        },        
        // 获取数据。
        fetchData() {

            this.loading = true;
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })

            this.$register.sendRequest(this.$store, this.$ajax, url, "get", oQuery, this.requestSucess, this.requestFail, this.requestError)
            // this.$get(url, oQuery)
            //     .then((res) => {
            //         this.loading = false;

            //         this.judgeLoaderHandler(res, () => {
            //             this.tableData.data = res.data.data
            //             this.tableData.data.forEach((el) => {
            //                 el["handle"] = "下载"
            //             })
            //         });
            //     })
            //     .catch((err) => {
            //         this.loading = false;
            //         this.styleObject.minWidth = 0;
            //         console.log("数据库查询出错。")
            //     })
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
            let oTable = this.$refs[refTable];

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
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            //	border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;	
                        }
                    </style>
                </div>
            `;

            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
        },
        // 获取高度。
        adjustHeight() {

            let ntable = 0;
            ntable = Math.floor(
                this.viewHeight
                - this.outerHeight(document.querySelector(".condition"))
                - this.outerHeight(document.querySelector(".tableData"))
            );
            return ntable;
        },
        /* 获取元素实际高度(含margin) */
        outerHeight(el) {
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        },
        /* 设置table实际高度 */
        setTbaleHeight() {
            this.routerContent = document.querySelector(".router-content").offsetHeight
            this.tableData.height = this.adjustHeight()
        },
        fileDownload(row) {
            let src = row["reportPath"]
            //   let src = "https://codeload.github.com/douban/douban-client/legacy.zip/master"
            let objIframe = document.createElement("IFRAME");
            document.body.appendChild(objIframe)
            objIframe.outerHTML = "<iframe   name=a1   style='width:0;hieght:0'   src=" + src + "></iframe>";
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

.table {
    .handle {
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
.tableData {
    display: flex;
    justify-content: space-between;
    .table-handle {
        margin-right: 5px;
        display: flex;
        align-items: center;
        i {
            margin: 7.5px;
        }
    }
    .table-table {
        i {
            margin: 5px;
        }
    }
}
</style>





