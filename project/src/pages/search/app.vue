<template>
  <div id="app">
    <header>
        <img :src="logo"/>
    </header>
    <v-tooltip :config="true" :back="false"></v-tooltip>
    <!--div class="tooltip-info" @mouseenter="showList=true" @mouseleave="showList=false">
      <el-tooltip class="item" effect="light" content="Bottom Right 提示文字" placement="bottom-end">
        <ul slot="content" class="info-list">
            <li @click="goToConfig">设置</li>
            <li @click="logout" v-if="userId">退出</li>
        </ul>     
        <div class="user-name" :style="{cursor: userName?'default':'pointer'}" @click="login">{{userName || "登录"}}<i class="el-icon-arrow-down"></i></div>
      </el-tooltip>
    </div-->
    <el-tabs v-loading="loading" element-loading-text="拼命加载中" v-model="activeKey" type="border-card" class="search-tab"  @tab-click="handleClick">
      <el-tab-pane :key="category.key" v-for="category in categories" :label="category.title" :name="category.key">
        <v-panel :category="category" :label-width="labelWidth" :handle-submit="handleSubmit"></v-panel>
        <!--v-panel :panel-data="category.list" :url-data="category.url" :label-data="width" :active-tab="activeTab"></v-panel-->
      </el-tab-pane>
    </el-tabs>
    <footer>
      <img class="version" :src="version"/>
      <span class="version-info">版本: {{ v }}</span>
    </footer>
  </div>
</template>

<script>
  import tooltip from 'components/header/tooltip.vue'
  import logo from 'assets/img/kssp-logo.png'
  import version from 'assets/img/version.png'
  import panel from 'components/panel/panel.vue'
	import fnP from "assets/js/public.js"

  const MODULE_ITEM_URL = HOST + "/api/v1/customized/modules";

  export default {
    components: {
      'v-panel': panel,
      'v-tooltip': tooltip
    },
    data() {
      return {
        showList: false,
        logo,
        version,
        v: VERSION,
        activeKey: "stock",
        categories: [],
        labelWidth: "100px",
        handleSubmit: this._submitForm,
        sErrorMessage: "",
        loading: false
      }
    },
    computed: {
    },
    created() {
      // 登录验证。
      this.$register.login(this.$store);

      this.loading = true;   
      
      // 请求判断。   
      this.$register.sendRequest(this.$store, this.$ajax, MODULE_ITEM_URL, "get", null, (oData) => {
        // 请求成功。
        this.loading = false;
        this.categories = fnP.parseData(oData).filter(o=>o.key!="restrain");
        this.categories.forEach(o => {
            o.active = {
              radio: "1",
              keys: {}
            }            
        })
      }, (sErrorMessage)=>{
        // 请求失败。
        this.loading = false;
        this.sErrorMessage = sErrorMessage;
        this.showMessage();        
      });
      // fnP.beforeRequest(this.$store, this.$ajax)
      //   .get(MODULE_ITEM_URL)
      //   .then((res) => {
          
      //     this.loading = false;
      //     // 判断是否请求成功。
      //     fnP.judgeLoaderHandler(res,() => {
      //       this.categories = fnP.parseData(res.data.data).filter(o=>o.key!="restrain");	// && o.key!="link"

      //       this.categories.forEach(o => {
      //           o.active = {
      //             radio: "1",
      //             keys: {}
      //           }            
      //       })
      //     }, (sErrorMessage)=>{
      //         this.sErrorMessage = sErrorMessage;
      //         this.showMessage();        
      //     });
      //   });
    },
    methods: {
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

          sessionStorage.setItem('searchConditions-' + sTage,JSON.stringify(oConditions));
          // 跳转。       
          location.assign(this.categories.filter(o => o.key==this.activeKey)[0].url + ".html?tag="+ sTage);
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
		margin-top: -30px;
		
    img {
        margin-bottom: 10px;
    }
  }
 footer {
   position: fixed;
   left: 50%;
   margin-left: -150px;
   bottom: 30px;
   
   .version {
   	vertical-align: middle;
   }
   .version-info {
   	font-size: 13px;
   	color: #cccccc;
   	vertical-align: middle;
   }
  }

  .login-info {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 14px;
    color: #fff;

    .el-icon-arrow-down {
      display: inline-block;
      padding-left: 10px; 
    }

  } 

  .el-tooltip__popper {
    padding: 0
  }
  // 设置相关列表。
  .info-list {
    width: 90px;
    // border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0px 3px 3px #888;
    padding: 10px 0;

    li {
      color: #999;
      text-align: center;
      padding: 10px 0;

      &:hover {
        background: #dedede;
        color: #666;
        cursor: pointer;
      }
    }
  }

  .panel-title {
      padding: 10px 0;		// 19
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
  
  .el-select-dropdown__wrap {
		max-height: 230px;	
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
          width: 216px;		// 270
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
      .el-form-item {
        margin-bottom: 18px;
      }
      .form-button {
        .btn:first-child {
          margin-left: 100px;
        }
      }
      
    } 
  }
  @media screen and (max-width: 1400px){
    footer{
      bottom: 10px;
    }
    .el-select-dropdown__wrap {
    	max-height: 230px;	
    }
    .search-tab {
    height: 650px;

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
        margin-bottom: 18px;

        .el-form-item__label {
          font-size: 14px;
          padding: 6px 10px 6px 0;
        }
        .el-form-item__content {
          line-height: 24px;
          .el-input {
            font-size: 14px;
            .el-input__inner{
              height: 24px;
              //color: #999
            }
          }
        }
      }
    } 
  }
  }
</style>
