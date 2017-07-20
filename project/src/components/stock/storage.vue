<!--出入库-->
<template>
    <div class="router-content">
    	<div class="tableClone" ref="printTable"></div>
        <div class="innner-content">
            <h2 class="content-title">
               	 出库信息
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outstockData, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outstockTable', $event)"></i>
            </h2>
            <div v-if="outstockData.error" class="error" :style="styleError">
                {{ outstockData.error }}
            </div>
            <div v-else class="content-table">
            	<v-table :table-data="outstockData" :heights="outstockData.height" :loading="outstockData.loading"></v-table>            
                <v-dialogTable :dialog-data="dialogData" :heights="dialogData.height"  v-on:dialogVisibleChange="visibleChange"></v-dialogTable>        
            </div>
            <h2 class="content-title">
               	 入库信息
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(instockData, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('instockTable', $event)"></i>
            </h2>
            <div v-if="instockData.error" class="error" :style="styleError">
                {{ instockData.error }}
            </div>
            <div v-else class="content-table">
            	<v-table :table-data="instockData" :heights="instockData.height" :loading="instockData.loading"></v-table>
            </div>
            <!-- 复制的内容 -->
            <div v-show="false" ref="outstockTable">
            	<v-table :table-data="outstockData" :loading="outstockData.loading"></v-table>
            </div>
            <div v-show="false" ref="instockTable">
            	<v-table :table-data="instockData" :loading="instockData.loading"></v-table>
            </div>
        </div>
    </div>      
</template>

<script>
    import $ from "jquery"
    import table from "components/basic/table.vue"
    import dialogTable from "components/basic/dialogTable.vue"
    import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'

    export default {
        components: {
            'v-table': table,
            'v-dialogTable': dialogTable
        },
        data () {
            return {
                key: this.$route.params.key,
                styleError: {
                	"max-height": "200px"
                },
                excel: true,
                print: true,
                outstockData: {
                    url: HOST + "/api/v1/outstock",
                    loading: false,
                    error: null,
                    height: "100%",
                    filename: "出库",
                    columns: [{
                        prop: "barcode",
                        name: "条码",
                        fixed: true
//                  },{
//                      prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
//                      name: "条码类型"
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        width: "120",
                        class: "batch",
                        cellClick: this.batchClick
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名称",
                        width: "300"
                    },{
                        prop: "quantity",
                        name: "数量"
                    },{
                        prop: "stock",
                        name: "仓库"
                    },{
                        prop: "stocklot",
                        name: "库位"
                    },{
                        prop: "customer",
                        name: "客户"
                    },{
                        prop: "stockType",
                        name: "出库类型"
                    },{
                        prop: "person",
                        name: "出库人"
                    },{
                        prop: "createTime",//格式：yyyy-MM-dd hh:mm:ss
                        name: "出库时间",
                        width: "160"
                    }],
                    data: []
                },
                instockData: {
                    url: HOST + "/api/v1/instock",
                    loading: false,
                    error: null,
                    height: "100%",
                    columns: [{
                        prop: "barcode",
                        name: "条码",
                        fixed: true
//                  },{
//                      prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
//                      name: "条码类型"

                    },{
                        prop: "batchNo",
                        name: "批次号",
                        width: "120",
                        class: "batch",
                        cellClick: this.batchClick
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名称",
                        width: "300"
                    },{
                        prop: "quantity",
                        name: "数量"
                    },{
                        prop: "remainingNum",
                        name: "库存余量"
                    },{
                        prop: "stock",
                        name: "仓库"
                    },{
                        prop: "stocklot",
                        name: "库位"
                    },{
                        prop: "customer",
                        name: "客户"
                    },{
                        prop: "stockType",
                        name: "入库类型"
                    },{
                        prop: "person",
                        name: "入库人"
                    },{
                        prop: "createTime",//格式：yyyy-MM-dd hh:mm:ss
                        name: "入库时间",
                        width: "160"
                    }],
                    data: []
                },
                /* 模拟序号数据 */
                dialogData: {
                    dialogVisible : false,
                    height: "100%",
                    columns: [{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        class: "batch"
                    }],
                    data: [{
                        "barcode": "1",
                        "batchNo": "batchNo", 
                    }]
                    
                }
            }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
               this.fetchPage();
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            '$route': function() {
            	this.key = this.$route.params.key;
              	this.fetchPage();
            }
        },
        methods: {
            // 条码点击。
            barcodeClick (row) {
                // 若为箱码。
                if(row.barcodeTypeName == "2") {
                    this.dialogData.dialogVisible  = !this.dialogData.dialogVisible
                }
            },
            // 点击批次
            batchClick (row) {
            	// 如果批次数据存在，则可点击。
            	if(row.batchNo) {
	                this.$router.push({ path: `/stock/${this.key}/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
            	}
            },
            // 获取高度。
            adjustHeight() {
            	let jRouter = $(".router-content"),
            		jTitle = jRouter.find(".content-title"),
            		jTable = jRouter.find(".content-table"),
            		nHeight = 0;
            	
            	nHeight = Math.floor((jRouter.height()
            						- jTitle.outerHeight(true)*jTitle.length
            						- (jTable.outerHeight(true) - jTable.height()))/2);
            	
            	return nHeight;
            },
            // 查询。
            fetchPage() {
            	this.fetchData(this.outstockData);
                this.fetchData(this.instockData);
            },
            // 获取数据。
            fetchData (oData) {
                oData.error = null;
                oData.data = [];
                oData.loading = true;

                let sPath = oData.url;
                
                switch(this.key) {
                	// 条码。
                    case "1":
                        sPath += "/bybarcode";
                        break;
                   	// 批次。
                    case "2":
                        sPath += "/bybatch";
                        break;
                    // 出库时间。
                    case "3":
                        sPath += "/byouttime";
                        break;
                    // 入库时间。
                    case "4":
                        sPath += "/byintime";
                        break;
                    default: break;
                }
                
                this.$ajax.post(sPath, this.$route.query)
                .then((res) => {
                    oData.loading = false;
                    oData.height = this.adjustHeight();
                    if(!res.data.errorCode) {
                        oData.data = res.data.data;
                    }else {
                    	this.styleError.maxHeight = this.adjustHeight()-50+"px";
//                  	oData.error = res.data.errorMsg.message;
                    	console.log(res.data.errorMsg.message)
                    }
                })
                .catch((err) => {
                    oData.loading = false;
//                  oData.error = "查询出错。"
                    console.log("接口查询出错。");
                    if(this.outstockData.error && this.instockData.error) {
                        this.styleError.maxHeight = this.adjustHeight()-50+"px"
                    }           
                })
            },
            visibleChange () {
//              debugger
                this.dialogData.dialogVisible = !this.dialogData.dialogVisible
            },
            // 表格导出。
            exportExcelHandle (oData, event) {
                if(!oData) {
                    return;
                }
                // 下载表格。
                window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
            },
            // 表格打印。
            printHandle (refTable, event) {
                let oTable = this.$refs[refTable],
                	oPrint = this.$refs["printTable"];
                	
                if(!oTable) {
                    return;
                }
				oPrint.innerHTML = oTable.innerHTML;
                window.Rt.utils.printHtml(oPrint,{
                	height: oPrint.clientHeight,
                	width: 1500
                },true);
            }
        }
    }  
</script>

<style lang="less">

    .router-content {
    	flex: 1 1;
    	overflow: auto;
    	        
        .icon {
            margin-left: 10px;
            position: relative;
            top: -2px;
            cursor: pointer;
            
            &.disabled {
                &.icon-print:hover {
                    background-position: 0 0;
                }
                &.icon-excel:hover {
                    background-position: 0 -40px;
                }           
            }
        }
    	.table {
    	    .batch {
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
    	
    	.error {
    		border: 2px solid #42AF8F;
		    padding: 20px 12px;
		    margin-bottom: 30px;
		    font-size: 14px;
		    color: red;
		    overflow: auto;
    	}

    }
    
    .el-table {
    	.el-table__body-wrapper {
    		/*overflow-x: hidden;*/
    	}
    }
    
</style>
