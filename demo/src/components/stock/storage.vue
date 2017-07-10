<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">出库信息</h2>
            <div v-if="outstockData.error" class="error">
                {{ outstockData.error }}
            </div>
            <div v-else class="content-table">
            	<v-table :table-data="outstockData" :heights="outstockData.height" :loading="outstockData.loading"></v-table>
            </div>
            <h2 class="content-title">入库信息</h2>
            <div v-if="instockData.error" class="error">
                {{ instockData.error }}
            </div>
            <div v-else class="content-table">
            	<v-table :table-data="instockData" :heights="outstockData.height" :loading="instockData.loading"></v-table>
            </div>
        </div>
    </div>      
</template>

<script>
    import table from "components/basic/table.vue"
    import $ from "jquery"
    
    const TEST = "http://192.168.20.102:8080";
    
    export default {
        components: {
            'v-table': table
        },
        data () {
            return {
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1200px"
                },
                outstockData: {
                    url: TEST + "/api/v1/outstock",
                    loading: false,
                    error: null,
                    height: "100%",
                    columns: [{
                        prop: "barcode",
                        name: "条码",
                        cellClick: this.barcodeClick
                    },{
                        prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
                        name: "条码类型"
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        class: "batch",
                        cellClick: this.batchClick
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名字"
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
                        prop: "outstockType",
                        name: "出库类型"
                    },{
                        prop: "person",
                        name: "出库人"
                    },{
                        prop: "outstockTime",//格式：yyyy-MM-dd hh:mm:ss
                        name: "出库时间",
                        width: "160"
                    }],
                    data: [{
                        "barcode": "箱条码",
                        "barcodeTypeName": "1", 
                        "batchNo": "20160331A", 
                        "materialCode": "0031", 
                        "materialName": "物料名字", 
                        "quantity": 16, 
                        "stock": "仓库",
                        "stocklot": "库位",
                        "customer": "客户名",
                        "outstockType": "出库类型",
                        "person": "出库人", 
                        "outstockTime": "2016-03-31 14:28:33"
                    }]
                },
                instockData: {
                    url: TEST + "/api/v1/instock",
                    loading: false,
                    error: null,
                    height: "100%",
                    columns: [{
                        prop: "barcode",
                        name: "条码",
                        cellClick: this.barcodeClick
                    },{
                        prop: "barcodeTypeName",//1-单件条码 2-箱条码 3-流转框条码 999-其他
                        name: "条码类型"
                    },{
                        prop: "batchNo",
                        name: "批次号",
                        class: "batch",
                        cellClick: this.batchClick
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名字"
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
                        prop: "instockType",
                        name: "入库类型"
                    },{
                        prop: "person",
                        name: "入库人"
                    },{
                        prop: "instockTime",//格式：yyyy-MM-dd hh:mm:ss
                        name: "入库时间",
                        width: "160"
                    }],
                    data: [{
                        "barcode": "单件条码",
                        "barcodeTypeName": "2", 
                        "batchNo": "批次号", 
                        "materialCode": "0024", 
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
            }
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
            // this.fetchPage();
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
//          '$route': 'fetchPage'
            '$route': function() {
            	this.key = this.$route.params.key;
            	// this.fetchPage();
            }
        },
        methods: {
            // 条码点击。
            barcodeClick (row) {
                // 若为箱码。
                if(row.barcodeTypeName == "2") {
                    console.log("2");
                }
            },
            // 点击批次
            batchClick (row) {
                this.$router.push({ path: `/stock/${this.key}/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
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
                oData.error = oData.data = null;
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
                //console.log(this.$route.query);
                this.$ajax.post(sPath, this.$route.query)
                .then((res) => {
                    oData.loading = false;
                    oData.height = this.adjustHeight();
                    if(!res.data.errorCode) {
                        oData.data = res.data.data;
                        this.styleObject.minWidth = "1200px";
                    }else {
                    	oData.error = res.data.errorMsg.message;
                    }
                })
                .catch((err) => {
                    oData.loading = false;
                    oData.error = "查询出错。"
                    if(this.outstockData.error && this.instockData.error) {
                        this.styleObject.minWidth = 0;
                    }           
                })
            }
        }
    }  
</script>

<style lang="less">

    .router-content {
    	flex: 1 1;
    	overflow: auto;
    	
    	.table {
    	    .batch {
    	    	cursor: pointer;
	            color: #f90;
	            .cell {
	                font-weight: 600;
	            } 
	        }         
            .clicked {
                cursor: pointer;
	            color: #f90;
            }
    	}
    }
    
    .el-table {
    	.el-table__body-wrapper {
    		overflow-x: hidden;
    	}
    }
    
</style>
