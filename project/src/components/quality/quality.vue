<!---->
<template>
  <div class="router-content">
    <div class="innner-content" >
      <div class="content-message tableData">
        <span class='table-title'>
          <span>物料编码：{{node.code}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>物料名称：{{node.name}}</span>
        </span>
        <span class='table-handle'>
          <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle('rawTable', materialData, $event)"></i>
          <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('rawTable', $event)"></i>
        </span>
      </div>
      <div class="content-table" ref="rawTable">
        <div v-if="error" class="error">
          {{ error }}
        </div>

        <el-table
          v-else
          ref="table"
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
          class="raw-table"
          :data="qualityData.data"
          :height="tableHeight">

          <el-table-column
            align="center"
            :resizable="true"
            v-for="(column,index) in qualityData.columns"
            :prop="column.prop"
            v-if="!column.hide"
            :label="column.name"
            :class-name="column.class"
            :width="column.width"
            :key="index">
            <template slot-scope="scope">
              <div :class="{merges: column.merge}" :value="scope.row.hide?0:scope.row.rowspan||1">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                {{scope.row[column.prop]}}
              </div>
            </template>
          </el-table-column>

        </el-table>

        
        <!-- <el-table
          ref="table"
          v-else
          border
          v-loading="loading"
          element-loading-text="拼命加载中"
          class="raw-table"
          @cell-click="cellClick"
          :data="materialData.data"
          :height="tableHeight">
          <el-table-column
            align="center"
            :resizable="true"
            v-for="(column,index) in materialData.columns"
            :prop="column.prop"
            v-if="!column.hide"
            :label="column.name"
            :class-name="column.class"
            :width="column.width"
            :key="index">
            <template slot-scope="scope">
              <div :class="{merges: column.merge}" :value="scope.row.hide?0:scope.row.rowspan||1">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                {{scope.row[column.prop]}}
              </div>
            </template>
          </el-table-column>
        </el-table> -->
        <!--<v-table v-else :table-data="materialData" :loading="loading"></v-table>-->  
      </div>
    </div>
  </div>
</template>

<script>
// import table from 'components/basic/table.vue'
import XLSX from "xlsx";
import Blob from "blob";
import FileSaver from "file-saver";
// import html2canvas from 'html2canvas'
import rasterizeHTML from "rasterizehtml";

export default {
  // components: {
  //   'v-table': table
  // },
  data() {
    return {
      excel: true,
      print: true,
      key: this.$route.params.key,
      tag: this.$route.query._tag,
      styleObject: {
        "min-width": "1000px"
      },
      url: window.HOST + "/api/v1/trace/material-detail",
      // 是否为溯源页面。
      bTrace: location.pathname.indexOf("traceIndex") > -1,
      // 点击的物料节点信息。
      node: {},
      loading: false,
      error: "",
      // sErrorMessage: "",
      materialData: {
        filename: "质检表",
        columns: [],
        data: []
      },
      qualityData: {
        filename: "质检表",
        columns: [],
        data: []
      },
      tableHeight: 200
    };
  },
  computed: {
    rawData() {
      return this.$store.state.rawData;
    },
    resizeY: function() {
      return this.$store && this.$store.state.resizeY;
    },
    fullscreen: function() {
      return this.$store && this.$store.state.fullscreen;
    },
    treeFullscreen: function() {
      return this.$store && this.$store.state.treeFullscreen;
    },
    // 当前传入的值。
    detailInfos() {
      return this.$store && this.$store.state.detailInfos;
    }
  },
  created() {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    // this.fetchData();
  },
  mounted() {
    this.fetchData();
    this.$nextTick(() => {
      this.setHeight();
    });
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function(to, from) {
      let toTitle = to.meta.title;
      let fromTitle = from.meta.title;

      // 如果从tree上直接点击，需要更新数据. tag不同
      // 质检信息: 从可疑品(restrain)进入，则不会重新请求 .tag是一样的
      if (
        toTitle === "quality" &&
        (fromTitle === "quality" ||
          (to.query._tag !== undefined && this.tag !== to.query._tag))
      ) {
        this.tag = to.query._tag;
        this.fetchData();
        this.$nextTick(() => {
          this.setHeight();
        });
      }
    },
    resizeY: function() {
      this.setHeight();
    },
    /* 全屏大小时，重新设置table大小 */
    fullscreen: function() {
      this.setHeight();
    },
    treeFullscreen: function() {
      if (!this.treeFullscreen) {
        this.setHeight();
      }
    }
  },
  methods: {
    // 获取业务库的表格显示列。
    getTableColumns() {
      let wareHouseColumns = [//仓库显示列
          // {
          //   prop: "reservoir",
          //   name: "库位"
          // },
          // {
          //   prop: "warehouse",
          //   name: "仓库"
          // }
        ],
        workShopColumns = [//车间显示列
          {
            prop: 'srcbarcode',
            name: '来源条码',
            click: this.barCodeClick
          }
          // {
          //   prop: "",
          //   name: "工序"
          // },
          // {
          //   prop: "doCode",
          //   name: "工单"
          // },
          // {
          //   prop: "",
          //   name: "设备"
          // }
        ],
        publicColumns = [
          //公共显示列
          {
            prop: "index",
            name: "质检单id",
            width: "50"
          },
          // {
          //   prop: 'srcbarcode',
          //   name: '来源条码',
          //   click: this.barCodeClick
          // },
          {
            prop: "materialName",
            name: "物料名称"
          },
          {
            prop: "batchNo",
            name: "批次",
            class: "batch",
            click: this.batchClick
          },
          {
            prop: "sumNum",
            name: "数量"
          },
          {
            prop: "sampleNum",
            name: "样本数"
          },
          {
            prop: "destbarcode",
            name: "取样框条码"
          },
          {
            prop: "qaDate",
            name: "检验时间"
          },
          {
            prop: "",
            name: "检验结果",
            width: 200
          },
          {
            prop: "",
            name: "处置方式"
          },
          // {
          //   prop: '',
          //   name: '返还时间'
          // },
          {
            prop: "",
            name: "检验人"
          },
          // {
          //   prop: '',
          //   name: '检验项目'
          // },
          {
            prop: "",
            name: "检验报告",
            click: this.reportClick
          }
        ];

      let cacheColumns = this.isQbMethodId()
        ? workShopColumns
        : wareHouseColumns;

      //车间或者仓库的显示列区分显示
      cacheColumns.forEach(function(column, index) {
        publicColumns.splice(1, 0, column);
      });

      return publicColumns;
    },

    //判断检验是仓库还是车间  0:仓库  1:车间
    isQbMethodId() {
      return 0;
    },

    // 判断调用接口是否成功。
    /*judgeLoaderHandler (param, fnSu, fnFail) {
      let bRight = param.data.errorCode

      // 判断是否调用成功。
      if (!bRight) {
        // 调用成功后的回调函数。
        fnSu && fnSu(param.data.data)
      } else {
        // 提示信息。
        this.error = '查无数据'
        console.warn(param.data.errorMsg.message)
        // 失败后的回调函。
        fnFail && fnFail()
      }
    },*/
    cellClick(row, column, cell, event) {
      let oColumn = this.materialData.columns.filter(
        o => o.prop === column.property
      )[0];
      oColumn.click && oColumn.click(row);
    },

    // 点击批次
    batchClick(row) {
      if (row.batchNo) {
        // 批次存在可点击  新版本跳转到可疑品。
        let sPath = this.isOpDbBeforeRefact
          ? "/stock/batch"
          : "/stock/restrain";
        this.$router.replace({
          path: sPath,
          query: { materialCode: this.node.code, batchNo: row.batchNo }
        });
      }
    },

    //点击来源条码
    barCodeClick(row) {
      if (row.srcbarcode) {
        // 条码点击，新版本跳转到可疑品
        let sPath = "/stock/restrain";
        this.$router.replace({
          path: sPath,
          query: { barcode: row.srcbarcode }
        });
      }
    },

    //检验报告点击
    reportClick(row) {
      // window.open()
    },

    // 请求成功。
    requestSucess(aoData) {
      this.loading = false;
      this.error = "";

      let oData = {
        data: aoData
      };

      if (!aoData.length) {
        this.error = "查无数据。";
        console.log("查无数据。");
      } else {
        oData.data = this.isOpDbBeforeRefact
          ? this.formatData(aoData)
          : this.newFormatData(aoData);

        // this.materialData.data = oData.data
        this.qualityData.data = oData.data;
        this.styleObject.minWidth = "1200px";

        this.$nextTick(function() {
          // 先设置所有的列都显示。
          var aMerge = document.querySelectorAll(".merges");
          for (var i = 0; i < aMerge.length; i++) {
            let num = Number(aMerge[i].attributes["value"].nodeValue);
            let td = aMerge[i].parentNode.parentNode;

            if (num) {
              if (td.classList.contains("hide")) {
                td.classList.remove("hide");
              }
              td.rowSpan = num;
            } else {
              td.classList.add("hide");
              // td.remove()
            }
          }

          // 设置批次为空时，鼠标样式。
          var aCell = document.querySelectorAll(".cell");
          for (let i = 0; i < aCell.length; i++) {
            let oDiv = aCell[i].childNodes[0];

            if (oDiv && !oDiv.innerHTML) {
              aCell[i].style.cursor = "default";
            }
          }
        });
      }
    },
    // 请求失败。
    requestFail(sErrorMessage) {
      this.loading = false;

      // 提示信息。
      this.error = "查无数据";
      console.warn(sErrorMessage);
    },
    // 请求错误。
    requestError(err) {
      this.loading = false;
      this.error = "查无数据。";
      this.styleObject.minWidth = 0;
      console.log(err);
    },
    fetchData() {
      // 获取表格显示列。
      //this.materialData.columns = this.getTableColumns()
      this.qualityData.colnmns = this.getTableColumns();

      let sKey = this.$route.query && this.$route.query.key;
      // 提取选中的物料节点数据。
      let oNode = this.rawData.nodeList.filter(o => o.key === sKey)[0] || {};

      this.node = {
        code: oNode.code || "",
        name: oNode.name || "",
        materialInfoList: oNode.detailInfo.materialInfoList.map(o => {
          return {
            batchNo: o.batchNo,
            barcode: o.barcode
          };
        })
      };

      if (this.isOpDbBeforeRefact) {
        // 老业务版本。
        let oData = {};
        oData.data = [];
        this.loading = true;

        this.$register.sendRequest(
          this.$store,
          this.$ajax,
          this.url,
          "post",
          {
            materialCode: this.node.code,
            materialInfoList: this.node.materialInfoList
          },
          this.requestSucess,
          this.requestFail,
          this.requestError
        );
      } else {
        // 新业务版本。

        // 判断是否为溯源，不显示滞留数列。
        // if (this.bTrace) {
        //   this.materialData.columns = this.materialData.columns.filter(
        //     o => o.prop !== 'remainQuantity'
        //   )
        // }

        this.requestSucess(
          JSON.parse(JSON.stringify(this.detailInfos.materialInfoList || []))
        );
      }
    },
    // 表格单元格数据合并处理。
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      // 第一列及第二列合并。
      console.log(row, column, rowIndex, columnIndex);
    },
    // 新业务库数据处理。--elementui 2.0版本表格有合并单元格功能。
    newFormatData(aoData) {
      aoData = aoData.sort((oA, oB) => this.sortData(oA.batchNo, oB.batchNo));

      let oBatchNo = {};
      let nRow = 0;
      let nIndex = 1;

      aoData.forEach((o, index) => {
        if (oBatchNo[o.batchNo]) {
          oBatchNo[o.batchNo]++;
          aoData[nRow].rowspan = oBatchNo[o.batchNo];
          o.hide = true;
        } else {
          o.index = nIndex;
          oBatchNo[o.batchNo] = 1;
          nRow = index;
          nIndex++;
          o.rowspan = oBatchNo[o.batchNo];
        }
      });

      return aoData;
    },
    /**
     * 格式化数据。
     * @param {Array} aoData
     * @return {Array}
     */
    formatData(aoData) {
      let that = this;

      aoData = aoData.sort(function(oA, oB) {
        // 先按照barcode排序，然后再按时间排序。
        let nB = that.sortData(oA.barcode, oB.barcode);

        if (nB === 0) {
          return that.sortData(
            +new Date(oA.createTime),
            +new Date(oB.createTime),
            "desc"
          ) > 0
            ? 1
            : -1;
        } else {
          return nB;
        }
      });

      let oBarcode = {};
      let nRow = 0;
      let nIndex = 1;

      aoData.forEach((o, index) => {
        if (oBarcode[o.barcode]) {
          oBarcode[o.barcode]++;
          aoData[nRow].rowspan = oBarcode[o.barcode];
          o.hide = true;
        } else {
          o.index = nIndex;
          oBarcode[o.barcode] = 1;
          nRow = index;
          nIndex++;
          o.rowspan = oBarcode[o.barcode];
        }
      });

      this.materialData.columns.forEach(column => {
        if (
          aoData.every(
            o => o[column.prop] === "" || o[column.prop] === undefined
          )
        ) {
          // 若每一行都为空，设置隐藏。
          column.hide = true;
        }
      });

      return aoData;
    },
    // 表格导出。
    exportExcelHandle(sTable, oTableData, event) {
      oTableData.filename = this.isOpDbBeforeRefact ? "仓储信息" : "物料明细";

      window.Rt.utils.exportMergeTable2Excel(
        XLSX,
        Blob,
        FileSaver,
        oTableData,
        this.$refs[sTable]
      );
      // 下载表格。
      // window.Rt.utils.exportTable2Excel(XLSX, Blob, FileSaver, this.$refs[sTable], sFileName, {date: "yyyy-mm-dd HH:MM:ss"});
    },
    // 表格打印。
    printHandle(refTable, event) {
      let oTable = this.$refs[refTable];

      if (!oTable) {
        return;
      }

      let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${
                          oTable.querySelector(".el-table__header-wrapper")
                            .innerHTML
                        }
                    </div>
                    <div class="el-table__body-wrapper">
                        ${
                          oTable.querySelector(".el-table__body-wrapper")
                            .innerHTML
                        }
                    </div>
                    <style>
                        .el-table td.is-center, .el-table th.is-center {
                            text-align: center;
                        }
                        .table thead th {
                            height: 36px;
                            background-color: #42af8f;
                        }
                        .table thead th .cell {
                            color: #fff;
                        }
                        .el-table__body-wrapper tr:nth-child(even) {
                            background-color: #fafafa;
                        }
                        .el-table__body-wrapper tr:nth-child(odd) {
                            background-color: #fff;
                        }
                        .el-table__body-wrapper td {
                            white-space: normal;
                            word-break: break-all;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            // border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;
                        }
                    </style>
                </div>
            `;

      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
    },
    // 获取批次类型
    getSortParamType(param) {
      // 先数字3 再字符串2 再中文1
      // 根据数据类型设置排序的方式。
      if (escape(param).indexOf("%u") > -1) {
        // 中文。
        return 1;
      } else if (!isNaN(Number(param))) {
        // 数字。
        return 3;
      } else if (isNaN(Number(param))) {
        // 字符串。
        return 2;
      }
    },
    sortData(param1, param2, sType) {
      // 默认按照从小到大排序。
      if (sType === "desc") {
        // 从大到小时。
        [param1, param2] = [param2, param1];
      }

      // 先数字3 再字符串2 再中文1
      let param1Type = this.getSortParamType(param1);
      let param2Type = this.getSortParamType(param2);

      // 根据数据类型设置排序的方式。
      if (param1Type === param2Type && param1Type === 1) {
        // 中文。
        return param1.localeCompare(param2);
      } else if (param1Type === param2Type && param1Type === 3) {
        // 数字。
        return param1 - param2;
      } else if (param1Type === param2Type && param1Type === 2) {
        // 字符串。
        return param1 > param2 ? 1 : -1;
      } else {
        return param1Type - param2Type;
      }
    },
    /* 获取元素实际高度(含margin) */
    outerHeight(el) {
      var height = el.offsetHeight;
      var style = el.currentStyle || getComputedStyle(el);

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    },
    // 设置table的高度
    setHeight() {
      // Array.from(document.querySelectorAll('table')).forEach(o => {
      //   o.style.width = '100%'
      // })
      let content = document.querySelector(".router-content");
      let tableData = document.querySelector(".tableData");
      this.tableHeight =
        this.outerHeight(content) - this.outerHeight(tableData) - 40;

      this.$nextTick(() => {
        this.$refs.table.doLayout();
      });
    }
  }
};
</script>

<style lang="less">
.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: transparent;
  background-clip: padding-box;
}
.material-stock {
  .content-message {
    margin-top: 20px;

    .icon-print {
      right: auto;
    }
  }

  .content-table {
    .raw-table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;

      th,
      td {
        text-align: center;
        vertical-align: middle;
        border: 1px solid #dfece9;
        box-sizing: border-box;
      }

      th {
        height: 36px;
        background-color: #42af8f;
        color: #fff;
        font-weight: bold;

        & > div {
          font-weight: 600;
        }
      }

      td {
        height: 30px;

        &.hide {
          display: none;
        }
      }

      .el-table__body-wrapper {
        .batch {
          .cell {
            cursor: pointer;
            color: #f90;

            & > div {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="less" scoped>
.tableData {
  display: flex;
  justify-content: space-between;
  margin-top: 0;
  margin-bottom: -20px;
  .table-title {
    display: flex;
    align-items: center;
  }
  .table-handle {
    margin-right: 5px;
    display: flex;
    align-items: center;
    i {
      margin: 7.5px;
    }
    .icon {
      cursor: pointer;
    }
  }
}
</style>
