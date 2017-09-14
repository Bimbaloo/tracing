<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="content-message tableData">
				<span class='table-title'>
					<span>物料编码：{{node.code}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>物料名称：{{node.name}}</span>
				</span>
				<span class='table-handle'>
					<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('rawTable', '仓储表', $event)"></i>
                	<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('rawTable', $event)"></i>
				</span>
			</div>
            <!--div v-if="error" class="error">
                {{ error }}
            </div-->
            <div class="content-table"> 
            	<table class="raw-table" v-loading="loading" ref="rawTable">
            		<tr>
            			<th v-for="(column,index) in materialData.columns" :style="{width: column.width}" v-if="!column.hide" :key="index">
            				{{column.name}}
            			</th>
            		</tr>
            		<tr v-for="(row,index) in materialData.data" :key="index">
            			<td v-for="(column,index) in materialData.columns" 
						:key="index"
						:style="{cursor: column.click && !row[column.prop]?'default':'cursor'}" 
						:class="column.class" 
						@click="column.click && column.click(row)" 
						v-if="!(column.hide||(column.merge && row.hide))" 
						:rowspan="`${column.merge ? row.rowspan : ''}`">
            				{{row[column.prop]}}
            			</td>
            		</tr>
            	</table>
				<div v-if="error" class="error">
					{{ error }}
				</div>
                <!--<v-table :table-data="materialData" :loading="loading">!((column.prop == 'index' || column.prop == 'barcode') && row.hide) || !column.hide"</v-table>-->    
            </div>

        </div>
    </div>      
</template>

<script>
    // import table from "components/basic/table.vue"
	import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'
	import html2canvas from 'html2canvas'

    export default {
        // components: {
        //     'v-table': table
        // },
        data () {
            return {
				excel: true,
				print: true,
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1000px"
                },
                url: HOST + "/api/v1/trace/material-detail",
                // 点击的物料节点信息。
                node: {},
                loading: false,
                error: "",
				// sErrorMessage: "",
                materialData: {
                    columns: [{
                        prop: "index",
                        name: "序号",
                        width: "50px",
                        merge: true,
                    },{
                        prop: "barcode",
                        name: "条码",
                        merge: true,
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        class: "batch",
                        click: this.batchClick
                    },{
                        prop: "quantity",
                        name: "数量",
                        width: "50px"
                    },{
                        prop: "warehouse",
                        name: "仓库"
                    },{
                        prop: "reservoir",
                        name: "库位"
                    },{
                        prop: "opType",
                        name: "出入库",
                        width: "60px"
                    },{
                        prop: "createTime",
                        name: "处理时间"
                    },{
                        prop: "personName",
                        name: "操作人",
                        width: "60px"
                    },{
                        prop: "vendorName",
                        name: "供应商/客户"
//                  },{
//                      prop: "handle",
//                      name: "操作",
//                      condition: {
//                      	materialType: "1"
//                      }
                    }],
                    data: []
                }
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		   }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
            // this.fetchData();
        },
        mounted () {
			this.fetchData();
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            '$route': 'fetchData'
        },
        methods: {
			// 判断调用接口是否成功。
			judgeLoaderHandler(param, fnSu, fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu(param.data.data);
				}else {
					// 提示信息。
					this.error = "查无数据";
					console.warn(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}
			},			

            // 点击批次
            batchClick (row) {
            	if(row.batchNo) {
            		// 批次存在可点击
	                this.$router.replace({ path: `/stock/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
            	}
			},
			// 请求成功。
            requestSucess(oData) {
                this.loading = false;
				this.error = "";
				
				if(!oData.length) {
					this.error = "查无数据。"
					console.log("查无数据。");
				}else {
					oData.data = this.formatData(oData);
					this.styleObject.minWidth = "1200px";
				}               	
            },
            // 请求失败。
            requestFail(sErrorMessage) {
                this.loading = false;
			
				// 提示信息。
				this.error = "查无数据";
				console.warn(param.data.errorMsg.message);
            },
            // 请求错误。
            requestError(err) {
				this.loading = false;
				this.error = "查无数据。"
				this.styleObject.minWidth = 0;  
            },
            fetchData () {
				
				let  oData = this.materialData;
                oData.data = null;
                this.loading = true;
				
				let sKey = this.$route.query && this.$route.query.key,
				// 提取选中的物料节点数据。
					oNode = this.rawData.filter(o => o.key == sKey)[0] || {};
					
				this.node = {
					code: oNode.code || "",
					name: oNode.name || "",
					materialInfoList: oNode.materialInfoList || []
				}

				this.$register.sendRequest(this.$store, this.$ajax, this.url, "post", {
					code: this.node.code,
					materialInfoList: this.node.materialInfoList
				}, this.requestSucess, this.requestFail, this.requestError)
				// this.$post(this.url, {
				// 	code: this.node.code,
				// 	materialInfoList: this.node.materialInfoList
				// })
				// .then((res) => {
				// 	this.loading = false;
				// 	this.error = "";
				// 	this.judgeLoaderHandler(res, (data) => {
				// 		// 保存数据。
				// 		if(!data.length) {
				// 			this.error = "查无数据。"
				// 			console.log("查无数据。");
				// 		}else {
				// 			oData.data = this.formatData(data);
				// 			this.styleObject.minWidth = "1200px";
				// 		}
						
				// 	});				 
				// })
				// .catch((err) => {
				// 	this.loading = false;
				// 	this.error = "查无数据。"
				// 	// this.sErrorMessage = "查询出错。"
				// 	// this.showMessage();
				// 	this.styleObject.minWidth = 0;          
				// })
           },
           /**
            * 格式化数据。
            * @param {Array} aoData
            * @return {Array}
            */
           formatData (aoData) {
           		// 按照条码进行排序。
//				aoData.sort((a, b) => a.barcode>b.barcode);
				let that = this;
				aoData.sort(function(oA,oB) {
					return that.sortData(oA.barcode,oB.barcode);
				});
				
				let oBarcode = {},
					nRow = 0,
					nIndex = 1;
				aoData.forEach((o, index) => {
					if(oBarcode[o.barcode]) {							
						oBarcode[o.barcode]++;
						aoData[nRow].rowspan = oBarcode[o.barcode];
						o.hide = true;
					}else {
						o.index = nIndex;
						oBarcode[o.barcode] = 1;
						nRow = index;
						nIndex ++;
						o.rowspan = oBarcode[o.barcode];
					}
				})   
				
				this.materialData.columns.forEach(column => {					
					if(aoData.every(o => o[column.prop] === "" || o[column.prop] == undefined)) {
					// 若每一行都为空，设置隐藏。
						column.hide = true;
					}
				})
			
				return aoData;
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
                window.Rt.utils.printHtml(html2canvas, oTable,{
                	height: oTable.clientHeight * 1.5
                });
            },
            sortData(param1,param2, sType) {

                // 默认按照从小到大排序。
                if(sType == "desc") {
                    // 从大到小时。
                    [param1,param2] = [param2,param1];                
                }

                // 根据数据类型设置排序的方式。
                if(escape(param1).indexOf("%u")>-1) {
                    // 中文。
                    return param1.localeCompare(param2);
                }else if(!isNaN(Number(param1))) {
                    // 数字。
                    return param1 - param2;
                }else {
                    // 字符串。
                    return param1 > param2 ? 1:-1;
                }

            }
        }
    }  
</script>

<style lang="less">    
	.material-stock  {	    	    	
    	.content-message {
    		margin-top: 20px;

			.icon-print {
				right: auto;
			}
    	}
    	
    	.content-table {
    		.raw-table {
    			width: 100%;
    			border-collapse: collapse;
   	 			border-spacing: 0;
    			
    			th,td {
    				text-align: center;
    				vertical-align: middle;
    				border: 1px solid #dfece9;
    				box-sizing: border-box;
    			}
    			
    			th {
    				height: 36px;
    				background-color: #42AF8F;
    				color: #fff;
    				font-weight: bold;
    			}
    			
    			td {
    				height: 30px;
    			}
    			
    			.batch {
	    	    	cursor: pointer;
		            color: #f90;
		            font-weight: 600;
		        }    
    		}
    	}
    }
</style>
<style lang="less" scoped>
.tableData {
    display: flex;
	justify-content: space-between;
	margin-top: 0;
    margin-bottom: -20px;
	.table-title {
		display: flex;
        align-items: center;
	}
    .table-handle {
        margin-right: 5px;
        display: flex;
        align-items: center;
        i {
            margin: 7.5px;
        }
    }
}
</style>