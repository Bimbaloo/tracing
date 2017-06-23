<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">出库信息</h2>
            <div v-if="outstockData.error" class="error">
                {{ outstockData.error }}
            </div>
            <div v-else class="content-table">
                <v-table :table-data="outstockData" :loading="outstockData.loading"></v-table>    
            </div>
            <h2 class="content-title">入库信息</h2>
            <div v-if="instockData.error" class="error">
                {{ instockData.error }}
            </div>
            <div v-else class="content-table">
                <v-table :table-data="instockData" :loading="instockData.loading"></v-table>    
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
        data () {
            return {
                key: this.$route.params.key,
                styleObject: {
                    "min-width": "1200px"
                },
                outstockData: {
                    url: "/outstock",
                    loading: false,
                    error: null,
                    columns: [{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "barcodeType",//1-单件条码 2-箱条码 3-流转框条码 999-其他
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
                        "barcode": "单件条码",
                        "barcodeType": "箱条码", 
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
                    url: "/instock",
                    loading: false,
                    error: null,
                    columns: [{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "barcodeType",//1-单件条码 2-箱条码 3-流转框条码 999-其他
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
                        "barcodeType": "箱条码", 
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
            // this.fetchData(this.outstockData);
            // this.fetchData(this.instockData);
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            // '$route': 'fetchData'
        },
        methods: {
            // 点击批次
            batchClick (row) {
                this.$router.push({ path: `/stock/${this.key}/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
            },
            fetchData (oData) {
                oData.error = oData.data = null;
                oData.loading = true;

                let sPath = oData.url;
            
                switch(this.key) {
                    case "1":
                        sPath += "/bybarcode";
                        break;
                    case "2":
                        sPath += "/bybatch";
                        break;
                    case "3":
                        sPath += "/byouttime";
                        break;
                    case "4":
                        sPath += "/byintime";
                        break;
                    default:;
                }
                console.log(this.$route.query);
                this.$get(sPath, this.$route.query)
                .then((res) => {
                    oData.loading = false;
                    if(!res.errorCode) {
                        oData.data = res.outStocks;
                        this.styleObject.minWidth = "1200px";
                    }
                })
                .catch((err) => {
                    oData.loading = false;
                    oData.error = "查询出错。"
                    if(this.outstockData.error && this.outstockData.error) {
                        this.styleObject.minWidth = 0;
                    }           
                })
            }
        }
    }  
</script>

<style lang="less">

    
</style>
