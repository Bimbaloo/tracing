﻿## 更新日志
### 2.0.3
1. 修改物料明细表缩放的表格高度设置报错的问题。
2. bug修改
	+ [追溯分析-前端-溯源-条码，设备分析时间轴的可疑品按钮与工艺-工艺参数中的可疑品按钮判断是否显示的方法不一致#2707](http://192.168.20.15/issues/2707)
	+ [追溯分析-前端-溯源-条码，设备分析-工艺-工艺参数中，曲线图切换成条码表再切回曲线图后台会报错#2706](http://192.168.20.15/issues/2706)
  + [追溯分析-前端-溯源-条码，开了F12后台窗口后，可疑品列表放大展开，最下方表格不停闪。#2690](http://192.168.20.15/issues/2690)
	+ [追溯分析-前端-遏制列表-遏制报告，遏制报告下载后，报告中的遏制清单表格不美观。#2692](http://192.168.20.15/issues/2692)
	+ [追溯分析-前端-溯源-条码，视频监控页面修改时间时，后台报错#2527](http://192.168.20.15/issues/2527)
	+ [追溯分析-前端-设置-工厂定制-视频监控，工艺参数视频监控配置没有效果#2681](http://192.168.20.15/issues/2681)
	+ [追溯分析-前端-追踪-条码，物料节点和工序节点的可疑品列表中，遏制按钮不在同个位置，建议一致#2670](http://192.168.20.15/issues/2670)
	+ [追溯分析-前端-遏制-设备，框选时间范围，点击加工查看投产表后再返回，无法点击还原按钮还原时间轴#2666](http://192.168.20.15/issues/2666)
	+ [追溯分析-前端-遏制-设备，工艺-工艺参数中点击可疑品，路径中没有可疑品#2665](http://192.168.20.15/issues/2665)
	+ [追溯分析-前端-溯源-条码，物料明细中先点批次遏制，再点击条码时，没有显示遏制按钮#2664](http://192.168.20.15/issues/2664)
	+ [追溯分析-前端-溯源-条码，监控时间与选择的时间不一致，监控名称建议为：工艺监控，与其他维度一致#2650](http://192.168.20.15/issues/2650)
	+ [追溯分析-前端-遏制-物料，不修改遏制详情里面前一次遏制的内容，直接点确定遏制后，遏制列表里遏制详情列没有内容#2586](http://192.168.20.15/issues/2586)
	+ [追溯分析-前端-溯源-条码，物料明细中，建议点击条码生成可疑品列表时，把条件显示出来，与物料+批次，设备+时间一致#2649](http://192.168.20.15/issues/2649)
	+ [追溯分析-前端-溯源-条码，按原料条码遏制时，提示批次不能为空，调用接口错误#2648](http://192.168.20.15/issues/2648)
	+ [追溯分析-前端-遏制列表-遏制清单，遏制清单显示成了遏制原因#2631](http://192.168.20.15/issues/2647)
	+ [追溯分析-前端-溯源-物流码，物流码为空时的提示方式，与其他查询条件为空时的提示方式不一致#2631](http://192.168.20.15/issues/2631)
	+ [追溯分析-前端-查出库-条码，遏制清单前端读取返回数据时，显示错误#2635](http://192.168.20.15/issues/2635)
	+ [追溯分析-前端-可疑品-遏制，遏制完后遏制按钮不显示，再用其他条码查询进入可疑品界面也不会显示遏制按钮#2582](http://192.168.20.15/issues/2582)
	+ [追溯分析-前端-遏制报告，优化遏制报告内容显示#2698](http://192.168.20.15/issues/2698)
3. 履历新增类型
4. 追溯主图节点线点击高亮
5. 自定义字段新增功能
### 2.0.2
1. bug修改：
	+ [追溯分析-前端-追踪-条码，设备分析-工艺参数中无法查看视频监控#2571](http://192.168.20.15/issues/2571)
	+ [追溯分析-前端-溯源-条码，物料明细中点击批次时，调用了条码接口，接口调用错误#2623](http://192.168.20.15/issues/2623)
2. 遏制列表状态值修改
3. 查询结果集增加起点明细信息已选中项提示

### 2.0.2-RC
1. 遏制报告
2. bug修改：追溯起点集表格高度问题，fgb下载图片对齐问题，设备分析时间修改后查询按钮不隐藏问题 [#2526](http://192.168.20.15/issues/2526) [#2566](http://192.168.20.15/issues/2566) [#2567](http://192.168.20.15/issues/2567)
3. 物料节点条码遏制，只支持原料码；遏制：条码遏制
4. 产线型工序：完整的工序链（没有投产记录的工序也显示）
5. bug修改：	
	+ [追溯分析-前端-遏制列表，遏制列表头增加排序功能#2601](http://192.168.20.15/issues/2601)
	+ [追溯分析-前端-遏制列表，遏制列表增加遏制编号一列#2598](http://192.168.20.15/issues/2598)
	+ [追溯分析-前端-遏制-遏制列表，查看详情中取消遏制按钮在滚动条上#2595](http://192.168.20.15/issues/2595)
	+ [追溯分析-前端-遏制-设备分析-投产表，投产表报错#2592](http://192.168.20.15/issues/2592)
	+ [追溯分析-前端-遏制-物料，不修改遏制原因里面前一次遏制的内容，直接点确定遏制后，遏制列表里遏制原因列没有内容#2586](http://192.168.20.15/issues/2586)
	+ [追溯分析-前端-遏制-物料，切换遏制条件后，遏制列表显示不正确#2585](http://192.168.20.15/issues/2585)
	+ [追溯分析-前端-可疑品-遏制，遏制完后遏制按钮不显示，再用其他条码查询进入可疑品界面也不会显示遏制按钮#2582](http://192.168.20.15/issues/2582)
	+ [追溯分析-前端-设备分析-工艺参数，老业务库不支持可疑品功能，应该不显示可疑品按钮#2565](http://192.168.20.15/issues/2565)
	+ [追溯分析-前端-溯源-条码，工艺参数条码表没有数据的话也会显示条码表#2564](http://192.168.20.15/issues/2564)
	+ [追溯分析-前端-遏制-可疑品遏制，当有权限验证时，遏制提示用户未登陆#2533](http://192.168.20.15/issues/2533)
	+ [追溯分析-前端-遏制列表-设备查询，改变查询条件再次查询时，请求的参数未更新#2525](http://192.168.20.15/issues/2525)
	+ [追溯分析-前端-遏制，可疑品列表或模具记录无数据时，依然可以遏制#2535](http://192.168.20.15/issues/2535)
	+ [追溯分析-前端-遏制，按物料和模具查询时，无数据的提示不一致#2534](http://192.168.20.15/issues/2534)
	+ [追溯分析-前端-遏制-模具，模具记录中规格显示不正确#2532](http://192.168.20.15/issues/2532)
	+ [追溯分析-前端-遏制-模具，勾选模具记录查可疑品时，可疑品列表页面元素不完整#2530](http://192.168.20.15/issues/2530)
	+ [追溯分析-前端-遏制-模具，勾选模具记录查可疑品时，提示信息不正确#2529](http://192.168.20.15/issues/2529)
6. 修改设备分析下设备状态提示，设备名称显示不正确的问题
7. 修复设备分析不同维度事件点悬浮框设备名称无法显示的问题


### 2.0.1
1. 修复设备分析时间点tooltip重复点击报错的问题
2. 主图容器清空只显示总数
3. 可疑品清单进度表格不显示‘暂无数据’
4. 老业务库中投产表BOM扣减数不显示
5. 老业务库中追溯主图节点连线不显示数字
6. 修改日期控件为24h制
7. 工艺参数查看视频监控
8. 主图数据结构改变后相关内容修改
9. detail页面中，重新打开页面标签复制url问题修改
10. 产线型工序详情显示到组外，产线中工序不显示
11. 投产表-投产关联表扣减数一列数据显示修改


### 2.0.1-RC
1. 追溯主图修改：明细显示数字（物料，工序，其他）其中滞留数只在新版本的追踪中显示
2. 主图图片导出：修改导出格式为svg
3. 将快速报告名称修改为可疑品清单
4. 老业务库取消遏制及可疑品显示功能
5. 追溯主图中滞留数不为0时颜色设为红色
6. 追溯主图连线上有物料节点，则不显示扣减数
7. 设备分析中时间跨度修改，不能超过前后各一天
8. 修改bug 2475 2491 2422 2941
9. 产出记录时间为空时查询报错
10. 追溯主图连线上的提示文字
11. 遏制功能全检问题，设备+时间的遏制接口修改

### 2.0.0
1. element ui 框架升级，样式等问题修改
2. 解决1.0版本遗留问题（物料等查询条件缓存；追溯主图表格详情缩放问题）
3. 增加遏制

### 1.0.2
1. 物料多选下拉框支持搜索属性设置
2. 配置页面中弹窗闪一下问题修改
3. 历史查询偶尔出现乱码问题修改
4. 追溯主图原条码取值修改：destBarcode改为barcode


### 1.0.1
1. 追溯起点结果集增加汇总表
2. 追溯起点结果集筛选时定位到改列
3. 设备分析图形中时间修改增加查询按钮
4. 溯源设备分析追踪时可配置设备及开始结束时间
5. 投产表汇总追踪时会显示当前汇总的详细列表
6. 投产表当没有投入记录时不显示关联表tab
7. 工艺参数页面中图形及表格切换问题修改，及表格变形问题修改
8. 页面路由数据缓存 设备分析相关页面修改
9. 配置页面：自定义查询改变顺序保存问题修改；工厂定制弹窗保存问题修改
10. 履历页面中出库详细信息修改；bom表排序修改


### 1.0.0-RC2
1. 追溯结果集表格可复制
2. 追溯左侧导航树bug修改
3. 条码查询新增显示参数
4. 新增产出记录功能
5. 仓储信息表格修改
6. 新增查询历史记录
7. 自定义配置修改

### 1.0.0-RC
1. 追溯结果集查询替换表格组件
2. 追溯结果集中模号如果为空时，改列隐藏修改
3. 修改detail页清空cookie后直接访问页面问题
4. 下拉框组件匹配通过enter键选中
5. 追溯左下角红线修改
6. 断链修复相关修改
7. 设备分析功能修改
8. 工艺参数页面修改
9. fgb页面修改
10. 质检显示列修改
11. 快速报告相关修改
12. 修改追踪主图详情显示问题
13. 修改追溯主图图片下载功能
14. 修改履历列宽、显示顺序等
15. 溯源、追踪左侧导航修改
16. 追踪页面错误提示修改

### 0.6.1
1. 查出库可疑品路由问题修改
2. 临时屏蔽遏制按钮
3. 修改投产表汇总计算错误问题
4. 投产表添加切换显示缩放时间内/所有班次时间内数据的功能


### 0.6.0
1. 追溯起点集表格全选传参问题修改


### 0.6.0-RC
1. 查出库面板中增加条码查询入口
2. 单点登录功能增加
3. 投产表展现方式修改，只展现与起点相关的数据
4. 设备分析展示与起点相关数据修改
5. 修改快速报告报告人为登录人
6. 开放溯源投产表中的条码追踪和批次追踪功能
7. 悬浮框按钮名称修改为关闭（issues/1477）
8. 主页添加自定义查询条件配置的入口（issues/1475)


### 0.5.2
1. 断链删除功能过滤：只能删除修复的
2. 增加工序过滤图标，修复的图标
3. 修改编辑模式下连线问题
4. search页增加版本号
5. 断链数据等高显示
6. 追溯主图增加详情功能
7. 工艺参数、FGB检验页面开发
8. 质检下载功能修改（issues/1472）
9. 表格序号修改（issues/1473）
10. 工具记录表修改（issues/1474）
11. 设备分析提示框左右翻转功能开发（issues/1470）


### 0.5.1
1. 断链功能。
2. 查出库中表格里条码上鼠标样式
3. 设备分析提示框增加点击头部时间关闭的功能。

### 0.5.0
1. 修改设备分析提示框显示位置，默认在鼠标位置的右10px，下10px处；
2. 修复追溯主页面刷新之后设备分析不能正常显示的问题；
3. 快速报告页面，在非起点集查询的情况下，不发起查询结果集的请求。
4. 修改质检表格列参数；修改质检、工具表格列宽度。

### 0.5.0-RC
1. 修改鼠标距离事件点超出一定范围不显示悬浮框的距离问题；-1457
2. 修改区域缩放按钮选中样式；-1459
3. 修改提示面板自适应缩放大小；-1458
4. 溯源-设备分析开发按照设备+时间追踪功能；
5. 溯源-投产表开发单件追踪(点击条码)和批次追踪(点击批次)功能；
6. 增加溯源页面跳转到追踪页面的快速报告功能(相应增加了3个快速报告接口);
7. 对所有页面引入ElementUI，将ElementUI打包到公共js，减少每个页面js大小；
8. 设备分析跳转链接鼠标移入置于顶层。


### 0.4.3
1. 修改设备分析路由跳转层级不对问题；
2. 优化设备分析功能：
	+ 鼠标距离事件点超出一定范围不显示悬浮提示框；
	+ 维度按钮、追溯相关按钮与点击显示的面板绑定，共同显示或隐性；
	+ 开启区域缩放功能，悬浮提示框不显示(修改了echarts源码，需要在包里面替换)；
3. 修改接口地址配置方法，在打包之后不需要更换html的中的configs引用地址，将configs配置文件放在static文件夹下，static文件夹需要打包后在dist下创建；
4. 修改设备分析的接口地址，和传参名称。
5. 修改投产表接口传参。


### 0.4.1-RC
1. 修改追溯起点集限制条件；
2. 修改追踪起点集页面左侧面板宽度；
3. 修改设备分析跳转时间轴缩放值改变问题；
4. 质检、送检、投产表等相关页面表格打印、下载功能修改。
5. IE主页显示问题修改
6. 溯源左侧树数据问题修改
7. 履历输入框宽度修改

1. 溯源起点结果集增加按照时间排序；
2. 遏制设备分析开发；
3. 起点集多选功能修改。
4. 履历时间排序问题
5. 配置页面保存问题
6. 时间控件问题
7. 表格加载高度问题


1. 日期格式修改
2. 配置页面保存信息修改
3. 浏览器返回空白问题修改

### 0.4.0-RC
1. 履历重构： 展开图标；排序
2. select下拉框：
	+ 加载数据时提示
	+ 跳转时显示code+name
	+ 下拉数据按code排序： 后台处理
3. title名称修改
4. 快速报告：设备，物料等参数名显示问题：code+name
5. 首页： 在小屏时，字体变为14px
6. 追踪溯源 设备类型字段改变，提示字段修改
7. 溯源左侧树结构更改
8. 溯源，快速报告传值修改
9. 表格高度更改

10. 设备分析修改；
11. 起点相关投产标记；
12. 设备分析链接跳转页面增加；
13. 溯源页面左侧面板缩放bug；
14. 质检，送检，fgb检验传参修改