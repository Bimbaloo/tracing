<!--自定义字段名称脚本-->
<template>
    <div class="content-wraps">
        <span class="title">条件列表</span>
        <el-table
                class="table-wrapper"
            :data="tableData"
            style="width: 100%"
            stripe
            border
            @cell-click="cellCllickHandler">
            <el-table-column
                width="80"
                type="index">
            </el-table-column>
            <el-table-column
                prop="itemCode"
                label="条件字段">
            </el-table-column>
            <el-table-column
                inline-template
                prop="itemName"
                label="显示名称">
                <!--<div>
                	<el-input :value="row.itemName" :placeholder="row.itemName" @change="labelChangeHandler"></el-input>
                </div>-->
                <el-form :model="row" :rules="rules" ref="ruleForm">
                	<el-form-item prop="itemName">
                		<el-input :value="row.itemName" :placeholder="row.itemName" @change="labelChangeHandler"></el-input>
					</el-form-item>
                </el-form>
            </el-table-column>
        </el-table>

        <el-button class="save-btn" type="primary" @click="saveClickHandler('ruleForm')">保存</el-button>
    </div>
</template>

<script>
	//表格数据接口http://192.168.20.176:8080
	import $ from "jquery"
	
    const TABLE_DATA_URL= HOST + "/api/v1/customized/items";
    const sSessionItemName = "sFiled"; 
    
    export default{
	    data() {
	        return {
	            input:'',
	            rules: {
	            	itemName: [{required: true, message: "请输入名称",trigger: "blur"}]
	            },
				tableData: [],
				aBefore: [],
	            // 提示信息。
	            sErrorMessage: "",
	            currentRow:null//存放当前点击行
	        }
	    },
        created() {
          //获取字段接口数据 TABLE_DATA_URL
            this.$ajax.get(TABLE_DATA_URL).then((res) => {
            	this.judgeLoaderHandler(res,() => {
            		// 设置表格数据。
            		this.tableData = res.data.data;
            		// 保存当前数据。
//          		this.aBefore = Object.assign([], this.tableData);
            		this.aBefore = $.extend(true,[],this.tableData);
            	});
            }).catch(function(error) {
            	console.log(error)
            });
        },
        methods: {
        	// 判断调用接口是否成功。
        	judgeLoaderHandler(param,fnSu,fnFail) {
        		let bRight = param.data.errorCode;
            	
            	// 判断是否调用成功。
            	if(!bRight) {
            		// 调用成功后的回调函数。
            		fnSu && fnSu();
            	}else {
            		// 提示信息。
            		this.sErrorMessage = param.data.errorMsg.message;
            		this.showMessage();
            		// 失败后的回调函。
            		fnFail && fnFail();
            	}
        	},
        	// 显示提示信息。
        	showMessage() {
        		this.$message({
        			message: this.sErrorMessage,
        			duration: 3000
        		});
        	},
        	// 行点击事件。
            cellCllickHandler(row, column, cell, event){
                this.currentRow=row;
                console.log(this.currentRow);
            },
            // 名称修改事件。
            labelChangeHandler(value){
                console.log(value);
                this.currentRow.itemName=value;
            },
            // 保存事件。
            saveClickHandler(formName){
            	if(!this.$refs[formName]) {
            		this.sErrorMessage="表格没有初始化，不能进行保存操作！";
			        this.showMessage();
            	}else {
	            	this.$refs[formName].validate((valid) => {
	            		if(valid) {
	            			// 判断。
			                //调用接口，修改数据
			                this.$ajax.put(TABLE_DATA_URL,{
			                	"items": this.tableData
			                }).then((res) => {
			                	// 判断是否更新成功。
			                	this.judgeLoaderHandler(res,() => {
									// 重新设置保存的值。
									this.aBefore = $.extend(true,[],this.tableData);
				            		this.sErrorMessage="更新成功！";
			        				this.showMessage();
				            	},()=>{
				            		// 恢复更新数据。
									let aData = this.aBefore;
				            		this.tableData = aData?aData:[];
				            	});
			                });
	            			
	            		}
	            	});
            	}
            }
        }
    };
</script>

<style lang="less">
	.content-wraps {
		padding: 20px;
	}
    .title{
        display: inline-block;
        margin: 0 0 20px;
    }
    .cell{
        text-align: center;
    }
    .table-wrapper{
        /*margin-left: 20px;*/
    }
    .el-table__header{
        th,.cell{
            background: #42af8f;
            color: #ffffff;
        }
    }
    .save-btn{
        margin-top: 20px;
    }
    .el-input__inner{
        text-align: center;
        border-radius: 0px;
    }
    .el-form-item {
    	margin: 20px 0;
    }
</style>