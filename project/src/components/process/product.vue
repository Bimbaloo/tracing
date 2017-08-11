<template>
    <div class="router-content" :data-height="routerContent" ref='content'>
        <div class="innner-content" :style="styleObject">
            <div class="condition">
                <div class='condition-messsage'>
                    <span v-for="filter in inItems.filters">
                        {{filter[0]}} : {{filter[1]}}
                    </span> 
                </div>
            </div>
            <h2 class="content-title">
            	投入
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('inputTable', '投入', $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputTable', $event)"></i>
            </h2>
			<div class="content-table">
                <v-table :table-data="inItems" :heights="inItems.height" :loading="loading" :resize="tdResize"></v-table>
			</div>

                  
            <h2 class="content-title">
            	产出
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('outputTable', '产出', $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputTable', $event)"></i>
            </h2>		  
			<div class="content-table">
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
    import $ from "jquery"
	
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
            /* 投入 */
            inItems: {
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
                    fixed: true,
                    class: "barcode",
                    cellClick: this.barcodeClick
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
                    class: "batch",
                    cellClick: this.batchClick
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
                    width: "120"
                }, {
                    name: "投入时间",
                    prop: "happenTime",
                    width: "200"
                }],
                height: 1,
                data: [],
                filters:[["条码","xxxx"],["开始时间","xxxx-xx-xx xx:xx:xx"],["结束时间","xxxx-xx-xx xx:xx:xx"]]
            },
            /* 产出 */
            outItems: {
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
                    fixed: true
                }, {
                    name: "批次号",
                    prop: "batchNo",
                    width: "200"
                }, {
                    name: "派工单号",
                    prop: "doCode",
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
                height: 1,
                filters:[["条码","xxxx"],["开始时间","xxxx-xx-xx xx:xx:xx"],["结束时间","xxxx-xx-xx xx:xx:xx"]]
            },
          //  viewHeight:0
          //routerContent:0

        }

    },
    created() {
        this.routerContent = $(".router-content").height();
     //   this.viewHeight = $(".innner-content").height();
        this.fetchData();
       
    },
    computed:{
        routerContent: function(){
            return $(".router-content").height()
        },
        viewHeight: function(){
            return this.routerContent-50
        }
    },
    mounted(){
       this.inItems.height = this.outItems.height = this.adjustHeight()
       console.log(this.$refs.content)
    },
    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': 'fetchData',
        "routerContent":function(){
            console.log('1')
        }
    },
    methods: {
        // 判断调用接口是否成功。
        judgeLoaderHandler(param, fnSu, fnFail) {
            let bRight = param.data.errorCode;
            
            // 判断是否调用成功。
            if(bRight != "0") {
                // 提示信息。
                console.log(param.data.errorMsg.message)
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
        // 获取数据。
        fetchData() {    
            
            this.loading = true;
            let oQuery = this.$route.query;

            this.$post(url, oQuery)
            .then((res) => {
                this.loading = false;
             
                this.judgeLoaderHandler(res,() => {
                    this.outItems.data = res.data.data.out
                    this.inItems.data = res.data.data.in
                });				 
            })
            .catch((err) => {
                this.loading = false;
                this.styleObject.minWidth = 0;   
                console.log("数据库查询出错。")
            })
        },
        /**
        * 格式化数据。
        * @param {Array} aoData
        * @return {Array}
        */
        formatData (aoData, aocolumns) {
            // 按照条码进行排序。
            aoData.sort((a, b) => a.equipmentId>b.equipmentId);
            
            let oEquipmentId = {},
                nRow = 0,
                nIndex = 1;
            aoData.forEach((o, index) => {
                if(oEquipmentId[o.equipmentId]) {							
                    oEquipmentId[o.equipmentId]++;
                    aoData[nRow].rowspan = oEquipmentId[o.equipmentId];
                    o.hide = true;
                }else {
                    o.index = nIndex;
                    oEquipmentId[o.equipmentId] = 1;
                    nRow = index;
                    nIndex ++;
                    o.rowspan = oEquipmentId[o.equipmentId];
                }
            })   
            
            aocolumns.forEach(column => {					
                if(aoData.every(o => o[column.prop] === "" || o[column.prop] == undefined)) {
                // 若每一行都为空，设置隐藏。
                    column.hide = true;
                }
            })
        
            return aoData;
        },
        batchClick() {
            console.log("批次号")
        },
        barcodeClick() {
            console.log("条码")
        },
        materialClick() {
            console.log("物料编码")
        },

        // 表格导出。
        exportExcelHandle (sTable, sFileName, event) {

            // 下载表格。
            window.Rt.utils.exportTable2Excel(XLSX, Blob, FileSaver, this.$refs[sTable], sFileName, {date: "yyyy-mm-dd HH:MM:ss"});      
        },
        // 表格打印。
        printHandle (refTable, event) {
            let oTable = this.$refs[refTable];
            if(!oTable) {
                return;
            }
            window.Rt.utils.printHtml(html2canvas, oTable);              
        },
        // 获取高度。
        adjustHeight() {
            let $content = $(".innner-content"),
        		$title = $content.find(".content-title"),
            	$condition = $content.find(".condition"),
                ntable = 0;
                debugger
            	ntable = Math.floor(
                    this.viewHeight
                    -$title.eq(0).outerHeight()-$title.eq(0).css("marginTop").split("px")[0]-$title.eq(0).css("marginBottom").split ("px")[0]
                    -$title.eq(1).outerHeight()-$title.eq(1).css("marginTop").split("px")[0]-$title.eq(1).css("marginBottom").split ("px")[0]
                    -$condition.outerHeight()-$condition.css("marginTop").split ("px")[0]-$condition.css("marginBottom").split ("px")[0]-40
                    );
                //debugger
                console.log(ntable)
            return ntable;
        },
        /* 获取元素实际高度(含margin) */
         outerHeight(el) {
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
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

// <style lang="less" scoped>
// .innner-content {
//     display: flex;
//     flex-direction: column;
//     .content-title,
//     .condition {
//         flex: 0 0 auto;
//     }
//     .content-table + .content-title {
//         margin-top: 0px;
//     }
// }
// .condition {
//     margin-bottom: 0;
//     padding-top: 10px;
//     padding-bottom: 10px;
    
// }
// </style>



