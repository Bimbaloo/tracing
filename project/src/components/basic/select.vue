<template>
    <el-select v-model="form[key]" :placeholder="hint" style="width: 100%;" filterable clearable @change="handleChange">
        <el-option
            v-for="option in options"
            :key="option.value"
            :label="option.label"
            :value="option.value">
        </el-option>
    </el-select> 
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData'],
        data() {
            return {
                form: this.formData,
                hint: this.placeholderData,
                key: this.keyData,
                options: [],
            }
        },
        created() {
            this.$get('static/data.json').then((res) => {
                this.options = res.data[this.key];
            })
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
