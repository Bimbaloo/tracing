<!--投产表-->
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
	    <!-- 批次追踪详细信息 -->
	    <el-dialog
	    	v-if="!bTrack"
	    	title="汇总详情"
	    	size="large"
	    	class="outTrack-dialog-wrap"
	    	:close-on-click-modal="false"
	    	:visible.sync="outTrackConfig.visible">
        <v-table :table-data="outTrackConfig" :heights="outTrackConfig.height"></v-table>
        <div class="dialog-footer">
          <el-button @click="outTrackConfig.visible = false">取 消</el-button>
          <el-button type="primary" @click="outTrackDialogHandle">追 踪</el-button>
        </div>
      </el-dialog>
      <div class="innner-content" :style="styleObject">
        <div class="condition" ref='condition' v-if="isInChart">
          <div class='condition-messsage'>
            <span v-for="(filter,index) in filters" :key="index">
              {{filter[0]}} : {{filter[1]}}
            </span>
            <br>
            <span>
              <el-checkbox v-model="checked">全部数据</el-checkbox>
            </span>
            <span style='margin-left:5px'>({{this.$route.query.shiftStartTime}}~{{this.$route.query.shiftEndTime}})</span>
          </div>
        </div>
        <el-tabs element-loading-text="拼命加载中" v-model="activeTabName" class="search-tab product" @tab-click="tabChange">
          <el-tab-pane name="unitTable" label="关联表" v-if="showUnited">
            <h2 class="content-title uniteTitle">
              <span class='table-title'>投产关联</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(uniteItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printAgTableHandle('uniteTable', uniteItems, $event)"></i>
              </span>
            </h2>

            <div class="content-table" ref="uniteTable" v-if="show1">
                    <!--<el-table class="table-main" :data="checked?uniteItems.dataAll:uniteItems.dataFilter" :height="uniteItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                        <el-table-column v-for="(column,index) in uniteItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                            <template scope="props">
                                <div
                                :class="['cell-content',{ltext: column.prop === 'barcode'}, {lchildText: props.row.hasInLen===undefined}]"
                                v-if="column.prop === 'barcode'">
                                    <i v-if="props.row.hasInLen" class="icon-down el-icon-arrow-down" @click="handleEdit(props.$index, props, $event)"></i>
                                    <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop]}}</span>
                                    <i
                                    v-if="showCamera"
                                    class="icon icon-12 icon-camera"
                                    title="视频监控"
                                    @click="showVideoDialog(props.row)"></i>
                                </div>
                                <div class="cell-content" v-else>
                                    <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>-->
              <v-ag
                :table-data="uniteItems"
                :heights="uniteItems.height"
                :loading="loading"
              ></v-ag>
            </div>

            <h2 class="content-title inNotOutTitle">
              <span class='table-title'>有投未产</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inNotOutItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printAgTableHandle('inNotOutTable', inNotOutItems, $event)"></i>
              </span>
            </h2>
            <div class="content-table" ref="inNotOutTable" v-if="show1">
              <!--<el-table class="table-main" :data="checked?inNotOutItems.dataAll:inNotOutItems.dataFilter" :height="inNotOutItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                  <el-table-column v-for="(column,index) in inNotOutItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                      <template scope="props">
                          <div class="cell-content">
                              <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                          </div>
                      </template>
                  </el-table-column>
              </el-table>-->
              <v-ag
                :table-data="inNotOutItems"
                :heights="inNotOutItems.height"
                :loading="loading"
              ></v-ag>
            </div>
          </el-tab-pane>
          <el-tab-pane name="infoTable" label="明细表">
            <h2 class="content-title outTitle">
              <span class='table-title'>产出</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printAgTableHandle('outputTable',outItems, $event)"></i>
              </span>
            </h2>

            <div class="content-table" ref="outputTable" v-if="show2">
              <!--<el-table class="table-main" :data="checked?outItems.dataAll:outItems.dataFilter" :height="outItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
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
              </el-table>-->
              <v-ag
                :table-data="outItems"
                :heights="outItems.height"
                :loading="loading"
              ></v-ag>
            </div>

            <h2 class="content-title inTitle">
              <span class='table-title'>投入</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printAgTableHandle('inputTable', inItems,$event)"></i>
              </span>
            </h2>

            <div class="content-table" ref="inputTable" v-if="show2">
                <!--<el-table class="table-main" :data="checked?inItems.dataAll:inItems.dataFilter" :height="inItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                    <el-table-column v-for="(column,index) in inItems.columns" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                        <template scope="props">
                            <div class="cell-content">
                                <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>-->
              <v-ag
                :table-data="inItems"
                :heights="inItems.height"
                :loading="loading"
              ></v-ag>
            </div>
          </el-tab-pane>

          <el-tab-pane name="sumTable" label="汇总表">
              <!-- 没有使用ag-table 是表格列太少，ag-table会有空白。 如果有替换成ag-table， 使用v-ag组件且 修改打印函数 -->
            <h2 class="content-title outAllTitle">
              <span class='table-title'>产出汇总</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(outAllItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('outputAllTable', $event)"></i>
              </span>
            </h2>
            <div class="content-table" ref="outputAllTable" v-if="show3">
              <el-table class="table-main" :data="checked?outAllItems.dataAll:outAllItems.dataFilter" :height="outAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                <el-table-column v-for="(column,index) in outAllItems.columns1" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                  <template slot-scope="props">
                    <div class="cell-content" v-if="column.prop !== 'batchNo'">
                      <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                    </div>
                    <div class="cell-content" v-else>
                      <span :class="[ bTrack ? '' : 'batchNo']" :title="[bTrack ? '' : '批次追踪']" @click="batchClick(props.row)">{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <!--<v-ag
                :table-data="outAllItems"
                :heights="outAllItems.height"
                :loading="loading"
              ></v-ag>-->
            </div>
            <h2 class="content-title inAllTitle">
              <span class='table-title'>投入汇总</span>
              <span class='table-handle'>
                <i class="icon icon-20 icon-excel" title="导出excle" v-if="excel" @click="exportExcelHandle(inAllItems, $event)"></i>
                <i class="icon icon-20 icon-print" title="打印" v-if="print" @click="printHandle('inputAllTable', $event)"></i>
              </span>
            </h2>

            <div class="content-table" ref="inputAllTable" v-if="show3">
              <el-table class="table-main" :data="checked?inAllItems.dataAll:inAllItems.dataFilter" :height="inAllItems.height" stripe border style="width: 100%;" v-loading="loading" element-loading-text="拼命加载中" row-class-name="table-item">
                <el-table-column v-for="(column,index) in inAllItems.columns1" :key="index" :align="'center'" :fixed="column.fixed" :resizable="true" :label="column.name" :width="column.width">
                  <template slot-scope="props">
                    <div class="cell-content">
                      <span>{{ column.formatter?column.formatter(props.row):props.row[column.prop] }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
                <!--<v-ag
                  :table-data="inAllItems"
                  :heights="inAllItems.height"
                  :loading="loading"
                ></v-ag>-->
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
// import html2canvas from 'html2canvas'
import table from 'components/basic/table.vue'
import rasterizeHTML from 'rasterizehtml'
import VideoDialog from 'components/monitor/dialog.vue'
import agTable from 'components/basic/ag-table.vue'
// import $ from 'jquery'

// 是否开启视频监控。
const CAMERA = 0
// const url = "http://192.168.220.182:8088/api/v1/trace/operation-detail/inout/by-id";
const url = window.HOST + '/api/v1/trace/operation-detail/inout/by-id'

// 产出，退料，结转字段。
const OUT_FIELD = 'outQuantity'
const RETURN_FIELD = 'returnMaterialQuantity'
const CARRY_FIELD = 'carryOverQuantity'

export default {
  components: {
    'v-table': table,
    'v-dialog': VideoDialog,
    'v-ag': agTable
  },
  props: {
    isInChart: {
      required: false,
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      // 追踪产出批次汇总弹窗配置。
      outTrackConfig: {
        visible: false,
        loading: false,
        height: 200,
        // 当前行的数据。
        row: {},
        columns: [
          {
            name: '条码',
            prop: 'barcode'
          },
          {
            name: '工单',
            prop: 'doCode'
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '100'
          },
          {
            name: '质量',
            prop: 'qualityTypeName',
            width: '100'
          },
          {
            name: '班次',
            prop: 'shiftName'
          },
          {
            name: '操作人',
            prop: 'personName',
            width: '120'
          },
          {
            name: '时间',
            prop: 'happenTime',
            width: '200'
          }
        ],
        data: []
      },
      // 是否开启视频监控。
      showCamera: !!CAMERA,
      videoForm: {
        visible: false,
        equipmentId: '',
        equipmentName: '',
        time: ''
      },
      checked: !this.isInChart, // 是否显示全部数据
      activeTabName: 'unitTable',
      excel: true,
      print: true,
      loading: false,
      sErrorMessage: '',
      empty: '暂无数据。',
      styleObject: {
        //  "min-width": "2000px"
      },
      // 是否为追踪页面。
      bTrack: location.pathname.indexOf('trackIndex') > -1,
      tdResize: true, // 是否允许拖动table大小
      condition: {}, // 显示的查询条件
      filters: {},
      dataName: [
        // 条件对应中文名
        {
          itemCode: 'equipmentName',
          itemName: '设备'
        },
        {
          itemCode: 'startTime',
          itemName: '开始时间'
        },
        {
          itemCode: 'endTime',
          itemName: '结束时间'
        }
      ],
      /* 投入 valueFormatter-字段没有时，也会执行。cellRenderer则不会 */
      inItems: {
        filename: '投入',
        columns: [
          {
            headerName: '条码',
            field: 'barcode',
            width: 200
          },
          {
            headerName: '工单',
            field: 'doCode',
            width: 200
          },
          {
            headerName: '批次',
            field: 'batchNo',
            width: 200
          },
          {
            headerName: '物料编码',
            field: 'materialCode',
            width: 200
          },
          {
            headerName: '物料名称',
            field: 'materialName',
            width: 300
          },
          {
            headerName: '数量',
            field: 'quantity',
            width: 100
          },
          {
            headerName: '设备',
            field: 'equipmentName',
            width: 120
          },
          {
            headerName: '模号',
            field: 'moldCode',
            width: 120
          },
          {
            headerName: '班次',
            field: 'shiftName',
            width: 200
          },
          {
            headerName: '操作人',
            field: 'personName',
            width: 120
          },
          {
            headerName: '时间',
            field: 'happenTime',
            width: 200
          },
          {
            headerName: '产出',
            field: OUT_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[OUT_FIELD] || 0
            }
          },
          {
            headerName: '结转',
            field: CARRY_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[CARRY_FIELD] || 0
            }
          },
          {
            headerName: '退料',
            field: RETURN_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[RETURN_FIELD] || 0
            }
          }
        ],
        columns1: [
          {
            name: '条码',
            prop: 'barcode',
            width: '200'
          },
          {
            name: '工单',
            prop: 'doCode',
            width: '200'
          },
          {
            name: '批次',
            prop: 'batchNo',
            width: '200'
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: '200'
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: '300'
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '100'
          },
          {
            name: '设备',
            prop: 'equipmentName',
            width: '120'
          },
          {
            name: '模号',
            prop: 'moldCode',
            width: '120'
          },
          {
            name: '班次',
            prop: 'shiftName',
            width: '200'
          },
          {
            name: '操作人',
            prop: 'personName',
            width: '120'
          },
          {
            name: '时间',
            prop: 'happenTime',
            width: '200'
          },
          {
            name: '产出',
            prop: OUT_FIELD,
            width: '120',
            // 自定义类型。 改字段可能为undefined。 当导出或打印时显示0，而不是''
            type: 'number',
            formatter: function (row, column) {
              return row[OUT_FIELD] || 0
            }
          },
          {
            name: '结转',
            prop: CARRY_FIELD,
            width: '120',
            // 自定义类型。 改字段可能为undefined。 当导出或打印时显示0，而不是''
            type: 'number',
            formatter: function (row, column) {
              return row[CARRY_FIELD] || 0
            }
          },
          {
            name: '退料',
            prop: RETURN_FIELD,
            width: '120',
            // 自定义类型。 改字段可能为undefined。 当导出或打印时显示0，而不是''
            type: 'number',
            formatter: function (row, column) {
              return row[RETURN_FIELD] || 0
            }
          }
        ],
        height: 1,
        dataAll: [],
        dataFilter: [],
        data: [],
        gridOptions: {}
      },
      /* 产出 */
      outItems: {
        filename: '产出',
        columns: [
          {
            headerName: '条码',
            field: 'barcode',
            width: 200,
            cellRenderer: this.createOutItemBarcodeCell
          },
          {
            headerName: '工单',
            field: 'doCode',
            width: 200
          },
          {
            headerName: '批次',
            field: 'batchNo',
            width: 200
          },
          {
            headerName: '物料编码',
            field: 'materialCode',
            width: 200
          },
          {
            headerName: '物料名称',
            field: 'materialName',
            width: 300
          },
          {
            headerName: '数量',
            field: 'quantity',
            width: 100
          },
          {
            headerName: '设备',
            field: 'equipmentName',
            width: 120
          },
          {
            headerName: '模号',
            field: 'moldCode'
          },
          {
            headerName: '质量',
            field: 'qualityTypeName',
            width: 100
          },
          {
            headerName: '班次',
            field: 'shiftName',
            width: 200
          },
          {
            headerName: '操作人',
            field: 'personName',
            width: 120
          },
          {
            headerName: '时间',
            field: 'happenTime',
            width: 200
          }
        ],
        columns1: [
          {
            name: '条码',
            prop: 'barcode',
            width: '200'
          },
          {
            name: '工单',
            prop: 'doCode',
            width: '200'
          },
          {
            name: '批次',
            prop: 'batchNo',
            width: '200'
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: '200'
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: '300'
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '100'
          },
          {
            name: '设备',
            prop: 'equipmentName',
            width: '120'
          },
          {
            name: '模号',
            prop: 'moldCode',
            width: ''
          },
          {
            name: '质量',
            prop: 'qualityTypeName',
            width: '100'
          },
          {
            name: '班次',
            prop: 'shiftName',
            width: '200'
          },
          {
            name: '操作人',
            prop: 'personName',
            width: '120'
          },
          {
            name: '时间',
            prop: 'happenTime',
            width: '200'
          }
        ],
        dataAll: [],
        dataFilter: [],
        data: [],
        height: 1,
        gridOptions: {
          onCellClicked: this.onAgOutItemBarcodeCellClickHandle
        }
      },
      /* 关联表-投产 */
      uniteItems: {
        filename: '产出投入',
        columns: [
          {
            headerName: '条码',
            field: 'barcode',
            width: 285,
            cellStyle: { 'text-align': 'left' },
            cellRenderer: this.createBarcodeCell
          },
          {
            headerName: '类型',
            field: 'opTypeName',
            width: 100
          },
          {
            headerName: '工单',
            field: 'doCode',
            width: 120
          },
          {
            headerName: '批次',
            field: 'batchNo',
            width: 250
          },
          {
            headerName: '物料编码',
            field: 'materialCode',
            width: 120
          },
          {
            headerName: '物料名称',
            field: 'materialName',
            width: 280
          },
          {
            headerName: '数量',
            field: 'quantity',
            width: 120
          },
          {
            headerName: '设备',
            field: 'equipmentName',
            width: 120
          },
          {
            headerName: '模号',
            field: 'moldCode',
            width: 120
          },
          {
            headerName: '质量',
            field: 'qualityTypeName',
            width: 120
          },
          {
            headerName: '班次',
            field: 'shiftName',
            width: 120
          },
          {
            headerName: '操作人',
            field: 'personName',
            width: 120
          },
          {
            headerName: '时间',
            field: 'happenTime',
            width: 200
          }
        ],
        // 打印时重置columns数据。
        columns1: [
          {
            name: '条码',
            prop: 'barcode',
            align: 'left',
            width: '285'
          },
          {
            name: '类型',
            prop: 'opTypeName',
            width: '100'
          },
          {
            name: '工单',
            prop: 'doCode',
            width: '120'
          },
          {
            name: '批次',
            prop: 'batchNo',
            width: '250'
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: '120'
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: '280'
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '120'
          },
          {
            name: '设备',
            prop: 'equipmentName',
            width: '120'
          },
          {
            name: '模号',
            prop: 'moldCode',
            width: '120'
          },
          {
            name: '质量',
            prop: 'qualityTypeName',
            width: '120'
          },
          {
            name: '班次',
            prop: 'shiftName',
            width: '120'
          },
          {
            name: '操作人',
            prop: 'personName',
            width: '120'
          },
          {
            name: '时间',
            prop: 'happenTime',
            width: '200'
          }
        ],
        height: 1,
        // 表格中展示的数据
        data: [],
        // 所有数据
        dataAll: [],
        // 条件过滤后的所有数据
        dataFilter: [],
        gridOptions: {
          enableSorting: false,
          onCellClicked: this.onAgCellClickHandle
        }
      },
      // 有投未产
      inNotOutItems: {
        filename: '有投未产',
        columns: [
          {
            headerName: '条码',
            field: 'barcode',
            width: 285
          },
          {
            headerName: '工单',
            field: 'doCode',
            width: 120
          },
          {
            headerName: '批次',
            field: 'batchNo',
            width: 250
          },
          {
            headerName: '物料编码',
            field: 'materialCode',
            width: 120
          },
          {
            headerName: '物料名称',
            field: 'materialName',
            width: 280
          },
          {
            headerName: '数量',
            field: 'quantity',
            width: 120
          },
          {
            headerName: '设备',
            field: 'equipmentName',
            width: 120
          },
          {
            headerName: '模号',
            field: 'moldCode',
            width: 120
          },
          {
            headerName: '班次',
            field: 'shiftName',
            width: 120
          },
          {
            headerName: '操作人',
            field: 'personName',
            width: 120
          },
          {
            headerName: '时间',
            field: 'happenTime',
            width: 200
          },
          {
            headerName: '结转',
            field: CARRY_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[CARRY_FIELD] || 0
            }
          },
          {
            headerName: '退料',
            field: RETURN_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[RETURN_FIELD] || 0
            }
          }
        ],
        columns1: [
          {
            name: '条码',
            prop: 'barcode',
            width: '285'
          },
          {
            name: '工单',
            prop: 'doCode',
            width: '120'
          },
          {
            name: '批次',
            prop: 'batchNo',
            width: '250'
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: '120'
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: '280'
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '120'
          },
          {
            name: '设备',
            prop: 'equipmentName',
            width: '120'
          },
          {
            name: '模号',
            prop: 'moldCode',
            width: '120'
          },
          {
            name: '班次',
            prop: 'shiftName',
            width: '120'
          },
          {
            name: '操作人',
            prop: 'personName',
            width: '120'
          },
          {
            name: '时间',
            prop: 'happenTime',
            width: '200'
          },
          {
            name: '结转',
            prop: CARRY_FIELD,
            width: '120',
            // 自定义类型。 改字段可能为undefined。 当导出或打印时显示0，而不是''
            type: 'number',
            formatter: function (row, column) {
              return row[CARRY_FIELD] || 0
            }
          },
          {
            name: '退料',
            prop: RETURN_FIELD,
            width: '120',
            // 自定义类型。 改字段可能为undefined。 当导出或打印时显示0，而不是''
            type: 'number',
            formatter: function (row, column) {
              return row[RETURN_FIELD] || 0
            }
          }
        ],
        height: 1,
        dataAll: [],
        dataFilter: [],
        data: [],
        gridOptions: {}
      },
      /* 投入汇总 */
      inAllItems: {
        filename: '投入汇总',
        columns: [
          {
            headerName: '批次',
            field: 'batchNo'
          },
          {
            headerName: '物料编码',
            field: 'materialCode'
          },
          {
            headerName: '物料名称',
            field: 'materialName'
          },
          {
            headerName: '数量',
            field: 'quantity',
            width: 100
          },
          {
            headerName: '产出',
            field: OUT_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[OUT_FIELD] || 0
            }
          },
          {
            headerName: '结转',
            field: CARRY_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[CARRY_FIELD] || 0
            }
          },
          {
            headerName: '退料',
            field: RETURN_FIELD,
            width: 120,
            valueFormatter: function (params) {
              return params.data[RETURN_FIELD] || 0
            }
          }
        ],
        columns1: [
          {
            name: '批次',
            prop: 'batchNo',
            width: ''
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: ''
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: ''
          },
          {
            name: '数量',
            prop: 'quantity',
            width: '100'
          },
          {
            name: '产出',
            prop: OUT_FIELD,
            width: '120',
            formatter: function (row, column) {
              return row[OUT_FIELD] || 0
            }
          },
          {
            name: '结转',
            prop: CARRY_FIELD,
            width: '120',
            formatter: function (row, column) {
              return row[CARRY_FIELD] || 0
            }
          },
          {
            name: '退料',
            prop: RETURN_FIELD,
            width: '120',
            formatter: function (row, column) {
              return row[RETURN_FIELD] || 0
            }
          }
        ],
        height: 1,
        dataAll: [],
        data: [],
        gridOptions: {}
      },
      /* 产出汇总 */
      outAllItems: {
        filename: '产出汇总',
        columns: [
          {
            headerName: '批次',
            field: 'batchNo',
            cellRenderer: this.createOutAllItemBatchNoCell
          },
          {
            headerName: '物料编码',
            field: 'materialCode'
          },
          {
            headerName: '物料名称',
            field: 'materialName'
          },
          {
            headerName: '合格数',
            field: 'qualifiedNum',
            width: 100,
            valueFormatter: function (params) {
              return params.data.qualifiedNum || 0
            }
          },
          {
            headerName: '报废数',
            field: 'scrapNum',
            width: 100,
            valueFormatter: function (params) {
              return params.data.scrapNum || 0
            }
          },
          {
            headerName: '不合格数',
            field: 'unqualifiedNum',
            width: 100,
            valueFormatter: function (params) {
              return params.data.unqualifiedNum || 0
            }
          },
          {
            headerName: '设备',
            field: 'equipmentName',
            width: 120
          },
          {
            headerName: '模号',
            field: 'moldCode',
            width: 120
          }
        ],
        columns1: [
          {
            name: '批次',
            prop: 'batchNo',
            width: ''
          },
          {
            name: '物料编码',
            prop: 'materialCode',
            width: ''
          },
          {
            name: '物料名称',
            prop: 'materialName',
            width: ''
          },
          {
            name: '合格数',
            prop: 'qualifiedNum',
            width: '100',
            formatter: function (row, column) {
              return row.qualifiedNum || 0
            }
          },
          {
            name: '报废数',
            prop: 'scrapNum',
            width: '100',
            formatter: function (row, column) {
              return row.scrapNum || 0
            }
          },
          {
            name: '不合格数',
            prop: 'unqualifiedNum',
            width: '100',
            formatter: function (row, column) {
              return row.unqualifiedNum || 0
            }
          },
          {
            name: '设备',
            prop: 'equipmentName',
            width: '120'
          },
          {
            name: '模号',
            prop: 'moldCode',
            width: '120'
          }
        ],
        height: 1,
        dataAll: [],
        data: [],
        gridOptions: {
          onCellClicked: this.onAgOutAllItemBatchNoCellClickHandle
        }
      },
      //  viewHeight:0
      routerContent: 0,
      // 默认显示关联表，当只有没有投入时，隐藏。
      showUnited: true,
      show1: true,
      show2: false,
      show3: false
    }
  },
  created () {
    this.initData()
    this.fetchData()
  },
  computed: {
    viewHeight: function () {
      return this.routerContent
    },
    resizeY: function () {
      return this.$store && this.$store.state.resizeY
    },
    fullscreen: function () {
      return this.$store && this.$store.state.fullscreen
    },
    treeFullscreen: function () {
      return this.$store && this.$store.state.treeFullscreen
    },
    activeTabChange: function () {
      return this.$store && this.$store.state.activeTabChange
    },
    detailInfos () {
      return this.$store && this.$store.state.detailInfos
    },
    // 版本信息数据。
    isOpDbBeforeRefact () {
      return (
        this.$store &&
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isOpDbBeforeRefact
      )
    }
  },
  mounted () {
    this.routerContent = document.querySelector(
      '.el-tabs__content'
    ).offsetHeight // 获取初始高度
    this.setTableHeight()
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      // 从设备分析过来时，点击tree上的节点时也会重新请求
      // 树上点击!to.meta.title && !this.isInChart
      // 设备分析上点击，只有设备分析里的可调用: 否则会调用两次。
      if (
        (this.isInChart && to.meta.title === 'product') ||
        (!this.isInChart && !to.meta.title)
      ) {
        // 初始化其他显示值。
        this.showUnited = true
        this.show1 = true
        this.show2 = false
        this.show3 = false
        this.activeTabName = 'unitTable'
        this.checked = !this.isInChart

        this.fetchData()
      }
    },
    /* 上下拖动时，重新设置table大小变化 */
    resizeY: 'setTableHeight',
    /* 全屏大小时，重新设置table大小 */
    fullscreen: 'setTableHeight',
    treeFullscreen: 'setTableHeight',
    //      "activeTabChange": function() {
    // if(this.$route.meta.title == 'product' && this.activeTabChange == 'product') {
    //     // 从设备分析的投产表中进来时，页面会错位。。。fixed导致。。。
    //     this.fetchData()
    // }else {
    //     this.setTableHeight()
    // }
    //      },
    activeTabChange: 'setTableHeight',
    /* checked的监听事件，修改显示的数据 */
    checked: function () {
      // checked改变时，表格数据改变
      this.uniteItems.data = this.checked
        ? this.uniteItems.dataAll
        : this.uniteItems.dataFilter
      this.inNotOutItems.data = this.checked
        ? this.inNotOutItems.dataAll
        : this.inNotOutItems.dataFilter
      this.outItems.data = this.checked
        ? this.outItems.dataAll
        : this.outItems.dataFilter
      this.inItems.data = this.checked
        ? this.inItems.dataAll
        : this.inItems.dataFilter
      this.outAllItems.data = this.checked
        ? this.outAllItems.dataAll
        : this.outAllItems.dataFilter
      this.inAllItems.data = this.checked
        ? this.inAllItems.dataAll
        : this.inAllItems.dataFilter

        // 删除关联数据的展开属性
      this.uniteItems.data = this.uniteItems.data.map(o => {
        delete o.isExpand
        return o
      })
    },
    'inItems.data': function () {
      if (!this.inItems.data.length) {
        this.showUnited = false

        // 如果当前默认是显示关联，则处理。
        if (this.show1) {
          this.activeTabName = 'infoTable'
          this.show1 = false
          this.show2 = true
        }
      } else {
        this.showUnited = true
        this.activeTabName = 'unitTable'
        this.show1 = true
        this.show2 = false
        this.show3 = false
      }
    }
  },
  methods: {
    // 获取筛选条件。
    getFilters () {
      let filters = this.condition
      for (let i in filters) {
        if (filters[i] === '' || i === '_tag') {
          delete filters[i]
        }
      }
      /* 为了将获取到的 barcode等转换为对应的中文 */
      let b = Object.entries(filters)
      let a = this.dataName

      b.forEach(o =>
        a.forEach(function (x) {
          if (o[0] === x.itemCode) {
            o[0] = x.itemName
          }
        })
      )
      return b
      /* 为了将获取到的 barcode等转换为对应的中文 */
    },
    initData () {
      if (this.bTrack) {
        // 若为追踪页面，过滤明细产出操作列。
        // this.outItems.columns[0].class = ''
        // this.outItems.columns[0].cellClick = ''
      }

      let aoHide = []

      // 版本信息中显示的列。
      if (this.isOpDbBeforeRefact) {
        aoHide = aoHide.concat([OUT_FIELD, RETURN_FIELD, CARRY_FIELD])
      }

      // 设备分析中显示的列。
      if (this.isInChart) {
        aoHide = aoHide.concat(['equipmentName', 'moldCode'])
      }

      // 存在需隐藏的列，则处理。
      if (aoHide && aoHide.length) {
        this.inItems.columns = this.setColumnHide(this.inItems.columns, aoHide)
        this.outItems.columns = this.setColumnHide(
          this.outItems.columns,
          aoHide
        )
        this.uniteItems.columns = this.setColumnHide(
          this.uniteItems.columns,
          aoHide
        )
        this.inNotOutItems.columns = this.setColumnHide(
          this.inNotOutItems.columns,
          aoHide
        )
        this.outAllItems.columns = this.setColumnHide(
          this.outAllItems.columns,
          aoHide
        )
        this.inAllItems.columns = this.setColumnHide(
          this.inAllItems.columns,
          aoHide
        )
        // 下载处理
        this.inItems.columns1 = this.setColumnHide(
          this.inItems.columns1,
          aoHide
        )
        this.outItems.columns1 = this.setColumnHide(
          this.outItems.columns1,
          aoHide
        )
        this.uniteItems.columns1 = this.setColumnHide(
          this.uniteItems.columns1,
          aoHide
        )
        this.inNotOutItems.columns1 = this.setColumnHide(
          this.inNotOutItems.columns1,
          aoHide
        )
        this.outAllItems.columns1 = this.setColumnHide(
          this.outAllItems.columns1,
          aoHide
        )
        this.inAllItems.columns1 = this.setColumnHide(
          this.inAllItems.columns1,
          aoHide
        )
      }
    },
    /**
     * 设置显示列隐藏。
     * @param {Array} aoColumns 当前所有列。
     * @param {Array} aoHideColumn 当前需隐藏的列。
     * @return {Array} 过滤后的列。
     */
    setColumnHide (aoColumns, aoHideColumn) {
      // 如果是在设备分析里面，则设置column中列隐藏。

      for (let i = 0; i < aoColumns.length; i++) {
        if (aoHideColumn.includes(aoColumns[i].prop || aoColumns[i].field)) {
          aoColumns.splice(i, 1)
          i--
        }
      }

      return aoColumns
    },
    // 隐藏监控视频。
    hideVideoDialog () {
      this.videoForm.visible = false
    },
    // 打开监控视频。
    showVideoDialog (row) {
      this.videoForm = {
        visible: true,
        equipmentId: row.equipmentId,
        equipmentName: row.equipmentName,
        time: row.happenTime,
        type: row.opTypeName === '产出' ? '2' : '1'
      }
    },
    // 请求成功。
    requestSucess (oData) {
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
        out: {
          group: ['batchNo', 'materialCode', 'equipmentId', 'moldCode'],
          dis: [
            'batchNo',
            'materialName',
            'materialCode',
            'equipmentId',
            'equipmentName',
            'moldCode',
            'quantity',
            'qualifiedNum',
            'scrapNum',
            'unqualifiedNum'
          ],
          merge: ['quantity', 'qualifiedNum', 'scrapNum', 'unqualifiedNum']
        },
        // 投入汇总
        in: {
          group: ['batchNo', 'materialCode'],
          // 包含退料等。。。。
          dis: [
            'batchNo',
            'materialName',
            'materialCode',
            'quantity',
            OUT_FIELD,
            RETURN_FIELD,
            CARRY_FIELD
          ],
          // 包含退料结转
          merge: ['quantity', OUT_FIELD, RETURN_FIELD, CARRY_FIELD]
        }
      }

      // 所有数据。
      let oAll = {
        // 投产
        unite: {
          dataAll: [],
          dataFilter: []
        },
        // 有投未产
        inNotOut: {
          dataAll: [],
          dataFilter: []
        },
        // 产出
        out: {
          dataAll: [],
          dataFilter: []
        },
        // 投入
        in: {
          dataAll: [],
          dataFilter: []
        },
        // 产出汇总
        outAll: {
          dataAll: [],
          dataFilter: []
        },
        // 投入汇总
        inAll: {
          dataAll: [],
          dataFilter: []
        }
      }

      // 投入及产出数据排序。
      aoInData = aoInData.sort(
        (oA, oB) =>
          +new Date(oA.happenTime) - +new Date(oB.happenTime) < 0 ? 1 : -1
      )
      aoOutData = aoOutData.sort(
        (oA, oB) =>
          +new Date(oA.happenTime) - +new Date(oB.happenTime) < 0 ? 1 : -1
      )

      // 根据投入记录->找到其只投未产的数据  === 只投未产。
      aoInData.forEach(o => {
        // 先获取改投入的
        o.destinationInfoList.forEach(oNo => {
          let sKey = oMore[oNo.destOpType]

          if (sKey) {
            // 过滤掉不需显示的字段。
            o[sKey] = oNo.srcDeductionQuantity || 0
          }
        })

        // 判断该数据是否有产出。-- 没有产出则将数据放入有投未产中
        if (!(o.outputOpIdList && o.outputOpIdList.length)) {
          // 将数据加入到有投未产中。
          oAll['inNotOut'].dataAll.push(o)
        }
      })

      // 根据产出数据->找到改产出对应的投入数据。 === 投产数据
      aoOutData.forEach(o => {
        // 设置每条记录的合格书、报废数、不合格数
        let sType = o.qualityType

        // 操作id值，对应投入记录中
        let sOperId = o.operationId

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
        let aIn = aoInData.filter(oIn => oIn.outputOpIdList.includes(sOperId))

        if (aIn.length) {
          // 有投入数据--对应icon的显示
          // o.hasIn = true
          o.hasInLen = aIn.length

          // 添加投产数据中的产出数据
          oAll['unite'].dataAll.push(o)

          // 添加投产数据该产出记录对应的投入数据
          oAll['unite'].dataAll.push(...aIn)
        } else {
          // o.hasIn = false
          o.hasInLen = 0

          // 添加投产数据中的产出数据
          oAll['unite'].dataAll.push(o)
        }
      })

      // 设置修改后的产出，投入数据。
      oAll['in'].dataAll = aoInData
      oAll['out'].dataAll = aoOutData

      // 获取投产、有投无产、产出、投入的根据时间过滤后的数据
      if (this.isInChart) {
        for (let sParam in oAll) {
          // 过滤掉了汇总的列。
          if (oAll[sParam].dataAll.length) {
            oAll[sParam].dataFilter = oAll[sParam].dataAll.filter(
              o => startTime <= o.happenTime && o.happenTime <= endTime
            )
          }
        }

        // 投产表中数据修改，产出对应的投入的个数改变了。
        oAll['unite'].dataFilter = oAll['unite'].dataFilter.map(o1 => {
          let o = Object.assign({}, o1)

            // 修改产出的hasInLen字段
          if (o1.hasInLen !== undefined) {
                // 产出- 从过滤后的投入中获取个数
            o.hasInLen = oAll['in'].dataFilter.filter(oIn => oIn.outputOpIdList.includes(o1.operationId)).length
          }

          return o
        })
      }

      // 获取汇总的数据。
      for (let sParam in oAll) {
        // 获取需汇总的处理。
        let sP = sParam.substr(0, sParam.length - 3)

        if (oAll[sP]) {
          oAll[sParam].dataAll = this._sumData(
            oAll[sP].dataAll,
            oGroup[sP].group,
            oGroup[sP].dis,
            oGroup[sP].merge
          )
          // 只有存在需要过滤时，才过滤数据。
          if (this.isInChart) {
            oAll[sParam].dataFilter = this._sumData(
              oAll[sP].dataFilter,
              oGroup[sP].group,
              oGroup[sP].dis,
              oGroup[sP].merge
            )
          }
        }
      }

      // 对于当数据为空时可以隐藏的列的处理。

      ({
        unite: {
          dataAll: this.uniteItems.dataAll,
          dataFilter: this.uniteItems.dataFilter
        },
        inNotOut: {
          dataAll: this.inNotOutItems.dataAll,
          dataFilter: this.inNotOutItems.dataFilter
        },
        out: {
          dataAll: this.outItems.dataAll,
          dataFilter: this.outItems.dataFilter
        },
        in: {
          dataAll: this.inItems.dataAll,
          dataFilter: this.inItems.dataFilter
        },
        outAll: {
          dataAll: this.outAllItems.dataAll,
          dataFilter: this.outAllItems.dataFilter
        },
        inAll: {
          dataAll: this.inAllItems.dataAll,
          dataFilter: this.inAllItems.dataFilter
        }
      } = oAll)

      // 设置关联表数据。
      this.uniteItems.data = this.checked
        ? this.uniteItems.dataAll
        : this.uniteItems.dataFilter
      this.inNotOutItems.data = this.checked
        ? this.inNotOutItems.dataAll
        : this.inNotOutItems.dataFilter
      this.outItems.data = this.checked
        ? this.outItems.dataAll
        : this.outItems.dataFilter
      this.inItems.data = this.checked
        ? this.inItems.dataAll
        : this.inItems.dataFilter
      this.outAllItems.data = this.checked
        ? this.outAllItems.dataAll
        : this.outAllItems.dataFilter
      this.inAllItems.data = this.checked
        ? this.inAllItems.dataAll
        : this.inAllItems.dataFilter

      this.setTableHeight()
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.loading = false
    //   let outDatas = []
    //   let inDatas = []
    //   let uniteDatas = []
    //   let outAllDatas = []
    //   let inAllDatas = []

      this.setTableHeight()
      // 提示信息。
      console.log(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.loading = false
      this.styleObject.minWidth = 0
      this.setTableHeight()
      console.log(err)
      console.log('数据库查询出错。')
    },
    /**
     * 获取汇总的数据
     * @param {Array} 汇总的数据。
     * @param {Array} 合并的字段-- 分类
     * @param {Array} 展示的数据
     * @param {Array} 需汇总的列。
     */
    _sumData (aoList, aGroup, aDis, aMerge) {
      let oFlag = {}

      aoList &&
        aoList.forEach(o => {
          // 需合并的参数值。
          let sKey = ''

          aGroup.forEach(sGroup => (sKey += o[sGroup] + '+'))

          if (!oFlag[sKey]) {
            // 设置展示的值。
            oFlag[sKey] = {}

            aDis.forEach(sDis => (oFlag[sKey][sDis] = o[sDis] || ''))
          } else {
            // 存在，则汇总数据。
            aMerge.forEach(
              sMerge =>
                (oFlag[sKey][sMerge] =
                  Number(oFlag[sKey][sMerge] || 0) + Number(o[sMerge] || 0))
            )
          }
        })

      // 返回数据。
      return window.Rt.utils.getObjectValues(oFlag)
    },
    // 获取数据。
    fetchData () {
      this.loading = true
      let oQuery = {}
      Object.keys(this.$route.query).forEach(el => {
        if (el === 'operationIdList') {
          oQuery[el] = this.$route.query[el]
        }
        if (el === 'equipmentName' || el === 'startTime' || el === 'endTime') {
          this.condition[el] = this.$route.query[el]
        }
      })

      if (!oQuery.operationIdList) {
        oQuery.operationIdList = this.detailInfos.map(o => {
          return {
            opId: o.opId,
            opType: o.opType
          }
        })
      }
      this.filters = this.getFilters()
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        url,
        'post',
        oQuery,
        this.requestSucess,
        this.requestFail,
        this.requestError
      )
    },
    // 批次追踪时获取汇总明细信息。
    getOutDetailListByRow (row) {
      // 获取当前产出的所有数据。
      let aoAll = this.checked
        ? this.outItems.dataAll
        : this.outItems.dataFilter

      // 产出汇总合并字段 group: ["batchNo", "materialCode", "equipmentId", "moldCode"]
      let aoGroup = ['batchNo', 'materialCode', 'equipmentId', 'moldCode']

      // 返回匹配当前行过滤的数据。产出汇总汇总将不存在的字段值设为了"" 因此这边也需处理
      return aoAll.filter(o =>
        aoGroup.every(param => (o[param] || '') === row[param])
      )
    },
    // 批次追踪
    batchClick (row) {
      if (this.bTrack) {
        return 0
      } else {
        // 显示弹窗
        let oBody = document.body || document.documentElement
        this.outTrackConfig.visible = true
        this.outTrackConfig.height = oBody.clientHeight * 0.6
        // 保存当前追踪的行数据。
        this.outTrackConfig.row = row
        this.outTrackConfig.data = this.getOutDetailListByRow(row)
      }
    },
    // 批次追踪弹窗显示。
    outTrackDialogHandle () {
      this.outTrackConfig.visible = false
      // 追踪处理。
      this.gotoBatchTrack(this.outTrackConfig.row)
    },
    // 批次追踪处理。
    gotoBatchTrack (row) {
      // 批次追踪。
      let tag = new Date()
        .getTime()
        .toString()
        .substr(-5) // 生成唯一标识。

      let aoAll = this.checked
          ? this.outItems.dataAll
          : this.outItems.dataFilter
      let oCondition = {
        selected: aoAll.filter(o => o.batchNo === row.batchNo).map(o => {
          return {
            materialCode: o.materialCode,
            batchNo: o.batchNo,
              // barcode: o.barcode,
            snapshotId: o.destSnapshotId
          }
        })
      }
      sessionStorage.setItem('track_' + tag, JSON.stringify(oCondition))
      window.open('trackIndex.html?tag=' + tag)
    },
    // 单件追踪
    barcodeClick (row) {
      if (this.bTrack) {
        return 0
      } else {
        // 单件追踪。
        let tag = new Date()
            .getTime()
            .toString()
            .substr(-5) // 生成唯一标识。
        let oCondition = {
          selected: [
            {
              materialCode: row.materialCode,
              batchNo: row.batchNo,
                // barcode: row.barcode,
              snapshotId: row.destSnapshotId
            }
          ]
        }

        sessionStorage.setItem('track_' + tag, JSON.stringify(oCondition))
        window.open('trackIndex.html?tag=' + tag)
      }
    },
    materialClick (row) {
      let oQuery = {
        batchNo: row.batchNo,
        materialCode: row.materialCode
      }
      let sPath = '/process/restrain'

      this.$router.replace({ path: sPath, query: oQuery })
    },
    // 表格导出。
    exportExcelHandle (oData, event) {
      if (!oData) {
        return
      }

      let oExportData = Object.assign({}, oData)

      oExportData.data = this.checked
        ? oExportData.dataAll
        : oExportData.dataFilter

      // 如果是关联表，则修改columns。
      if (oExportData.columns1) {
        oExportData.columns = oExportData.columns1
      }

      // 下载表格。
      window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oExportData)
    },
    // 关联表格打印
    printAgTableHandle (refTable, oData, event) {
      let oTable = this.$refs[refTable]

      if (!oTable) {
        return
      }

      let nWidth = document.body.clientWidth // parseFloat(oTable.querySelector('.ag-body-container').style.width)

      let oPrintData = Object.assign({}, oData)

      oPrintData.data = this.checked
        ? oPrintData.dataAll
        : oPrintData.dataFilter

      // 根据表格column获取列表。
      let sHeaderHtml = '<thead><tr>'

      oPrintData.columns.forEach(o => {
        sHeaderHtml += `<th class="is-center"><div class="cell">${
          o.headerName
        }</div></th>`
      })

      sHeaderHtml += '</tr></thead>'

      // 表格内容
      let sBodyHtml = '<tbody>'
      oPrintData.data.forEach(oRow => {
        sBodyHtml += `<tr class="el-table__row table-item">`

        oPrintData.columns1.forEach(oCol => {
          let sAlign = oCol.align ? 'is-' + oCol.align : 'is-center'

          // 关联表的特殊处理。
          let nPLeft =
            refTable === 'uniteTable' && oCol.prop === 'barcode'
              ? oRow.hasInLen === undefined ? 50 : 15
              : 0

          sBodyHtml += `<td class="${sAlign}"><div class="cell"><div class="cell-content" style="padding-left: ${nPLeft}px">${
            oRow[oCol.prop] === undefined
              ? oCol.type === 'number' ? 0 : ''
              : oCol.formatter ? oCol.formatter(oRow) : oRow[oCol.prop]
          }</div></div></td>`
        })
        sBodyHtml += '</tr>'
      })
      sBodyHtml += '</tbody>'

      // 不存在数据时。
      let sEmpty = ''
      if (!oPrintData.data.length) {
        sEmpty = `<div class="el-table__empty-block" width=${nWidth}><span class="el-table__empty-text">暂无数据</span></div>`
      }

      let sHtml = `
                <div class="table el-table">
                    <table cellspacing="0" cellpadding="0" border="0" width=${nWidth}>
                        ${sHeaderHtml}
                        ${sBodyHtml}
                    </table>
                    ${sEmpty}
                </div>
                <style>
                    .el-table td.is-center, .el-table th.is-center {
                        text-align: center;
                    }
                    .el-table td.is-left, .el-table th.is-left {
                        text-align: left;
                    }
                    .table thead th {
                        height: 36px;
                        background-color: #42af8f;
                    }
                    .table thead th .cell {
                        color: #fff;
                    }
                    .table tbody tr:nth-child(even) {
                        background-color: #fafafa;
                    }
                    .table tbody tr:nth-child(odd) {
                        background-color: #fff;
                    }
                    .table tbody td {
                        white-space: normal;
                        word-break: break-all;
                    }
                    .table tbody .cell {
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
            `

      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
    },
    // 表格打印。
    printHandle (refTable, event) {
      let oTable = this.$refs[refTable]

      if (!oTable) {
        return
      }

      let sHtml = `
                <div class="table el-table">
                    <div class="el-table__header-wrapper">
                        ${
                          oTable.querySelector('.el-table__header-wrapper')
                            .innerHTML
                        }
                    </div>
                    <div class="el-table__body-wrapper">
                        ${
                          oTable.querySelector('.el-table__body-wrapper')
                            .innerHTML
                        }
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
            `

      window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml)
    },

    // 获取高度。
    adjustHeight () {
      let ntable = 0
      ntable =
        Math.floor(
          this.viewHeight -
          //              - (this.isInChart ? this.outerHeight(document.querySelector(".condition")) : 0)
          (this.isInChart && document.querySelector('.condition')
            ? this.outerHeight(document.querySelector('.condition'))
            : 0) -
          (this.isInChart && document.querySelector('.router-path')
            ? this.outerHeight(document.querySelector('.router-path'))
            : 0) -
          30 - //   this.outerHeight(document.querySelector(".el-tabs__header")  初始渲染的时候会有问题
          56 - //   this.outerHeight(document.querySelector(".content-title.outTitle"))
          66 - //   this.outerHeight(document.querySelector(".content-title.inTitle"))
            20 // 表格margin-bottom
        ) / 2

      return ntable
    },
    /* 获取元素实际高度(含margin) */
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    /* 设置table实际高度 */
    setTableHeight () {
      // if(this.$route.meta.title == 'product') {
      this.routerContent = document.querySelector(
        '.el-tabs__content'
      ).offsetHeight
      this.uniteItems.height = this.inNotOutItems.height = this.inAllItems.height = this.outAllItems.height = this.inItems.height = this.outItems.height = this.adjustHeight()
      // }
    },
    /* 设置title */
    setTitle (el, title) {
      let elTds = document.querySelectorAll(el)
      elTds.forEach((el, index) => {
        if (elTds[index].tagName.toLocaleLowerCase() === 'td') {
          el.setAttribute('title', title)
        }
      })
    },
    /* 点击产出 展开或收拢投入 */
    handleEdit (index, props, event) {
      let elArr = []
      const num = props.row.hasInLen // props.row.in.length
      const icon = event.target
      let jParent = event.target.closest('.content-table')
      const trs = jParent
        .querySelectorAll('.el-table__body-wrapper')[0]
        .querySelectorAll('tr')
      //          const trsFix = jParent.querySelectorAll(".el-table__fixed-body-wrapper")[0].querySelectorAll("tr")

      for (let i = 0; i < num; i++) {
        elArr.push(trs[index + i + 1])
        //              elArr.push(trsFix[index + i + 1])
      }
      if (icon.classList.contains('actived')) {
        // 判断是否隐藏
        elArr.forEach(el => {
          return el.classList.remove('hide')
        })
        icon.classList.remove('actived')
      } else {
        elArr.forEach(el => {
          return el.classList.add('hide')
        })
        icon.classList.add('actived')
      }
    },
    /* tab切换 */
    tabChange (tab, event) {
      this.activeTabName = tab.name

      // const index = tab.index
      // 由于tab个数不定，不能用index处理
      switch (tab.name) {
        case 'unitTable':
          this.show1 = true
          this.show2 = false
          this.show3 = false
          break
        case 'infoTable':
          this.show1 = false
          this.show2 = true
          this.show3 = false
          break
        case 'sumTable':
          this.show1 = false
          this.show2 = false
          this.show3 = true
          break
      }
    },

    /**
     * 关联表中 单元格点击事件
     * - 折叠展开事件
     * - 显示视频监控
     */
    onAgCellClickHandle (params) {
      let target = params.event.target

      // 判断当前target
      if (target.classList.contains('icon-down')) {
        // 表格折叠操作函数
        this.onUniteItemExpandHandle(params)
      } else if (target.classList.contains('icon-camera')) {
        // 显示视频监控函数。
        this.showVideoDialog(params.data)
      }
    },
    // 关联表数据展开，折叠操作函数
    onUniteItemExpandHandle (params) {
      // 保存当前表格的scrollTop值
      let nScrollTop = this.$refs.uniteTable.querySelector('.ag-body-viewport')
        .scrollTop

      let {
        operationId: sOpId,
        hasInLen: nLen,
        isExpand: bExpand
      } = params.data

      let nRowIndex = params.rowIndex

      // 当前表格中展示的数据
      let {
        data: aDis,
        dataAll: aoAll,
        dataFilter: aoFilter
      } = this.uniteItems

      let aoAllDis = this.checked ? aoAll : aoFilter

      if (bExpand) {
        // 新增属性

        // 从所有数据中获取当前产出对应的投入数据
        let nIndex = aoAllDis.findIndex(o => o.operationId === sOpId) // 产出所处与所有数据中的位置
        let aIn = aoAllDis.filter(
          (o, nIn) => nIn > nIndex && nIn <= nIndex + nLen
        )

        delete aDis[nRowIndex].isExpand

        aDis.splice(nRowIndex + 1, 0, ...aIn)
      } else {
        // 删除属性
        aDis[nRowIndex].isExpand = true

        aDis = aDis.filter(
          (o, nIn) => !(nIn > nRowIndex && nIn <= nRowIndex + nLen)
        )
      }

      this.uniteItems.data = aDis

      // 设置当前表格的scrollTop值。
      setTimeout(() => {
        this.$refs.uniteTable.querySelector(
          '.ag-body-viewport'
        ).scrollTop = nScrollTop
      }, 0)
    },
    // 关联表中条码列。
    createBarcodeCell (params) {
      let { data } = params

      let nPLeft = data.hasInLen === undefined ? 50 : 15

      let showCamera = this.showCamera

      return `<div class="cell-content" style="padding-left: ${nPLeft}px">
                ${data.hasInLen ? `<i class="icon-down el-icon-arrow-down ${data.isExpand ? 'actived' : ''}"></i>` : ''}
                ${showCamera ? `<i class="icon icon-12 icon-camera" title="视频监控"></i>` : ''}
                <span>${data.barcode}</span>
               </div>`
    },
    // 产出表中的条码列。
    createOutItemBarcodeCell (params) {
      let { data } = params

      let bTrack = this.bTrack

      return `<div class="cell">
                <div class="cell-content">
                   ${bTrack ? `<span>${data.barcode}</span>` : `<span class="barcode" title="条码追踪">${data.barcode}</span>`}
                </div>
              </div>
              `
    },
    // 产出中条码列点击函数
    onAgOutItemBarcodeCellClickHandle (params) {
      if (params.event.target.classList.contains('barcode')) {
        this.barcodeClick(params.data)
      }
    },
    // 产出汇总中的批次列
    createOutAllItemBatchNoCell (params) {
      let { data } = params

      let bTrack = this.bTrack

      return `<div class="cell">
                <div class="cell-content">
                  ${bTrack ? `<span>${data.batchNo}</span>` : `<span class="batchNo" title="批次追踪">${data.batchNo}</span>`}
                </div>
              </div>`
    },
    // 产出汇总中批次列点击函数
    onAgOutAllItemBatchNoCellClickHandle (params) {
      if (params.event.target.classList.contains('batchNo')) {
        this.batchClick(params.data)
      }
    }
  }
}
</script>

<style lang="less">
.outTrack-dialog-wrap {
  .el-dialog__body {
    padding: 20px;

    .dialog-footer {
      margin-top: 20px;
      text-align: center;
    }
  }
}
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
      margin-left: 20px;
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
    color: #ffffff;
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
  .lchildText {
    padding-left: 50px;
  }
}

.show {
  transition: display 400ms;
}

.hide {
  opacity: 0;
  display: none;
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

.innner-content .search-tab {
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
      display: none;
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
.condition {
  padding-top: 4px;
  padding-bottom: 4px;
  .condition-messsage {
    line-height: 23px;
  }
}
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
        cursor: pointer;
      }
    }
  }
  .table-table {
    i {
      margin: 5px;
    }
  }
}
/deep/.product {
  .el-tabs__header {
    .el-tabs__nav-wrap {
      &::after {
        height: 0 !important;
      }
    }
  }
}

</style>
