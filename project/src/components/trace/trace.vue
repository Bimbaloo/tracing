<template>
    <div class="post">
    	<h2 class="content-title">查询结果集</h2>
    	<el-button class="btn btn-plain" @click="onTrace">溯源</el-button>
        <div class="router-content">
	        <div class="innner-content" :style="styleObject">
	            <div v-if="gridData.error" class="error">
	                {{ gridData.error }}
	            </div>
	            <div v-if="!gridData.error" class="content-table">
	                <v-table :table-data="gridData" :heights="gridData.height" :loading="gridData.loading"></v-table>    
	            </div>   
	       </div>   
    	</div> 
    </div>
</template>

<script>
	import $ from "jquery"
    import table from "components/basic/table.vue"
	
    export default {
        components: {
            'v-table': table
        },
        data () {
            return {
            	styleObject: {
                    "min-width": "1500px"
                },
                gridData: {
                    url: HOST + "/api/v1/trace/up/start-points",
                    loading: false,
                    error: null,
                    height: "100%",
                    selected: [],
                    columns: [{
                        prop: "bucketNo",
                        name: "",
                        type: "selection",
                        width: "30"
                    },{
                        type: "index",
                        name: "序号",
                        width: "50"
                    },{
                        prop: "barcode",
                        name: "条码"
                    },{
                        prop: "batchNo",
                        name: "批次号"
                    },{
                        prop: "materialCode",
                        name: "物料编码"
                    },{
                        prop: "materialName",
                        name: "物料名称"
                    },{
                        prop: "materialSpec",
                        name: "物料规格"
                    },{
                        prop: "materialUnit",
                        name: "物料单位"
                    },{
                        prop: "quantity",
                        name: "数量"
                    },{
                        prop: "happenTime",
                        name: "加工时间",
                        width: "160"
                    },{
                        prop: "personName",
                        name: "操作人"
                    },{
                        prop: "equipmentName",
                        name: "设备名称"
                    },{
                        prop: "equipmentCode",
                        name: "设备编码"
                    },{
                        prop: "equipmentType",
                        name: "设备类型"
                    },{
                        prop: "processName",
                        name: "工序名称"
                    },{
                        prop: "moldCode",
                        name: "模号"
                    }],
                    data: [{
				      "barcode": "UN65457437520007057", 
				      "batchNo": "20160331A", 
				      "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				      "materialCode": "10000515", 
				      "materialSpec": "", 
				      "materialUnit": "kg", 
				      "quantity": 16, 
				      "happenTime": "2016-03-31 14:28:33", 
				      "personName": "李瑞娇", 
				      "equipmentName": "装配2.2线GP12", 
				      "equipmentCode": "RLSB1", 
				      "equipmentType": "", 
				      "processName": "GP12", 
				      "moldCode": "",
				      "bucketNo": ""
				    }]
                },
            }
        },
        created () {
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
            	this.fetchData(this.gridData);
            },
        	// 获取高度。
            adjustHeight() {
            	let jRouter = $(".router-content"),
            		jTable = jRouter.find(".content-table"),
            		nHeight = 0;
            	
            	nHeight = Math.floor(jRouter.height() - (jTable.outerHeight(true) - jTable.height()));
            	
            	return nHeight;
            },
        	// 获取数据。
            fetchData (oData) {
                oData.error = null;
                oData.data = [];
                oData.loading = true;

                this.styleObject.minWidth = "1500px";
                
                let sPath = oData.url;
                
                this.$ajax.post(sPath, this.$route.query)
                .then((res) => {
                    oData.loading = false;
					oData.height = this.adjustHeight();
					
                    if(!res.data.errorCode) {
                        oData.data = res.data.data;
//						if(oData.number > 1000) {
//							this.$alert("查询结果集包含" + oData.number + "条数据，页面显示其中1000条，如需查询全部，请缩小条件范围进行精确查詢。", "提示", {
//					          	confirmButtonText: "确定",
//					          	callback: action => {
//						            this.$message({
//						              type: "info"
//						            });
//					        	}
//					        });
//						}
                    }else {
//                  	oData.error = res.data.errorMsg.message;
                    	// 当前是由于数据过多的提示，则显示出来。
                    	let sError = res.data.errorMsg.message;
                    	if(sError == "起点记录太多，请更换查询条件") {
	                    	this.styleObject.minWidth = 0;
                    		oData.error = sError;
                    	}else {
                    		// 其他错误，则直接console
                    		console.log(sError);
                    	}
                    }
                })
                .catch((err) => {
                    oData.loading = false;
//                  oData.error = "查询出错。";
                    console.log("接口查询出错。")
                })
            },
            onTrace (event) {
            	if(this.gridData.data && this.gridData.selected.length) {
	            	let aSelected = [];
	            	this.gridData.selected.forEach(o => {
	            		let oSelected = {};
	            		// 解构赋值。
	            		({ batchNo: oSelected.batchNo,materialName:oSelected.materialName,materialCode: oSelected.materialCode, bucketNo: oSelected.bucketNo} = o);
	            			
	            		aSelected.push(oSelected);
	            	})
	
	            	let tag = new Date().getTime().toString().substr(-5);// 生成唯一标识。
	            	
	            	sessionStorage.setItem("trace_" + tag, JSON.stringify(aSelected));
//	          		window.open("trace/index.html?tag="+tag);     
	            	window.open("traceIndex.html?tag="+tag);
            	}else {
            		this.$message("没有数据溯源");
            	}
            }
        }
    }  
</script>

<style lang="less">
	// .btn {
	// 	margin-bottom: 10px;
	// }
	.error {
		// margin-top: 10px;
		border: 2px solid #42AF8F;
	    padding: 20px 12px;
	    margin-bottom: 30px;
	    font-size: 14px;
	    color: red;
	}
	
</style>
