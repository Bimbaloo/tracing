<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition'>
                <div class='condition-messsage'>
                    <span v-for="filter in filters">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                    <el-form :model="ruleForm"  ref="ruleForm" class='el-form-input'>
                        <el-form-item label="条码：" > 
                             <el-input v-model="ruleForm.input" placeholder="请输入编码"  @change="updateRow" ></el-input>
                        </el-form-item>
                    </el-form>
                   
                </div>
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>fgb检验</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(tableData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('fgbTable', $event)"></i>
                </span>
            </h2>
            <div class="content-table" ref="fgbTable">
                <el-table :data="datas" stripe class="table" :row-key="tableData.data.prop" v-loading="loading" element-loading-text="拼命加载中" style="width: 100%" ref="multipleTable" @expand="dataEdit" :height="tableData.height">
                    <el-table-column v-if="!!column.show" v-for="column in columns" align="center" :type="column.type" :prop="column.prop" :label="column.name" :key="column.prop" :class-name="column.class" :width="column.width">
                        <template scope="props">
                            <el-form label-position="left" inline class="demo-table-expand table-form" v-if="column.type === 'expand'">
                                <el-form-item v-for="(prop,index) in props.row" v-if="!!setName(index)">
                                    <span>{{ setName(index) }}：</span>
                                    <span>{{ prop }}</span>
                                </el-form-item>
                            </el-form>
                            <div v-else :class="[ 'cell-content']">
                                {{ props.row[column.prop] }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
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

const url = HOST + "/api/v1/fgb/by-equipment-time";
const url2 = HOST + `/api/v1/fgb/by-dataid`;
//const url = "static/fgb.json"
//const url2 = "static/fgb2.json"

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
                //"min-width": "1000px"
            },

            loading: false,
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
            /* fgb */
            tableData: {
                filename: 'fgb检验',
                columns: [{
                    type: "expand",
                    width: "100",
                    show:true               //是否在表头显示
                }, {
                    name: "条码",
                    prop: "value",
                    show:true
                }, {
                    name: "采集时间",
                    prop: "pickTime",
                    show:true
                }],
                data: [],
                height: 1
            },

            routerContent: 0,
            ruleForm:{
                input: ""
            },
           expandedId:[] //用于保存展开过的行的id

        }

    },
    created() {
        this.fetchData(); //获取数据
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
        },
        /* 列信息 */
        columns: function() {
            return this.tableData.columns 
        },
        /* 显示的行信息 */
        datas: function() {
            if(this.ruleForm.input === ""){
                return this.tableData.data 
            }else {
                return this.updateRow(this.ruleForm.input)
            }
            
        }
    },
    mounted() {
        this.routerContent = document.querySelector(".router-content").offsetHeight  //获取初始高度
        this.tableData.height  = this.adjustHeight()

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
                if (el === "equipmentId" || el === "startTime" || el === "endTime") {
                    oQuery[el] = this.$route.query[el]
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })
            /* 测试数据 */
            oQuery = {
                "equipmentId": "186",
                "startTime": "2017-08-11 00:34:52",
                "endTime": "2017-08-11 00:35:18"
            }
            this.$get(url, oQuery)
                .then((res) => {
                    this.loading = false;

                    this.judgeLoaderHandler(res, () => {
                        this.tableData.data = res.data.data
                    });
                })
                .catch((err) => {
                    this.loading = false;
                    this.styleObject.minWidth = 0;
                    console.log("数据库查询出错。")
                })
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
        /* 根据新获取的检验值，找到对应的中文 */
        setName(val) {
            let cName = this.tableData.columns.find((el) => {
                return el.prop === val
            })
            return (cName?cName.name:false)
        },
        /* 根据新获取的检验值，设置中文名和英文名对应关系 */
        dataEdit(row, expanded) {
            //debugger
            let Id = row.dataId
            if(!!expanded && !this.expandedId.some(el=>el===Id)){  //如果展开的话
                let dataId = {
                    "dataId": Id
                }
                this.$get(url2, dataId).then((res) => {
                    this.judgeLoaderHandler(res, () => {
                        let oData= res.data.data
                        oData.forEach(el=>{
                            let newData = {name:`${el.description}`,prop:`${el.description}`}
                            this.tableData.columns.push(newData)
                            this.$set(row, `${el.description}`, `${el.value}${el.varUnit}`)
                        })
                        this.expandedId.push(Id)
                        
                    });
                })
                .catch((err) => {
                    console.log(err)
                })
            }
        },
        /* 根据刷选条件显示行 */
        updateRow(value) {
            let odata;
            if(value !== ""){
                let reg =new RegExp("\\w*" + value + "\\w*");
                odata = this.tableData.data.filter((el)=>{
                   return reg.test(el.value) === true
                })
            }else{
                odata = this.tableData.data
            }
            return odata
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
.el-table__expanded-cell{
    background-color: #f4fcf9;
    padding: 0;
    .table-form {
        margin: 0;
        width: 100%;
        .el-form-item {
            margin-left: 100px;
            margin-right: 0;
            margin-bottom: 0;
            line-height: 40px;
        }
    }
}
</style>

<style lang="less" scoped>
.tableData {
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
 .el-input {
     width: 180px
 }
 .el-form-input {
     display: inline-block;
     margin-left: 60px;
     width: 240px;
     .el-form-item {
         margin-bottom:0;
     }
 }

</style>


