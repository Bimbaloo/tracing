<template>
	<div class="banner">
		<!-- 搜索 -->
		<div class="search-block">
			<el-select v-model="searchColumnName" placeholder="请选择搜索列">
				<el-option
				  	v-for="item in columnNames"
				  	:key="item.value"
				  	:label="item.label"
				  	:value="item.value">
				</el-option>
		  	</el-select>
			<input v-model="searchKey" class="search-input" placeholder=""/>
			<el-button type="primary" @click="search">搜索</el-button>
		</div>
		
		<!--<div class="search-block">
			<el-button type="primary">搜索&nbsp;<i class="el-icon-caret-bottom"></i></el-button>
			<div>
				<el-select v-model="value" placeholder="请选择">
				    <el-option
				      	v-for="item in options"
				      	:key="item.value"
				      	:label="item.label"
				      	:value="item.value">
				    </el-option>
			  	</el-select>
			</div>
		</div>-->
		
		
	
		<el-button type="primary" @click="saveToDB">保存</el-button>
		<el-select v-model="value" @change="changeState" placeholder="请选择">
		    <el-option
		      	v-for="item in options"
		      	:key="item.value"
		      	:label="item.label"
		      	:value="item.value">
		    </el-option>
	  	</el-select>
	</div>
</template>

<script>
  export default {
  	props: {
  		isShow: {
  			type: Boolean,
  			default: true
  		},
  		columnNames: {
  			type: Array,
  			defualt: []
  		}
  	},
    data() {
      return {
      	searchKey: '',//搜索关键字
      	searchColumnName: '',//按列名搜索
        options: [{
          value: true,
          label: '显示'
        },
        {
          value: false,
          label: '隐藏'
        }],
        value: true
      }
    },
    methods: {
    	changeState: function (state) {
    		this.$emit('change-state', state);
    	},
    	saveToDB: function () {
    		this.$emit('save-data');
    	},
    	addNewLine: function () {
    		this.$emit('add-new-line');
    	},
    	search: function () {
    		if (!this.searchColumnName || !this.searchKey) {
    			return;
    		}
    		
    		const obj = {};
    		obj[this.searchColumnName] = this.searchKey;
    		this.$emit('search', obj);
    	}
    }
  }
</script>

<style>
	.banner, .search-block {
		margin-bottom: 10px;
	}
	.search-input {
		border-radius: 4px;
	    border: 1px solid rgb(191, 217, 212);
	    box-sizing: border-box;
	    color: rgb(31, 61, 55);
	    line-height: 1;
        padding: 3px 10px;
        height: 36px;
	}
	.search-input:focus {
	    outline: 0;
    	border-color: #42af8f;
	}
</style>