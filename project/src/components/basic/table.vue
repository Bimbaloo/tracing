<template>
    <el-table
    :data="dataArray"
    stripe
    border
    @filter-change="filterChange"
    @selection-change="selectionChange"
    @cell-click="cellClick"
    class="table"
    :row-key="tableData.data.prop"
    :height="heights"
    :max-height="maxHeight"
    v-loading="loading"
    element-loading-text="拼命加载中"
    style="width: 100%"
    ref="multipleTable">
        <el-table-column 
        v-for="column in columns"
        align="center"
        :fixed="bFixed && column.fixed?true:false"
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
        :width="column.width"
        :data-filte="dataFilter"
        :selectable="checkSelectable"
        :reserve-selection="true">
            <el-table-column  
                align="center"
                v-if="!!column.lists"  
                v-for='list in column.lists'
                :sortable="list.sortable"
                :type="list.type"
                :resizable="resize"
                :prop="list.prop"
                :label="list.itemName"
                :sort-method="list.sortMethod"
                :key="list.prop" 
                :class-name="list.class"
                :formatter="list.formatter"
                :filters="list.filters"
                :filter-method="list.filterMethod"
                :filter-placement="list.filterPlacement"
                :width="list.width">
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
    maxHeight: {
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
  data () {
    return {
      // columns: this.tableData.columns
    }
  },
  computed: {
    columns: function () {
      return this.tableData.columns
    },
    selectedData: function () {
      return this.tableData.selected
    },
    dataArray: function () {
      if (!this.dataFilter) {
        return this.tableData.data
      } else if (this.selectedData.length !== 0) {
        let materialCode = this.selectedData[0].materialCode // 获取当前勾选行 物料编码
        let processCode = this.selectedData[0].processCode // 获取当前勾选行 工序编码

        let aFilterd = this.tableData.data.filter(
          el =>
            el.materialCode === materialCode && el.processCode === processCode
        )

        // 判断是否是全选中的状态。
        if (
          this.selectedData.length === this.tableData.data.length &&
          aFilterd.length !== this.tableData.data.length
        ) {
          // 全选 且当前过滤后的数据不是所有
          this.tableData.selected = aFilterd.map(el => {
            return el
          })
        }

        return aFilterd
      } else {
        return this.tableData.data
      }
     // return this.tableData.data
    }
  },
  created () {
    this.tableData.selected = []
  },
  methods: {
    cellClick (row, column, cell, event) {
      let oColumn =
        this.columns.filter(o => o.prop === column.property)[0] ||
        this.columns
          .find(o => o.lists)
          .lists.filter(o => o.prop === column.property)[0]
      oColumn.cellClick && oColumn.cellClick(row)
    },
    selectionChange (selection) {
      if (
        selection.length !== 0 &&
        selection.length !== this.selectedData.length - this.dataArray.length
      ) {
        // 选中的行数不为0且不等于未显示的行数
        this.tableData.selected = []
        this.tableData.selected = selection.map(el => {
          return el
        })
      } else {
        this.tableData.selected = []
        this.$refs.multipleTable.clearSelection()
      }
    },
    filterChange (filters) {
      this.tableData.filterChange && this.tableData.filterChange(filters)
    },
    /* 是否禁选 */
    checkSelectable (row, index) {
      if (!this.selectable) {
        return true
      } else if (this.selectedData.length !== 0) {
        // 启用过滤功能，勾选后。
        let materialCode = this.selectedData[0].materialCode // 获取当前勾选行 物料编码
        let processCode = this.selectedData[0].processCode // 获取当前勾选行 工序编码
        return (
          row.materialCode === materialCode && row.processCode === processCode
        )
      } else {
        return true
      }
    }
  }
}
</script>

<style lang="less">
.table {
  th {
    height: 36px;
    background-color: #42af8f;
    box-sizing: border-box;
    padding: 0;
    & > div {
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
    padding: 0;
    .cell {
      padding: 0;
    }
  }
}
</style>
