<template>
    <el-select v-if="keyData==='materialCodeList'"
    	v-model="formData[keyData]" 
    	:placeholder="hint" 
    	:disabled="disabled" 
    	style="width: 100%;" 
    	multiple 
    	filterable 
    	remote
    	clearable
    	:loading="loading"
    	loading-text="加载中..."
    	@visible-change ="showSelect"
    	:remote-method="remoteMethod"
    	:default-first-option="true"
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="getDisplayName(option).label"
            :value="getDisplayName(option).value">
        </el-option>
    </el-select>
    <el-select v-else
    	v-model="formData[keyData]" 
    	:placeholder="hint" 
    	:disabled="disabled" 
    	style="width: 100%;" 
    	multiple 
    	filterable 
    	clearable
    	:loading="loading"
    	@visible-change ="showSelect"
    	:default-first-option="true"
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="getDisplayName(option).label"
            :value="getDisplayName(option).value">
        </el-option>
    </el-select>
</template>

<script>
const oAjax = {
  // 物料。
  materialCodeList: {
    url: window.HOST + '/api/v1/basicinfo/materials',
    code: 'material'
  },
  // 设备。
  equipmentCodeList: {
    url: window.HOST + '/api/v1/basicinfo/equipments',
    code: 'equipment'
  },
  // 工序
  processCodeList: {
    url: window.HOST + '/api/v1/basicinfo/processes',
    code: 'process'
  }
}
const sSessionSelectStorageKey = 'outputSelectStorageKey'

export default {
  props: {
    formData: Object,
    placeholderData: String,
    keyData: String,
    listData: Array,
    // 全部的key值
    allData: {
      required: false,
      default: '全部' // 'all'
    },
    allDataLabel: {
      required: false,
      default: '全部'
    },
    // 是否禁用
    disabled: {
      required: false,
      default: false
    },
    // 是否通过ajax调用
    getByAjax: {
      required: false,
      default: false
    }
  },
  data () {
    return {
      hint: this.placeholderData,
      list: [],
      // 保存所有数据。
      options: [],
      // 物料数据初始化。
      oInit: [],
      // 默认显示最大条数。（只限物料）
      nMax: 200,
      loading: false
    }
  },
  computed: {
    // options: function() {
    // let aResult = JSON.parse(JSON.stringify(this.listData || []));
    // 将全部按钮加入。
    // Result.unshift({
    // abel: "全部",
    // value: this.allData
    // })
    // 返回数据。
    // return aResult;
    // }
  },
  created () {
    // 如果不是通过ajax获取数据。
    // if(!this.getByAjax) {
    // this.options = JSON.parse(JSON.stringify(this.listData || []));
    // 将全部按钮加入。
    // this.addAll();
    // }
  },
  methods: {
    handleChange (value) {
      let aGet = this.listData || []

      // 是否选中的是全部，如果是全部则其他的不能选中其他的|| 如果选中的是除全部以外其他的，则设置为全部
      if (value.length) {
        if (
          (value.includes(this.allData) && value.length > 1) ||
          (!value.includes(this.allData) && value.length === aGet.length)
        ) {
          // 含有全部，则将数据设置为全部。
          if (
            value.includes(this.allData) &&
            value[value.length - 1] !== this.allData
          ) {
            // 已选中全部下，选中其他数据。
            this.formData[this.keyData] = [value[value.length - 1]]
          } else {
            // 1、点击的是全部 2、选中了除全部外的数据
            this.formData[this.keyData] = [this.allData]
          }
        }
      }
    },
    // 下拉框点击事件
    showSelect (bShow) {
      if (bShow) {
        // 通过ajax调用接口。
        if (this.getByAjax) {
          // 先判断是否存在数据，不存在数据，则通过ajax请求。
          this.loading = true

          // 判断是否存在。如果存在
          let sKey = this.keyData
          let sStorage = sessionStorage.getItem(sSessionSelectStorageKey)
          let oStorage = sStorage ? JSON.parse(sStorage) : {}
          let nLen = this.nMax

          // 数据存在。
          if (oStorage && oStorage[sKey]) {
            this.loading = false

            this.list = oStorage[sKey]

            // 如果是物料，则获取部分数据。
            if (sKey === 'materialCodeList') {
              // 物料只取其中一部分。
              this.options = this.list.filter((o, index) => {
                return index < nLen
              })
              // 增加全部
              this.addAll()
              this.oInit = this.options
            } else {
              // 默认为所有、
              this.options = this.list
              this.addAll()
            }
          } else {
            // 通过请求获取数据。
            this.$register.sendRequest(
              this.$store,
              this.$ajax,
              oAjax[sKey].url,
              'get',
              null,
              oData => {
                // 请求成功。
                this.loading = false
                this.list = oData.map(o => {
                  return {
                    label: o[oAjax[sKey].code + 'Name'],
                    value:
                      o[oAjax[sKey].code + 'Code'] ||
                      o[oAjax[sKey].code + 'Name']
                  }
                })

                if (sKey === 'materialCodeList') {
                  // 物料只取其中一部分。并保存起来。当搜索时恢复
                  this.options = this.list.filter((o, index) => {
                    return index < nLen
                  })
                  // 增加全部。
                  this.addAll()
                  this.oInit = this.options
                } else {
                  // 默认为所有。
                  this.options = this.list
                  this.addAll()
                }
                oStorage[sKey] = this.list
                // 保存数据。
                sessionStorage.setItem(
                  sSessionSelectStorageKey,
                  JSON.stringify(oStorage)
                )
              },
              sErrorMessage => {
                // 请求失败。
                this.loading = false
                this.list = []
                this.options = []
                this.oInit = []
                oStorage[sKey] = []
                // 保存数据。
                sessionStorage.setItem(
                  sSessionSelectStorageKey,
                  JSON.stringify(oStorage)
                )
              }
            )
          }
        } else {
          // 不是通过ajax调用。
          this.options = JSON.parse(JSON.stringify(this.listData || []))
          this.addAll()
        }
      }
    },
    // 外部查询。
    remoteMethod (query) {
      if (this.keyData === 'materialCodeList' && this.getByAjax) {
        // 物料数据，则通过搜索。
        let sQuery = (query || '').trim()

        if (sQuery !== '') {
          this.loading = true
          let nLen = this.nMax
          let nFilter = 0

          setTimeout(() => {
            this.loading = false
            this.options = this.list.filter(o => {
              // 编码或名称匹配
              let sLable = this.getDisplayName(o).label
              if (
                sLable !== this.allDataLabel &&
                (sLable.indexOf(sQuery) > -1 ||
                  o.label.indexOf(sQuery) > -1 ||
                  o.value.indexOf(sQuery) > -1) &&
                nFilter < nLen
              ) {
                nFilter++
                return true
              } else {
                return false
              }
            })
            // 增加全部。
            this.addAll()
          }, 100)
        } else {
          this.options = this.oInit
        }
      }
    },
    // 增加全部数据。
    addAll () {
      // 将全部按钮加入。
      if (!this.options.some(o => o.value === this.allData)) {
        this.options.unshift({
          label: this.allDataLabel,
          value: this.allData
        })
      }
    },
    // 获取显示label
    getDisplayName (item) {
      var oDisplay = {
        value: '',
        label: ''
      }
      if (item.value === item.label) {
        oDisplay.value = item.value
        oDisplay.label = item.value
      } else if (item.value === this.allData) {
        oDisplay.value = this.allData
        oDisplay.label = this.allDataLabel
      } else {
        oDisplay.value = item.value + ':' + item.label
        oDisplay.label = item.value + ':' + item.label
      }

      return oDisplay
    }
  }
}
</script>

<style lang="less">
.el-select-dropdown {
  border-radius: 0;
  margin: 0;
}

// 多选按钮不换行处理
.el-select {
  .el-select__tags {
    height: 30px;
    white-space: nowrap;
    overflow: hidden;

    & > span {
      display: inline-block;
      /*width: 100%;*/
      height: 100%;
      /*overflow: hidden;*/
      vertical-align: middle;

      .el-tag {
        border-radius: 0;
        height: 20px;
        line-height: 20px;
        margin: 5px 0 5px 6px;
      }
    }
  }
  .el-input {
    .el-input__inner {
      // 多选高度在内联元素中设置了为36px
      height: 30px !important;
    }
  }
}
</style>
