<template>
    <div class="panel">
        <div class="panel-title">
          <el-radio-group v-model="radio" @change="handleChange">
            <el-radio class="radio" :key="item.key" v-for="item in category.list" :label="item.key">{{item.title}}</el-radio>
         </el-radio-group>
        </div>
        <div class="panel-content">
            <v-form :active="category.active" :label-width="labelWidth" :keys="keys" :items="items" :handle-submit="handleSubmit"></v-form>
        </div>
    </div>
    
</template>
<script>
    import form from 'components/form/form.vue'

    export default {
        props: {
            labelWidth: String,
            category: Object,
            handleSubmit: Function
        },
        data () {
            return {
                radio: "1",          
                keys: {},
            }
        },
        computed: {
            items: function () {
                let aList = [];
                this.category.list.forEach(oData => {
                    oData.items.forEach(oItem => {
                        if(!aList.filter(o => o.key == oItem.key).length) {
                            aList.push(oItem);
                        }                     
                    })
                })
                return aList;
            }
        },
        created () {
            // 设置选中的初始值。
            this.radio = this.category.active.radio;
            let initData = this.category.list.filter(o => o.key == this.radio)[0];    
            this.keys = this.getKeys(initData);
            // this.$nextTick(() => {
            //     this._init(initData);
            // })
        },
        components: {
            'v-form': form
        },
        methods: {            
            getKeys(oData) {
                let oKey = {};
                
                if(oData) {
	                oData.items.forEach(o => oKey[o.key] = '');
                }

                return oKey;
            },

            // 切换选中项处理函数
            handleChange(value) {
                let currentData = this.category.list.filter(o => o.key == value)[0];
                // this.items = currentData.items;
                this.keys = this.getKeys(currentData);

                this.$nextTick(() => this.$emit("radioChange"));

                this.category.active.radio = value;  
            }
        }
    }
</script>
<style lang="less">  
    .el-radio {
        &:hover {
            color: #42af8f;

            .el-radio__inner {
                border-color: #42af8f;
            }  
        }
    }

    .el-radio__inner {
        border: 2px solid #999;
        width: 14px;
        height: 14px;

        &::after {
            background-color: #42af8f;
        }
    }

    .el-radio__input.is-checked .el-radio__inner {
        border-color: #42af8f;
        background: #fff;
    }

    .el-radio__label {
        padding-left: 10px;
    }

    .panel-title {
        text-align: center;
    }
</style>
