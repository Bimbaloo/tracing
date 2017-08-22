<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" :label-width="labelWidth">
        <el-form-item :label="item.name" :prop="item.key" v-for="item in items" :key="item.key" :class="[Object.keys(keys).includes(item.key) ? '': 'hide']"> 
            <component :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key"></component> 
        </el-form-item>
        <div class="form-button">
            <el-button class="btn" type="primary" @click="submitForm('ruleForm')">查询</el-button>
            <el-button class="btn" type="primary" @click="resetForm('ruleForm')">重置</el-button>
        </div>
    </el-form>
</template>

<script>
    import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
    import DateTime from 'components/basic/dateTime.vue'

    export default {
        props: {
            labelWidth: String,
            active: Object,
            keys: Object,
            items: Array,
            handleSubmit: Function          
        },
        components: {
            'v-input': Input,
            'v-select': Select,
            'v-datetime': DateTime
        },
        data() {
            return {
            };
        },
        mounted () {
            // 数据初始化。
            // this.$nextTick(() => {
            //     this._init();
            // })
        },
        computed: {
            ruleForm: function() {
                let oFormData = {};
                this.items.forEach(o => {
                    oFormData[o.key] = this.active.keys[o.key] || '';
                });
                return oFormData;
            },
            rules: function() {
                return {};
            }
        },
        methods: {
            // _init() {
            //     for(let k in this.keys) {
            //         this.ruleForm[k] = this.keys[k];          
            //     }
            //     debugger
            // },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // alert('submit!');
                        // 保存搜索条件。
                        for (let key in this.keys){
                            this.keys[key] = this.ruleForm[key];
                        }
                       
                        let oConditions = {
                            keys: this.keys,
                            radio: this.active.radio
                        };
                        
                        this.active.keys = this.keys;
                        this.handleSubmit(oConditions);
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }    
    }
   
</script>

<style lang="less">
    .hide {
        display: none;
    }
    .form-button {
        text-align: center;
    }

    .el-form-item {
        margin-bottom: 19px;
    }

    .el-form-item__label {
        padding: 8px 10px 8px 0;
    }

    .el-form-item__content {
        line-height: 30px;
        white-space: nowrap;
    }

    .el-input__inner {
        height: 30px;
        border-radius: 0;
        border-color: #ddd;
    }  
</style>