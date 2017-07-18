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
        computed: {
        	options: function() {
        		let aResult = this.listData || [];
        		
        		// 将全部按钮加入。
        		aResult.unshift({
        			label: "全部",
        			value: "all"
        		})
        		// 返回数据。
        		return aResult;
        	}
        },
        methods: {
            handleChange(value) {
            	// 是否选中的是全部，如果是全部则其他的不能选中其他的。
            	if(value.includes("all") && value.length > 1) {
            		// 含有全部，则将数据设置为全部。
            		this.form[this.key] = ["all"];
            	}
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
