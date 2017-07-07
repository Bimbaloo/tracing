<template>
    <div class="router-content">
        <div class="innner-content" :style="styleObject">
            <h2 class="content-title">
            	产出
            </h2>
		
			<div class="content-table">
				<el-table :data="outData" border style="width: 100%" class="table">
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
				</el-table> 
			</div>
			
            <h2 class="content-title">
            	投入
            </h2>
	
			<div class="content-table">
				<el-table :data="inDatas" border style="width: 100%" class="table">
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
				</el-table>
			</div>			
					
        </div>
    </div>  
</template>

<script>

export default {
    data() {
        return {
			styleObject: {
				"min-width": "2000px"
			},
            outData: [{
                eqipmentName: ['装配线2.2线GP1'],
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
                eqipmentName: ['装配线2.2线GP1'],
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
                eqipmentName: ['装配线2.2线GP1'],
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
            inDatas: [{
                eqipmentName: ['暂无数据'],
                moldCode: ['暂无数据'],
                doCode: ['暂无数据'],
                barcode: ['暂无数据'],
                batchNo: ['暂无数据'],
                materialCode:['暂无数据'],
                materialName: ['暂无数据'],
                quantity: ['暂无数据'],
                shiftName: ['暂无数据'],
                personName: ['暂无数据'],
                happenTime: ['暂无数据'],
                rowNum: ['暂无数据']
            }],
            outItems: [{
                name: "设备名称",
                prop: "eqipmentName",
                width: "150"
            }, {
                name: "模号",
                prop: "moldCode",
                width: "120"
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
            }]
            ,
            inItems: [{
                name: "设备名称",
                prop: "eqipmentName",
                width: "150"
            }, {
                name: "模号",
                prop: "moldCode",
                width: "120"
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

        this.$get('http://rapapi.org/mockjsdata/21533/a?').
            then((response) => {
                let _outDatas = response.data.out;

                this.outData = this.dataChange(_outDatas)

                let _inDatas = response.data.in;

                this.inDatas = this.dataChange(_inDatas)
            })
    },
    methods: {
        handleClick(a) {
            console.log(a);
        },
        dataChange(Datas) {
            /* 格式转化，转化为数组 */
            Datas.forEach(o => {
                for (var prop in o) {
                    o[prop] = [o[prop]]
                }
            });
            /* 相同id单元格合并 */
            for (var i = 0; i < Datas.length; i++) {
                for (var j = 0; j < Datas.length - i - 1; j++) {
                    var a = Datas[i + j],
                        b = Datas[i + j + 1];
                    if (a.equipmentId[0] === b.equipmentId[0]) {  //判断id是否相同，相同的则合并
                        if (a.moldCode[0] !== b.moldCode[0]) {    //id相同的情况下判断模块号是否相同  
                            for (var prop in b) {                 //模块号相同的时候
                                if (prop !== "eqipmentName") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        } else {                                  //模块号不相同的时候
                            for (var prop in b) {
                                if (prop !== "eqipmentName" && prop !== "moldCode") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        }                                         //合并完成后删除一行
                        Datas.splice(i + j + 1, 1)
                    }
                }
            }
            return Datas
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