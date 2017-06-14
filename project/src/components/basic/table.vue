<template>
    <el-table
    :data="dataArray"
    stripe
    border
    @selection-change="selectionChange"
    @cell-click="cellClick"
    class="table"
    v-loading="loading"
    element-loading-text="拼命加载中"
    style="width: 100%">
        <el-table-column 
        v-for="column in columns"       
        align="center"
        :sortable="column.sortable"
        :type="column.type"
        :resizable="resize"
        :prop="column.prop"
        :label="column.name"
        :sort-method="column.sortMethod"
        :key="column.prop" 
        :class-name="column.class"
        :formatter="column.formatter"
        :filters="column.filters"
        :filter-method="column.filterMethod"
        :filter-placement="column.filterPlacement"
        :width="column.width">
        </el-table-column>
        
    </el-table>
</template>

<script>
    export default {
        props: {
            tableData: Object,
            loading: Boolean
        },
        data() {
            return {
                resize: false,
//              dataArray: this.tableData.data,
                columns: this.tableData.columns
            }
        },
        computed: {
        	dataArray: function() {
        		return this.tableData.data
        	}
        },
        methods: {    
            cellClick: function(row, column, cell, event) {
                let oColumn = this.columns.filter(o => o.prop==column.property)[0];
                oColumn.cellClick && oColumn.cellClick(row);
                
            },
            selectionChange: function(selection) {
            	this.tableData.selected = selection;
            }
        }
    }
</script>

<style lang="less">
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