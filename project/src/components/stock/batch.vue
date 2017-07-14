<!--同批出入库-->
<template>
	<div class="router-content">
		<el-button  @click="showSuspiciousList"  :class="[{ 'nobtn': btnShow }, 'btn' , 'btn-plain' , 'btn-restrain']" >可疑品</el-button>
		<!--<el-button class="btn btn-plain btn-restrain" @click="showSuspiciousList"  >可疑品</el-button>-->
		<div class="innner-content" :style="styleObject">
			<h2 class="content-title">
				<span class="tag">{{batch}}</span>出库信息
				<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outstockData, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outstockTable', $event)"></i>	
			</h2>
			<div v-if="outstockData.error" class="error" :style="styleError">
				{{ outstockData.error }}
			</div>
			<div v-else class="content-table" ref="outstockTable">
				<v-table :table-data="outstockData" :heights="outstockData.height" :loading="outstockData.loading"></v-table>
			</div>
			<h2 class="content-title">
				<span class="tag">{{batch}}</span>在库信息
				<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(instockData, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('instockTable', $event)"></i>
			</h2>
			<div v-if="instockData.error" class="error" :style="styleError">
				{{ instockData.error }}
			</div>
			<div v-else class="content-table" ref="instockTable">
				<v-table :table-data="instockData" :heights="instockData.height" :loading="instockData.loading"></v-table>
			</div>
		</div>
	</div>

</template>

<script>
	import $ from "jquery"
	import table from "components/basic/table.vue"
	import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'

	export default {
		components: {
			'v-table': table
		},
		data() {
			return {
				excel: true,
				print: true,
				btnShow: true,
				styleObject: {
					"min-width": "1200px"
				},
				styleError: {
                	"max-height": "200px"
                },
				batch: this.$route.query.batchNo,
				outstockData: {
					url: HOST + "/api/v1/outstock/bybatch",
					loading: false,
					error: null,
					height: "100%",
					filename: this.$route.query.batchNo + "出库",
					columns: [{
						prop: "barcode",
						name: "条码"
//					}, {
//						prop: "barcodeTypeName", //1-单件条码 2-箱条码 3-流转框条码 999-其他
//						name: "条码类型"
					}, {
						prop: "batchNo",
						name: "批次号"
					}, {
						prop: "materialCode",
						name: "物料编码"
					}, {
						prop: "materialName",
						name: "物料名字"
					}, {
						prop: "quantity",
						name: "数量"
					}, {
						prop: "stock",
						name: "仓库"
					}, {
						prop: "stocklot",
						name: "库位"
					}, {
						prop: "customer",
						name: "客户"
					}, {
						prop: "stockType",
						name: "出库类型"
					}, {
						prop: "person",
						name: "出库人"
					}, {
						prop: "createTime", //格式：yyyy-MM-dd hh:mm:ss
						name: "出库时间",
						width: "160"
					}],
					data: [
// 						{
// 						"barcode": "单件条码",
// //						"barcodeTypeName": "2",
// 						"batchNo": "20160331A",
// 						"materialCode": "021",
// 						"materialName": "物料名字",
// 						"quantity": 16,
// 						"stock": "仓库",
// 						"stocklot": "库位",
// 						"customer": "客户名",
// 						"stockType": "出库类型",
// 						"person": "出库人",
// 						"createTime": "2016-03-31 14:28:33"
// 					}
					]
				},
				instockData: {
					url: HOST + "/api/v1/stock/bybatch",
					loading: false,
					error: null,
					height: "100%",
					filename: this.$route.query.batchNo + "在库",
					columns: [{
						prop: "barcode",
						name: "条码"
//					}, {
//						prop: "barcodeTypeName", //1-单件条码 2-箱条码 3-流转框条码 999-其他
//						name: "条码类型"
					}, {
						prop: "batchNo",
						name: "批次号"
					}, {
						prop: "materialCode",
						name: "物料编码"
					}, {
						prop: "materialName",
						name: "物料名称"
					}, {
						prop: "quantity",
						name: "数量"
						// },{
						//     prop: "remainingNum",
						//     name: "库存余量"
					}, {
						prop: "stock",
						name: "仓库"
					}, {
						prop: "stocklot",
						name: "库位"
//					}, {
//						prop: "customer",
//						name: "客户"
					}, {
						prop: "stockType",
						name: "入库类型"
					}, {
						prop: "person",
						name: "入库人"
					}, {
						prop: "createTime", //格式：yyyy-MM-dd hh:mm:ss
						name: "入库时间",
						width: "160"
					}],
					data: [
// 						{
// 						"barcode": "单件条码",
// //						"barcodeTypeName": "2",
// 						"batchNo": "批次号",
// 						"materialCode": "031",
// 						"materialName": "物料名字",
// 						"quantity": 16,
// 						// "remainingNum": 16,
// 						"stock": "仓库",
// 						"stocklot": "库位",
// 						"customer": "客户名",
// 						"stockType": "入库类型",
// 						"person": "入库人",
// 						"createTime": "2016-03-31 14:28:33"
// 					}
					]
				},
			}
		},
		created() {
			// 组件创建完后获取数据，
			// 此时 data 已经被 observed 了
			this.fetchPage();
		},
		watch: {
			// 如果路由有变化，会再次执行该方法
			'$route': 'fetchPage'
		},
		methods: {
			 // 查询。
            fetchPage() {
            	this.fetchData(this.outstockData);
                this.fetchData(this.instockData);
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
            // 获取参数。
			fetchData(oData) {
				oData.error = null;
				oData.data = [];
				oData.loading = true;

				let sPath = oData.url;

				this.$ajax.post(sPath, this.$route.query)
					.then((res) => {
						oData.loading = false;
						oData.height = this.adjustHeight();
						
						if(!res.data.errorCode) {
							oData.data = res.data.data;
							this.styleObject.minWidth = "1200px";
						}else {
							this.styleError.maxHeight = this.adjustHeight()-50+"px";
//							oData.error = res.data.errorMsg.message;
							console.log(res.data.errorMsg.message);
						}
					})
					.catch((err) => {
						oData.loading = false;
//						oData.error = "查询出错。"
						console.log("接口查询出错。");
						if(this.outstockData.error && this.instockData.error) {
							this.styleObject.minWidth = 0;
							this.styleError.maxHeight = this.adjustHeight()-50+"px"
						}
					})
			},
			// 可疑品列表。
			showSuspiciousList() {
				if(!this.btnShow){
					let sKey = this.$route.params.key,
					sPath = "";				
					if(sKey != undefined && sKey !== "") {
						sPath = `/stock/${sKey}/restrain`;			
					}else {
							sPath = "/stock/restrain"
						}		
				this.$router.push({ path: sPath, query: this.$route.query})
				}else{
					console.log("该功能将在后续开发，敬请期待...")
				}
				
			},
			// 表格导出。
            exportExcelHandle (oData, event) {
                if(!oData) {
                    return;
                }
                // 下载表格。
                Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);      
            },
            // 表格打印。
            printHandle (refTable, event) {
                let oTable = this.$refs[refTable];
                if(!oTable) {
                    return;
                }
                Rt.utils.printHtml(oTable);              
            }

		}
	}
</script>

<style lang="less" scoped>
		
	.router-content {
		flex: 1 1;
		overflow: auto;

		.nobtn {
			background: rgb(204,204,204);
			border: none;
			color: #fff;
			// cursor: no-drop;
			cursor:auto;
		}

		.btn-restrain {
			position: absolute;
			right: 0;
			top: 65px;
		}
		
		.content-title {
			.tag {
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
    		overflow-x: hidden;
    	}
    }
	
</style>