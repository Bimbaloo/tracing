<template>
	<el-dialog size="small" class="dialog-wrap" title="条码查询" :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="handleClose">

		<div class="dialog-content">
			<div class="dialog-filter">
				<!--<el-input style="width: 75%; margin-right: 2%;" v-model="sBarcode" placeholder="请输入条码"></el-input>
				<el-button class="btn" type="primary" @click="query">查询</el-button>-->
				
				<el-form :model="search" :rules="rules" ref="ruleForm">
					<el-form-item style="width: 75%; margin-right: 2%;" prop="barcode">
						<el-input v-model="search.barcode" placeholder="请输入条码" @keyup.enter.native="query('ruleForm')"></el-input>
						<input id="hiddenText" type="text" style="display:none" />
					</el-form-item>
					<el-form-item>
						<el-button class="btn" type="primary" @click="query('ruleForm')">查询</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div class="error" v-if="error">{{error}}</div>
			<div v-else class="dialog-main" v-loading="loading" element-loading-text="拼命加载中">
				<div class="main-item item-info">
					<div class="item-title">条码信息</div>
					<div class="item-content">
						<ul class="item-list clear">
							<li class="item-item" :title="data.barcodeTypeName">条码类型 : {{ data.barcodeTypeName }}</li>
							<li class="item-item" :title="data.happenTime">加工时间 : {{ data.happenTime }}</li>
							<li class="item-item" :title="data.materialCode">物料编码 : {{ data.materialCode }}</li>
							<li class="item-item" :title="data.materialName">物料名称 : {{ data.materialName }}</li>
							<li class="item-item" :title="data.equipmentCode">设备编码 : {{ data.equipmentCode }}</li>
							<li class="item-item" :title="data.equipmentName">设备名称 : {{ data.equipmentName }}</li>
							<li class="item-item" :title="data.batchNo">批次 : {{ data.batchNo }}</li>
							<li class="item-item" :title="data.packet">父级码 : {{ data.packet }}</li>
						</ul>
					</div>
				</div>
				<div class="main-item item-sub" v-if="data.subBarcodeList && data.subBarcodeList.length">
					<div class="item-title">子级条码信息</div>
					<div class="item-content">
						<ul class="item-list clear">
							<li class="item-item"><label>类型 : </label><span>{{ data.subBarcodeTypeName}}</span></li>
							<li class="item-item"><label>数量 : </label><span>{{ data.subBarcodeNum }}</span></li>
						</ul>
						<!--<div class="table-wrap">
							<table>
								<tr v-for="item,index in data.child.list">
									<td width="30%" v-if="!index" class="firstColumn" :rowspan="data.child.list.length">条码</td>
									<td width="70%">{{ item }}</td>
								</tr>
							</table>
						</div>-->
						<div class="sub-list">
							<div class="sub-title" :style="{lineHeight: lineHeight+'px'}">条码</div>
							<ul class="sub-items">
								<li v-for="(item,index) in data.subBarcodeList" :key="index">{{ item.barCode }}</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
		
	</el-dialog>
</template>

<script>
	
	const URL = HOST + '/api/v1/barcode/list';
	
	export default {
		props: {
			dialogVisible: {
				default: true
			}
		},
		data() {
			return {
				sBarcode: '',
				loading: false,
				error: null,
				search: {
					barcode: ''
				},
				data: {
					barCode: '',
					// 条码类型
					barcodeTypeName: '',
					// 物料编码
					materialCode: '',
					// 物料名称
					materialName: '',
					equipmentCode: '',
					equipmentName: '',
					// 加工时间
					happenTime: '',
					// 批次
					batchNo: '',
					// 父级码
					packet: '',
					// 数量
					subBarcodeNum: '',
					// 类型
					subBarcodeTypeName: '',
					subBarcodeList: []
				},
				rules: {
					barcode: [{required: true, message: '请输入条码', trigger: 'blur'}]
				}
			}
		},
		computed: {
			lineHeight() {
				let nLen = this.data.subBarcodeList.length,
					nLineHeight = 0;
				
				let nHeight = nLen * 32,
					nMax = 300
				
				nLineHeight = nHeight > nMax? nMax : nHeight
				
				return nLineHeight - 2
			}
		},
		methods: {
			// 查询条码
			query(formName) {
				
				this.$refs[formName].validate( (valid) => {
					if(valid) {
						
						// 通过条码查询。
						this.loading = true;
						this.error = null;
						
						this.$register.sendRequest(this.$store, this.$ajax, URL, "get", this.search, (oData) => {
							this.loading = false;
							this.data = oData;
						}, (sErrorMessage) => {
							this.loading = false;
							this.error = sErrorMessage;
						}, (err) => {
							this.loading = false;
							this.error = "查询错误";
						})
						
					}else {
						return false
					}
				})
			},
			handleClose() {
				this.$emit('hideDialog')
			}
		}
	}
	
</script>

<style lang="less" scoped>
	.dialog-wrap {
		line-height: 20px;
		
		.dialog-content {
			.error {
				margin-top: 20px;
	    		border: 2px solid #42AF8F;
			    padding: 20px 12px;
			    margin-bottom: 30px;
			    font-size: 14px;
			    color: red;
	    	}
	    	
	    	.el-form-item {
	    		display: inline-block;
	    		margin-bottom: 0;
	    	}
			.dialog-main {
				
				.main-item {
					margin-top: 20px;
					
					.item-title {
						color: #42af8f;
						border-left: solid 4px #42af8f; 
						padding-left: 10px;
					}
					
					.item-content {
						.item-list {
							margin: 10px 0 0 14px;
							
							.item-item {
								width: 50%;
								float: left;
								line-height: 30px;
								
								overflow: hidden;
								text-overflow: ellipsis;
								vertical-align: middle;
								white-space: nowrap;
								/*span {
									display: inline-block;
									width: calc(100% - 22px);
									width: -webkit-calc(100% - 22px);
									width: -moz-calc(100% - 22px);
									overflow: hidden;
									text-overflow: ellipsis;
									vertical-align: middle;
								}*/
							}
						
						}
						
						.sub-list {
							display: flex;
							flex-direction: row;
							
							
							.sub-title {
								flex: 0 0 80px;
								text-align: center;
								border: 1px solid #CCCCCC;
								border-right: 0;
							}
							.sub-items {
								max-height: 300px;
								overflow-y: auto;
								
								flex: 1;
								li {
									line-height: 30px;
									padding-left: 20px;
									border: 1px solid #CCCCCC;
								}
							}
						}
						
						.table-wrap {
							
							max-height: 300px;
							overflow: auto;
							
							table {
								width: 100%;
								
								td {
									border: 1px solid #CCCCCC;
									line-height: 30px;
									text-indent: 20px;
									
									&.firstColumn {
										text-align: center;
										text-indent: 0;
									}
								}
							}
						}
						
					}
				}
			}
		}
		
	}
</style>