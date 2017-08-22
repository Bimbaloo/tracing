<template>
    <div id="app">
        <v-header></v-header>
        <div class="pbody">
            <div class="sidebar">
                <div class="sidebar-item" v-for="(item,index) in sidebarItems" :class="{active: isActive==index}" @click="turnTo(item.src,index)">
                    <div class="logo-item" :class="item.img"></div>
                    <span class="logo-item-text">{{item.text}}</span>
                </div>
            </div>

            <div class="content-bg">
            	<div class="content-wrap">
	                <div class="content">
	                    <router-view></router-view>
	                </div>
            	</div>
            </div>
        </div>
    </div>
</template>

<script>
    import header  from 'components/header/header.vue';

    export default {
        components: {
            'v-header' : header
        },
        data() {
            return {
                isActive: 0,
                sidebarItems:[{
                    text:'自定义查询入口',
                    img: '',
                    src:'/query'
                },{
                    text:'自定义条件名称',
                    img: 'field',
                    src:'/field'
                }],
            }
        },
        created() {
            this.$router.push('query');
        },
        computed: {
        	// 是否编辑的状态。
	        edit () {
	          return this.$store.state.edit
	        }
        },
        methods: {
            turnTo(routerLink,index){
            	let self = this
            	if(self.edit && self.isActive != index) {
					// 存在未保存，是否处理。  
					self.$confirm('内容未保存, 是否继续?', '提示', {
			          	confirmButtonText: '确定',
			          	cancelButtonText: '取消',
			          	type: 'warning'
			        }).then(() => {
			        	// 确定操作。离开当前页面
			        	self.isActive=index;
                		self.$router.push({path:routerLink});
                		
			        	return true
			        }).catch(() => {
			        	// 取消操作。还在当前页面。
			        	return false
			        });
            	}else {
            		self.isActive=index;
                	self.$router.push({path:routerLink});
            	}
                
            }
        }
    }
</script>

<style lang="less">
    html,body {
        height: 100%;
    }
    #app{
        display: flex;
        flex-direction: column;
        height:100%;
        .pbody{
            display: flex;
            flex:1;
            flex-direction: row;
        }
        .el-dialog__headerbtn, .el-pagination__rightwrapper {
            border-width: 0;
            background-color: transparent;
            outline: none;
        }
        
        .sidebar{
            display: flex;
            flex-direction: column;
            flex:0 0 180px;
            background: #ffffff;
            .sidebar-item{
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height:100px;
                text-align: center;
                cursor: pointer;
                &:hover,&.active{
                    background: #42af8f;
                    color: #ffffff;
                    .logo-item{
                        background-position: 0 0;
                        &.field{
                            background-position: 0 -30px;
                         }
                    }
                 }
                 .logo-item{
                     height:30px;
                     width: 30px;
                     margin:20px auto 0;
                     background: url("../../assets/img/img01.png")no-repeat;
                     background-position: -30px 0;
                     &.field{
                        background-position: -30px -30px;
                      }
                 }
                .logo-item-text {
                	line-height: 40px;
                }
            }
        }
        .content-bg{
            width: 100%;
            /*height: 100%;*/
            background: #cccccc;
            padding: 20px;
            display: flex;
            
            .content-wrap {
            	flex: 1;
            	position: relative;
            	
	            .content{
	            	position: absolute;
	                width: 100%;
	                height: 100%;
	                background: #ffffff;
	            }
            }
        }
    }
	.el-message-box__headerbtn {
    	background: transparent;
    	border: none;
    }

</style>
