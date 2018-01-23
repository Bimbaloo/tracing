<template>
	<div class="router-content">
		<div class="innner-content" >
			<h2 class="content-title path-title">遏制列表</h2>
			<h2 class="content-title">遏制列表</h2>
			<v-table :table-data="tableDate" :loading="loading" :resize="resize"></v-table>
		</div>
	</div>
	
</template>


<script>
import table from "components/basic/table.vue";

const URL = HOST + "/api/v1/suppress/list"; // 测试获取遏制列表数据

export default {
  components: {
    "v-table": table
  },
  data() {
    return {
      loading: false,
      resize: true, //是否允许拖动table大小
      tableDate: {
        columns: [
          {
            type: "index",
            name: "序号",
            width: "50"
          },
          {
            prop: "condition",
            name: "物料信息"
          },
          {
            prop: "startTime",
            name: "遏制开始时间"
          },
          {
            prop: "endTime",
            name: "遏制结束时间"
          },
          {
            prop: "startDescription",
            name: "开始遏制详情"
          },
          {
            prop: "startOperator",
            name: "开始遏制人员"
          },
          {
            prop: "endDescription",
            name: "结束遏制详情"
          },
          {
            prop: "endOperator",
            name: "结束遏制人员"
          },
          {
            prop: "handle",
            name: "操作",
            cellClick: this.viewDetails,
            class: "batch"
          }
        ],
        data: []
      },
      /* 查询条件 */
      restrainList: {
        "startTime": "",
        "endTime": "",
        "personCode": ""
      }
    };
  },
  created() {
    //获取查询条件
    this.getCondition();
    // 调用接口查询
    this.getListhData(this.restrainList);
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function() {
      this.getCondition();
      this.getListhData(this.restrainList);
    }
  },
  methods: {
    // 获取查询信息
    getCondition() {
			let { startTime , endTime , personCode} = this.$route.query
			this.restrainList = { startTime , endTime , personCode}		
		},
		
		// 调用接口查询
    getListhData(oCondition) {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        URL,
        "post",
        oCondition,
        this.requestSucess,
        this.requestFail,
        this.requestError
			);
    },
    // 请求成功。
    requestSucess(oData) {
      this.loading = false;
      this.tableDate.data = oData;
    },
    // 请求失败。
    requestFail(sErrorMessage) {
      this.loading = false;
      console.log(sErrorMessage);
    },
    // 请求错误。
    requestError(err) {
			console.log(err)
      this.loading = false;
      console.log("数据库查询出错。");
    },

    
    //查看详情
    viewDetails(index) {
      console.log(index);
    },
    // 根据条件过滤
    // filter() {
    //   let a = sessionStorage.getItem(
    //     "restrainList",
    //     JSON.stringify(this.ruleForm2)
    //   );
    //   this.restrainList = JSON.parse(a);
    //   //console.log(this.restrainList)
    //   //debugger
    //   if (
    //     this.restrainList.personCode !== "" &&
    //     this.restrainList.startTime !== "" &&
    //     this.restrainList.endTime !== ""
    //   ) {
    //     //三个条件都在
    //     this.tableDate.data = this.columnsData
    //       .filter(this.isPerson)
    //       .filter(this.isStartTime)
    //       .filter(this.isEndTime);
    //   } else if (
    //     this.restrainList.personCode === "" &&
    //     this.restrainList.startTime !== "" &&
    //     this.restrainList.endTime !== ""
    //   ) {
    //     //未限制人员
    //     this.tableDate.data = this.columnsData
    //       .filter(this.isStartTime)
    //       .filter(this.isEndTime);
    //   } else if (
    //     this.restrainList.personCode !== "" &&
    //     this.restrainList.startTime === "" &&
    //     this.restrainList.endTime !== ""
    //   ) {
    //     //未限制开始时间
    //     this.tableDate.data = this.columnsData
    //       .filter(this.isPerson)
    //       .filter(this.isEndTime);
    //   } else if (
    //     this.restrainList.personCode !== "" &&
    //     this.restrainList.startTime !== "" &&
    //     this.restrainList.endTime === ""
    //   ) {
    //     //未限制结束时间
    //     this.tableDate.data = this.columnsData
    //       .filter(this.isPerson)
    //       .filter(this.isStartTime);
    //   } else if (
    //     this.restrainList.personCode !== "" &&
    //     this.restrainList.startTime === "" &&
    //     this.restrainList.endTime === ""
    //   ) {
    //     //只限制人员
    //     this.tableDate.data = this.columnsData.filter(this.isPerson);
    //   } else if (
    //     this.restrainList.personCode === "" &&
    //     this.restrainList.startTime !== "" &&
    //     this.restrainList.endTime === ""
    //   ) {
    //     //只限制开始时间
    //     this.tableDate.data = this.columnsData.filter(this.isStartTime);
    //   } else if (
    //     this.restrainList.personCode === "" &&
    //     this.restrainList.startTime === "" &&
    //     this.restrainList.endTime !== ""
    //   ) {
    //     //只限制结束时间
    //     this.tableDate.data = this.columnsData.filter(this.isEndTime);
    //   } else {
    //     //什么都不限制
    //     this.tableDate.data = this.columnsData;
    //   }
    // },
    // 根据人员条件过滤
    // isPerson(obj) {
    //   return obj.personCode === this.restrainList.personCode;
    // },
    // 根据开始时间过滤
    // isStartTime(obj) {
    //   return obj.startTime <= this.restrainList.startTime;
    // },
    // 根据结束时间过滤
    // isEndTime(obj) {
    //   return obj.endTime >= this.restrainList.endTime;
    // },
    // 获取一周前的时间
    // setData() {
    //   let nowdate = new Date();
    //   let oneweekdate = new Date(nowdate - 7 * 24 * 3600 * 1000);
    //   let y = oneweekdate.getFullYear();
    //   let m = oneweekdate.getMonth() + 1;
    //   let d = oneweekdate.getDate();
    //   let formatwdate = y + "-" + m + "-" + d + " " + "00:00:00";
    //   return formatwdate;
    // }
  }
};
</script>

<style scoped lang="less">
.router-content {
  height: 100%;

  .innner-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    .content-table {
      flex: 1;
    }
    .path-title {
      border-left: 0;
      margin-bottom: 0px;
      margin-left: -10px;
    }
  }
}
</style>