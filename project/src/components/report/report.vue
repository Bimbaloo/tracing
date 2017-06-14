<template>
	<div class="report">
		<!--div class="loading" v-if="loading">
			Loading...
		</div-->
		<div v-if="error" class="error">
			{{ error }}
		</div>
		<div v-if="!error" ref="content">
			<div ref="outputs" :class="{ actived: active.outputs }">				
				<h2 class="content-title" @click="active.outputs=!active.outputs">汇总信息<i class="el-icon-d-arrow-right icon"></i></h2>
				<div class="content-table">
					<v-table :table-data="reportData.outputs" :loading="loading"></v-table>
				</div>
			</div>
			<div ref="inStocks" :class="{ actived: active.inStocks }">			
				<h2 class="content-title" @click="active.inStocks=!active.inStocks">在库明细<i class="el-icon-d-arrow-right icon"></i></h2>
				<div class="content-table">
					<v-table :table-data="reportData.inStocks" :loading="loading"></v-table>
				</div>
			</div>
			<div ref="inMakings" :class="{ actived: active.inMakings }">			
				<h2 class="content-title" @click="active.inMakings=!active.inMakings">在制明细<i class="el-icon-d-arrow-right icon"></i></h2>
				<div class="content-table">
					<h2 class="inner-title">加工中</h2>
					<v-table :table-data="reportData.inMakings" :loading="loading"></v-table>
					<h2 class="inner-title">滞留中</h2>
					<v-table :table-data="reportData.remain" :loading="loading"></v-table>
				</div>
			</div>
			<div ref="outStocks" :class="{ actived: active.outStocks }">				
				<h2 class="content-title" @click="active.outStocks=!active.outStocks">出库明细<i class="el-icon-d-arrow-right icon"></i></h2>
				<div class="content-table">
					<h2 class="inner-title">非成品出库</h2>
					<v-table :table-data="reportData.outStocks" :loading="loading"></v-table>
					<h2 class="inner-title">成品发货</h2>
					<v-table :table-data="reportData.delivery" :loading="loading"></v-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import table from "components/basic/table.vue"
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
				loading: false,
				error: null,
				url: "/tracereport/bybatch",
				active: {
					outputs: true,
					inStocks: false,
					outStocks: false,
					inMakings: false
				},
				reportData: {
					outputs: {
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
							name: "物料名字",
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
							prop: "scrapNum",
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
								return row.rate*100 + "%"
							},
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}],
						data: [{
							"batchNo": "20160331A",
							"materialCode": "0031",
							"materialName": "物料名字",
							"quantity": 16,
							"qualifiedNum": "14",
							"unqualifiedNum": "1",
							"scrapNum": "1",
							"rate": "0.87"
						}]
					},
					delivery: {					
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						}, {
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名字",
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
							filters: [{
								"text": "上海通用",
								"value": "上海通用"
							},{
								"text": "通用",
								"value": "通用"
							}],
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
							"materialName": "物料名字",
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
							"materialName": "物料名字",
							"quantity": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "通用",
							"outstockType": "出库类型",
							"person": "出库人",
							"outstockTime": "2016-03-31 14:28:33"
						}]
					},
					outStocks: {					
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						}, {
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名字",
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
							filters: [{
								"text": "客户",
								"value": "客户"
							}],
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
							"materialName": "物料名字",
							"quantity": 16,
							"stock": "仓库",
							"stocklot": "库位",
							"customer": "客户",
							"outstockType": "出库类型",
							"person": "出库人",
							"outstockTime": "2016-03-31 14:28:33"
						}]
					},
					inStocks: {					
						columns: [{
							prop: "barcode",
							name: "条码",
							sortable: true
						}, {
							prop: "batchNo",
							name: "批次",
							sortable: true
						}, {
							prop: "materialCode",
							name: "物料编码",
							sortable: true
						}, {
							prop: "materialName",
							name: "物料名字",
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
							filters: [{
								"text": "客户",
								"value": "客户"
							}],
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
							"materialName": "物料名字",
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
					inMakings: {
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
							name: "物料名字",
							sortable: true
						}, {
							prop: "processName",
							name: "工序",
							sortable: true
						}, {
							prop: "inNum",
							name: "投入数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "useNum",
							name: "已消耗数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "remainNum",
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
							"materialName": "物料名字", 
							"processName": "工序名称",
							"inTime": "2016-03-31 14:28:33", 
							"inNum": 16,
							"useNum": 14,
							"remainNum": 1
				        }]
					},
					remain: {
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
							name: "物料名字",
							sortable: true
						}, {
							prop: "processName",
							name: "工序",
							sortable: true
						}, {
							prop: "lastOutQuantity",
							name: "数量",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "lastOutQualifiedNum",
							name: "合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "lastOutUnqualifiedNum",
							name: "不合格数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "lastOutScrapNum",
							name: "报废数",
							sortable: true,
							sortMethod: function(a, b) {
								return a-b>0;
							}
						}, {
							prop: "lastOutTime",
							name: "产出时间",
							width: "150",
							sortable: true
						}],
						data: [{
							"batchNo": "批次号", 
							"materialCode": "物料编码", 
							"materialName": "物料名字", 
							"processName": "工序名称",
							"lastOutTime": "2016-03-31 14:28:33", //最后产出时间 格式：yyyy-MM-dd hh:mm:ss
							"lastOutQuantity": 16, //最后产出数量
							"lastOutQualifiedNum": 14, //最后产出合格数
							"lastOutUnqualifiedNum": 1, //最后产出不合格数,
							"lastOutScrapNum": 1, // 最后产出报废数,
				        }]
					}
				}				
			}
		},
		created() {
			// 数据加载。
//			this.fetchData();
		},
		mounted() {
//			设置显示顺序.
			this.setSequence();
		},
		methods: {
			fetchData() {
				this.error = null;
				this.loading = true;
				
				let oQuery = this.$route.query;
				
				if(this.type == "trace") {
					// 若为快速报告，根据物料+批次+bucketNo获取数据。
					this.url = "/tracereport/bybatchlist";
					oQuery = this.query;
				}else {
					if("equipmentId" in oQuery) {
						// 若根据设备查询。
						this.url = "/tracereport/byequipment";
					}
				}
				
				this.$get(this.url, oQuery)
					.then((res) => {
						this.loading = false;
						
						let bSetWidth = false;
						
						if(!res.errorCode) {
							let oData = this.reportData;
								
							for(let p in oData) {
								oData[p].data = res[p];
								
								if(res[p].length && !bSetWidth) {
									bSetWidth = true;
									// 设置最小宽度。
									this.$emit("hasData");
								}
								
								if(p == "outputs") {
									// 若为汇总信息。
									oData[p].data.map(o => {
										if(o.quantity) {
											o.rate = o.qualifiedNum/o.quantity;
										}else {
											o.rate = 0;
										}
									})
								}
							}														
						}
						
						if(!bSetWidth) {
							this.$emit("noData");
							this.error = "查无数据。"
						}
					})
					.catch((err) => {
						this.loading = false;
						this.error = "查询出错。"
						this.$emit("noData");
					})
			},
			setSequence() {
				if(this.type == "trace") {
					// 若为快速报告，改变显示顺序：汇总-出库-在制-在库
					this.$refs.content.insertBefore(this.$refs.outStocks, this.$refs.inMakings);
					this.$refs.content.append(this.$refs.inStocks);
					
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.actived {
		.icon {
			display: none;
		}
		.content-title {
			color: #333;
		}
		.content-table {
			display: block;
		}
	}
	.icon {
		font-size: 14px;
	}
	.content-title {
		color: #42AF8F;

		&:hover {
			color: #42AF8F;
			cursor: pointer;
		}
	}
	.content-table {
		display: none;
		
		.inner-title {
			color: #42AF8F;
			margin: 13px 0;
			text-indent: 10px;
		}
	}
</style>