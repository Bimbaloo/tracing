<template>
    <el-date-picker
      v-model="form[key]" 
      type="datetime"
      :placeholder="hint" 
      style="width: 100%;"
      @change="dateChange">
    </el-date-picker>
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData'],
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