<!--出库-->
<template>
    <div class="router-content">
        <div class="innner-content" >
            <div class="content-message tableData">
				<span class='table-handle'>
					<i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('rawTable', materialData, $event)"></i>
                	<i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('rawTable', $event)"></i>
				</span>
			</div>
            <div class="content-table" ref="rawTable"> 
				<div v-if="error" class="error">
					{{ error }}
				</div>
                <v-table :table-data="materialData" :loading="loading"  :resize="tdResize"></v-table>
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
	import rasterizeHTML from 'rasterizehtml'

    export default {
        components: {
            'v-table': table
        },
        data () {
            return {
				excel: true,
				print: true,
                styleObject: {
                    "min-width": "1000px"
                },
                loading: false,
                error: "",

                materialData: {
					filename: "库存转储",
                    columns: [{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "batchNo",
                        name: "批次",
                        class: "batch"
                    },{
                        prop: "materialCode",
                        name: "物料编码",
                        width: "50px"
                    },{
                        prop: "materialName",
                        name: "物料名称"
                    },{
                        prop: "srcWarehouse",
                        name: "仓库"
                    },{
                        prop: "destWarehouse",
                        name: "库位",
                        width: "60px"
                    },{
                        prop: "destReservoir",
                        name: "数量"
                    },{
                        prop: "operatorName",
                        name: "操作人"
                    },{
                        prop: "vendorName",
                        name: "时间"
                    }],
                    data: []
                },
				tableHeight: 200
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
			},
		    resizeY: function() {
            	return this.$store && this.$store.state.resizeY
			},
			fullscreen: function() {
				return this.$store && this.$store.state.fullscreen
			}
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
            // this.fetchData();
        },
        mounted () {
			this.fetchData();
			this.tableHeight = this.setHeight()
        },
        watch: {
			"resizeY": function(){
				this.tableHeight = this.setHeight()
			},
			/* 全屏大小时，重新设置table大小 */
			"fullscreen": function(){
				this.tableHeight = this.setHeight()
			},
        },
        methods: {
			// 发起请求
            fetchData () {
				let oQuery = this.$route.query || {} //路由中获取条件
				// 发起请求
				this.$register.sendRequest(this.$store, this.$ajax, this.url, "post", oQuery, this.requestSucess, this.requestFail, this.requestError)
		   },
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
			// 请求成功。
            requestSucess(oData) {
				/* oData的结构
				{
					"traceCode":"UN54523742200000133",          //物流码
					"srcBarcode":"020400235",                   //源条码
					"destBarcode":“020400299”,                  //目标条码
					“batchNo”:"20160419A",                      //批次号
					"materialCode":"20000375",                  //物料编码
					"materialName":"MP/C15VVT-S3 活塞毛坯",     //物料名
					"srcWarehouse":"1001",                      //源仓库
					"destWarehouse":"1002",                     //目标仓库
					"srcReservoir":"A01",                       //源库位
					"destReservoir":"A02",                      //目标库位
					"quantity":10,                              //操作调整数量
					"srcQuantity":50,                           //源条码操作后数量
					"destQuantity":60,                          //目标条码操作后数量
					"operatorName":"周宇庭",                    //操作人名
					"customer_name":"天津市多恒商贸有限公司",   //客户名
					"vendor_name":"东方柴油配件公司3",          //供应商名
					"operationTime":"2017-11-13 11:34:39"       //操作时间
				}
				*/
				let newData = []
				newData = [].concat(oData)
				this.materialData = newData
            },
            // 请求失败。
            requestFail(sErrorMessage) {
                this.loading = false;
				// 提示信息。
				this.error = "查无数据";
				console.warn(sErrorMessage);
            },
            // 请求错误。
            requestError(err) {
				this.loading = false;
				this.error = "查无数据。"
				this.styleObject.minWidth = 0; 
				console.log(err) 
            },
		   	// 表格导出。
            exportExcelHandle (sTable, oTableData, event) {
				window.Rt.utils.exportMergeTable2Excel(XLSX, Blob, FileSaver, oTableData, this.$refs[sTable])
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
						//  .el-table__body-wrapper tr:nth-child(even) {
						//	 background-color: #fafafa;
						//  }
						//	.el-table__body-wrapper tr:nth-child(odd) {
						//		background-color: #fff;
						//	}
	                        .el-table__body-wrapper td {
	                        	white-space: normal;
	    						word-break: break-all;
	                        }
	                        .el-table__body-wrapper .cell {
	                            min-height: 30px;
	                            line-height: 30px;
	                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
	                            //	border: 1px solid #e4efec;
	                            box-sizing: border-box;
	                        }
	                        .el-table__body-wrapper .batch .cell > div {
	                            color: #f90;
	                        	font-weight: 600
	                        }
	                        .el-table__empty-block {
	                            text-align: center;	
	                        }
	                    </style>
	                </div>
	            `;

	            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
			},
			
			/* 获取元素实际高度(含margin) */
			outerHeight(el) {
				var height = el.offsetHeight;
				var style = el.currentStyle || getComputedStyle(el);

				height += parseInt(style.marginTop) + parseInt(style.marginBottom);
				return height;
			},
			// 设置table的高度
			setHeight() {
				let content = document.querySelector(".router-content")
				let tableData = document.querySelector(".tableData")
				return this.outerHeight(content) - this.outerHeight(tableData)-40	
			}
        }
    }  
</script>

<style lang="less">   
	.el-table--enable-row-hover .el-table__body tr:hover>td {
	  	background-color: transparent;
	  	background-clip: padding-box;
	} 
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
    				
    				&>div {
    					font-weight: 600;
    				}
    			}
    			
    			td {
    				height: 30px;
    			}
    			
    			.el-table__body-wrapper {
    				.batch {
	    				.cell {
			    	    	cursor: pointer;
				            color: #f90;
				            
				            &>div {
					            font-weight: 600;
				            }
	    				}
			        } 
    			}   
    		}
    		
    	}
    }
</style>
