<template>
    <div class="post">
    
        <el-breadcrumb separator=">">
            <el-breadcrumb-item>设备列表</el-breadcrumb-item>
            <el-breadcrumb-item>设备详情</el-breadcrumb-item>
            <el-breadcrumb-item> 投产表 </el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="content-title table-title">产出
            <i class="el-icon-upload2"></i>
            <i class='el-icon-document'></i>
        </h2>
        <div class="router-content">
            <div class="innner-content">
                <div class="content-table">
                    <el-table :data="outData" border style="width: 100%" class="table">
                        <el-table-column v-for="item in outItems" align="center" :label="item.name" :width="item.width">
                            <template scope="props">
                                <div class="cell" v-for=" a in props.row[item.prop]">{{a}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="400">
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
        <h2 class="content-title">投入
            <i class="el-icon-upload2"></i>
            <i class='el-icon-document'></i>
        </h2>
        <div class="router-content">
            <div class="innner-content">
                <div class="content-table">
                    <el-table :data="inDatas" border style="width: 100%" class="table">
                        <el-table-column v-for="item in inItems" align="center" :label="item.name" :width="item.width">
                            <template scope="props">
                                <div class="cell" v-for=" a in props.row[item.prop]">{{a}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="400">
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
    </div>
</template>

<script>

export default {
    data() {
        return {
            outData: [{
                eqipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004'],
                barcode: ['UN654574375200'],
                batchNo: ['20170505A'],
                materialCode: ['1111'],
                materialName: ['半成品活塞'],
                quantity: ['50'],
                qualifiedNum: ['49'],
                unqualifiedNum: ['1',],
                person: ['王小虎'],
                shiftName: ['白天'],
                outTime: ['2017-06-29 12:24:24'],
                rowNum: ['UN654574375200']
            }, {
                eqipmentName: ['装配线2.2线GP1'],
                moldCode: ['2331'],
                doCode: ['D201705050004', 'D201705050003'],
                barcode: ['UN654574375200', 'UN654574375201'],
                batchNo: ['20170505A', '20170505B'],
                materialCode: ['1111', '2222'],
                materialName: ['半成品活塞', '配料'],
                quantity: ['50', '200'],
                qualifiedNum: ['49', '190'],
                unqualifiedNum: ['1', '10'],
                person: ['王小虎', '张三'],
                shiftName: ['白天', '晚上'],
                outTime: ['2017-06-29 12:24:24', ''],
                rowNum: ['UN654574375200', '2222']
            }],
            inDatas: [{
                eqipmentName: ['暂无数据'],
                moldCode: ['暂无数据'],
                doCode: ['暂无数据'],
                barcode: ['暂无数据'],
                batchNo: ['暂无数据'],
                materialCode: ['暂无数据'],
                materialName: ['暂无数据'],
                quantity: ['暂无数据'],
                person: ['暂无数据'],
                shiftName: ['暂无数据'],
                inTime: ['暂无数据'],
                rowNum: ['暂无数据']
            }]


            ,
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
                name: "数量",
                prop: "quantity",
                width: "120"
            }, {
                name: "合格",
                prop: "qualifiedNum",
                width: "120"
            }, {
                name: "不合格",
                prop: "unqualifiedNum",
                width: "120"
            }, {
                name: "班次",
                prop: "shiftName",
                width: "300"
            }, {
                name: "时间",
                prop: "outTime",
                width: "300"
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
                width: "120"
            }, {
                name: "班次",
                prop: "shiftName",
                width: "300"
            }, {
                name: "操作人",
                prop: "person",
                width: "300"
            }, {
                name: "产出时间",
                prop: "inTime",
                width: "300"
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
                    if (a.id[0] === b.id[0]) {
                        if (a.moldCode[0] !== b.moldCode[0]) {
                            for (var prop in b) {
                                if (prop !== "eqipmentName") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        } else {
                            for (var prop in b) {
                                if (prop !== "eqipmentName" && prop !== "moldCode") {
                                    a[prop].push(b[prop][0])
                                }
                            }
                        }
                        Datas.splice(i + j + 1, 1)
                    }
                }
            }
            return Datas
        }
    }
}
</script>

<style lang="less">
.el-breadcrumb {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    &>span {
        span {
            font-size: 14px;
            color: #333;
            font-family: '微软雅黑'
        }
    }
    &>span:last-child {
        span:first-child {
            color: #42af8f
        }
    }
}

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