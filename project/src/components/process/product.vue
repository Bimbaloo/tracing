<template>
    <div class="router-content">
        <!-- 设备监控 -->
	    <v-dialog 
    		v-if="showCamera" 
    		:dialog-visible="videoForm.visible"
            :equipment-id="videoForm.equipmentId" 
            :equipment-name="videoForm.equipmentName" 
            :time="videoForm.time" 
            :type="videoForm.type"
    		@hideDialog="hideVideoDialog">
	    </v-dialog>     
        <div class="innner-content" :style="styleObject">
            <div class="condition" ref='condition' v-if="isInChart">
                <div class='condition-messsage'>
                    <span v-for="(filter,index) in filters" :key="index">
                        {{filter[0]}} : {{filter[1]}}
                    </span>
                    <span>
                        <el-checkbox v-model="checked">全部数据</el-checkbox>
                    </span>
                    <span style='margin-left:5px'>({{this.$route.query.shiftStartTime}}~{{this.$route.query.shiftEndTime}})</span>
                </div>
            </div>
            <el-tabs element-loading-text="拼命加载中" v-model="activeTabName" class="search-tab" @tab-click="tabChange">
                <el-tab-pane name="unitTable" label="关联表">
                    <h2 class="content-title uniteTitle">
                        <span class='table-title'>产出投入</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(uniteItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('uniteTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="uniteTable" v-show="show1">
                        <el-table class="table-main" :data="checked?uniteItems.data:uniteItems.dataFilter" :height="uniteItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in uniteItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div 
                                    :class="['cell-content',{ltext: column.prop === 'barcode'}]" 
                                    v-if="column.prop === 'barcode'" 
                                    :style="{paddingLeft: props.row.hasInLen ? 15 : 50 +'px'}">
                                        <i v-if="props.row.hasInLen" class="icon-down el-icon-arrow-down" @click="handleEdit(props.$index, props, $event)"></i>
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop]}}</span>
                                        <i 
                                        v-if="showCamera" 
                                        class="icon icon-12 icon-camera" 
                                        title="视频监控"
                                        @click="showVideoDialog(props.row)"></i>
                                    </div>
                                    <div class="cell-content" v-else>
                                    	<!--<span v-if="!isInChart && column.prop =='equipmentName'" class="equipment" @click="equipmentClick(props.row)">{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>-->
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

					<h2 class="content-title inNotOutTitle">
						<span class='table-title'>有投未产</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inNotOutItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inNotOutTable', $event)"></i>
                        </span>
					</h2>
					<div class="content-table" ref="inNotOutTable" v-show="show1">
						<el-table class="table-main" :data="checked?inNotOutItems.data:inNotOutItems.dataFilter" :height="inNotOutItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in inNotOutItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
					</div>
					
					
                </el-tab-pane>
                <el-tab-pane name="infoTable" label="明细表">
                    <h2 class="content-title outTitle">
                        <span class='table-title'>产出</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="outputTable" v-show="show2">
                        <el-table class="table-main" :data="checked?outItems.data:outItems.dataFilter" :height="outItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in outItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content" v-if="column.prop !== 'barcode'">
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                    <div class="cell-content" v-else>
                                        <span :class="[ bTrack ? '' : 'barcode']" :title="[bTrack ? '' : '条码追踪']" @click="barcodeClick(props.row)">{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <h2 class="content-title inTitle">
                        <span class='table-title'>投入</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="inputTable" v-show="show2">
                        <el-table class="table-main" :data="checked?inItems.data:inItems.dataFilter" :height="inItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in inItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                </el-tab-pane>
                <el-tab-pane name="sumTable" label="汇总表">
                    <h2 class="content-title outAllTitle">
                        <span class='table-title'>产出汇总</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outAllItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputAllTable', $event)"></i>
                        </span>
                    </h2>
                    <div class="content-table" ref="outputAllTable" v-show="show3">
                        <el-table class="table-main" :data="checked?outAllItems.data:outAllItems.dataFilter" :height="outAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in outAllItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content" v-if="column.prop !== 'batchNo'">
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                    <div class="cell-content" v-else>
                                        <span :class="[ bTrack ? '' : 'batchNo']" :title="[bTrack ? '' : '批次追踪']" @click="batchClick(props.row)">{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <h2 class="content-title inAllTitle">
                        <span class='table-title'>投入汇总</span>
                        <span class='table-handle'>
                            <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inAllItems, $event)"></i>
                            <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputAllTable', $event)"></i>
                        </span>
                    </h2>

                    <div class="content-table" ref="inputAllTable" v-show="show3">
                        <el-table class="table-main" :data="checked?inAllItems.data:inAllItems.dataFilter" :height="inAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                            <el-table-column v-for="(column,index) in inAllItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                                <template scope="props">
                                    <div class="cell-content">
                                        <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                </el-tab-pane>
            </el-tabs>

        </div>
    </div>
</template>

<script>
import XLSX from 'xlsx'
import Blob from 'blob'
import FileSaver from 'file-saver'
import html2canvas from 'html2canvas'
import table from "components/basic/table.vue"
import rasterizeHTML from 'rasterizehtml'
import VideoDialog from 'components/monitor/dialog.vue'
import $ from 'jquery'

// 是否开启视频监控。
const CAMERA = 0;
//const url = "http://192.168.220.182:8088/api/v1/trace/operation-detail/inout/by-id";
const url = HOST + "/api/v1/trace/operation-detail/inout/by-id";

// 产出，退料，结转字段。
const OUT_FIELD = "outQuantity";
const RETURN_FIELD = "returnMaterialQuantity";
const CARRY_FIELD = "carryOverQuantity";

export default {
    components: {
        'v-table': table,
        "v-dialog": VideoDialog
    },
    props: {
    	isInChart: {
    		required: false,
    		type: Boolean,
    		default: true 
    	}
    },
    data() {
        return {
            // 是否开启视频监控。
            showCamera: !!CAMERA,
            videoForm: {
                visible: false,
                equipmentId: '',
                equipmentName: '',
                time: ''
            },
            checked: this.isInChart ? false: true, //是否显示全部数据
            activeTabName: 'unitTable',
            excel: true,
            print: true,
            loading: false,
            sErrorMessage: "",
            empty: "暂无数据。",
            styleObject: {
                //  "min-width": "2000px"
            },
            // 是否为追踪页面。
            bTrack: location.pathname.indexOf("trackIndex") > -1,
            tdResize: true, //是否允许拖动table大小
            condition: {},   // 显示的查询条件
            filters: {},
            dataName: [      // 条件对应中文名
                {
                    itemCode: "equipmentName",
                    itemName: "设备"
                }, {
                    itemCode: "startTime",
                    itemName: "开始时间"
                }, {
                    itemCode: "endTime",
                    itemName: "结束时间"
                },
            ],
            /* 投入 */
            inItems: {
                filename: "投入",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
//                  fixed: true
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "200"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "200",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "200"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "300"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "100"
                }, {
                	name: "设备",
                	prop: "equipmentName",
                	width: "120",
                }, {
                	name: "模号",
                	prop: "moldCode",
                	width: "120",
                },{
                    name: "班次",
                    prop: "shiftName",
                    width: "200"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "时间",
                    prop: "happenTime",
                    width: "200"
                }, {
                	name: "产出",
                	prop: OUT_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[OUT_FIELD] || 0
                	}
                }, {
                	name: "结转",
                	prop: CARRY_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[CARRY_FIELD] || 0
                	}
                }, {
                	name: "退料",
                	prop: RETURN_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[RETURN_FIELD] || 0
                	}
                }],
                height: 1,
                data: [],
                dataFilter: []
            },
            /* 产出 */
            outItems: {
                filename: "产出",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "200",
//                  fixed: true
                }, {
                    name: "箱码",
                    prop: "packetBarcode",
                    width: "200"
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "200"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "200"
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "200"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "300"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "100"
                }, {
                	name: "设备",
                	prop: "equipmentName",
                	width: "120",
                },{
                    name: "模号",
                    prop: "moldCode",
                    width: "",
                }, {
                    name: "质量",
                    prop: "qualityTypeName",
                    width: "100"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "200"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "时间",
                    prop: "happenTime",
                    width: "200"
                }],
                data: [],
                dataFilter: [],
                height: 1
            },
            /* 关联表-投产 */
            uniteItems: {
                filename: "产出投入",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "285",
//                  fixed: true
                }, {
                    name: "类型",
                    prop: "opTypeName",
                    width: "100"
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "120"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "250",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "120"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "280"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "120"
                }, {
                	name: "设备",
                	prop: "equipmentName",
                	width: "120"
                },{
                	name: "模号",
                	prop: "moldCode",
                	width: "120"
                }, {
                    name: "质量",
                    prop: "qualityTypeName",
                    width: "120"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "120"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "时间",
                    prop: "happenTime",
                    width: "200"
                }],
                height: 1,
                data: [],
                dataFilter: []
            },
            // 有投未产
            inNotOutItems: {
                filename: "有投未产",
                columns: [{
                    name: "条码",
                    prop: "barcode",
                    width: "285",
//                  fixed: true
                }, {
                    name: "工单",
                    prop: "doCode",
                    width: "120"
                }, {
                    name: "批次",
                    prop: "batchNo",
                    width: "250",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: "120"
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: "280"
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "120"
                }, {
                	name: "设备",
                	prop: "equipmentName",
                	width: "120"
                },{
                	name: "模号",
                	prop: "moldCode",
                	width: "120"
                }, {
                    name: "班次",
                    prop: "shiftName",
                    width: "120"
                }, {
                    name: "操作人",
                    prop: "personName",
                    width: "120"
                }, {
                    name: "时间",
                    prop: "happenTime",
                    width: "200"
                }, {
                	name: "结转",
                	prop: CARRY_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[CARRY_FIELD] || 0
                	}
                }, {
                	name: "退料",
                	prop: RETURN_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[RETURN_FIELD] || 0
                	}
                }],
                height: 1,
                data: [],
                dataFilter: []
            },
            /* 投入汇总 */
            inAllItems: {
                filename: "投入汇总",
                columns: [{
                    name: "批次",
                    prop: "batchNo",
                    width: "",
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: ""
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: ""
                }, {
                    name: "数量",
                    prop: "quantity",
                    width: "100"
                }, {
                	name: "产出",
                	prop: OUT_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[OUT_FIELD] || 0
                	}
                }, {
                	name: "结转",
                	prop: CARRY_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[CARRY_FIELD] || 0
                	}
                }, {
                	name: "退料",
                	prop: RETURN_FIELD,
                	width: "120",
                	formatter: function(row, column) {
                		return row[RETURN_FIELD] || 0
                	}
                }],
                height: 1,
                data: []
            },
            /* 产出汇总 */
            outAllItems: {
                filename: "产出汇总",
                columns: [{
                    name: "批次",
                    prop: "batchNo",
                    width: ""
                }, {
                    name: "物料编码",
                    prop: "materialCode",
                    width: ""
                }, {
                    name: "物料名称",
                    prop: "materialName",
                    width: ""
                }, {
                    name: "合格数",
                    prop: "qualifiedNum",
                    width: "100"
                }, {
                    name: "报废数",
                    prop: "scrapNum",
                    width: "100"
                }, {
                    name: "不合格数",
                    prop: "unqualifiedNum",
                    width: "100"
                }, {
                	name: "设备",
                	prop: "equipmentName",
                	width: "120"
                }, {
                	name: "模号",
                	prop: "moldCode",
                	width: "120"
                }],
                height: 1,
                data: []
            },
            //  viewHeight:0
            routerContent: 0,
            show1: true,
            show2: false,
            show3: false
        }

    },
    created() {
        this.initData();
        this.fetchData();
    },
    computed: {
        viewHeight: function() {
            return this.routerContent
        },
        resizeY: function() {
            return this.$store && this.$store.state.resizeY
        },
        fullscreen: function() {
            return this.$store && this.$store.state.fullscreen
        },
        activeTabChange: function() {
        	return this.$store && this.$store.state.activeTabChange
        }
    },
    mounted() {
        this.routerContent = document.querySelector(".el-tabs__content").offsetHeight  //获取初始高度
        this.setTableHeight()
    },
    watch: {
        // 如果路由有变化，会再次执行该方法
        '$route': function(to, from) {       	
        	// 从设备分析过来时，点击tree上的节点时也会重新请求
        	if(to.meta.title == 'product' || !to.meta.title) {
        		// 初始化其他显示值。
        		this.show1 = true
        		this.show2 = false
        		this.show3 = false
        		this.activeTabName = "unitTable"
        		this.checked = !this.isInChart
        		
        		this.fetchData();
        	}
        },
        /* 上下拖动时，重新设置table大小变化 */
        "resizeY": 'setTableHeight',
        /* 全屏大小时，重新设置table大小 */
        "fullscreen": 'setTableHeight',
//      "activeTabChange": function() {
//      	if(this.$route.meta.title == 'product' && this.activeTabChange == 'product') {
//      		// 从设备分析的投产表中进来时，页面会错位。。。fixed导致。。。
//      		this.fetchData()
//      	}else {
//      		this.setTableHeight()
//      	}
//      },
        "activeTabChange": 'setTableHeight'
    },
    methods: {
    	// 设备点击事件。
    	equipmentClick(row) {
    		// 如果设备数据存在，则可点击。
        	// if(!this.isInChart && row.equipmentName) {
			// 	this.$store.commit({
			// 		type: "updateTabChange",
			// 		key: "equipment"
			// 	});
            //     this.$router.replace({ path: '/process/chart', query: {  }})
        	// }
    	},
    	// 获取筛选条件。
    	getFilters() {
            let filters = this.condition
            for (let i in filters) {
                if (filters[i] === '' || i === '_tag') {
                    delete filters[i]
                }
            }
            /* 为了将获取到的 barcode等转换为对应的中文 */
            let b = Object.entries(filters),
                a = this.dataName;

            b.forEach(o =>
                a.forEach(function(x) {
                    if (o[0] === x.itemCode) {
                        o[0] = x.itemName
                    }
                })
            )
            return b
            /* 为了将获取到的 barcode等转换为对应的中文 */
        },
        initData() {
            if (this.bTrack) {
                // 若为追踪页面，过滤明细产出操作列。
               // this.outItems.columns[0].class = ''
               // this.outItems.columns[0].cellClick = ''
            }
            
            if(this.isInChart) {
	            this.inItems.columns = this.setColumnHide(this.inItems.columns)
	            this.outItems.columns = this.setColumnHide(this.outItems.columns)
	            this.uniteItems.columns = this.setColumnHide(this.uniteItems.columns)
            	this.inNotOutItems.columns = this.setColumnHide(this.inNotOutItems.columns)
            	this.outAllItems.columns = this.setColumnHide(this.outAllItems.columns)
            }
        },
        // 设置显示列隐藏。
        setColumnHide(aoColumns) {
        	// 如果是在设备分析里面，则设置column中列隐藏。
            let aDisplayColumnProp = ["equipmentName", "moldCode"]
            
            for(let i = 0; i< aoColumns.length; i++) {
            	if(aDisplayColumnProp.includes(aoColumns[i].prop)) {
            		aoColumns.splice(i,1)
            		i--
            	}
            }
        	return aoColumns
        },
        // 隐藏监控视频。
        hideVideoDialog() {
            this.videoForm.visible = false;
        },
        // 打开监控视频。
        showVideoDialog(row) {
            this.videoForm = {
                visible: true,
                equipmentId: row.equipmentId,
                equipmentName: row.equipmentName,
                time: row.happenTime,
                type: row.opTypeName==="产出" ? "2":"1"
            };
        },
        // 请求成功。
        requestSucess(oData) {
	
			this.loading = false
			
			let startTime = this.condition.startTime
			
		    let endTime = this.condition.endTime
		    
		    // 所有产出数据
			let aoOutData = oData.outList
			
			// 所有投入数据。
			let aoInData = oData.inList
			
			// 投产中数据： 产出、退料、结转
			let oMore = {
				// 类型（destOpType）-显示的字段
				// 产出
				6: OUT_FIELD,
				// 退料
				8: RETURN_FIELD,
				// 结转
				7: CARRY_FIELD
			}
			
			// 汇总显示的数据
			let oGroup = {
				// 产出汇总
				"out": {
					group: ["batchNo", "materialCode", "equipmentId", "moldCode"],
					dis: ["batchNo", "materialName", "materialCode", "equipmentId", "equipmentName", "moldCode", "quantity", "qualifiedNum", "scrapNum", "unqualifiedNum"],
					merge: ["quantity", "qualifiedNum", "scrapNum", "unqualifiedNum"]
				},
				// 投入汇总
				"in": {
					group: ["batchNo", "materialCode"],
					// 包含退料等。。。。
					dis: ["batchNo", "materialName", "materialCode", "quantity", OUT_FIELD, RETURN_FIELD, CARRY_FIELD],
					// 包含退料结转
					merge: ["quantity", OUT_FIELD, RETURN_FIELD, CARRY_FIELD]
				}
			}
			
			// 所有数据。
			let oAll = {
				// 投产
				"unite": {
					data: [],
					dataFilter: []
				},
				// 有投未产
				"inNotOut": {
					data: [],
					dataFilter: []
				},
				// 产出
				"out": {
					data: [],
					dataFilter: []
				},
				// 投入
				"in": {
					data: [],
					dataFilter: []
				},
				// 产出汇总
				"outAll" : {
					data: [],
					dataFilter: []
				},
				// 投入汇总
				"inAll": {
					data: [],
					dataFilter: []
				}
			}
			
			// 根据投入记录->找到其只投未产的数据  === 只投未产。
			aoInData.forEach( o => {
				
				// 先获取改投入的
				o.destinationInfoList.forEach( oNo => {
					let sKey = oMore[oNo.destOpType]
					
					if(sKey) {
						// 过滤掉不需显示的字段。
						o[sKey] = oNo.srcDeductionQuantity || 0
					}
				})
				
				// 判断该数据是否有产出。-- 没有产出则将数据放入有投未产中
				if(!(o.outputOpIdList && o.outputOpIdList.length)) {
					// 将数据加入到有投未产中。
					oAll["inNotOut"].data.push(o)
				}
			})
			
			// 根据产出数据->找到改产出对应的投入数据。 === 投产数据
			aoOutData.forEach( o => {
				
				// 设置每条记录的合格书、报废数、不合格数
				let sType = o.qualityType
				
				// 操作id值，对应投入记录中 
				let	sOperId = o.operationId
				
				if (sType === 1) { 
					// 合格数
		            o.qualifiedNum = o.quantity || 0
		        } else if (sType === 2) { 
		        	// 报废数
		            o.scrapNum = o.quantity || 0
		        } else {       
		        	// 不合格数
		            o.unqualifiedNum = o.quantity || 0
		        }
				
				// 获取该产出对应的投入信息。
				let aIn = aoInData.filter( oIn => oIn.outputOpIdList.includes(sOperId))
				
				if(aIn.length) {
					// 有投入数据--对应icon的显示
//					o.hasIn = true
					o.hasInLen = aIn.length
					
					// 添加投产数据中的产出数据
					oAll["unite"].data.push(o)
					
					// 添加投产数据该产出记录对应的投入数据
					oAll["unite"].data.push(...aIn)
				}else {
//					o.hasIn = false
					o.hasInLen = 0
					
					// 添加投产数据中的产出数据
					oAll["unite"].data.push(o)
				}
			})
			
			// 设置修改后的产出，投入数据。
			oAll["in"].data = aoInData
			oAll["out"].data = aoOutData
			
			// 获取投产、有投无产、产出、投入的根据时间过滤后的数据
			if(this.isInChart) {
				for(let sParam in oAll) {
					// 过滤掉了汇总的列。
					if(oAll[sParam].data.length) {
						oAll[sParam].dataFilter = oAll[sParam].data.filter( o => startTime <= o.happenTime && o.happenTime <= endTime )
					}
				}
			}
			
			// 获取汇总的数据。
			for(let sParam in oAll) {
				
				// 获取需汇总的处理。
				let sP = sParam.substr(0, sParam.length-3)
				
				if(oAll[sP]) {
					
					oAll[sParam].data = this._sumData(oAll[sP].data, oGroup[sP].group, oGroup[sP].dis, oGroup[sP].merge)
					// 只有存在需要过滤时，才过滤数据。
					if(this.isInChart) {
						oAll[sParam].dataFilter = this._sumData(oAll[sP].dataFilter, oGroup[sP].group, oGroup[sP].dis, oGroup[sP].merge)
					}
				}
			}
			
			// 对于当数据为空时可以隐藏的列的处理。
			
			({
				unite:{data:this.uniteItems.data, dataFilter: this.uniteItems.dataFilter},
				inNotOut:{data:this.inNotOutItems.data, dataFilter: this.inNotOutItems.dataFilter},
				out:{data:this.outItems.data, dataFilter: this.outItems.dataFilter},
				in: {data:this.inItems.data, dataFilter: this.inItems.dataFilter},
				outAll:{data:this.outAllItems.data, dataFilter: this.outAllItems.dataFilter},
				inAll: {data:this.inAllItems.data, dataFilter: this.inAllItems.dataFilter}
			} = oAll)
			
			this.setTableHeight()
		},
        // 请求失败。
        requestFail(sErrorMessage) {
            this.loading = false;
            let outDatas = []
            let inDatas = []
            let uniteDatas = []
            let outAllDatas = []
            let inAllDatas = []
            
            this.setTableHeight()
            // 提示信息。
            console.log(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.loading = false;
            this.styleObject.minWidth = 0;
            this.setTableHeight()
            console.log(err)
            console.log("数据库查询出错。")
        },
        /**
		 * 获取汇总的数据
		 * @param {Array} 汇总的数据。
		 * @param {Array} 合并的字段-- 分类
		 * @param {Array} 展示的数据
		 * @param {Array} 需汇总的列。
		 */
		_sumData(aoList, aGroup, aDis, aMerge) {
			
			let oFlag = {}
			
			aoList && aoList.forEach( o => {
				
				// 需合并的参数值。
				let sKey = ""
				
				aGroup.forEach( sGroup => sKey += o[sGroup] + "+")
				
				if(!oFlag[sKey]) {
					// 设置展示的值。
					oFlag[sKey] = {}
					
					aDis.forEach( sDis => oFlag[sKey][sDis] = (o[sDis] || "") )
				}else {
					// 存在，则汇总数据。
					aMerge.forEach( sMerge => oFlag[sKey][sMerge] = Number(oFlag[sKey][sMerge] || 0) + Number(o[sMerge] || 0) )
				}
				
			})
			
			// 返回数据。	
			return window.Rt.utils.getObjectValues(oFlag);
		},
        // 获取数据。
        fetchData() {

            this.loading = true;
            let oQuery = {}
            Object.keys(this.$route.query).forEach((el) => {
                if (el === "operationIdList") {
                    oQuery[el] = this.$route.query[el]
                }else if (el === "detailInfos") {
                    oQuery.operationIdList = this.$route.query[el].map(o => {
                        return {
                            opId: o.opId, 
                            opType: o.opType
                        }
                    })
                }
                if (el === "equipmentName" || el === "startTime" || el === "endTime") {
                    this.condition[el] = this.$route.query[el]
                }
            })
            this.filters = this.getFilters()
//          oQuery = {
//				"operationIdList": [{
//					"opId": "39837166-4657-4c1d-b746-827d7fab95ed",
//					"opType": 6
//				},{
//					"opId": "bfcdffb1-2b5f-43c0-837c-9f61b50648ea",
//					"opType": 6
//				},{
//					"opId": "6c9f4b86-82a9-4b61-a5d4-71063edce107",
//					"opType": 6
//				},{
//					"opId": "5506de6b-08ec-40dd-bb1f-c9e32a8b4661",
//					"opType": 1
//				},{
//					"opId": "254e0267-f53c-4321-9225-c37ca02a72fd",
//					"opType": 1
//				}]
//			}
            this.$register.sendRequest(this.$store, this.$ajax, url, "post", oQuery, this.requestSucess, this.requestFail, this.requestError)
        	
        },
        // 批次追踪
        batchClick(row) {
            if(this.bTrack){
                return 0
            }else {
                debugger
                // 批次追踪。
                let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                oCondition = {
                    selected: this.outItems.data.filter(o => o.batchNo === row.batchNo).map(o => {
                        return {
                            materialCode: o.materialCode,
                            batchNo: o.batchNo,
                            // barcode: o.barcode,
                            snapshotId: o.destSnapshotId
                        }
                    })
                }
                sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
                window.open("trackIndex.html?tag=" + tag);
            }
        },
        // 单件追踪
        barcodeClick(row) {
            if(this.bTrack){
                return 0
            }else {
                debugger
                // 单件追踪。
                let tag = new Date().getTime().toString().substr(-5),// 生成唯一标识。
                    oCondition = {
                        selected: [{
                            materialCode: row.materialCode,
                            batchNo: row.batchNo,
                            // barcode: row.barcode,
                            snapshotId: row.destSnapshotId
                        }]
                    }

                sessionStorage.setItem("track_" + tag, JSON.stringify(oCondition));
                window.open("trackIndex.html?tag=" + tag);
            }
        },
        materialClick(row) {
            let oQuery = {
                batchNo: row.batchNo,
                materialCode: row.materialCode
            },
                sPath = "/process/restrain"

            this.$router.replace({ path: sPath, query: oQuery })
        },
        // 表格导出。
        exportExcelHandle(oData, event) {
            if (!oData) {
                return;
            }

            // 下载表格。
            window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
        },

        // 表格打印。
        printHandle(refTable, event) {
            let oTable = this.$refs[refTable];

            if (!oTable) {
                return;
            }

            let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${oTable.querySelector(".el-table__header-wrapper").innerHTML}
                    </div>
                    <div class="el-table__body-wrapper">
                        ${oTable.querySelector(".el-table__body-wrapper").innerHTML}
                    </div>
                    <style>
                        .el-table td.is-center, .el-table th.is-center {
                            text-align: center;
                        }
                        .table thead th {
                            height: 36px;
                            background-color: #42af8f;
                        }
                        .table thead th .cell {
                            color: #fff;
                        }
                        .el-table__body-wrapper tr:nth-child(even) {
                            background-color: #fafafa;
                        }
                        .el-table__body-wrapper tr:nth-child(odd) {
                            background-color: #fff;
                        }
                        .el-table__body-wrapper td {
                        	white-space: normal;
    						word-break: break-all;
                        }
                        .el-table__body-wrapper .cell {
                            min-height: 30px;
                            line-height: 30px;
                            // 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
                            //border: 1px solid #e4efec;
                            box-sizing: border-box;
                        }
                        .el-table__empty-block {
                            text-align: center;	
                        }
                    </style>
                </div>
            `;

            window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
        },

        // 获取高度。
        adjustHeight() {
            
            let ntable = 0;
            ntable = Math.floor(
                this.viewHeight
//              - (this.isInChart ? this.outerHeight(document.querySelector(".condition")) : 0)
                - (this.isInChart && document.querySelector(".condition") ? this.outerHeight(document.querySelector(".condition")) : 0)
                - (this.isInChart && document.querySelector(".router-path") ? this.outerHeight(document.querySelector(".router-path")) : 0)
                - 30 //   this.outerHeight(document.querySelector(".el-tabs__header")  初始渲染的时候会有问题
                - 56 //   this.outerHeight(document.querySelector(".content-title.outTitle"))
                - 66 //   this.outerHeight(document.querySelector(".content-title.inTitle"))
                - 20  // 表格margin-bottom
            ) / 2;

            return ntable;
        },
        /* 获取元素实际高度(含margin) */
        outerHeight(el) {
            var height = el.offsetHeight;
            var style = el.currentStyle || getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        },
        /* 设置table实际高度 */
        setTableHeight() {
//      	if(this.$route.meta.title == 'product') {
	            this.routerContent = document.querySelector(".el-tabs__content").offsetHeight
	            this.uniteItems.height = this.inNotOutItems.height = this.inAllItems.height = this.outAllItems.height = this.inItems.height = this.outItems.height = this.adjustHeight()
//      	}
        },
        /* 设置title */
        setTitle(el, title) {
            let elTds = document.querySelectorAll(el)
            elTds.forEach((el, index) => {
                if (elTds[index].tagName.toLocaleLowerCase() === 'td') {
                    el.setAttribute('title', title);
                }
            })
        },
        /* 点击产出 展开或收拢投入 */
        handleEdit(index, props, event) {
            let elArr = []
            const num = props.row.hasInLen //props.row.in.length
            const icon = event.target
            let jParent = event.target.closest('.content-table')
            const trs = jParent.querySelectorAll(".el-table__body-wrapper")[0].querySelectorAll("tr")
//          const trsFix = jParent.querySelectorAll(".el-table__fixed-body-wrapper")[0].querySelectorAll("tr")
            
            for (let i = 0; i < num; i++) {
                elArr.push(trs[index + i + 1])
//              elArr.push(trsFix[index + i + 1])
            }
            if (icon.classList.contains("actived")) {  // 判断是否隐藏
                elArr.forEach((el) => {
                    return el.classList.remove('hide');
                })
                icon.classList.remove('actived');
            } else {
                elArr.forEach((el) => {
                    return el.classList.add('hide');
                })
                icon.classList.add('actived');
            }
            
            
        },
        /* tab切换 */
        tabChange(tab, event) {
        	this.activeTabName = tab.name
        	
            const index = tab.index
            switch (index) {
                case "0":
                    this.show1 = true
                    this.show2 = false
                    this.show3 = false
                    break;
                case "1":
                    this.show1 = false
                    this.show2 = true
                    this.show3 = false
                    break;
                case "2":
                    this.show1 = false
                    this.show2 = false
                    this.show3 = true
                    break;
            }
        },
        /* 汇总函数 */
        gatherDate(needDate,copyDate) {
            copyDate.forEach((el, i) => {                        // 投入汇总
                needDate.push({
                    batchNo: copyDate[i]["batchNo"],             // 批次号
                    quantity: parseInt(copyDate[i]["quantity"]),               // 数量
                    qualifiedNum: parseInt(copyDate[i]["qualifiedNum"]),       // 合格数
                    scrapNum: parseInt(copyDate[i]["scrapNum"]),               // 报废数
                    unqualifiedNum: parseInt(copyDate[i]["unqualifiedNum"]), // 不合格数
                    materialName: copyDate[i]["materialName"],   // 物料名称
                    materialCode: copyDate[i]["materialCode"],   // 物料编码
                })
                for (let j = i + 1; j < copyDate.length; j++) {
                    if (el["batchNo"] !== "" && el["batchNo"] === copyDate[j]["batchNo"] && el["materialCode"] === copyDate[j]["materialCode"]) {
                        needDate[i].quantity = parseInt(needDate[i]["quantity"]) + parseInt(copyDate[j]["quantity"])  // 数量
                        needDate[i].qualifiedNum = parseInt(needDate[i]["qualifiedNum"]) + parseInt(copyDate[j]["qualifiedNum"])        // 合格数
                        needDate[i].scrapNum = parseInt(needDate[i]["scrapNum"]) + parseInt(copyDate[j]["scrapNum"])                    // 报废数
                        needDate[i].unqualifiedNum = parseInt(needDate[i]["unqualifiedNum"]) + parseInt(copyDate[j]["unqualifiedNum"])  // 不合格数
                        copyDate.splice(j, 1)
                        j = j - 1
                    }
                }
            })
            return needDate
        }
    }
}
</script>

<style lang="less">
.content-title.table-title {
    margin-top: 10px;
    margin-bottom: 0;
    color: #333;
    font-size: 14px;
    i {
        color: #ccc;
        float: right;
        &:first-child {
            transform: rotate(180deg);
            margin-left: 20px
        }
    }
}

.content-title {
    .icon-print {
        right: auto;
    }
}

.cell {
    .cell-content {
        .batchNo,
        .barcode {
        // .equipment 
            cursor: pointer;
            color: #f90;
            .cell {
                font-weight: 600;
                &:empty {
                    cursor: default;
                }
            }
        }
    }
    
    .clicked {
        cursor: pointer;
        color: #f90;
    }
}


.button {
    cursor: pointer;
    color: #f90;
}

@green: #42af8f;
@blue: #0099ff;
@yellow: #fcc433;
@red: #e86b59;
@inVent: #00a656;

body {
    background-color: #f2f2f2;
    font-size: 14px;
    overflow: hidden;
}

.el-button--text {
    border: 1px solid #42af8f;
    padding: 10px 15px;
}

.el-table .el-table__header thead tr th {
    background-color: @green;
    .cell {
        background-color: @green;
        color: #FFFFFF;
    }
}

.el-table .cell {
    padding: 0;
}

.cell {
    .ltext {
        text-align: left;
        padding-left: 15px;
    }
}

.show {
    transition: display 400ms;
}

.hide {
    opacity: 0;
    display: none
}

.icon-down {
    transition: transfrom 1s linear;
    &.actived {
        transform: rotate(-90deg);
    }
}

.router-content {
    .condition {
        margin-bottom: 20px;
        .el-checkbox {
            .el-checkbox__label {
                margin-left: 0;
                padding-left: 10px;
            }
        }
    }
}

.innner-content .search-tab{
    margin-top: 0;
}

.search-tab {
    
    .el-tabs__header {
        border-bottom: none;
        margin-bottom: 0;
        .el-tabs__item {
            border-radius: 0;
            width: 90px;
            height: 30px;
            padding: 0;
            box-sizing: border-box;
            font-size: 14px;
            border: 2px solid #42af8f;
            line-height: 26px;
            margin-right: 20px;
            text-align: center;
            color: #666;
            &:hover {
                color: #333;
            }
        }
        .el-tabs__active-bar {
            display: none
        }
        .is-active {
            background-color: #42af8f;
            color: #fff;
            &:hover {
                color: #fff;
            }
        }
    }
}
</style>

<style lang="less" scoped>
.outTitle,
.inTitle,
.uniteTitle,
.inAllTitle,
.outAllTitle,
.inNotOutTitle {
    display: flex;
    justify-content: space-between;
    .table-handle {
        margin-right: 5px;
        display: flex;
        align-items: center;
        i {
            margin: 7.5px;
            &:hover {
                cursor: pointer
            }
        }
    }
    .table-table {
        i {
            margin: 5px;
        }
    }
}
</style>




