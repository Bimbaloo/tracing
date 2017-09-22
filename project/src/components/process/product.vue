<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                    <span>
                        <el-checkbox v-model="checked">全部数据</el-checkbox>
                    </span>
                    <span style='margin-left:5px'>({{this.$route.query.shiftStartTime}}~~{{this.$route.query.shiftEndTime}})</span>
                </div>
            </div>
            <el-tabs element-loading-text="拼命加载中" class="search-tab" @tab-click="tabChange">
                <el-tab-pane label="关联表">
                    <h2 class="content-title uniteTitle">
                        <span class='table-title'>产出投入</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(uniteItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('uniteTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="uniteTable" v-if="show1">
                        <el-table class="table-main" :data="checked?uniteItems.data:uniteItems.dataFilter" :height="uniteItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in uniteItems.columns" :key="index" :align="'center'" :fixed="index===0?true:false" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div :class="['cell-content',{ltext: column.prop === 'barcode'}]" v-if="column.prop === 'barcode'" :style="{paddingLeft: !!props.row.in ? 15 : 50 +'px'}">
                                        <i v-if="!!props.row.in" class="icon-down el-icon-arrow-down" @click="handleEdit(props.$index, props)"></i>
                                        <span>{{ props.row[column.prop]}}</span>
                                    </div>
                                    <div class="cell-content" v-else>
                                        <span>{{ props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                </el-tab-pane>
                <el-tab-pane label="明细表">
                    <h2 class="content-title outTitle">
                        <span class='table-title'>产出</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="outputTable" v-if="show2">
                        <!-- <v-table :table-data="outItems" :heights="outItems.height" :loading="loading" :resize="tdResize"></v-table> -->
                        <el-table class="table-main" :data="checked?outItems.data:outItems.dataFilter" :height="outItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in outItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <h2 class="content-title inTitle">
                        <span class='table-title'>投入</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="inputTable" v-if="show2">
                        <!-- <v-table :table-data="inItems" :heights="inItems.height" :loading="loading" :resize="tdResize"></v-table> -->
                        <el-table class="table-main" :data="checked?inItems.data:inItems.dataFilter" :height="inItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in inItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                </el-tab-pane>
                <el-tab-pane label="汇总表">
                    <h2 class="content-title outAllTitle">
                        <span class='table-title'>产出汇总</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outAllItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputAllTable', $event)"></i>
                        </span>
                    </h2>
                    <div class="content-table" ref="outputAllTable" v-if="show3">
                        <!-- <v-table :table-data="outAllItems" :heights="outAllItems.height" :loading="loading" :resize="tdResize"></v-table> -->
                        <el-table class="table-main" :data="checked?outAllItems.data:outAllItems.dataFilter" :height="outAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in outAllItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <h2 class="content-title inAllTitle">
                        <span class='table-title'>投入汇总</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inAllItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputAllTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="inputAllTable" v-if="show3">
                        <!-- <v-table :table-data="inAllItems" :heights="inAllItems.height" :loading="loading" :resize="tdResize"></v-table> -->
                        <el-table class="table-main" :data="checked?inAllItems.data:inAllItems.dataFilter" :height="inAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in inAllItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                </el-tab-pane>
            </el-tabs>

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


const url = HOST + "/api/v1/trace/inout/by-trace";
//const url = "http://rapapi.org/mockjsdata/21533/qqq?"
//const url = `static/produce.json`

export default {
    components: {
        'v-table': table
    },
    data() {
        return {
            checked: false, //是否显示全部数据
            excel: true,
            print: true,
            loading: false,
            sErrorMessage: "",
            empty: "暂无数据。",
            styleObject: {
                //  "min-width": "2000px"
            },
            // 是否为追踪页面。
            bTrack: location.pathname.indexOf("trackIndex") > -1,
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
                    width: "",
                    fixed: true,
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: ""
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: ""
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: ""
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: ""
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: ""
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: ""
                }, {
                    name: "投入时间",
                    prop: "happenTime",
                    width: "200"
                }],
                height: 1,
                data: [],
                dataFilter: []
            },
            /* 产出 */
            outItems: {
                filename: "产出",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
                    fixed: true,
                    class: 'barcode',
                    cellClick: this.barcodeClick
                }, {
                    name: "箱码",
                    prop: "packetBarcode",
                    width: "200"
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "200"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "200"
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "200"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "300"
                }, {
                    name: "模号",
                    prop: "moldCode",
                    width: ""
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "100"
                }, {
                    name: "质量",
                    prop: "quality",
                    width: "100"
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
                dataFilter: [],
                height: 1
            },
            /* 关联表 */
            uniteItems: {
                filename: "关联表",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "285",
                    fixed: true,
                }, {
                    name: "类型",
                    prop: "productionType",
                    width: "100"
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "120"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "250",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "120"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "280"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "120"
                }, {
                    name: "质量",
                    prop: "quality",
                    width: "120"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "120"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "加工时间",
                    prop: "happenTime",
                    width: "200"
                }],
                height: 1,
                data: [],
                dataFilter: []
            },
            /* 投入汇总 */
            inAllItems: {
                filename: "投入汇总",
                columns: [{
                    name: "批次",
                    prop: "batchNo",
                    width: "",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: ""
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: ""
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: ""
                }],
                height: 1,
                data: []
            },
            /* 产出汇总 */
            outAllItems: {
                filename: "产出汇总",
                columns: [{
                    name: "批次",
                    prop: "batchNo",
                    width: "",
                    class: 'batchNo',
                    cellClick: this.batchClick
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: ""
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: ""
                }, {
                    name: "合格数",
                    prop: "qualifiedNum",
                    width: "100"
                }, {
                    name: "报废数",
                    prop: "scrapNum",
                    width: "100"
                }, {
                    name: "不合格数",
                    prop: "unqualifiedNum",
                    width: "100"
                }],
                height: 1,
                data: []
            },
            //  viewHeight:0
            routerContent: 0,
            show1: true,
            show2: false,
            show3: false

        }

    },
    created() {
        this.initData();
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
        this.setTbaleHeight()
    },
    updated() {

        this.setTitle(".barcode", "条码追踪")
        this.setTitle(".batchNo", "批次追踪")
       // this.setTitle(".material", "遏制")

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
        initData() {

            if (this.bTrack) {
                // 若为追踪页面，过滤明细产出操作列。
                this.outItems.columns[0].class = ''
                this.outItems.columns[0].cellClick = ''
            }
        },
        // 请求成功。
        requestSucess(oData) {
            this.loading = false;
            let outDatas = []
            let outDatasFilter = []
            let inDatas = []
            let inDatasFilter = []
            let uniteDatas = []
            let uniteDatasFilter = []
            let outAllDatas = []
            let outAllDatasFilter = []
            let inAllDatas = []
            let inAllDatasFilter = []
            let startTime = this.condition.startTime
            let endTime = this.condition.endTime

            let outData = oData.out;

            outData.forEach((e, index) => {
                e.productionType = "产出"
                e.productionID = index              //对产出做标记，方便找到对应的投入
                e.in.forEach(el => {
                    el.productionType = "投入"
                    el.productionID = index         //对投入做标记，方便找到对应的产出
                })
                inDatas.push(...e.in)               // 获取投入数据
                outDatas.push(e)                    // 获取产出数据
                uniteDatas.push(e)                  // 获取关联数据
                uniteDatas.push(...e.in)
                // 获取关联数据 -- 时间内
                if (startTime <= e.happenTime && e.happenTime <= endTime) {
                    uniteDatasFilter.push(e)
                    uniteDatasFilter.push(...e.in)
                }

                
            });

            outDatasFilter = outDatas.filter(e => {                     // 获取产出数据 -- 时间内         
                return startTime <= e.happenTime && e.happenTime <= endTime
            })

            outDatasFilter.forEach(e => {                               // 获取投入数据--时间内
                inDatas.filter(el => {
                    if (e.productionID === el.productionID) {
                        inDatasFilter.push(el)
                    }
                })
            })


            /* 所有投入汇总 */
            let inDatasCopy = JSON.parse(JSON.stringify(inDatas))
            inDatasCopy.forEach((el, i) => {                        // 投入汇总
                inAllDatas.push({
                    batchNo: inDatasCopy[i]["batchNo"],             // 批次号
                    quantity: parseInt(inDatasCopy[i]["quantity"]), // 数量
                    materialName: inDatasCopy[i]["materialName"],   // 物料名称
                    materialCode: inDatasCopy[i]["materialCode"],   // 物料编码
                })
                for (let j = i + 1; j < inDatasCopy.length; j++) {
                    if (el["batchNo"] === inDatasCopy[j]["batchNo"]) {
                        inAllDatas[i].quantity = parseInt(inAllDatas[i]["quantity"]) + parseInt(inDatasCopy[j]["quantity"])  // 数量
                        inDatasCopy.splice(j, 1)
                        j = j - 1
                    }
                }
            })

            /* 时间内投入汇总 */
            let inDatasCopyFilter = JSON.parse(JSON.stringify(inDatasFilter))
            inDatasCopyFilter.forEach((el, i) => {                        // 投入汇总
                inAllDatasFilter.push({
                    batchNo: inDatasCopyFilter[i]["batchNo"],             // 批次号
                    quantity: parseInt(inDatasCopyFilter[i]["quantity"]), // 数量
                    materialName: inDatasCopyFilter[i]["materialName"],   // 物料名称
                    materialCode: inDatasCopyFilter[i]["materialCode"],   // 物料编码
                })
                for (let j = i + 1; j < inDatasCopyFilter.length; j++) {
                    if (el["batchNo"] === inDatasCopyFilter[j]["batchNo"]) {
                        inAllDatasFilter[i].quantity = parseInt(inAllDatasFilter[i]["quantity"]) + parseInt(inDatasCopyFilter[j]["quantity"])  // 数量
                        inDatasCopyFilter.splice(j, 1)
                        j = j - 1
                    }
                }
            })


            outDatas.forEach(el => {
                /* 设置每条记录的合格数、报废数、不合格数 */
                el.qualifiedNum = el.scrapNum = el.unqualifiedNum = 0
                if (el.type === 1) {                                       // 合格数
                    el.qualifiedNum = el.quantity
                } else if (el.type === 2) {                                // 报废数
                    el.scrapNum = el.quantity
                } else {                                                 // 不合格数
                    el.unqualifiedNum = el.quantity
                }
            })
            /* 如果箱码列内容为空，取消该列 */
            if(outDatas.some((e)=> e.packetBarcode === '' || e.packetBarcode === null )){ 
                this.outItems.columns = this.outItems.columns.filter(o => o.prop !== "packetBarcode");
            }
            /* 所有产出汇总 */
            let outDatasCopy = JSON.parse(JSON.stringify(outDatas))
            outDatasCopy.forEach((el, i) => {                             // 产出汇总
                /* 根据批次合并，同批次合格数、报废数、不合格数分别汇总 */
                outAllDatas.push({
                    batchNo: outDatasCopy[i]["batchNo"],              // 批次号
                    qualifiedNum: parseInt(outDatasCopy[i]["qualifiedNum"]),       // 合格数
                    scrapNum: parseInt(outDatasCopy[i]["scrapNum"]),               // 报废数
                    unqualifiedNum: parseInt(outDatasCopy[i]["unqualifiedNum"]), // 不合格数
                    materialName: outDatasCopy[i]["materialName"],   // 物料名称
                    materialCode: outDatasCopy[i]["materialCode"]    // 物料编码
                })
                for (let j = i + 1; j < outDatasCopy.length; j++) {
                    if (el["batchNo"] === outDatasCopy[j]["batchNo"]) {
                        outAllDatas[i].qualifiedNum = parseInt(outAllDatas[i]["qualifiedNum"]) + parseInt(outDatasCopy[j]["qualifiedNum"])        // 合格数
                        outAllDatas[i].scrapNum = parseInt(outAllDatas[i]["scrapNum"]) + parseInt(outDatasCopy[j]["scrapNum"])                    // 报废数
                        outAllDatas[i].unqualifiedNum = parseInt(outAllDatas[i]["unqualifiedNum"]) + parseInt(outDatasCopy[j]["unqualifiedNum"])  // 不合格数
                        outDatasCopy.splice(j, 1)
                        j = j - 1
                    }
                }
            })

            /* 时间内产出汇总 */
            let outDatasCopyFilter = JSON.parse(JSON.stringify(outDatasFilter))
            outDatasCopyFilter.forEach((el, i) => {                             // 产出汇总
                /* 根据批次合并，同批次合格数、报废数、不合格数分别汇总 */
                outAllDatasFilter.push({
                    batchNo: outDatasCopyFilter[i]["batchNo"],              // 批次号
                    qualifiedNum: parseInt(outDatasCopyFilter[i]["qualifiedNum"]),       // 合格数
                    scrapNum: parseInt(outDatasCopyFilter[i]["scrapNum"]),               // 报废数
                    unqualifiedNum: parseInt(outDatasCopyFilter[i]["unqualifiedNum"]), // 不合格数
                    materialName: outDatasCopyFilter[i]["materialName"],   // 物料名称
                    materialCode: outDatasCopyFilter[i]["materialCode"]    // 物料编码
                })
                for (let j = i + 1; j < outDatasCopyFilter.length; j++) {
                    if (el["batchNo"] === outDatasCopyFilter[j]["batchNo"]) {
                        outAllDatasFilter[i].qualifiedNum = parseInt(outAllDatasFilter[i]["qualifiedNum"]) + parseInt(outDatasCopyFilter[j]["qualifiedNum"])        // 合格数
                        outAllDatasFilter[i].scrapNum = parseInt(outAllDatasFilter[i]["scrapNum"]) + parseInt(outDatasCopyFilter[j]["scrapNum"])                    // 报废数
                        outAllDatasFilter[i].unqualifiedNum = parseInt(outAllDatasFilter[i]["unqualifiedNum"]) + parseInt(outDatasCopyFilter[j]["unqualifiedNum"])  // 不合格数
                        outDatasCopyFilter.splice(j, 1)
                        j = j - 1
                    }
                }
            })



            this.uniteItems.data = uniteDatas                           // 关联明细
            this.uniteItems.dataFilter = uniteDatasFilter               // 关联明细--时间内

            this.outItems.data = outDatas                               // 产出明细
            this.outItems.dataFilter = outDatasFilter                   // 产出明细--时间内

            this.inItems.data = inDatas                                 // 投入明细
            this.inItems.dataFilter = inDatasFilter                     // 投入明细--时间内


            this.outAllItems.data = outAllDatas                         // 产出汇总
            this.outAllItems.dataFilter = outAllDatasFilter             // 产出汇总--时间内
            this.inAllItems.data = inAllDatas                           // 投入汇总
            this.inAllItems.dataFilter = inAllDatasFilter               // 投入汇总--时间内
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            this.loading = false;
            let outDatas = []
            let inDatas = []
            let uniteDatas = []
            let outAllDatas = []
            let inAllDatas = []
            // 提示信息。
            console.log(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            console.log(err)
            console.log("数据库查询出错。")
        },
        // 获取数据。
        fetchData() {

            this.loading = true;
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "doOutIdList") {
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })
            this.$register.sendRequest(this.$store, this.$ajax, url, "post", oQuery, this.requestSucess, this.requestFail, this.requestError)

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
            this.outItems.data
            // 批次追踪。
            let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                oCondition = {
                    // "keys": {
                    //     equipmentId: this.$route.query["equipmentId"],
                    //     equipmentName: this.$route.query["equipmentName"],
                    //     batchNo: row.batchNo,
                    //     materialCode: row.materialCode
                    // },
                    // "type": "batch"
                    selected: this.outItems.data.filter(o => o.batchNo === row.batchNo).map(o => {
                        return {
                            materialCode: o.materialCode,
                            batchNo: o.batchNo,
                            barcode: o.barcode,
                            bucketNo: o.bucketNo
                        }
                    })
                }

            sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
            window.open("trackIndex.html?tag=" + tag);
        },
        barcodeClick(row) {
            // 单件追踪。
            let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                oCondition = {
                    selected: [{
                        materialCode: row.materialCode,
                        batchNo: row.batchNo,
                        barcode: row.barcode,
                        bucketNo: row.bucketNo
                    }]
                    // "keys": {
                    //     equipmentId: this.$route.query["equipmentId"],
                    //     equipmentName: this.$route.query["equipmentName"],
                    //     barcode: row.barcode
                    // },
                    // "type": "barcode"
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
                        .el-table__body-wrapper td {
                        	white-space: normal;
    						word-break: break-all;
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
                - 30 //   this.outerHeight(document.querySelector(".el-tabs__header")  初始渲染的时候会有问题
                - this.outerHeight(document.querySelector(".content-title.outTitle"))
                - this.outerHeight(document.querySelector(".content-title.inTitle"))
                - 70  //修正值
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
            this.inAllItems.height = this.outAllItems.height = this.inItems.height = this.outItems.height = this.adjustHeight()
            this.uniteItems.height = 2 * this.adjustHeight() + 70
           // console.log(this.adjustHeight())
        },
        /* 设置title */
        setTitle(el, title) {
            let elTds = document.querySelectorAll(el)
            elTds.forEach((el, index) => {
                if (elTds[index].tagName.toLocaleLowerCase() === 'td') {
                    el.setAttribute('title', title);
                }
            })
        },
        /* 点击产出 展开或收拢投入 */
        handleEdit(index, props) {
            //debugger
            //console.log(props)
            let elArr = []
            const num = props.row.in.length
            const trs = document.querySelectorAll(".el-table__body-wrapper")[0].querySelectorAll("tr")
            const trsFix = document.querySelectorAll(".el-table__fixed-body-wrapper")[0].querySelectorAll("tr")
            //const tr = document.querySelectorAll(".el-table__row")
            for (let i = 0; i < num; i++) {
                elArr.push(trs[index + i + 1])
                elArr.push(trsFix[index + i + 1])
            }
            const icon = trsFix[index].querySelectorAll(".icon-down")[0]
            if (icon.classList.contains("actived")) {  // 判断是否隐藏
                elArr.forEach((el) => {
                    return el.classList.remove('hide');
                })
                icon.classList.remove('actived');
            } else {
                elArr.forEach((el) => {
                    return el.classList.add('hide');
                })
                icon.classList.add('actived');
            }
        },
        /* tab切换 */
        tabChange(tab, event) {
            const index = tab.index
            switch (index) {
                case "0":
                    this.show1 = true
                    this.show2 = false
                    this.show3 = false
                    break;
                case "1":
                    this.show1 = false
                    this.show2 = true
                    this.show3 = false
                    break;
                case "2":
                    this.show1 = false
                    this.show2 = false
                    this.show3 = true
                    break;
            }
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
    td.material,
    td.batchNo {
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


.button {
    cursor: pointer;
    color: #f90;
}

@green: #42af8f;
@blue: #0099ff;
@yellow: #fcc433;
@red: #e86b59;
@inVent: #00a656;

body {
    background-color: #f2f2f2;
    font-size: 14px;
    overflow: hidden;
}

.el-button--text {
    border: 1px solid #42af8f;
    padding: 10px 15px;
}

.el-table .el-table__header thead tr th {
    background-color: @green;
    .cell {
        background-color: @green;
        color: #FFFFFF;
    }
}

.el-table .cell {
    padding: 0;
}

.cell {
    .ltext {
        text-align: left;
        padding-left: 15px;
    }
}

.show {
    transition: display 400ms;
}

.hide {
    opacity: 0;
    display: none
}

.icon-down {
    transition: transfrom 1s linear;
    &.actived {
        transform: rotate(-90deg);
    }
}

.router-content {
    .condition {
        .el-checkbox {
            .el-checkbox__label {
                margin-left: 0;
                padding-left: 10px;
            }
        }
    }
}


.search-tab {
    // padding-top: 20px;
    .el-tabs__header {
        border-bottom: none;
        margin-bottom: 0;
        .el-tabs__item {
            border-radius: 0;
            width: 90px;
            height: 30px;
            padding: 0;
            box-sizing: border-box;
            font-size: 14px;
            border: 2px solid #42af8f;
            line-height: 26px;
            margin-right: 20px;
            text-align: center;
            color: #666;
            &:hover {
                color: #333;
            }
        }
        .el-tabs__active-bar {
            display: none
        }
        .is-active {
            background-color: #42af8f;
            color: #fff;
            &:hover {
                color: #fff;
            }
        }
    }
}
</style>

<style lang="less" scoped>
.outTitle,
.inTitle,
.uniteTitle,
.inAllTitle,
.outAllTitle {
    display: flex;
    justify-content: space-between;
    .table-handle {
        margin-right: 5px;
        display: flex;
        align-items: center;
        i {
            margin: 7.5px;
            &:hover {
                cursor: pointer
            }
        }
    }
    .table-table {
        i {
            margin: 5px;
        }
    }
}
</style>




