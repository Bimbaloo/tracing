<template>
	<div id="app">
	    <h1>Full Width Component</h1>
	   <ag-grid-vue 
	    	style="width: 800px; height: 350px;" 
	    	class="ag-fresh"
	      :gridOptions="gridOptions">
	   </ag-grid-vue>	  
	</div>
</template>

<script>
	import {AgGridVue} from "ag-grid-vue";
	
	export default {
		data() {
			return {
				gridOptions: {},
				selected: []
			}
		},
		components: {
	       'ag-grid-vue': AgGridVue
	    },
    beforeMount() {
    	this.gridOptions = {
    		enableColResize: true,
    		enableSorting: true,
    		rowSelection: "multiple",
    		rowDeselection: true,
    		enableRangeSelection: true,
    		suppressRowClickSelection: true,
    		onSelectionChanged: this.selectionChanged
    	};
	    this.gridOptions.rowData = this.createRowData();
	    this.gridOptions.columnDefs = this.createColumnDefs();
    },
    methods: {
    	createRowData() {
    		
    		let aArr = [];
    		for(let i=0; i< 2000; i++) {
    			aArr.push({
    				index: i+1,
    				name: 'bo'+i,
    				age: 20
    			})
    		}
    		
    		return aArr;
    		
//      return [
//          {index: 1,name: "Bob", age: 10},
//          {index: 2,name: "Harry", age: 3},
//          {index: 3,name: "Sally", age: 20},
//          {index: 4,name: "Mary", age: 5},
//          {index: 5,name: "John", age: 15},
//          {index: 6,name: "Bob", age: 10},
//          {index: 7,name: "Harry", age: 3},
//          {index: 8,name: "Sally", age: 20},
//          {index: 9,name: "Mary", age: 5},
//          {index: 10,name: "John", age: 15},
//          {index: 11,name: "Jack", age: 25},
//          {index: 12,name: "Sue", age: 43},
//          {index: 13,name: "Sean", age: 44},
//          {index: 14,name: "Niall", age: 2},
//          {index: 15,name: "Alberto", age: 32},
//          {index: 16,name: "Fred", age: 53},
//          {index: 17,name: "Jenny", age: 34},
//          {index: 18,name: "Larry", age: 13},
//      ];
	    },
	    createColumnDefs() {
	        return [
	         		{
                width: 30, 
                checkboxSelection: true,
                headerCheckboxSelection: true,
                pinned: true,
                suppressSorting: true
            	},{
            		headerName: "索引",
            		field: "index",
            		pinned: true
            	},
	            {
	                headerName: "名称",
	                field: "name",
	                width: 400,
	                pinned: true
	            },
	            {
	                headerName: "年龄",
	                field: "age",
	                width: 399
	            }
	        ];
	    },
	    selectionChanged(event) {
	    	let aSelected = this.gridOptions.api.getSelectedRows(),
	    		that = this;
	    	
	    	// 过滤数据。
	    	let aAll = this.createRowData(),
	    			aFilterd = [];
	    	
	    	if(aSelected.length) {
		    	aFilterd = aAll.filter(el => el.name === aSelected[0].name)
	    	}else {
	    		aFilterd = aAll
	    	}
				
				console.log(1)
				console.log(event)
				if(aFilterd.length != this.gridOptions.api.getDisplayedRowCount()) {
		    	this.gridOptions.api.setRowData(aFilterd)
				}
				
				// 判断是否为全选，如果为全选，则为filtered的数据。
				if(aSelected.length && aFilterd.length === aAll.length) {
					this.selected = aFilterd;
				}else {
		    	this.selected = aSelected
				}
				
	    	// 设置选中,一次。
	    	if(aSelected.length) {
	    		this.gridOptions.api.getRenderedNodes().forEach( o => {
	    			// 数据存在selected中。
	    			if(that.selected.some(el => el.index == o.data.index) && !o.selected) {
		    			o.setSelected(true)	    
	    			}
	    		})
	    	}
	    	console.log(this.selected)
	    }
    }
	}
</script>

<style lang="less" scoped>

</style>