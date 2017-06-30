<template>

    <div class="post">

        <el-breadcrumb separator=">">
            <el-breadcrumb-item>设备列表</el-breadcrumb-item>
            <el-breadcrumb-item>设备详情</el-breadcrumb-item>
            <el-breadcrumb-item> 投产表 </el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="content-title">产出<i class="el-icon-upload2"></i><i class='el-icon-document'></i></h2>
        <div class="router-content">
            <div class="innner-content">
                <div class="content-table">
                    <!--<el-table :data="tableData" border style="width: 100%" class="table" >                        
                        <el-table-column 
                            v-for="(column,index) in columns"       
                            align="center"
                            :label="column.name"
                            :width="column.width">
                            <template scope="column">
                               <div class="cell" v-for="">{{column.row.devicename}}</div>
                            </template>
                        </el-table-column>
                    </el-table>-->
                    <el-table :data="outData" border style="width: 100%" class="table" >                        
                        <el-table-column prop="eqipmentName" label="设备名称" width="150">
                        </el-table-column>
                        <el-table-column label="模号" width="120">
                            <template scope="column">
                               <div class="cell" v-for="moldCode in column.row.moldCode">{{moldCode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="派工单号" width="200">
                            <template scope="column">
                               <div class="cell" v-for="doCode in column.row.doCode">{{doCode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="条码" width="200">
                            <template scope="column">
                               <div class="cell" v-for="barcode in column.row.barcode">{{barcode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="批次号" width="200">
                            <template scope="column">
                               <div class="cell" v-for="batchNo in column.row.batchNo">{{batchNo}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="物料编码" width="120">
                            <template scope="column">
                               <div class="cell" v-for="materialCode in column.row.materialCode">{{materialCode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="物料名称" width="150">
                            <template scope="column">
                               <div class="cell" v-for="materialname in column.row.materialname">{{materialname}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="数量" width="120">
                            <template scope="column">
                               <div class="cell" v-for="quantity in column.row.quantity">{{quantity}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="合格数" width="120">
                            <template scope="column">
                               <div class="cell ok" v-for="qualifiedNum in column.row.qualifiedNum">{{qualifiedNum}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="不合格数" width="120">
                            <template scope="column">
                               <div class="cell ng" v-for="unqualifiedNum in column.row.unqualifiedNum">{{unqualifiedNum}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="班次" width="300">
                            <template scope="column">
                               <div class="cell" v-for="shiftName in column.row.shiftName">{{shiftName}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作人" width="300">
                            <template scope="column">
                               <div class="cell" v-for="person in column.row.person">{{person}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="产出时间" width="300">
                            <template scope="column">
                               <div class="cell" v-for="outTime in column.row.outTime">{{outTime}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作" width="400">
                            <template scope="column">
                                <div v-for="row in column.row.rows" class="cell">
                                    <el-button @click="handleClick(row)" type="text" size="small">遏制</el-button>
                                    <el-button type="text" size="small">单件追踪</el-button>
                                    <el-button @click="handleClick(row)" type="text" size="small">批次追踪</el-button>
                                    <el-button type="text" size="small">链路修复</el-button>
                                </div>
                                
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <h2 class="content-title">投入<i class="el-icon-upload2"></i><i class='el-icon-document'></i></h2>
        <div class="router-content">
            <div class="innner-content">
                <div class="content-table">
                    <el-table :data="inData" border style="width: 100%" class="table" >                        
                        <el-table-column prop="eqipment" label="设备名称" width="150">
                        </el-table-column>
                        <el-table-column label="模号" width="120">
                            <template scope="column">
                               <div class="cell" v-for="moldCode in column.row.moldCode">{{moldCode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="派工单号" width="200">
                            <template scope="column">
                               <div class="cell" v-for="doCode in column.row.doCode">{{doCode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="条码" width="200">
                            <template scope="column">
                               <div class="cell" v-for="barcode in column.row.barcode">{{barcode}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="批次号" width="200">
                            <template scope="column">
                               <div class="cell" v-for="batchNo in column.row.batchNo">{{batchNo}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="物料编码" width="120">
                            <template scope="column">
                               <div class="cell" v-for="materialCode in column.row.materialCode">{{materialCode}}</div>
                            </template>
                        </el-table-column>

                        <el-table-column  label="物料名称" width="150">
                            <template scope="column">
                               <div class="cell" v-for="materialName in column.row.materialName">{{materialName}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="数量" width="120">
                            <template scope="column">
                               <div class="cell" v-for="quantity in column.row.quantity">{{quantity}}</div>
                            </template>
                        </el-table-column>
                    
                        <el-table-column  label="班次" width="300">
                            <template scope="column">
                               <div class="cell" v-for="shiftName in column.row.shiftName">{{shiftName}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作人" width="300">
                            <template scope="column">
                               <div class="cell" v-for="person in column.row.person">{{person}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="产出时间" width="300">
                            <template scope="column">
                               <div class="cell" v-for="inTime in column.row.inTime">{{inTime}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="操作" width="400">
                            <template scope="column">
                                <div v-for="row in column.row.rows" class="cell">
                                    <el-button @click="handleClick(row)" type="text" size="small">遏制</el-button>
                                    <el-button type="text" size="small">单件追踪</el-button>
                                    <el-button @click="handleClick(row)" type="text" size="small">批次追踪</el-button>
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
                    eqipmentName: '暂无数据',
                    moldCode: ['暂无数据'],
                    doCode: ['暂无数据'],
                    barcode: ['暂无数据'],
                    batchNo: ['暂无数据'],
                    materialCode: ['暂无数据'],
                    materialname:['暂无数据'],
                    quantity:['暂无数据'],
                    qualifiedNum: ['暂无数据'],
                    unqualifiedNum: ['暂无数据'],
                    person: ['暂无数据'],
                    shiftName:['暂无数据'],
                    outTime: ['暂无数据'],
                    rows: ['暂无数据']
                }],
                inData: [{
                    eqipment: '暂无数据',
                    moldCode: ['暂无数据'],
                    doCode: ['暂无数据'],
                    barcode: ['暂无数据'],
                    batchNo: ['暂无数据'],
                    materialCode: ['暂无数据'],
                    materialName:['暂无数据'],
                    quantity: ['暂无数据'],
                    person: ['暂无数据'],
                    shiftName:['暂无数据'],
                    inTime: ['暂无数据'],
                    rows: ['暂无数据']
                }]

                
                // ,
                // columns:[{
                //     name:"设备",
                //     prop: "devicename",
                //     width:"150"
                // },{
                //     name:"模号",
                //     prop: "date",
                //     width:"150"
                // },{
                //     name:"派工单号",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"条码",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"批次",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"物料名称",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"合格",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"不合格",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"设备操作人",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"班次",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"时间",
                //     prop: "",
                //     width:"150"
                // },{
                //     name:"操作",
                //     prop: "",
                //     width:"150"
                // }]
                
            }
        },
        created() {
         
			this.$get('http://rapapi.org/mockjsdata/21533/a?').
            then((response) => {
                let _outDatas = response.data.out;
                _outDatas.forEach(_outData => {
                    for(var prop in _outData){
                        _outData[prop] = [_outData[prop]]
                    }
                });
               for(var i = 0 ; i < _outDatas.length ; i++ ){  
                   for( var j = 0; j<_outDatas.length-i-1 ; j++ ){
                        var a =  _outDatas[i+j],
                            b =  _outDatas[i+j+1];
                        if( a.eqipmentName[0] ===  b.eqipmentName[0]){
                            if(a.moldCode[0] !==  b.moldCode[0]){
                                for(var prop in b){
                                    if( prop !== "eqipmentName" ){
                                        a[prop].push(b[prop][0])
                                    }
                                }
                            }else{
                                for(var prop in b){
                                    if( prop !== "eqipmentName" && prop !== "moldCode" ){
                                        a[prop].push(b[prop][0])
                                    }
                                }
                            }
                            _outDatas.splice(i+j+1,1)
                        }
                   } 
               }
               this.outData = _outDatas

               let _inDatas = response.data.in;
                _inDatas.forEach(_inData => {
                    for(var prop in _inData){
                        _inData[prop] = [_inData[prop]]
                    }
                });
                for(var i = 0 ; i < _inDatas.length ; i++ ){  
                   for( var j = 0; j<_inDatas.length-i-1 ; j++ ){
                        var a =  _inDatas[i+j],
                            b =  _inDatas[i+j+1];
                        if( a.eqipment[0] ===  b.eqipment[0]){
                            if(a.moldCode[0] !==  b.moldCode[0]){
                                for(var prop in b){
                                    if( prop !== "eqipment" ){
                                        a[prop].push(b[prop][0])
                                    }
                                }
                            }else{
                                for(var prop in b){
                                    if( prop !== "eqipment" && prop !== "moldCode" ){
                                        a[prop].push(b[prop][0])
                                    }
                                }
                            }
                            _inDatas.splice(i+j+1,1)
                        }
                   } 
               }
               this.inData = _inDatas
            })
		},
        methods: {
            handleClick(a) {
                console.log(a);
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
        &>span{
            span{
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
    .content-title {
        margin-top: 30px;
        margin-bottom: 0;
        color: #333;
        font-size: 14px;
        i{
            color: #ccc;
            float: right;
            &:first-child{
                transform:rotate(180deg);
                margin-left: 20px
            }
        }
    }
    .table {
        th {
            height: 36px;
            background-color: #42af8f;
            // white-space: nowrap;
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