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
        methods: {
        	// 输入处理
        	dateChange(event) {
        		let sVal = event.target.value
        		this.formData[this.keyData] = new Date(sVal);
        	},
        	// 选中确定处理
        	dateClick(value) {
        		if(value != undefined) {
        			this.formData[this.keyData] = new Date(value);
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