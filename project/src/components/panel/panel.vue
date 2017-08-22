<template>
    <div :data="panelHeight" class="panel">
        <div ref="panelTitle" class="panel-title">
          <el-radio-group v-model="radio"  @change="handleChange">
            <el-radio class="radio" :key="item.key" v-for="item in category.list" :label="item.key">{{item.title}}</el-radio>
         </el-radio-group>
        </div>
        <div class="panel-content"
        	:style="{height: sPanelHeight}">
            <!--<v-form :tab="category.key" :active="category.active" :label-width="labelWidth" :keys="keys" :items="items" :handle-submit="handleSubmit"></v-form>-->
	        <div class="panel-content-wrap" v-for="item in category.list" 
	        		:class="[category.active.radio == item.key?'':'hide']">
	        		<v-form 
	        			:tab="category.key"
	        			:sub-tab="item.key"
	        			:active="category.active"
	        			:label-width="labelWidth"
	        			:handle-submit="handleSubmit"
	        			:keys="keys"
	        			:items="item.items" >
	        		</v-form>
	        	</div>
        </div>
    </div>
    
</template>
<script>
    import form from 'components/form/form.vue'

    export default {
        props: {
            labelWidth: String,
            category: Object,
            handleSubmit: Function,
            panelHeight: Number,
            activeTab: String
        },
        data () {
            return {
                radio: "1",          
                keys: {},
                // 面板参数高度
                sPanelHeight: "100%"
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
        watch: {
        	panelHeight: function() {
        		this.setPanelHeight();
        	},
        	activeTab: function() {
        		if(this.activeTab == this.category.key) {
        			this.setPanelHeight();
        		}
        	}
        },
        created () {
            // 设置选中的初始值。
            this.radio = this.category.active.radio;
            let initData = this.category.list.filter(o => o.key == this.radio)[0];    
            this.keys = this.getKeys(initData);
        },
        components: {
            'v-form': form
        },
        mounted() {
            this.setPanelHeight()
        },
        methods: {
        	setPanelHeight() {
        		let oPanelTitle = this.$refs.panelTitle;
        		if(oPanelTitle) {
	        		this.sPanelHeight = (this.panelHeight - oPanelTitle.clientHeight)+ "px"
        		}
        	},
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
                this.keys = this.getKeys(currentData);

//              this.$nextTick(() => this.$emit("radioChange"));
                this.category.active.radio = value;  
                
                // 设置内容高度
				this.setPanelHeight();
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
        // padding-left: 28px;
        // padding-right: 28px;
    }
    .panel-content {
    	overflow: auto;
    	
    	.panel-content-wrap {
    		padding:  0 28px;
    	}
    }
    .hide {
    	display: none;
    }
</style>
