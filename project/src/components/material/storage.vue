<!--出入库-->
<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <div class="content-message">
            	<span>物料编码：{{node.code}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>物料名称：{{node.name}}</span>
            </div>
            <!--div v-if="error" class="error">
                {{ error }}
            </div-->
            <div class="content-table">
            	<table class="raw-table" v-loading="loading">
            		<tr>
            			<th v-for="column in materialData.columns" :style="{width: column.width}" v-if="!column.hide">
            				{{column.name}}
            			</th>
            		</tr>
            		<tr v-for="row in materialData.data">
            			<td v-for="column in materialData.columns" :class="column.class" @click="column.click(row)" v-if="!(column.hide||(column.merge && row.hide))" :rowspan="`${column.merge ? row.rowspan : ''}`">
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

    export default {
        // components: {
        //     'v-table': table
        // },
        data () {
            return {
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
            this.fetchData();
        },
        mounted () {

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
				if(bRight != "0") {
					// 提示信息。
					this.error = "查无数据";
					console.warn(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}else {
					// 调用成功后的回调函数。
					fnSu && fnSu(param.data.data);
				}
			},			

            // 点击批次
            batchClick (row) {
                this.$router.push({ path: `/stock/batch`, query: { materialCode : row.materialCode, batchNo: row.batchNo }})
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

			    // setTimeout(() => {
				// 	this.loading = false;
				// 	let aoTest = [{
				//       "materialCode": "10000515", 
				//       "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				//       "barcode": "UN65457437520007057", 
				//       "warehouse": "成品仓库", 
				//       "reservoir": "CPK0001", 
				//       "opType": "出库", 
				//       "batchNo": "20160331B", 
				//       "quantity": 16, 
				//       "createTime": "2016-03-31 16:32:44", 
				//       "personName": "周宇庭", 
				//       "vendorName": "上海通用"
				//     }, {
				//       "materialCode": "10000515", 
				//       "materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
				//       "barcode": "UN65457437520007057", 
				//       "warehouse": "成品仓库", 
				//       "reservoir": "CPK0001", 
				//       "opType": "入库", 
				//       "batchNo": "20160331A", 
				//       "quantity": 16, 
				//       "createTime": "2016-03-31 16:32:44", 
				//       "personName": "周宇庭", 
				//       "vendorName": "上海通用"
				//     }]

				// 	oData.data = this.formatData(aoTest);
			    // }, 1000)

				this.$post(this.url, {
					code: this.node.code,
					materialInfoList: this.node.materialInfoList
				})
				.then((res) => {
					this.loading = false;
					this.error = "";
					this.judgeLoaderHandler(res, (data) => {
						debugger
						// 保存数据。
						if(!data.length) {
							// this.error = "查无数据。"
							console.log("查无数据。");
						}else {
							oData.data = this.formatData(data);
							this.styleObject.minWidth = "1200px";
						}
						
					});				 
				})
				.catch((err) => {
					this.loading = false;
					this.error = "查无数据。"
					// this.sErrorMessage = "查询出错。"
					// this.showMessage();
					this.styleObject.minWidth = 0;          
				})
           },
           /**
            * 格式化数据。
            * @param {Array} aoData
            * @return {Array}
            */
           formatData (aoData) {
           		// 按照条码进行排序。
				aoData.sort((a, b) => a.barcode>b.barcode);
				
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
           }
        }
    }  
</script>

<style lang="less">    
	.material-stock  {	    	    	
    	.content-message {
    		margin-top: 20px;
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
