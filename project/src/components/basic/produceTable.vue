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
                    <el-table :data="tableData" border style="width: 100%" class="table" >                        
                        <el-table-column 
                            v-for="(column,index) in columns"       
                            align="center"
                            :label="column.name"
                            :width="column.width">
                            <template scope="column">
                               <div class="cell" v-for="">{{column.row.devicename}}</div>
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
                    <el-table :data="tableData" border style="width: 100%" class="table" >                        
                        <el-table-column prop="date" label="设备" width="150">
                        </el-table-column>
                        <el-table-column prop="name" label="模号" width="120">
                        </el-table-column>
                        <el-table-column  label="派工单号" width="120">
                            <template scope="column">
                               <div class="cell" v-for="patternnumber in column.row.patternnumbers">{{patternnumber}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column  label="条码" width="120">
                        </el-table-column>
                        <el-table-column  label="批次" width="300">
                        </el-table-column>
                        <el-table-column  label="物料名称" width="120">
                        </el-table-column>

                        <el-table-column  label="数量" width="150">
                        </el-table-column>
                        <el-table-column  label="操作人" width="120">
                        </el-table-column>
                        <el-table-column  label="班次" width="120">
                        </el-table-column>
                        <el-table-column  label="时间" width="120">
                        </el-table-column>
                        <el-table-column  label="操作" width="300">
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
                tableData: [{
                    devicename: '装配线2.2线GP1',
                    patternnumbers: ['王小虎'],
                    workorder: '上海',
                    barcode: '普陀区',
                    batchnumber: '上海市普陀区金沙江路 1518 弄',
                    materialcode: 200333,
                    materialname:'',
                    number:'',
                    ok: '',
                    ng: '',
                    

                }],
                columns:[{
                    name:"设备",
                    prop: "devicename",
                    width:"150"
                },{
                    name:"模号",
                    prop: "date",
                    width:"150"
                },{
                    name:"派工单号",
                    prop: "",
                    width:"150"
                },{
                    name:"条码",
                    prop: "",
                    width:"150"
                },{
                    name:"批次",
                    prop: "",
                    width:"150"
                },{
                    name:"物料名称",
                    prop: "",
                    width:"150"
                },{
                    name:"合格",
                    prop: "",
                    width:"150"
                },{
                    name:"不合格",
                    prop: "",
                    width:"150"
                },{
                    name:"设备操作人",
                    prop: "",
                    width:"150"
                },{
                    name:"班次",
                    prop: "",
                    width:"150"
                },{
                    name:"时间",
                    prop: "",
                    width:"150"
                },{
                    name:"操作",
                    prop: "",
                    width:"150"
                }]
                
            }
        },
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
                }
                
            }
        }

        td {
            height: 30px;   

            .cell {
                padding: 0;
            }             
        }

    }
</style>