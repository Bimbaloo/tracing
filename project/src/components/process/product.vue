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
                <span class='table-title'>投入</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inItems, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="inputTable">
                <v-table :table-data="inItems" :heights="inItems.height" :loading="loading" :resize="tdResize"></v-table>
            </div>
            <h2 class="content-title outTitle">
                <span class='table-title'>产出</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outItems, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="outputTable">
                <v-table :table-data="outItems" :heights="outItems.height" :loading="loading" :resize="tdResize"></v-table>
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
const url = HOST + "/api/v1/trace/inout/by-equipment";

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
            /* 投入 */
            inItems: {
                filename: "投入",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
                    fixed: true,
                    // class: "barcode",
                    // cellClick: this.barcodeClick
                }, {
                    name: "派工单号",
                    prop: "doCode",
                    width: "200"
                }, {
                    name: "批次号",
                    prop: "batchNo",
                    width: "200",
                    // class: "batch",
                    // cellClick: this.batchClick
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "200",
                    class: "material",
                    cellClick: this.materialClick
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "300"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "120"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "200"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "200"
                }, {
                    name: "投入时间",
                    prop: "happenTime",
                    width: "220"
                }],
                height: 1,
                data: []
            },
            /* 产出 */
            outItems: {
                filename: "产出",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
                    fixed: true,
                    // class: "barcode",
                    // cellClick: this.barcodeClick
                }, {
                    name: "箱码",
                    prop: "",
                    width: "200"
                }, {
                    name: "派工单号",
                    prop: "doCode",
                    width: "200"
                }, {
                    name: "批次号",
                    prop: "batchNo",
                    width: "200",
                    // class: "batch",
                    // cellClick: this.batchClick
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "200",
                    class: "material",
                    cellClick: this.materialClick
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "300"
                }, {
                    name: "合格数",
                    prop: "qualifiedNum",
                    width: "120"
                }, {
                    name: "报废数",
                    prop: "scrapNum",
                    width: "120"
                }, {
                    name: "不合格数",
                    prop: "unqualifiedNum",
                    width: "120"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "200"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "产出时间",
                    prop: "happenTime",
                    width: "200"
                }],
                data: [],
                height: 1
            },
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
        this.inItems.height = this.outItems.height = this.adjustHeight()

    },
    updated() {

        this.setTitle(".barcode", "条码追踪")
        this.setTitle(".batch", "批次追踪")
        this.setTitle(".material", "遏制")

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
            this.outItems.data = oData.out;
            this.inItems.data = oData.in;
                       
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
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {//equipmentIdList//equipmentList
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })

            this.$register.sendRequest(this.$store, this.$ajax, url, "post", oQuery, this.requestSucess, this.requestFail, this.requestError)
            // this.$post(url, oQuery)
            //     .then((res) => {
            //         this.loading = false;

            //         this.judgeLoaderHandler(res, () => {
            //             this.outItems.data = res.data.data.out
            //             this.inItems.data = res.data.data.in
            //         });
            //     })
            //     .catch((err) => {
            //         this.loading = false;
            //         this.styleObject.minWidth = 0;
            //         console.log("数据库查询出错。")
            //     })
        },
        /**
        * 格式化数据。
        * @param {Array} aoData
        * @return {Array}
        */
        formatData(aoData, aocolumns) {
            // 按照条码进行排序。
            aoData.sort((a, b) => a.equipmentId > b.equipmentId);

            let oEquipmentId = {},
                nRow = 0,
                nIndex = 1;
            aoData.forEach((o, index) => {
                if (oEquipmentId[o.equipmentId]) {
                    oEquipmentId[o.equipmentId]++;
                    aoData[nRow].rowspan = oEquipmentId[o.equipmentId];
                    o.hide = true;
                } else {
                    o.index = nIndex;
                    oEquipmentId[o.equipmentId] = 1;
                    nRow = index;
                    nIndex++;
                    o.rowspan = oEquipmentId[o.equipmentId];
                }
            })

            aocolumns.forEach(column => {
                if (aoData.every(o => o[column.prop] === "" || o[column.prop] == undefined)) {
                    // 若每一行都为空，设置隐藏。
                    column.hide = true;
                }
            })

            return aoData;
        },
        batchClick(row) {
            // 批次追踪。
            let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                oCondition = {
                    "keys": {
                        equipmentId: this.$route.query["equipmentId"],
                        equipmentName: this.$route.query["equipmentName"],
                        batchNo: row.batchNo,
                        materialCode: row.materialCode
                    },
                    "type": "batch"
                }

            sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
            window.open("trackIndex.html?tag=" + tag);
        },
        barcodeClick(row) {
            // 单件追踪。
            let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                oCondition = {
                    "keys": {
                        equipmentId: this.$route.query["equipmentId"],
                        equipmentName: this.$route.query["equipmentName"],
                        barcode: row.barcode
                    },
                    "type": "barcode"
                }

            sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
            window.open("trackIndex.html?tag=" + tag);
        },
        materialClick(row) {
            // console.log("物料编码")
            // console.log(row)
            let oQuery = {
                batchNo: row.batchNo,
                materialCode: row.materialCode
            },
                sPath = "/process/restrain"

            this.$router.replace({ path: sPath, query: oQuery })
        },
        // 表格导出。
        exportExcelHandle(oData, event) {
            if (!oData) {
                return;
            }
            // 下载表格。
            window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
        },
        // 表格导出。
        // exportExcelHandle (sTable, sFileName, event) {

        //     // 下载表格。
        //     window.Rt.utils.exportTable2Excel(XLSX, Blob, FileSaver, this.$refs[sTable], sFileName, {date: "yyyy-mm-dd HH:MM:ss"});      
        // },
        // 表格打印。
        // printHandle (refTable, event) {
        //     let oTable = this.$refs[refTable];
        //     if(!oTable) {
        //         return;
        //     }
        //     window.Rt.utils.printHtml(html2canvas, oTable);              
        // },
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
                            //border: 1px solid #e4efec;
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
                - this.outerHeight(document.querySelector(".inTitle"))
                - this.outerHeight(document.querySelector(".outTitle"))
            ) / 2;
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
            this.inItems.height = this.outItems.height = this.adjustHeight()
        },
        /* 设置title */
        setTitle(el, title) {
            let elTds = document.querySelectorAll(el)
            elTds.forEach((el, index) => {
                if (elTds[index].tagName.toLocaleLowerCase() === 'td') {
                    el.setAttribute('title', title);
                }
            })
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
    td.batch,
    td.barcode,
    td.material {
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
.outTitle,
.inTitle {
    display: flex;
    justify-content: space-between;
    .table-handle {
        margin-right: 5px;
        i {
            margin: 5px;
        }
    }
    .table-table {
        i {
            margin: 5px;
        }
    }
}
</style>




