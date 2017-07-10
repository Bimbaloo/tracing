<template>
  	<el-table tooltip-effect="dark"
		:data="tableData" border
		style="width:100%;height:100%;" max-height="400px;">
		
	    <el-table-column label="地点" prop="location">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.location"
	    			@change="changeHandler(scope.row)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column label="工序编码" prop="processCode">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.processCode" 
	    			@change="changeHandler(scope.row)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column label="工序名称" prop="process">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.process" 
	    			@change="changeHandler(scope.row)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column label="物料编码" prop="materialCode">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.materialCode" 
	    			@change="changeHandler(scope.row)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column label="物料名称" prop="materialType">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.materialType" 
	    			@change="changeHandler(scope.row)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column label="单价" prop="price">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.price" 
	    			@change="changeHandler(scope.row, scope.column)"
	    			@blur="inputBlurHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
	    <el-table-column width="90" label="操作">
	      	<template scope="scope">
	      		<el-button type="primary" icon="delete" @click="deleteClick(scope.row)"></el-button>
	      	</template>
	    </el-table-column>
  	</el-table>
</template>

<script>

	export default {
		data () {
			return {
				filterFields: ['id', 'flag', 'changed', 'process', 'materialType']
			}
		},
		props: {
			tableData: {
				type: Array,
				default: []
			}
		},
		methods: {
			inputBlurHandler: function (row) {//切换行
				let flag = true;//数据完整
				for (const key in row) {
					if (this.filterFields.indexOf(key) === -1 && !row[key]) {
						flag = false;//有空列
						break;
					}
				}
				if (flag && row.changed) {
					//更新到数据库
					this.$emit('save', row);
					row.changed = false;
				}
			},
			changeHandler: function (row, column) {
				row.changed = true;
			},
			deleteClick: function (row) {
				this.$emit('delete-by-id', row);
			}
		},
	}
</script>