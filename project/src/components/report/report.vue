<template>
	<div class="report">
		<!--div v-if="error" class="error">
			{{ error }}
		</div-->
		<div v-if="!sErrorMessage" ref="content">
			<div ref="summary" :class="{ actived: active.summary }">				
				<h2 class="content-title" @click="active.summary=!active.summary">汇总信息<i class="el-icon-d-arrow-right icon"></i>
                	<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.summary, $event)"></i>
                	<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('summaryTable', $event)"></i>					
				</h2>
				<!--<div class="content-table">
					<v-table :table-data="reportData.summary" :loading="loading"></v-table>
				</div>-->
				<transition name="el-zoom-in-top">
					<div class="content-table inner" ref="summaryTable">
						<v-table v-show="active.summary" :table-data="reportData.summary" :loading="loading"></v-table>
					</div>
				</transition>
			</div>
			<div ref="inStocks" :class="{ actived: active.inStocks }">			
				<h2 class="content-title" @click="active.inStocks=!active.inStocks">在库明细<i class="el-icon-d-arrow-right icon"></i>
					<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.inStocks, $event)"></i>
                	<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inStocksTable', $event)"></i>
				</h2>
				<transition name="el-zoom-in-top">
					<div class="content-table inner" ref="inStocksTable">
					<v-table  v-show="active.inStocks" :table-data="reportData.inStocks" :loading="loading"></v-table>
					</div>
				</transition>
			</div>
			<div ref="inMakings" :class="{ actived: active.inMakings }">			
				<h2 class="content-title" @click="active.inMakings=!active.inMakings">在制明细<i class="el-icon-d-arrow-right icon"></i></h2>
				<!--<transition-group class="content-table">-->
				<transition-group name="el-zoom-in-top" tag="div">
					<h2 v-show="active.inMakings" key="1" class="inner-title">
						加工中
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.inMaking, $event)"></i>
                		<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inMakingTable', $event)"></i>
					</h2>
					<div class="content-table inner" ref="inMakingTable" key="2">
						<v-table v-show="active.inMakings" key="2" :table-data="reportData.inMaking" :loading="loading"></v-table>
					</div>
					<h2 v-show="active.inMakings" key="3" class="inner-title">
						滞留中
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.remain, $event)"></i>
                		<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('remainTable', $event)"></i>
					</h2>
					<div class="content-table inner" ref="remainTable" key="4">
						<v-table v-show="active.inMakings" :table-data="reportData.remain" :loading="loading"></v-table>
					</div>
				</transition-group>
			</div>
			<div ref="outStocks" :class="{ actived: active.outStocks }">				
				<h2 class="content-title" @click="active.outStocks=!active.outStocks">出库明细<i class="el-icon-d-arrow-right icon"></i></h2>
				<transition-group name="el-zoom-in-top" tag="div">
					<h2 v-show="active.outStocks" key="5" class="inner-title">
						出库明细
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.outStocks, $event)"></i>
                		<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outStocksTable', $event)"></i>
					</h2>
					<div class="content-table inner" key="6" ref="outStocksTable">
						<v-table v-show="active.outStocks" :table-data="reportData.outStocks" :loading="loading"></v-table>
					</div>
					<h2 v-show="active.outStocks" key="7" class="inner-title">
						发货明细
						<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(reportData.delivered, $event)"></i>
                		<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('deliveredTable', $event)"></i>
					</h2>
					<div class="content-table inner" key="8" ref="deliveredTable">
						<v-table v-show="active.outStocks" :table-data="reportData.delivered" :loading="loading"></v-table>
					</div>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<script>
	import table from "components/basic/table.vue"
	import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'

	export default {
		components: {
			'v-table': table
		},
		props: {
			type: String,
			query: Array
		},
		data() {
			return {
				excel: true,
				print: true,
				loading: false,
				sErrorMessage: '',
				url: "/api/v1/trace/report/by-batch",
				active: {
					summary: true,
					inStocks: false,
					outStocks: false,
					inMakings: false
				},
				reportData: {
					// 汇总。
					summary: {
						filename: "汇总",
						columns: [{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "quantity",
							name: "数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "qualifiedNum",
							name: "合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "unqualifiedNum",
							name: "不合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "disabilityNum",
							name: "报废数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "rate",
							name: "合格率",
							sortable: true,
							formatter: function(row, column) {
								return (row.rate*100).toFixed(2) + "%"
							},
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}],
						data: []
					},
					// 发货。
					delivered: {
						filename: "发货",	
						filteredData: [],	
						filterChange: (filters) => {
							this.filterChange(filters, 'delivered');
						},		
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						},{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "quantity",
							name: "数量",
							sortable: true
						}, {
							prop: "stock",
							name: "仓库",
							sortable: true
						}, {
							prop: "stocklot",
							name: "库位",
							sortable: true
						}, {
							prop: "customer",
							name: "客户",
							sortable: true,
							filters: [],
							filterMethod: function(value, row) {
						        return row.customer === value;
						   	},
						   	filterPlacement: "bottom-end"
						}, {
							prop: "outstockType",
							name: "出库类型",
							sortable: true
						}, {
							prop: "person",
							name: "出库人",
							sortable: true
						}, {
							prop: "outstockTime", //格式：yyyy-MM-dd hh:mm:ss
							name: "出库时间",
							width: "160",
							sortable: true
						}],
						data: [{
							"barcode": "003311",
							"batchNo": "20160331A",
							"materialCode": "物料编码",
							"materialName": "物料名称",
							"quantity": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "上海通用",
							"outstockType": "出库类型",
							"person": "出库人",
							"outstockTime": "2016-03-31 14:28:33"
						}, {
							"barcode": "003311",
							"batchNo": "20160331A",
							"materialCode": "物料编码",
							"materialName": "物料名称",
							"quantity": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "通用",
							"outstockType": "出库类型",
							"person": "出库人",
							"outstockTime": "2016-03-31 14:28:33"
						}]
					},
					// 出库。
					outStocks: {
						filename: "出库",		
						filteredData: [],	
						filterChange: (filters) => {
							this.filterChange(filters, 'outStocks');
						},			
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						},{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "quantity",
							name: "数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "stock",
							name: "仓库",
							sortable: true
						}, {
							prop: "stocklot",
							name: "库位",
							sortable: true
						}, {
							prop: "customer",
							name: "客户",
							sortable: true,
							filters: [],
							filterMethod: function(value, row) {
						        return row.customer === value;
						   	},
						   	filterPlacement: "bottom-end"
						}, {
							prop: "outstockType",
							name: "出库类型",
							sortable: true
						}, {
							prop: "person",
							name: "出库人",
							sortable: true
						}, {
							prop: "outstockTime", //格式：yyyy-MM-dd hh:mm:ss
							name: "出库时间",
							width: "160",
							sortable: true
						}],
						data: [{
							"barcode": "003311",
							"batchNo": "20160331A",
							"materialCode": "物料编码",
							"materialName": "物料名称",
							"quantity": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "客户",
							"outstockType": "出库类型",
							"person": "出库人",
							"outstockTime": "2016-03-31 14:28:33"
						}]
					},
					// 在库
					inStocks: {		
						filename: "在库",	
						filteredData: [],	
						filterChange: (filters) => {
							this.filterChange(filters, 'inStocks');
						},				
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						},{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "quantity",
							name: "数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						 },{
						     prop: "remainingNum",
						     name: "库存余量",
							sortable: true
						}, {
							prop: "stock",
							name: "仓库",
							sortable: true
						}, {
							prop: "stocklot",
							name: "库位",
							sortable: true
						}, {
							prop: "customer",
							name: "客户",
							sortable: true,
							filters: [],
							filterMethod: function(value, row) {
						        return row.customer === value;
						   	},
						   	filterPlacement: "bottom-end"
						}, {
							prop: "instockType",
							name: "入库类型",
							sortable: true
						}, {
							prop: "person",
							name: "入库人",
							sortable: true
						}, {
							prop: "instockTime", //格式：yyyy-MM-dd hh:mm:ss
							name: "入库时间",
							width: "160",
							sortable: true
						}],
						data: [{
							"barcode": "003322",
							"batchNo": "批次号",
							"materialCode": "物料编码",
							"materialName": "物料名称",
							"quantity": 16,
							"remainingNum": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "客户名",
							"instockType": "入库类型",
							"person": "入库人",
							"instockTime": "2016-03-31 14:28:33"
						}]
					},
					// 加工
					inMaking: {
						filename: "加工",
						columns: [{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "processName",
							name: "工序",
							sortable: true
						}, {
							prop: "equipmentName",
							name: "设备",
							sortable: true
						}, {
							prop: "inNum",
							name: "投入数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "consumedNum",
							name: "已消耗数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "remainingNum",
							name: "剩余量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "inTime",
							name: "投入时间",
							width: "150",
							sortable: true
						}],
						data: [{
							"batchNo": "批次号", 
							"materialCode": "物料编码", 
							"materialName": "物料名称", 
							"processName": "工序名称",
							"equipmentName": "设备名称",
							"inTime": "2016-03-31 14:28:33", 
							"inNum": 16,
							"consumedNum": 14,
							"remainingNum": 1
				        }]
					},
					// 滞留
					remain: {
						filename: "滞留",
						columns: [{
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名称",
							width: "300",
							sortable: true
						}, {
							prop: "processName",
							name: "工序",
							sortable: true
						}, {
							prop: "equipmentName",
							name: "设备",
							sortable: true
						}, {
							prop: "outNum",
							name: "数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "qualifiedNum",
							name: "合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "unqualifiedNum",
							name: "不合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "disabilityNum",
							name: "报废数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "outTimeFirst",
							name: "最早产出时间",
							width: "150",
							sortable: true
						},{
							prop: "outTimeLast",
							name: "最晚产出时间",
							width: "150",
							sortable: true
						}],
						data: [{
							"batchNo": "批次号", 
							"materialCode": "物料编码", 
							"materialName": "物料名称", 
							"processName": "工序名称",
							"equipmentName": "设备名称",
							"outTimeFirst": "2016-03-31 14:28:33",
							"outTimeLast": "2016-03-31 14:28:33", //最后产出时间 格式：yyyy-MM-dd hh:mm:ss
							"outNum": 16, //最后产出数量
							"qualifiedNum": 14, //最后产出合格数
							"unqualifiedNum": 1, //最后产出不合格数,
							"disabilityNum": 1, // 最后产出报废数
				        }]
					}
				}				
			}
		},
		watch: {
			'$route':function(){  
				this.fetchData();
			}
		},
		created() {
			// 数据加载。
			
			this.fetchData();
		},
		mounted() {
//			设置显示顺序.
			this.setSequence();	
		},

		methods: {
			// 判断调用接口是否成功。
			judgeLoaderHandler(param, fnSu, fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(bRight != "0") {
					// 提示信息。
					this.sErrorMessage = param.data.errorMsg.message;
					this.showMessage();
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
			fetchData() {
				this.sErrorMessage = '';
				this.loading = true;
				
				// 初始设置内容为空。
				for(let param in this.reportData) {
					this.reportData[param].data = [];
				}

				let oQuery = this.query;
				//console.log(this.$route.query.equipmentCode)
				//debugger
				if(this.type == "trace") {
					// 若为快速报告，根据物料+批次+bucketNo获取数据。
					this.url = "/api/v1/trace/report/by-start-points";
					
					oQuery = this.query;
				}else {
					if(oQuery && ("equipmentId" in oQuery)) {
						// 若根据设备查询。
						this.url = "/api/v1/trace/report/by-equipment";
					}
					oQuery ={
						"materialCode":this.$route.query.materialCode,
						"batchNo":this.$route.query.batchNo
					}
				}
				
				// oQuery = [
				// 			{
				// 			"batchNo": "20151118A",
				// 			"bucketNo": "28_D201511170002_20151118152959491",
				// 			"iokey": "D201511170003_59_2015-11-18 15:49:55_6501",
				// 			"materialCode": "20000375",
				// 			"materialName": "MP/C15VVT-S3 活塞毛坯/074175",
				// 			"productionMode": 0
				// 			}
				// 		]
				this.$post(HOST + this.url, oQuery)
					.then((res) => {
						this.loading = false;					
						let bSetWidth = false;
						this.judgeLoaderHandler(res, () => {
							
							let oData = this.reportData;
							for(let p in oData) {
								
								oData[p].data = res.data.data[p];
								oData[p].filteredData = oData[p].data;
								if(res.data.data[p].length && !bSetWidth) {
									bSetWidth = true;
									// 设置最小宽度。
									this.$emit("hasData");
								}
								
								if(p == "summary") {
									// 若为汇总信息。
									oData[p].data.map(o => {
										if(o.quantity) {
											
											o.rate = (o.qualifiedNum/o.quantity).toFixed(4);  //保留小数点后两位
										}else {
											o.rate = 0;
										}
									})
								}
								
								this.setFilters(oData[p]);

							}						
						})
						if(!bSetWidth) {
							this.$emit("noData");
//							this.error = "查无数据。"
							console.log("查无数据。")
						}
						
					})
					.catch((err) => {
						this.loading = false;

//						this.sErrorMessage = "查询出错。";
//						this.showMessage();
						this.$emit("noData");
						console.log("查询出错。")
					})
					
			},
			// 设置过滤。
			setFilters(oData) {
				
				let aoColumns = oData.columns,
					aoData = oData.data;
				
				for(let i = 0, l = aoColumns.length; i < l; i ++)  {
					if(aoColumns[i].prop == "customer") {
						// 若有客户信息。
						let oFilter = {};
						
						aoData.map(o => {
							if(!oFilter[o.customer]) {
								oFilter[o.customer] = 1;
							}
						});

						Object.keys(oFilter).map(key => aoColumns[i].filters.push({
							text: key,
							value: key
						}))

						break;
					}
				}

			},
			/**
			 * 表格筛选变化。
			 * @param {Object} filters
			 * @param {String} param
			 * @return {void}
			 */
			filterChange(filters, param) {
				let selected = [];

				for(let p in filters) {
					selected = filters[p];
				}
				debugger
				// 设置过滤数据。
				selected.map(s => this.reportData[param].filteredData = this.reportData[param].data.filter(o => o.customer == s))
						
			},
			setSequence() {
				if(this.type == "trace") {
					// 若为快速报告，改变显示顺序：汇总-出库-在制-在库
					this.$refs.content.insertBefore(this.$refs.outStocks, this.$refs.inMakings);
					this.$refs.content.append(this.$refs.inStocks);					
				}
			},
			// 表格导出。
            exportExcelHandle (oData, event) {
				event.stopPropagation();
				
                if(!oData) {
                    return;
                }
                // 下载表格。
                window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);      
            },
            // 表格打印。
            printHandle (refTable, event) {
				event.stopPropagation();

                let oTable = this.$refs[refTable];
                if(!oTable) {
                    return;
                }
                window.Rt.utils.printHtml(oTable);              
            }
		}
	}
</script>

<style lang="less">
	.report {
		.content-title {
			.icon-excel, .icon-print {
				display: none;
			}
		}

		.actived {
			.icon-excel, .icon-print {
				margin-left: 10px;
				position: relative;
				top: -2px;
				display: inline-block;
				cursor: pointer;
			}
			.el-icon-d-arrow-right {
				display: none;
			}
			.content-title {
				color: #333;
			}
			.content-table.inner {
				display: block;
			}
		}
		.el-icon-d-arrow-right {
			font-size: 14px;
		}
		.content-title {
			color: #42AF8F;

			&:hover {
				color: #42AF8F;
				cursor: pointer;
			}
		}
		.content-table.inner {
			display: none;
		}
		.inner-title {
				color: #42AF8F;
				margin: 13px 0;
				text-indent: 10px;
		}

		.el-table th>.cell.highlight {
			color: #f9ff00;
		}
	}
</style>