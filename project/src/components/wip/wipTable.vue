<template>
  	<el-table
  		tooltip-effect="dark"
		@select-all="toggleAll"
		:data="tableData" border 
		style="width:100%;"
		>
		
		<el-table-column fixed type="selection">
			<template scope="scope">
	         	<el-checkbox v-model="scope.row.selected" @change="handleSelectionChange(scope.row)"></el-checkbox>
	      	</template>
		</el-table-column>
	    <el-table-column prop="address" label="地点"></el-table-column>
	    <el-table-column prop="process" label="工序"></el-table-column>
	    <el-table-column prop="processCode" label="工序编码"></el-table-column>
	    <el-table-column prop="device" label="生产设备"></el-table-column>
	    <el-table-column prop="deviceCode" label="设备编码"></el-table-column>
	    <el-table-column prop="worker" label="生产人员"></el-table-column>
	    <el-table-column prop="workerCode" label="人员编码"></el-table-column>
	    <el-table-column prop="prodTime" label="生产时间"></el-table-column>
	    <el-table-column prop="prodTurn" label="生产班次"></el-table-column>
	    <el-table-column prop="materialType" label="物料类型"></el-table-column>
	    <el-table-column prop="batchId" label="批次号"></el-table-column>
	    <el-table-column prop="barCode" label="条码"></el-table-column>
	    <el-table-column prop="amount" label="数量"></el-table-column>
	    <el-table-column prop="mark" label="备注">
	    	<template scope="scope">
	    		<el-input v-model="scope.row.mark" @blur="markChangeHandler(scope.row)"></el-input>
    		</template>
	    </el-table-column>
  	</el-table>
</template>

<script>
	export default {
	  	methods: {
	      	handleSelectionChange (row) {//手动勾选每个选项
	        	this.$emit('select-item', row);
	      	},
	      	toggleAll (rows) {//全选或全不选
	      		const flag = !!rows.length;
	      		this.tableData.forEach(function (item) {
	      			item.selected = flag;
	      		});
	      		this.$emit('select-item', rows);
	      	},
	      	markChangeHandler (row) {//修改备注
	      		this.$emit('select-item', row);
	      	}
	    },
	    props: {
	    	tableData: {
				type: Array,
				default: []
			},
			loading: {
				type: Boolean,
				default: true
			}
	    }
  	}
</script>
