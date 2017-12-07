<template>
    <el-date-picker
      v-model="sTime" 
      :type="dateType"
      :placeholder="hint" 
      :disabled="disabled"
      style="width: 100%;"
      @change.native = "dateChange"
      @change = "dateClick">
    </el-date-picker>
</template>

<script>
    import { bus } from "assets/js/bus.js"
    export default {
        props: {
        	formData: Object, 
        	placeholderData: String, 
        	keyData: String,
        	dateType: {
        		required: false,
        		default: "datetime"
        	},
        	disabled: {
        		required: false,
        		default: false
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
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData || '',
                key: this.keyData,
                sTime: this.formData[this.keyData]
            }
        },
        created() {
            let _that = this
            //debugger
            bus.$on('timeChange', function (obj){
                //debugger
                if(_that.tab === obj.tab && _that.subTab === obj.radio){
                    let datas = obj.keys
                    for(let i in datas){
                        if(i === _that.key) {
                            _that.sTime = new Date(datas[i])
                        // console.log(_that.sTime)
                        }
                    }
                }
                
            })
        },
        methods: {
        	// 输入处理
        	dateChange(event) {
        		let sVal = event.target.value
        		this.formData[this.keyData] = sVal;
        	},
        	// 选中确定处理
        	dateClick(value) {
        		if(value != undefined) {
        			this.formData[this.keyData] = value;
        		}else {
        			// 点击插件自动清空，返回是undefined 
        			this.formData[this.keyData] = '';
        		}
        	}
        }
    }
</script>

<style lang="less" scoped>
    .el-date-editor {
        width: 180px
    }
</style>
