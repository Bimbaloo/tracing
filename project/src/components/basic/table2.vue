<template>
    <el-table :row-key="tableData.data.prop" :data="dataArray" stripe border @filter-change="filterChange" @selection-change="selectionChange" @cell-click="cellClick" class="table" :height="heights" v-loading="loading" element-loading-text="拼命加载中" style="width: 100%" ref="multipleTable">
        <el-table-column v-for="column in columns" align="center" :fixed="bFixed && column.fixed?true:false" :sortable="column.sortable" :type="column.type" :resizable="resize" :prop="column.prop" :label="column.name" :sort-method="column.sortMethod" :key="column.prop" :class-name="column.class" :formatter="column.formatter" :filters="column.filters" :filter-method="column.filterMethod" :filter-placement="column.filterPlacement" :width="column.width" :data-filte="dataFilter" :selectable="checkSelectable" :reserve-selection="true">
            <el-table-column align="center" v-if="!!column.lists" v-for='list in column.lists' :sortable="list.sortable" :type="list.type" :resizable="resize" :prop="list.prop" :label="list.itemName" :sort-method="list.sortMethod" :key="list.prop" :class-name="list.class" :formatter="list.formatter" :filters="list.filters" :filter-method="list.filterMethod" :filter-placement="list.filterPlacement" :width="list.width">
            </el-table-column>
        </el-table-column>
    
    </el-table>
</template>

<script>
export default {
    props: {
        tableData: Object,
        loading: Boolean,
        heights: {
            required: false
        },
        bFixed: {
            required: false,
            type: Boolean,
            default: true
        },
        resize: {
            required: false,
            type: Boolean,
            default: false
        },
        dataFilter: {
            required: false,
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            //              resize: false,
            //              dataArray: this.tableData.data,
            columns: this.tableData.columns,
            //dataArray :[]
        }
    },
    computed: {
        selectedData: function () {
            return this.tableData.selected
        },
        dataArray: function () {
            if (!this.dataFilter) {
                return this.tableData.data
            } else if (this.selectedData.length !== 0) {
                let OcheckTime = this.selectedData[0].checkTime  // 获取当前勾选行 物料编码 
                return this.tableData.data.filter(el => el.checkTime === OcheckTime)
            } else {
                return this.tableData.data
            }
            return this.tableData.data
        }
    },
    created() {

    },
    watch:{
        dataArray: function(){
            //this.rowSelection()
        }
    },
    methods: {
        cellClick(row, column, cell, event) {

            let oColumn = this.columns.filter(o => o.prop == column.property)[0] || this.columns.find(o => o.lists).lists.filter(o => o.prop == column.property)[0];
            oColumn.cellClick && oColumn.cellClick(row);
        },
        selectionChange(selection) {   //selection 为所有选择的行的数组和

            console.log(selection)


                this.tableData.selected = []
                // this.tableData.selected.push(selection.map((el)=>{return el}))
                this.tableData.selected = selection.map((el) => { return el })

            //    let OcheckTime = this.tableData.selected[0].checkTime  // 获取当前勾选行 物料编码 
            //    this.dataArray = this.tableData.data.filter(el => el.checkTime === OcheckTime)

        },
        filterChange(filters) {
            this.tableData.filterChange && this.tableData.filterChange(filters);
        },
        /* 是否禁选 */
        checkSelectable(row, index) {
            // if (!this.dataFilter) {
            //     return true
            // } else if (this.selectedData.length !== 0) {
            //     // 启用过滤功能，勾选后。
            //     let materialCode = this.selectedData[0].materialCode  // 获取当前勾选行 物料编码  
            //     let processCode = this.selectedData[0].processCode   // 获取当前勾选行 工序编码 
            //     return (row.materialCode === materialCode && row.processCode === processCode)
            // } else {
            //     return true
            // }
            return true
        },
        rowSelection(){
            let rows = [this.dataArray[2]]
            rows.forEach(row => {          
                this.$refs.multipleTable.toggleRowSelection(row);
            });
        }
    }
}
</script>

<style lang="less">
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
            }
        }
    }

    td {
        /*height: 30px;*/
        .cell {
            padding: 0;
        }
    }
}
</style>