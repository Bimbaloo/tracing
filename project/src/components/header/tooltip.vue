    
<template>
	<div>
	    <div class="tooltip-info" @mouseenter="showList=true" @mouseleave="showList=true">
	        <div v-if="back" class="back" @click="goBack">返回</div>
	        <div v-if="back && tool" class="division">|</div>
	        <el-tooltip v-if="tool" class="item" effect="light" content="Bottom Right" placement="bottom-end">
	            <ul slot="content" class="info-list">
	                <li @click="goSearchBarcode">条码查询</li>
	                <li @click="goOutputRecord">产出记录</li>
	            </ul>     
	            <div class="user-name">小工具<i class="el-icon-arrow-down"></i></div>
	        </el-tooltip>
	        <div v-if="tool && (ssoLogin || (!ssoLogin && config))" class="division">|</div>
	        <div v-if="ssoLogin">
		        <el-tooltip v-if="config || userId" class="item" effect="light" content="Bottom Right" placement="bottom-end">
		            <ul slot="content" class="info-list">
		                <li @click="goToConfig" v-if="config">设置</li>
		                <li @click="logout" v-if="userId">退出</li>
		            </ul>     
		            <div class="user-name" :style="{cursor: nickname?'default':'pointer'}" @click="login">{{nickname || "登录"}}<i class="el-icon-arrow-down"></i></div>
		        </el-tooltip>
		        <div v-else class="user-name" :style="{cursor: nickname?'default':'pointer'}" @click="login">{{nickname || "登录"}}</div>
	        </div>
        	<div v-if="!ssoLogin && config" @click="goToConfig" class="user-name" style="{cursor:'pointer'}">设置</div>
	    </div>
	    
	    <!-- 条码查询 -->
	    <v-dialog 
    		v-if="showBarcodeDialog" 
    		:dialog-visible="showBarcodeDialog"
    		@hideDialog="hideBarcodeDialog">
	    </v-dialog>
	    
	    <!-- 产出记录 -->
	    <v-output 
    		v-if="showOutputRecordDialog" 
    		:dialog-visible="showOutputRecordDialog"
    		@hideDialog="hideOutputRecordDialog">
	    </v-output>
	</div>
    	
</template>

<script>
    // 登录。
    const LOGIN_URL = HOST + "/api/v1/sso/get-login-info";
    // 退出。
    const LOGOUT_URL = HOST + "/api/v1/sso/logout";
    
    import dialog from "components/basic/dialogBarcode.vue"
    import outputRecord from "components/basic/dialogOutputRecord.vue"

    export default {
    	components: {
    		"v-dialog": dialog,
    		"v-output": outputRecord
    	},
        props: {
            // 是否需要设置链接。
            config: Boolean,
            // 是否需要返回链接。
            back: [Boolean, String],
            // 是否需要小工具链接。
            tool: {
            	type: Boolean,
            	default: true
            }
        },
        data () {
            return {
                showList: true,
                showBarcodeDialog: false,
                showOutputRecordDialog: false
            }
        },
        computed: {
            token() {
                return this.$store.state.loginModule.token
            },
            userId() {
                return this.$store.state.loginModule.userId
            },
            username() {
                return this.$store.state.loginModule.username
            },
            nickname() {
                return this.$store.state.loginModule.nickname
            },
            ssoLogin() {
            	return this.$store.state.versionModule.ssoLogin
            }
        },
        methods: {
        	// 跳转到配置页面。
        	goToConfig() {
        		window.open("config.html", "_self");
            },
            // 回退。
            goBack() {
                window.open(this.back, "_self");
            },
            // 登录。
            login() {
                if(this.userId) {
                    return;
                }

                this.$ajax.get(LOGIN_URL).then((res) => {
                    if(res.data.errorCode === 0) {
                        // 请求成功，按照登录失败的处理方式去发现登录。
                        this.$register.loginFail(res.data.data.loginUrl)
                    }else {
                        // 提示信息。
                        console.log(res.data.errorMsg)
					    this.$message.error("登录失败。");
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message.error("登录失败。");
                })
            },
            // 退出。
            logout() {
                this.$register.logout(this.$store, this.$ajax);
            },
            // 条码查询。
            goSearchBarcode() {
            	this.showBarcodeDialog = true
            },
            hideBarcodeDialog() {
            	this.showBarcodeDialog = false
            },
            // 产出记录。
            goOutputRecord() {
            	this.showOutputRecordDialog = true
            },
            hideOutputRecordDialog() {
            	this.showOutputRecordDialog = false
            }
        }
    }
</script>
<style lang="less">

    .el-tooltip__popper.is-light {
        padding: 0;   
        border: none;
    }

    .tooltip-info {
        position: absolute;
        right: 20px;
        top: 27px;
        height: 14px;
        line-height: 14px;
        font-size: 14px;
        color: #fff;
        height: auto;

        .el-icon-arrow-down {
            display: inline-block;
            padding-left: 10px; 
        }

        .back,.division,.item {
            display: inline-block;
        }
        
        .back {
            cursor: pointer;
        }
        .division {
            padding: 0 10px;
        }
        
        .user-name {
        	cursor: pointer;
        	display: inline-block;
        }
    }

    // 设置相关列表。
    .info-list {
        width: 90px;
        // border: 1px solid #ccc;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0px 3px 3px #888;
        padding: 10px 0;

        li {
            color: #999;
            text-align: center;
            padding: 10px 0;

            &:hover {
                background: #dedede;
                color: #666;
                cursor: pointer;
            }
        }
    }
</style>