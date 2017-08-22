<template>
  <div class="router-content" id='app'>
    <div class="innner-content">
      <div class="condition" ref='condition'>
        <div class='condition-messsage'>
  
        </div>
      </div>
      <h2 class="content-title tableData">
        送检
  
      </h2>
      <div class="content-table">
        <v-table :table-data="tableData" :heights="tableData.height" :loading="loading" :resize="tdResize" :data-filter="true"></v-table>
      </div>
  
    </div>
  </div>
</template>

<script>
//import logo from 'assets/img/logo-w.png'



import fnP from "assets/js/public.js"
import table from "components/basic/table2.vue"


// const url = `http://rap.taobao.org/mockjsdata/24404/quality/inspect/by-equipment-time?`
// const url = `static/sb.json`
const url = `http://rapapi.org/mockjsdata/24404/eventrecord/by-equipment-time?`;

export default {
  components: {
    'v-table': table
  },
  data() {
    return {
      fileDownload: function () {
        debugger
        console.log("1111")
      },
      test: true,
      loading: false,
      tdResize: true, //是否允许拖动table大小
      dataName: [      // 条件对应中文名
        {
          itemCode: "equipmentName",
          itemName: "设备"
        }, {
          itemCode: "startTime",
          itemName: "开始时间"
        }, {
          itemCode: "endTime",
          itemName: "结束时间"
        },
      ],
      tableData2: {
        columns: [{}],
        height: 500,
        data: [],
      },
      /* 投入 */
      tableData: {
        filename: "事件记录",
        columns: [
          {
            prop: "bucketNo",
            name: "",
            type: "selection",
            width: "30",
            fixed: true
          },{
            name: "ID",
            prop: "id",
            width: "50",
            fixed: true
          }, {
            name: "序号",
            type: "index",
            width: "50"
          }, {
            name: "状态",
            prop: "statusName",
            width: "120",
          }, {
            name: "事件类型",
            prop: "eTypeName",
            width: "120"
          }, {
            name: "事件原因",
            prop: "eReasonName",
            width: ""
          }, {
            name: "发生时间",
            prop: "happenTime",
            width: "200",
          }, {
            name: "上报时间",
            prop: "reportTime",
            width: "200",
          }, {
            name: "上报人",
            prop: "reportName",
            width: "120"
          }, {
            name: "确认时间",
            prop: "checkTime",
            width: "200"
          }, {
            name: "确认人",
            prop: "checkName",
            width: "120"
          }, {
            name: "处理时间",
            prop: "manageTime",
            width: "200"
          }, {
            name: "处理人",
            prop: "manageName",
            width: "120"
          }, {
            name: "关闭时间",
            prop: "closeTime",
            width: "200"
          }, {
            name: "关闭人",
            prop: "closeName",
            width: "120"
          }],
        height: 500,
        data: [
          {
            "checkTime": "0",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"0"
          },
          {
            "checkTime": "1",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"1"
          },
          {
            "checkTime": "10",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"2"
          },
          {
            "checkTime": "1",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"3"
          },
          {
            "checkTime": "1",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"4"
          },
          {
            "checkTime": "1",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"5"
          },
          {
            "checkTime": "0",
            "eTypeName": "\u4e8b\u4ef6\u7c7b\u578b",
            "reportName": "\u62a5\u544a\u4eba",
            "happenTime": "\u53d1\u751f\u65f6\u95f4",
            "manageTime": "\u5904\u7406\u5883",
            "statusName": "\u72b6\u6001",
            "closeTime": "\u5173\u95ed\u65f6\u95f4",
            "reportTime": "\u62a5\u544a\u65f6\u95f4",
            "manageName": "\u5904\u7406\u4eba",
            "eReasonName": "\u4e8b\u4ef6\u539f\u56e0",
            "closeName": "\u5173\u95ed\u4eba",
            "checkName": "\u786e\u8ba4\u4eba",
            "id":"6"
          }
        ],
        selected:[]
      },

      routerContent: 0
    }
  },
  created() {
   // this.fetchData();

  },
  methods: {
    fetchData() {

      this.loading = true;
      let oQuery = {}

      this.$get(url, oQuery)
        .then((res) => {
          this.loading = false;
          this.judgeLoaderHandler(res, () => {
            let odata = res.data.data  //获取到的data

            //this.tableData.data = odata

          });
        })
        .catch((err) => {
          this.loading = false;
          this.styleObject.minWidth = 0;
          console.log("数据库查询出错。")
        })
    },
    // 判断调用接口是否成功。
    judgeLoaderHandler(param, fnSu, fnFail) {
      let bRight = param.data.errorCode;

      // 判断是否调用成功。
      if (!bRight) {
        // 调用成功后的回调函数。
        fnSu && fnSu();
      } else {
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
        duration: 3000,
        type: "error"
      });
    },
    handleClick(tab, event) {

    },
    _submitForm(oConditions) {
      oConditions.tab = this.activeKey;

      let sTage = (+new Date()).toString().substr(-5);

      sessionStorage.setItem('searchConditions-' + sTage, JSON.stringify(oConditions));
      // 跳转。       
      location.assign(this.categories.filter(o => o.key == this.activeKey)[0].url + ".html?tag=" + sTage);
    },
    // fileDownload() {
    //   console.log('sssss')
    // }
  }
}
</script>

<style lang="less">
.content-title.table-title {
  margin-top: 10px;
  margin-bottom: 0;
  color: #333;
  font-size: 14px;
  i {
    color: #ccc;
    float: right;
    &:first-child {
      transform: rotate(180deg);
      margin-left: 20px
    }
  }
}

.content-title {
  .icon-print {
    right: auto;
  }
}

.table {
  .handle {
    cursor: pointer;
    color: #f90;

    .cell {
      font-weight: 600;

      &:empty {
        cursor: default;
      }
    }
  }
  .clicked {
    cursor: pointer;
    color: #f90;
  }
}
</style>
