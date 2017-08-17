<template>
    <el-date-picker
      v-model="form[key]" 
      :type="dateType"
      :placeholder="hint" 
      style="width: 100%;"
      @change="dateChange">
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
        	}
        },
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData || '',
                key: this.keyData
            }
        },
        methods: {
        	dateChange(sVal) {
        		this.form[this.key] = sVal;
        	}
        }
    }
</script>

<style lang="less" scoped>
    .el-date-editor {
        width: 180px
    }
</style>