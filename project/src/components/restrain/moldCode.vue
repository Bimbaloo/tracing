<template>
	<div class="router-content suspicious">
		<el-button class="btn btn-plain btn-restrain" @click="suppres" v-show="isRestrained">遏制</el-button>
		<div class="innner-content" :style="styleObject">
      <h2 class="title">模具记录</h2>
      <div class="moldInfo">
				<span>模具名称：XXX</span><span>规格：XXX</span><span>模具额定寿命：XXX</span>
			</div>
		</div>
	</div>

</template>

<script>
import report from "components/report/report.vue";

export default {
  components: {
    "v-report": report
  },
  data() {
    return {
      isRestrained: true,
      doDescription: "",
      url: HOST + "/api/v1/suppress/do-by-mold", // 根据模号
      styleObject: {
        "min-width": "1000px"
      },
      equipmentName: ""
    };
  },
  computed: {
    isrestrainHtml() {
      return window.location.pathname.includes("restrain");
    },
    oQuery() {
      return this.$route.query;
    }
  },
  created() {
    this.equipmentName = this.oQuery.equipmentName;
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    // this.fetchData();
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function() {
      if (this.$route.meta.title === "restrain") {
        this.equipmentName = this.oQuery.equipmentName;
      }
      this.isRestrained = true;
    }
  },
  methods: {
    // 可疑品列表。
    suppres() {
      const h = this.$createElement;
      let self = this;
      this.$msgbox({
        title: "提示",
        message: h("el-input", {
          attrs: {
            type: "textarea",
            rows: 4,
            placeholder: "请输入遏制描述信息"
          },
          class: {
            message: true
          },
          domProps: {
            value: self.doDescription
          },
          on: {
            blur: function(event) {
              self.doDescription = event.target.value;
            }
          }
        }),
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "遏制中...";
            let oConditions = Object.assign(
              { doDescription: self.doDescription },
              this.$route.query
            );

            this.$post(this.url, oConditions)
              .then(oData => {
                console.log(oData);
                this.isRestrained = false;
                const handle = oData.data.data.handle;
                sessionStorage.setItem("handleID", handle);
                instance.confirmButtonLoading = false;
                this.$message.success("遏制成功");
                let restrain = {
                  ...this.$route.query,
                  ...{
                    handleID: handle,
                    description: this.doDescription,
                    suppressTime: new Date().Format("yyyy-MM-dd hh:mm:ss")
                  }
                };
                self.doDescription = "";
                sessionStorage.setItem("restrain", JSON.stringify(restrain));
                window.open(
                  "/restrainReport.html?" +
                    "_tag=" +
                    new Date()
                      .getTime()
                      .toString()
                      .substr(-5)
                );

                done();
              })
              .catch(err => {
                instance.confirmButtonLoading = false;
                this.$message.error("遏制失败");
                self.doDescription = "";
                console.log(err);
                done();
              });
          } else {
            self.doDescription = "";
            done();
          }
        }
      });
    },
    setWidth() {
      this.styleObject.minWidth = "1000px";
    },
    removeWidth() {
      this.styleObject.minWidth = 0;
    }
  }
};
</script>

<style lang="less">
.el-message-box {
  .el-textarea__inner {
    border-radius: 0;
  }
  .el-button {
    border-radius: 0;
    padding: 7px 15px;
  }
  .el-message-box__headerbtn {
    padding: 0;
    border: none;
  }
  .el-message-box__content {
    padding: 0 20px;
  }
}

.router-content {
  flex: 1 1;
  overflow: auto;
  position: relative;

  .btn-restrain {
    position: absolute;
    right: 20px;
    //	top: 45px;
  }

  .moldInfo {
    span {
      display: inline-block;
      & + span {
        margin-left: 60px;
      }
    }
  }
}

.message {
  textarea {
    font-family: "微软雅黑";
  }
}
</style>