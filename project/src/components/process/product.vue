<template>
    <div class="router-content" v-loading="loading">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">
            	产出
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('outputTable', '产出', $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputTable', $event)"></i>
            </h2>	
			<div class="content-table">
				<!--el-table :data="outData" border style="width: 100%" class="table">
					<el-table-column v-for="(item, index) in outItems" align="center" :label="item.name" :width="item.width" :key="index">
						<template scope="props">
							<div class="cell" v-for="a in props.row[item.prop]">{{a}}</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="300">
						<template scope="props">
							<div v-for="code in props.row.rowNum" class="cell">
								<el-button @click="handleClick(code)" type="text" size="small">遏制</el-button>
								<el-button type="text" size="small">单件追踪</el-button>
								<el-button @click="handleClick(code)" type="text" size="small">批次追踪</el-button>
								<el-button type="text" size="small">链路修复</el-button>
							</div>

						</template>
					</el-table-column>
				</el-table--> 

                <table class="raw-table" v-loading="loading" ref="outputTable">
            		<tr>
            			<th v-for="column in outItems" :style="{width: column.width}" v-if="!column.hide">
            				{{column.name}}
            			</th>
            		</tr>
            		<tr v-for="row in product.out">
            			<td v-for="column in outItems" :class="column.class" @click="column.click(row)" v-if="!(column.hide||(column.merge && row.hide))" :rowspan="`${column.merge ? row.rowspan : ''}`">
            				{{row[column.prop]}}
            			</td>
            		</tr>
            	</table>
				<div v-if="!product.out.length" class="empty">
					{{ empty }}
				</div>
			</div>
			
            <h2 class="content-title">
            	投入
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('inputTable', '投入', $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputTable', $event)"></i>
            </h2>
	
			<div class="content-table">
				<!--el-table :data="inData" border style="width: 100%" class="table">
					<el-table-column v-for="(item,index) in inItems" align="center" :label="item.name" :width="item.width" :key="index">
						<template scope="props">
							<div class="cell" v-for=" a in props.row[item.prop]">{{a}}</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="300">
						<template scope="props">
							<div v-for="code in props.row.rowNum" class="cell">
								<el-button @click="handleClick(code)" type="text" size="small">遏制</el-button>
								<el-button type="text" size="small">单件追踪</el-button>
								<el-button @click="handleClick(code)" type="text" size="small">批次追踪</el-button>
								<el-button type="text" size="small">链路修复</el-button>
							</div>

						</template>
					</el-table-column>
				</el-table-->
                <table class="raw-table" v-loading="loading" ref="inputTable">
            		<tr>
            			<th v-for="column in inItems" :style="{width: column.width}" v-if="!column.hide">
            				{{column.name}}
            			</th>
            		</tr>
            		<tr v-for="row in product.in">
            			<td v-for="column in inItems" :class="column.class" @click="column.click(row)" v-if="!(column.hide||(column.merge && row.hide))" :rowspan="`${column.merge ? row.rowspan : ''}`">
            				{{row[column.prop]}}
            			</td>
            		</tr>
            	</table>
				<div v-if="!product.in.length" class="empty">
					{{ empty }}
				</div>
			</div>			
					
        </div>
    </div>  
</template>

<script>
	import XLSX from 'xlsx'
    import Blob from 'blob'
    import FileSaver from 'file-saver'

const url = HOST + "/api/v1/trace/inout/by-equipment";

export default {
    data() {
        return {
            excel: true,
			print: true,
            loading: false,
            sErrorMessage: "",
            empty: "暂无数据。",
			styleObject: {
				"min-width": "2000px"
			},
            product: {
                out: [],
                in: []
            },
            outData: [{
                equipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004'],
                barcode: ['UN654574375200'],
                batchNo: ['20170505A'],
                materialCode:['bbbbbbbbb'],
                materialName: ['半成品活塞'],
                qualifiedNum: ['69'],
                scrapNum: ['10'],
                unqualifiedNum: ['1',],
                shiftName: ['白天'],
                personName: ['王小虎'],
                happenTime: ['2017-06-29 12:24:24'],
                rowNum: ['UN654574375200']
            }, {
                equipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004'],
                barcode: ['UN654574375200'],
                batchNo: ['20170505A'],
                materialCode:['aaaaaaaaa'],
                materialName: ['半成品活塞'],
                qualifiedNum: ['69'],
                scrapNum: ['10'],
                unqualifiedNum: ['1',],
                shiftName: ['白天'],
                personName: ['王小虎'],
                happenTime: ['2017-06-29 12:24:24'],
                rowNum: ['UN654574375200']
            },{
                equipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004', 'D201705050003'],
                barcode: ['UN654574375200', 'UN654574375201'],
                batchNo: ['20170505A', '20170505B'],
                materialCode:['aaaaaaaaa','bbbbbbbbb'],
                materialName: ['半成品活塞', '配料'],
                qualifiedNum: ['49', '190'],
                scrapNum: ['10','0'],
                unqualifiedNum: ['1', '10'],
                shiftName: ['白天', '晚上'],
                personName: ['王小虎', '张三'], 
                happenTime: ['2017-06-29 12:24:24', ''],
                rowNum: ['UN654574375200', '2222']
            }],
            inData: [{
                equipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004'],
                barcode: ['UN654574375200'],
                batchNo: ['20170505A'],
                materialCode:['bbbbbbbbb'],
                materialName: ['半成品活塞'],
                quantity: ['1'],
                shiftName: ['白天'],
                personName: ['王小虎'],
                happenTime: ['2017-06-29 12:24:24'],
                rowNum: ['UN654574375200']
            }],
            outItems: [{
                name: "设备名称",
                prop: "equipmentName",
                width: "150",
                merge: true
            }, {
                name: "模号",
                prop: "moldCode",
                width: "120",
                merge: true
            }, {
                name: "派工单号",
                prop: "doCode",
                width: "200"
            }, {
                name: "条码",
                prop: "barcode",
                width: "200"
            }, {
                name: "批次号",
                prop: "batchNo",
                width: "200"
            }, {
                name: "物料编码",
                prop: "materialCode",
                width: "120"
            }, {
                name: "物料名称",
                prop: "materialName",
                width: "120"
            }, {
                name: "合格数",
                prop: "qualifiedNum",
                width: ""
            }, {
                name: "报废数",
                prop: "scrapNum",
                width: ""
            }, {
                name: "不合格数",
                prop: "unqualifiedNum",
                width: ""
            }, {
                name: "班次",
                prop: "shiftName",
                width: ""
            }, {
                name: "操作人",
                prop: "personName",
                width: ""
            }, {
                name: "产出时间",
                prop: "happenTime",
                width: "200"
            }],
            inItems: [{
                name: "设备名称",
                prop: "equipmentName",
                width: "150",
                merge: true
            }, {
                name: "模号",
                prop: "moldCode",
                width: "120",
                merge: true
            }, {
                name: "派工单号",
                prop: "doCode",
                width: "200"
            }, {
                name: "条码",
                prop: "barcode",
                width: "200"
            }, {
                name: "批次号",
                prop: "batchNo",
                width: "200"
            }, {
                name: "物料编码",
                prop: "materialCode",
                width: "120"
            }, {
                name: "物料名称",
                prop: "materialName",
                width: "120"
            }, {
                name: "数量",
                prop: "quantity",
                width: ""
            }, {
                name: "班次",
                prop: "shiftName",
                width: ""
            }, {
                name: "操作人",
                prop: "personName",
                width: ""
            }, {
                name: "投入时间",
                prop: "happenTime",
                width: "200"
            }]

        }
    },
    created() {
        this.fetchData();
        // this.$get('http://rapapi.org/mockjsdata/21533/a?').
        //     then((response) => {
        //         let _outDatas = response.data.out;

        //         this.outData = this.dataChange(_outDatas)

        //         let _inData = response.data.in;

        //         this.inData = this.dataChange(_inData)
        //     })
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
//              this.sErrorMessage = param.data.errorMsg.message;
//              this.showMessage();
                console.log(param.data.errorMsg.message)
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
        // 获取数据。
        fetchData() {    
            this.loading = true;
            this.product.out = [];
            this.product.in = [];
            let oQuery = this.$route.query;

            this.$post(url, oQuery)
            .then((res) => {
                this.loading = false;
             
                this.judgeLoaderHandler(res,() => {
                    // 保存数据。
                    // debugger
                    // let _outDatas = res.data.data.out;
                    // this.outData = this.dataChange(_outDatas)
                    // let _inData = res.data.data.in;
                    // this.inData = this.dataChange(_inData)
                    this.product.out = this.formatData(res.data.data.out, this.outItems);
                    this.product.in = this.formatData(res.data.data.in, this.inItems);
                });				 
            })
            .catch((err) => {
                this.loading = false;
//              this.sErrorMessage = "查询出错。"
//              this.showMessage();
                this.styleObject.minWidth = 0;   
                console.log("数据库查询出错。")
            })
        },
        /**
        * 格式化数据。
        * @param {Array} aoData
        * @return {Array}
        */
        formatData (aoData, aocolumns) {
            // 按照条码进行排序。
            aoData.sort((a, b) => a.equipmentId>b.equipmentId);
            
            let oEquipmentId = {},
                nRow = 0,
                nIndex = 1;
            aoData.forEach((o, index) => {
                if(oEquipmentId[o.equipmentId]) {							
                    oEquipmentId[o.equipmentId]++;
                    aoData[nRow].rowspan = oEquipmentId[o.equipmentId];
                    o.hide = true;
                }else {
                    o.index = nIndex;
                    oEquipmentId[o.equipmentId] = 1;
                    nRow = index;
                    nIndex ++;
                    o.rowspan = oEquipmentId[o.equipmentId];
                }
            })   
            
            aocolumns.forEach(column => {					
                if(aoData.every(o => o[column.prop] === "" || o[column.prop] == undefined)) {
                // 若每一行都为空，设置隐藏。
                    column.hide = true;
                }
            })
        
            return aoData;
        },
        handleClick(a) {
        },
        dataChange(Datas) {
            /* 格式转化，转化为数组 */
            Datas.forEach(o => {
                for (let p in o) {
                    o[p] = [o[p]]
                }
            });
            /* 相同id单元格合并 */
            for (let i = 0; i < Datas.length; i++) {
                for (let j = 0; j < Datas.length - i - 1; j++) {
                    let a = Datas[i + j],
                        b = Datas[i + j + 1];
                    if (a.equipmentId[0] === b.equipmentId[0]) {  //判断id是否相同，相同的则合并
                        if (a.moldCode[0] !== b.moldCode[0]) {    //id相同的情况下判断模块号是否相同  
                            for (let prop in b) {                 //模块号相同的时候
                                if (prop !== "equipmentName") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        } else {                                  //模块号不相同的时候
                            for (let prop in b) {
                                if (prop !== "equipmentName" && prop !== "moldCode") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        }                                         //合并完成后删除一行
                        Datas.splice(i + j + 1, 1)
                    }
                }
            }
            return Datas
        },
        // 表格导出。
        exportExcelHandle (sTable, sFileName, event) {

            // 下载表格。
            Rt.utils.exportTable2Excel(XLSX, Blob, FileSaver, this.$refs[sTable], sFileName);      
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

<style lang="less"  >
.content-title.table-title {
    margin-top: 30px;
    margin-bottom: 0;
    color: #333;
    font-size: 14px;
    i {
        color: #ccc;
        float: right;
        &:first-child {
            transform: rotate(180deg);
            margin-left: 20px
        }
    }
}
.content-title {
    .icon-print {
        right: auto;
    }
}
.table {
    th {
        height: 36px;
        background-color: #42af8f; // white-space: nowrap;
        &>div {
            background-color: #42af8f;
            color: #fff;
            font-weight: 600;

            &.cell {
                padding: 0;
                white-space: nowrap;
                text-align: center
            }
        }
    }

    td {
        height: 30px;

        .cell {
            padding: 0;
            text-align: center;
            &.cell {
                line-height: 30px;
                min-height: 30px;
                border-bottom: 1px solid rgb(223, 236, 233);
                span {
                    font-size: 14px;
                    font-weight: bold;
                    text-decoration: underline #ff9900;
                    color: #ff9900;
                }
            }
            &.ok {
                font-weight: bold;
                color: #31bc00;
            }
            &.ng {
                font-weight: bold;
                color: #f10000;
            }
            &.cell:last-child {
                border-bottom: none
            }
        }
    }
}
</style>
