<template>
	
    <el-select v-if="key === 'materialCode'" v-model="form[key]" 
    	:placeholder="hint" 
    	style="width: 100%;" 
    	filterable 
    	clearable 
    	remote
    	:default-first-option="true"
    	:remote-method="remoteMethod"
    	:loading="loading"
    	loading-text="加载中..."
    	@visible-change ="showSelect"
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="getDisplayName(option)"
            :value="getDisplayName(option)">
            <div>
		        <span>{{ option.value }}</span>:
		      	<span>{{ option.label }}</span>
	        </div>
        </el-option>
    </el-select>
    
    <el-select v-else v-model="form[key]" 
    	:placeholder="hint" 
    	style="width: 100%;" 
    	filterable 
    	clearable
    	:default-first-option="true"
    	:loading="loading"
    	@visible-change ="showSelect"
    	@change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="getDisplayName(option)"
            :value="getDisplayName(option)">
        </el-option>
    </el-select>
</template>

<script>
// import {host} from 'assets/js/configs.js'

// var HOST = window.HOST ? window.HOST: host

const oAjax = {
  // 物料。
  materialCode: {
    url: window.HOST + '/api/v1/basicinfo/materials',
    code: 'material'
  },
  // 设备。
  equipmentCode: {
    url: window.HOST + '/api/v1/basicinfo/equipments',
    code: 'equipment'
  },
  // 工序
  processCode: {
    url: window.HOST + '/api/v1/basicinfo/processes',
    code: 'process'
  },
  // 人员
  personCode: {
    url: window.HOST + '/api/v1/basicinfo/persons',
    code: 'person'
  },
  // 班次
  shiftName: {
    url: window.HOST + '/api/v1/basicinfo/shifts',
    code: 'shift'
  }
}

export default {
  // props: ['formData', 'placeholderData', 'keyData', 'listData'],
  props: {
    formData: Object,
    placeholderData: String,
    keyData: String,
    listData: Array,
    // 是否通过ajax调用。
    getByAjax: {
      required: false,
      default: true
    },
    tab: {
      required: false,
      default: null
    },
    subTab: {
      required: false,
      default: null
    }
  },
  data () {
    return {
      form: this.formData,
      hint: this.placeholderData,
      key: this.keyData,
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
  created () {
    // 如果不是通过ajax获取数据。
    if (!this.getByAjax) {
      this.options = JSON.parse(JSON.stringify(this.listData || []))
    }
  },
  methods: {
    handleChange (value) {
      console.log(value)
    },
    // 获取显示label
    getDisplayName (item) {
      if (item.value === item.label) {
        return item.label
      } else {
        return item.value + ':' + item.label
      }
    },
    // 下拉框点击事件。
    showSelect (bShow) {
      if (bShow && this.getByAjax) {
        // 先判断是否存在数据，不存在数据，则通过ajax请求。
        this.loading = true

        // 判断是否存在。如果存在
        let sKey = this.key
        let oStorage = this.$store.state.optionsModule
        let nLen = this.nMax

        // 数据存在。
        if (oStorage && oStorage[sKey]) {
          this.loading = false

          this.list = JSON.parse(oStorage[sKey])

          // 如果是物料，则获取部分数据。
          if (sKey === 'materialCode') {
            // 物料只取其中一部分。
            this.options = this.list.filter((o, index) => {
              return index < nLen
            })
            this.oInit = this.options
          } else {
            // 默认为所有、
            this.options = this.list
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
                    o[oAjax[sKey].code + 'Code'] || o[oAjax[sKey].code + 'Name']
                }
              })

              if (sKey === 'materialCode') {
                // 物料只取其中一部分。并保存起来。当搜索时恢复
                this.options = this.list.filter((o, index) => {
                  return index < nLen
                })
                this.oInit = this.options
              } else {
                // 默认为所有。
                this.options = this.list
              }
              oStorage[sKey] = this.list
              // 保存数据。
              this.$store.commit('setOptionsData', {
                key: sKey,
                value: JSON.stringify(this.list)
              })
            },
            sErrorMessage => {
              // 请求失败。
              this.loading = false
              this.list = []
              this.options = []
              this.oInit = []
              oStorage[sKey] = []
              // 保存数据。
              this.$store.commit('setOptionsData', {
                key: sKey,
                value: JSON.stringify([])
              })
            }
          )
        }
      }
    },
    // 外部查询。
    remoteMethod (query) {
      if (this.key === 'materialCode' && this.getByAjax) {
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
              let sLable = this.getDisplayName(o)
              if (
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
          }, 100)
        } else {
          this.options = this.oInit
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-select-dropdown {
  border-radius: 0;
  margin: 0;
}

.el-select {
  width: 180px;
}
</style>
