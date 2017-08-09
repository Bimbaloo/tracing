<template>
    <el-input v-model="form[key]" :placeholder="hint" :disabled="disabled"></el-input> 
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData','disabledData'],
        data() {
            return {
                form: this.formData,
                key: this.keyData,
                hint: this.placeholderData,
                disabled: this.disabledData?true:false
            }
        },
        methods: {
            // 不是直接更新值，而是使用此方法来对输入值进行格式化和位数限制
            update: function (event) {}
        }
    }
</script>

<style lang="less" scoped>
    .el-input {
        width: 180px
    }
</style>
