<template>
    <header>
        <img :src="logo"/>
        ——&nbsp;&nbsp;追溯系统
        <div class="header-icon">
	        <i v-if="bShowSearch" class="icon icon-back" @click="goToSearch"></i>
	        <i v-if="bShowConfig" class="icon el-icon-setting" @click="goToConfig"></i>
        </div>
    </header>
</template>
<script>
    import logo from 'assets/img/logo-w.png'
    
    const pathName = window.location.pathname;
    
    export default {
        data () {
            return {
                logo,
                bShowSearch: pathName.indexOf("trace")<0 && pathName.indexOf("track")<0,
                bShowConfig: pathName.indexOf("config.html")<0 && pathName.indexOf("trace")<0 && pathName.indexOf("track")<0
            }
        },
        methods: {
        	// 跳转到搜索页。
        	goToSearch() {
//      		console.log(window.location.origin)
        		window.open("search.html", "_self");
        		// 返回上一级目录。
        	},
        	// 跳转到配置页面。
        	goToConfig() {
        		window.open("config.html", "_self");
        	}
        }
    }
</script>
<style lang="less" scoped>
    header{
        height: 68px;
        line-height: 68px;
        background-color: #333;
        /*padding-left: 40px;*/
        padding: 0 20px 0 40px;
        color: #fff;
        font-size: 16px;
        font-family: 微软雅黑;
    }
    img {
        // height: 48px;
        vertical-align: middle;
    }
    .header-icon {
    	float: right;
    	
	    .icon {
	    	display: inline-block;
	    	vertical-align: middle;
	    	cursor: pointer;
			
	    	&.icon-back {
		    	width: 24px;
		    	height: 18px;
		    	background: url(../../assets/img/icon-back.png) no-repeat 0 0;
		    	
		    	&:hover {
		    		background-position: -24px 0;
		    	}
	    	}
	    	
	    	&.el-icon-setting {
	    		margin-left: 10px;
	    	}
	    }
    }
</style>
