<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content">
            <h2 class="content-title tableData">
                <span class='table-title'>出库信息</span>
               	<span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outstockData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outstockTable', $event)"></i>
                </span>
            </h2>
            <div v-if="outstockData.error" class="error" :style="styleError">
                {{ outstockData.error }}
            </div>
            <div v-else class="content-table" ref="outstockTable">
            	<v-table :table-data="outstockData" :heights="outstockData.height" :loading="outstockData.loading"></v-table>            
                <v-dialogTable :dialog-data="dialogData" :heights="dialogData.height"  v-on:dialogVisibleChange="visibleChange"></v-dialogTable>        
            </div>
            <h2 class="content-title tableData">
                <span class='table-title'>入库信息</span>
                <span class='table-handle'>
                    <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(instockData, $event)"></i>
                    <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('instockTable', $event)"></i>
                </span>
            </h2>
            <div v-if="instockData.error" class="error" :style="styleError">
                {{ instockData.error }}
            </div>
            <div v-else class="content-table" ref="instockTable">
            	<v-table :table-data="instockData" :heights="instockData.height" :loading="instockData.loading"></v-table>
            </div>
            <!-- 复制的内容 -->
            <!--<div v-show="false" ref="outstockTable">
            	<v-table :b-fixed="false" :table-data="outstockData" :loading="outstockData.loading"></v-table>
            </div>
            <div v-show="false" ref="instockTable">
            	<v-table :b-fixed="false" :table-data="instockData" :loading="instockData.loading"></v-table>
            </div>-->
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
	import rasterizeHTML from 'rasterizehtml'
	import fnP from "assets/js/public.js"
	// import {host} from 'assets/js/configs.js'

    // var HOST = window.HOST ? window.HOST: host
    	
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
                        name: "批次",
                        width: "150",
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
                        name: "批次",
                        width: "150",
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
                        name: "批次",
                        class: "batch"
                    }],
                    data: [{
                        "barcode": "1",
                        "batchNo": "batchNo", 
                    }]
                    
                }
            }
        },
        mounted () {
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
	                this.$router.replace({ path: `/stock/${this.key}/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
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
                oData.height = this.adjustHeight();
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
                
                this.$register.sendRequest(this.$store, this.$ajax, sPath, "post", fnP.parseQueryParam(this.$route.query), (oResult) => {
					// 请求成功。
					oData.loading = false;			
					oData.data = oResult;        
				}, (sErrorMessage) => {
					// 请求失败。
					oData.loading = false;
					this.styleError.maxHeight = this.adjustHeight()-50+"px";
					// 提示信息。
					console.log(sErrorMessage);
				}, (err) => {
					// 请求错误。
					oData.loading = false;
					console.log("接口查询出错。");

					if(this.outstockData.error && this.instockData.error) {
						this.styleError.maxHeight = this.adjustHeight()-50+"px"
					}
				})

                // this.$ajax.post(sPath, fnP.parseQueryParam(this.$route.query))
                // .then((res) => {
                //     oData.loading = false;
                // //   oData.height = this.adjustHeight();
                //     if(!res.data.errorCode) {
                //         oData.data = res.data.data;
                //     }else {
                //     	this.styleError.maxHeight = this.adjustHeight()-50+"px";
                //   	// oData.error = res.data.errorMsg.message;
                //     	console.log(res.data.errorMsg.message)
                //     }
                // })
                // .catch((err) => {
                //     oData.loading = false;
                // //   oData.error = "查询出错。"
                //     console.log("接口查询出错。");
                //     if(this.outstockData.error && this.instockData.error) {
                //         this.styleError.maxHeight = this.adjustHeight()-50+"px"
                //     }           
                // })
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
                let oTable = this.$refs[refTable];
                	
                if(!oTable) {
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
                            //  border: 1px solid #e4efec;
	        				}
	        				.batch {
	        					color: #f90;
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
	                height: 100%;
	                line-height:40px; 
	                 
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

