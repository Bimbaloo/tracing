<template>
  <div id="app">
    <header>
        <img :src="logo"/>
    </header>
    <el-tabs v-model="activeKey" type="border-card" class="search-tab"  @tab-click="handleClick">
      <el-tab-pane :key="category.key" v-for="category in categories" :label="category.title" :name="category.key">
        <v-panel :category="category" :label-width="labelWidth" :handle-submit="handleSubmit"></v-panel>
        <!--v-panel :panel-data="category.list" :url-data="category.url" :label-data="width" :active-tab="activeTab"></v-panel-->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import logo from 'assets/img/logo-w.png'
  import panel from 'components/panel/panel.vue'

  export default {
    components: {
      'v-panel': panel
    },
    data() {
      return {
        logo,
        activeKey: "trace",
        categories: [],
        labelWidth: "100px",
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
        this.categories = res.data.categories;
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
      });    
    },
    methods: {
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
    background-image: url("../../assets/img/bg.jpg");
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

  .panel-title {
      padding: 19px 0;
      .el-radio+.el-radio {
          margin-left: 60px;
      }
  }

  .panel-content {
      margin-left: -100px;
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
    height: 700px;
    margin: 0 auto;
    border: none;
    box-shadow: none;

    &.el-tabs--border-card {
      &>.el-tabs__header {
        background-color: #d9dee4;

        .el-tabs__item {
          height: 42px;
          line-height: 42px;     
          width: 180px;
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

      &>.el-tabs__content {
        padding: 0 300px;
      }
    } 
  }
</style>
