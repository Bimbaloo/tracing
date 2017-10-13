<template>
	<ag-grid 
		v-loading="loading"
		element-loading-text="拼命加载中"
    	class="ag-table ag-fresh"
		:style="{height: heights+'px'}"
    	:rowData="dataArray"
    	:columnDefs="columns"
    	:selectionChanged="selectionChanged"
    	:gridOptions="option">
    </ag-grid>
</template>
<script>
	import {AgGridVue} from "ag-grid-vue"
//	import "ag-grid-enterprise/main"
	
	import "ag-grid/dist/styles/ag-grid.css"
	import "ag-grid/dist/styles/theme-fresh.css"
	import 'assets/css/ag-table.less'
	
	export default {
		props: {
			tableData: Object,
			loading: Boolean,
			heights: {
				required: false,
				default: 200
			}
		},
        components: {
            'ag-grid': AgGridVue
        },
        data () {
            return {
//          	option: this.tableData.gridOptions,
            	option: Object.assign({
			            	enableColResize: true,
				    		enableSorting: true,
				    		rowSelection: "multiple",
				    		rowHeight: 40,
				    		headerHeight: 40,
				    		rowClass: 'row-style',
				    		rowDeselection: true,
				    		enableRangeSelection: true,
				    		// 取消行点击checkbox事件
				    		suppressRowClickSelection: true,
				    		// 取消自带loading效果
				    		suppressLoadingOverlay: true,
				    		overlayNoRowsTemplate: "暂无数据",
				    		// 右键显示菜单项。-- 使用企业版本后充值了复制事件。
				    		getContextMenuItems: function(params) {
				    			if (params.node == null) return null;
				    			
		    					var result = params.defaultItems.splice(0);
				    			// ["copy", "copyWithHeaders", "paste", "separator", "toolPanel", "export"]
				    			return ["copy", "copyWithHeaders", "paste"]
				    		}
			            }, this.tableData.gridOptions)
            }
        },
        computed: {
        	dataArray() {
        		return this.tableData.data
        	},
        	columns() {
        		return this.tableData.columns
        	}
        },
        created() {
        	this.tableData.selected = []
        },
        methods: {
        	selectionChanged() {
		    	let aSelected = this.option.api.getSelectedRows(),
		    		that = this;

				// 过滤数据。
		    	let aAll = this.tableData.data,
		    		aFilterd = [];
		    	
		    	if(aSelected.length) {
			    	aFilterd = aAll.filter(el => el.materialCode === aSelected[0].materialCode && el.processCode === aSelected[0].processCode)
		    	}else {
		    		aFilterd = aAll
		    	}
				
				// 设置数据
				if(aFilterd.length != this.option.api.getDisplayedRowCount()) {
		    		this.option.api.setRowData(aFilterd)
				}
				
				// 判断是否为全选，如果为全选，则为filtered的数据。
				if(aSelected.length && aSelected.length === aAll.length) {
					this.tableData.selected = aFilterd
				}else {
		    		this.tableData.selected = aSelected
				}
				
				if(aSelected.length) {
					// 数据更新后，设置选中		    		
		    		if(this.tableData.selected.length != this.option.api.getSelectedRows().length) {
			    		this.option.api.forEachNode(o => {
			    			// 数据存在selected中。
			    			if(that.tableData.selected.some(el => el.index == o.data.index) && !o.selected) {
				    			o.setSelected(true)	    
			    			}
			    		})
		    		}
		    	}
				
//		    	console.log(this.tableData.selected.length)
		  }
        }
    }
</script>

<style>
</style>