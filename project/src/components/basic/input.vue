<template>
    <el-input v-model="formData[keyData]" :placeholder="hint" :disabled="disabled" @change="update"></el-input>
</template>

<script>
    export default {
        props: ['formData', 'placeholderData', 'keyData','disabledData'],
        props: {
        	formData: Object,
        	placeHolderData: String,
        	keyData: String,
        	listData: Array,
        	disabledData: {
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
                hint: this.placeholderData,
                disabled: this.disabledData?true:false,
                value: this.formData[this.keyData]
            }
        },
        methods: {
            // 不是直接更新值，而是使用此方法来对输入值进行格式化和位数限制
            update: function (value) {
                let formattedValue = value.trim()

                // 如果值不统一，手动覆盖以保持一致
                this.formData[this.keyData] = formattedValue;
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-input {
        width: 180px
    }
</style>
