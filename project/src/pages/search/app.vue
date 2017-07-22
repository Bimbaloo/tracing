<template>
  <div id="app">
    <header>
        <img :src="logo"/>
    </header>
    <el-tabs v-loading="loading" element-loading-text="拼命加载中" v-model="activeKey" type="border-card" class="search-tab"  @tab-click="handleClick">
      <el-tab-pane :key="category.key" v-for="category in categories" :label="category.title" :name="category.key">
        <v-panel :category="category" :label-width="labelWidth" :handle-submit="handleSubmit"></v-panel>
        <!--v-panel :panel-data="category.list" :url-data="category.url" :label-data="width" :active-tab="activeTab"></v-panel-->
      </el-tab-pane>
    </el-tabs>
    <footer>
      <img :src="version"/>
    </footer>
  </div>
</template>

<script>
  //import logo from 'assets/img/logo-w.png'
  import logo from 'assets/img/kssp-logo.png'
  import version from 'assets/img/version.png'
  import panel from 'components/panel/panel.vue'
	import fnP from "assets/js/public.js"
	
	const MODULE_ITEM_URL = HOST + "/api/v1/customized/modules";
	
  export default {
    components: {
      'v-panel': panel
    },
    data() {
      return {
        logo,
        version,
        activeKey: "stock",
        categories: [],
        labelWidth: "100px",
        handleSubmit: this._submitForm,
        sErrorMessage: "",
        loading: false
      }
    },
    created() {  
      this.loading = true;
      this.$ajax.get(MODULE_ITEM_URL).then((res) => {
      	this.loading = false;
      	this.judgeLoaderHandler(res,() => {

	        this.categories = fnP.parseData(res.data.data).filter(o=>o.key!="restrain" && o.key!="link");

	        this.categories.forEach(o => {
	            o.active = {
	              radio: "1",
	              keys: {}
	            }            
	        })
      	});
      });
      
      
    },
    methods: {
    	// 判断调用接口是否成功。
    	judgeLoaderHandler(param,fnSu,fnFail) {
    		let bRight = param.data.errorCode;
        	
        	// 判断是否调用成功。
        	if(bRight != "0") {
        		// 提示信息。
        		this.sErrorMessage = param.data.errorMsg.message;
        		this.showMessage();
        		// 失败后的回调函。
        		fnFail && fnFail();
        	}else {
        		// 调用成功后的回调函数。
        		fnSu && fnSu();
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
          console.log(oConditions);
          oConditions.tab = this.activeKey;
          sessionStorage.setItem('searchConditions',JSON.stringify(oConditions));
          // 跳转。       
          location.assign(this.categories.filter(o => o.key==this.activeKey)[0].url + ".html");
      }
    }
  }
</script>

<style lang="less">
  html,body {
    height: 100%;
  }

  body {
    background-color: #f2f2f2;
    display: table;
    background: url(../../assets/img/bg.jpg);
    background-size: cover;
  }

  #app {
    display: table-cell;
    vertical-align: middle;
  }

  header{
    text-align: center;

    img {
        margin-bottom: 10px;
    }
  }
 footer {
   position: fixed;
   left: 50%;
   margin-left: -150px;
   bottom: 30px
 }
  .panel-title {
      padding: 19px 0;
      .el-radio+.el-radio {
          margin-left: 60px;
      }
  }

  .panel-content {
      /*margin-left: -100px;*/
			padding: 0 80px;     
  }

  .el-tabs--border-card {
    &>.el-tabs__header {
      border-bottom : none;

      .el-tabs__item {
          margin-right: 0;
          margin-left: 0;
          border: none;
          box-sizing: content-box;
          padding: 0;
      }
    }
  } 

  .el-tabs__nav-wrap {
    margin-bottom: 0;
  }
  
  .search-tab {
    width: 1080px;
    height: 750px;
    margin: 0 auto;
    border: none;
    box-shadow: none;

    &.el-tabs--border-card {
      &>.el-tabs__header {
        background-color: #d9dee4;

        .el-tabs__item {
          height: 42px;
          line-height: 42px;     
          /*width: 180px;*/
          width: 270px;
          text-align: center;
          font-size: 16px;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          color: #666;

          &:hover {
            color: #333;
          }

          &.is-active {
            color: #42af8f;
            border-top-color: #42af8f;
          }
        }
      }
      .form-button {
        .btn:first-child {
          margin-left: 100px;
        }
      }
      &>.el-tabs__content {
        /*padding: 0 300px;*/
      }
    } 
  }
  @media screen and (max-width: 1400px){
    footer{
      bottom: 10px;
    }
    .search-tab {
    height: 610px;

    &.el-tabs--border-card {
      &>.el-tabs__header {
        height:40px;
        .el-tabs__item {
          height: 32px;
          line-height: 32px;     

          &:hover {
            color: #333;
          }

          &.is-active {
            color: #42af8f;
            border-top-color: #42af8f;
          }
        }
      }

      .el-form-item {
        margin-bottom: 16px;

        .el-form-item__label {
          font-size: 12px;
          padding: 6px 10px 6px 0;
        }
        .el-form-item__content {
          line-height: 24px;
          .el-input {
            font-size: 12px;
            .el-input__inner{
              height: 24px;
              //color: #999
            }
          }
        }
      }

      &>.el-tabs__content {
        /*padding: 0 300px;*/
      }
    } 
  }
  }
</style>
