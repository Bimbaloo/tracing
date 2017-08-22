<template>
    <el-select v-model="form[key]" :placeholder="hint" style="width: 100%;" multiple @change="handleChange">
        <el-option
            v-for="option in listData"
            :key="option.value"
            :label="option.label"
            :value="option.value">
        </el-option>
    </el-select> 
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData', 'listData'],
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData,
                key: this.keyData
//              options: this.listData
            }
        },
        methods: {
            handleChange(value) {
                console.log(value);
            }
        }  
    }
</script>

<style lang="less">
    .el-select-dropdown {
        border-radius: 0;
        margin: 0;
    }
</style>
