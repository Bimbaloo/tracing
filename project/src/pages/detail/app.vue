<template>
  <div id="app">
    <v-header></v-header>
    <el-row :gutter="0" class="content">
      <el-col :xs="15" :sm="12" :md="9" :lg="5" class="nav" v-if="!collapse">      	
          <el-tabs 
          v-model="activeKey" 
          type="border-card" 
          class="search-tab"  
          ref="searchTab" 
          @tab-click="handleClick"  
          v-bind:style="{ height: searchTab }">
            <el-tab-pane :key="category.key" v-for="category in categories" :label="category.title" :name="category.key">
              <v-panel :category="category" :label-width="labelWidth" :radioChange="adjustTabHeight" :handle-submit="handleSubmit"></v-panel>
            </el-tab-pane>
          </el-tabs>            
      </el-col>
      <el-col :xs="collapse?24:9" :sm="collapse?24:12" :md="collapse?24:15" :lg="collapse?24:19" class="router">
      		<i class="el-icon-d-arrow-left btn-collapse" v-if="!collapse" @click="collapse=true"></i>
      		<i class="el-icon-d-arrow-right btn-collapse" v-if="collapse" @click="collapse=false"></i>
          <div class="router-container" ref="routerContainer">
            <div v-if="tip" class="tip"></div>
            <router-view></router-view>
          </div>
        
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import header from 'components/header/header.vue'
  import panel from 'components/panel/panel.vue'

  export default {
    components: {
      'v-header': header,
      'v-panel': panel
    },
    data() {
      return {
      	// 侧栏是否收缩。
      	collapse: false,
        activeKey: "trace",
        categories: [],
        labelWidth: "70px",
        searchTab: "100%",
        tip: true,
        handleSubmit: this._submitForm
      }
    },
    created() {
      let oData = sessionStorage.getItem('searchConditions');

      if(oData) {
          oData = JSON.parse(oData);
          this.activeKey = oData.tab;
      }

      this.$ajax.get('static/data.json').then((res) => {
        this.categories = res.data.categories.filter(o => o.url==="detail");
        this.categories.forEach(o => {
          if(oData && oData.tab == o.key) {
            o.active = oData;
          }else {
            o.active = {
              radio: "1",
              keys: {}
            }            
          }
        })

        this.$nextTick(() => {
          if(oData) {
            this._submitForm(oData);
          }            
        })
      });
    },
    mounted() {
      window.onresize = () => {
        this.adjustTabHeight;
      }
    },
    methods: {
      getKeys(sKey) {
        return this.categories.filter(o => o.key==sKey)[0].active.keys;
      },
      handleClick(tab, event) {
        // console.log(tab, event);
      },
      // 调整面板高度。
      adjustTabHeight() {
        let oSearchTab = this.$refs.searchTab.$el;
        if(oSearchTab.scrollHeight > oSearchTab.clientHeight) {
          this.searchTab = oSearchTab.scrollHeight + "px";
        }else {
          this.searchTab = "100%";
        }
      },
      // 数据提交
      _submitForm(oConditions) {
          this.tip = false;
          
          let sPath = '/' + this.activeKey;
          oConditions.tab = this.activeKey;
          console.log(oConditions);

          sessionStorage.setItem('searchConditions', JSON.stringify(oConditions));

          if(this.activeKey == "stock") {
            // 若为查出库。
            sPath = sPath + '/' + oConditions.radio;
          }
        
          this.$router.push({ path: sPath, query: this.getKeys(this.activeKey) })
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
    font-family: 微软雅黑;
    color: #333;
    font-size: 14px;
  }

  #app {
    height: 100%;
    display: flex;
    flex-direction: column;

    .content {
      flex: 1;
			
      .nav {
        border-right: 1px solid #ccc;
        box-sizing: border-box;
        height: 100%;
      }

      .router {
        // flex: 1 1;
        padding: 20px;  
        box-sizing: border-box;
        height: 100%;
        position: relative;
              
				.btn-collapse {
					position: absolute;
					left: 2px;
					top: 50%;
					color: #42AF8F;
					font-weight: bold;
					font-size: 16px;
					cursor: pointer;
				} 
      }

      .router-container {
        border: 1px solid #ccc;
        background-color: #fff;
        padding: 0 20px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;    
        overflow: auto;

        .post {
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .tip {
          height: 100%;
          background: url('../../assets/img/tip.png') no-repeat center center;
        }
      }
    }
  }

  .panel-title {
      padding: 30px 0;
      .el-radio+.el-radio {
          margin-left: 20px;
      }
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
    width: 100%;
    border: none;
    box-shadow: none;

    &.el-tabs--border-card {
      &>.el-tabs__header {
        background-color: #d9dee4;

        .el-tabs__nav {
          width: 100%;
        }

        .el-tabs__item {
          height: 42px;
          line-height: 42px;     
          width: 130px;
          text-align: center;
          font-size: 16px;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          color: #666;
          width: 33%;

          &:last-child {
            width: 34%;
          }

          &:hover {
            color: #333;
          }

          &.is-active {
            color: #42af8f;
            border-top-color: #42af8f;
          }
        }
      }

      &>.el-tabs__content {
        padding: 0 28px;
      }
    } 

    .form-button {
      margin-top: 80px;
    }
  }
</style>
