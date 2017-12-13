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
	import {AgGridVue} from "ag-grid-vue"
//	import "ag-grid-enterprise/main"
	
	export default {
		data() {
			return {
				gridOptions: {},
				selected: [],
				aoAllData: [],
				aoDisplay: []
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
    		onSelectionChanged: this.selectionChanged,
            onCellClicked: this.cellClickChanged,
    		getContextMenuItems: function(params) {
    			if (params.node == null) return null;
		    	var result = params.defaultItems.splice(0);
		    	
//  			return ["copy", "copyWithHeaders", "paste"];
    			return []
    		},
//  		onCellContextMenu: this.cellContextMenu
    	};
	    this.gridOptions.rowData = this.createRowData();
	    this.gridOptions.columnDefs = this.createColumnDefs();
	    
	    // 保存数据
    	this.aoAllData = this.aoDisplay =  this.createRowData();
    },
    mounted() {
    	this.gridOptions.api.sizeColumnsToFit();
    },
    methods: {
        cellClickChanged(params) {
//			console.log(params)
			let icon = params.event.target
			let sOpId = params.data.operationId
			let nLen = params.data.hasIn 
			let bExpand = params.data.isExpand
			
			let nRowIndex = params.rowIndex
			
			// 当前显示的数据
			let aDis = this.aoDisplay
			
			
			// 当前点击的target为icon
			if(icon.classList.contains('icon-down')) {
				
//				if(icon.classList.contains('actived')) {
//					
//					// 获取当前产出对应的投入数据。
//					let aIn = this.aoAllData.filter(o => o.outputOpIdList && o.outputOpIdList.includes(sOpId))
//					
//					this.aoDisplay = aDis.splice(nRowIndex+1, 0, ...aIn)
//					
//					// 展开
//					icon.classList.remove('actived')
//					
//					this.gridOptions.api.updateRowData({
//						add: aIn,
//						addIndex: nRowIndex+1
//					})
//				}else {
//				
//					let aOut = aDis.filter( (o, nIn) => (nIn > nRowIndex && nIn <= (nRowIndex+nLen)))
//					
//					this.aoDisplay = aDis.filter( (o, nIn) => !(nIn > nRowIndex && nIn <= (nRowIndex+nLen)))
//					
//					// 折叠
//					icon.classList.add('actived')
//					
//					this.gridOptions.api.updateRowData({
//						remove: aOut
//					})
//				}
				
				if(bExpand) {
					
					// 删除属性
					// 获取当前产出对应的投入数据。
					let aIn = this.aoAllData.filter(o => o.outputOpIdList && o.outputOpIdList.includes(sOpId))
					
					delete aDis[nRowIndex].isExpand
					aDis.splice(nRowIndex+1, 0, ...aIn)
					
				}else {
					
					// 新增属性
					aDis[nRowIndex].isExpand = true
					
					aDis = aDis.filter( (o, nIn) => !(nIn > nRowIndex && nIn <= (nRowIndex+nLen)))
				}
				
				this.aoDisplay = aDis
				this.gridOptions.api.setRowData(aDis)
				
			}
			
		},
    	createRowData() {
    		return [{
    			index: 1,
    			name: 1,
    			age: 1,
    			hasIn: 1,
    			operationId: '22'
    		},{
    			index: 2,
    			name: 12,
    			age: 12,
    			outputOpIdList: ["22"]
    		}, {
    			index: 3,
    			name: 2,
    			age: 2,
    			hasIn: 0,
    			operationId: '33'
    		}]
			
//			let aArr = [];
//  		for(let i=0; i< 2000; i++) {
//  			aArr.push({
//  				index: i+1,
//  				name: 'bo'+i,
//  				age: 20
//  			})
//  		}
//  		
//  		return aArr;
			
//		  return [
//			  {index: 1, data: {
//                name: "Bob", age: 10
//			  }},
//			  {index: 2, data: {
//                name: "Harry", age: 3
//			  }},
//			  {index: 3, data: {
//		      		name: "Sally", age: 20}},
//			  {index: 4, data: null}
//		  ];
	    },
	    createCell(params) {
    		let nPLeft = (params.data.hasIn === undefined) ? 50 : 15
    		
			return `<div class="cell-content" style="padding-left: ${nPLeft}px">
						${params.data.hasIn ? `<i class="icon-down el-icon-arrow-down ${params.data.isExpand?'actived':''}"></i>`: ''}
						<span>haha</span>
					</div>`
	    },
	    createColumnDefs() {
	        return [{
	            	headerName: "#",
	                field: "",
//	                width: 400,
					pinned: true,
                	cellRenderer: this.createCell
//					cellRenderer: (params) => {
//						let nPLeft = (params.data.hasIn === undefined) ? 50 : 15
//              		debugger
//						return `<div class="cell-content" style="padding-left: ${nPLeft}px">
//									${params.data.hasIn ? `<i class="icon-down el-icon-arrow-down ${params.data.isExpand?'actived':''}"></i>`: ''}
//									<span>haha</span>
//								</div>`
//					}
            	},{
            		headerName: "索引",
            		field: "index",
            		enableRowGroup: true,
                	enablePivot: true,
	                valueFormatter: function (params) {},
                	filterParams:{
                		selectAllOnMiniFilter: true,
						newRowsAction: 'keep',
						clearButton: true
					}
				},{
	                headerName: "名称",
	                field: "name",	// data.name
//	                width: 400,
	                enableRowGroup: true,
                	enablePivot: true,
                	filterParams:{
                		selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
			            clearButton: true
			        }
	            },
	            {
	                headerName: "年龄",
	                field: "age",	// data.age
//	                width: 399,
	                enableRowGroup: true,
	                enablePivot: true,
	                filterParams:{
	                	selectAllOnMiniFilter: true,
                    newRowsAction: 'keep',
			            clearButton: true
			        }
	            }
	        ];
	    },
	    getContextMenuItems(params) {
		    if (params.node == null) return null;
		    var result = params.defaultItems.splice(0);
		    result.push(
		        {
		            name: 'Custom Menu Item',
		            icon: '<img src="../images/lab.png" style="width: 14px;"/>',
		            //shortcut: 'Alt + M',
		            action: function () {
		                var value = params.value ? params.value : '<empty>';
		                window.alert('You clicked a custom menu item on cell ' + value);
		            }
		        }
		    );
		
		    return [];
		},
	    cellContextMenu(param) {
	    	console.log(param)
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

<style lang="less">
	.icon-down {
	    transition: transfrom 1s linear;
	    
	    &.actived {
	        transform: rotate(-90deg);
	    }
	}
</style>