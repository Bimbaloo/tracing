// 主页search数据转换。
var parseData = function (aoGet) {
  // 每一项对应的跳转地址。
  let oTurnTo = {
    // 查出库。
    'stock': 'detail',
    // 溯源。
    'trace_up': 'detail',
    // 追踪。
    'trace_down': 'detail',
    // 一般遏制。
    'suppress': 'restrain',
    // 一般遏制。
    'qtSuppress': 'restrain',
    // 履历。
    'resume': 'resume',
    // 断链。
    'link_repair': 'chain'
  }

  // 类型判断处理。
  let oType = {
    'materialCode': 'select',
    'equipmentCode': 'select',
    'processCode': 'select',
    'personCode': 'select',
    'startTime': 'datetime',
    'endTime': 'datetime'
  }

  // 排序处理。
  aoGet.sort((a, b) => a.moduleOrder > b.moduleOrder)

  // 数据转换。
  let aResult = aoGet.map(oModule => {
    let oItem = {
      url: oTurnTo[oModule.moduleCode],
      key: oModule.moduleCode,
      title: oModule.moduleName,
      list: []
    }

    // 修改list的值。
    oItem.list = oModule.groups.map((oGroup, index) => {
      let oList = {
        groupOrder: oGroup.groupOrder + '',
        title: oGroup.groupName,
        key: oGroup.groupOrder + '',
        items: []
      }

      // 修改items的值。
      oList.items = oGroup.groupItems.map(o => {
        let sName = o.itemName
        let sPlaceHolderName = o.itemName

        // 如果是履历的话固定名称。
        if (oModule.moduleCode === 'resume') {
          sName = '成品条码'
          sPlaceHolderName = '成品条码或扫码'
        }

        return {
          name: sName,
          key: o.itemCode,
          type: oType[o.itemCode] || 'input',
          placeholder: (oType[o.itemCode] === 'select' ? '请选择' : '请输入') + sPlaceHolderName
        }
      })
      return oList
    })

    return oItem
  })

  return aResult
}

// 转换树数据。
var parseTreeData = function (oTreeData, sPageType, bIsOld) {
  // 转换后的数据
  let oCopyTreeData = JSON.parse(JSON.stringify(oTreeData))
  let {nodeList, linkList, productionLineInfo} = oCopyTreeData
  let nGroupIndex = nodeList.length

  // 修改数据，添加group的数据，并将子工序增加group字段。
  nodeList.forEach(o => {
      // 修改节点的类型。
    let oNodeType = getNodeIconAndTemp(o.nodeType)
      // 设置icon类型和detailType
    o.iconType = oNodeType.icon

    // 判断是否需要显示滞留数
    o.isShowRemain = !bIsOld && sPageType === 'track'

    // 判断是否为组。
    if (o.groupCode && !o.group) {
      // 新增组数据。
      let oGroup = {
        code: o.groupCode,
        name: o.groupName,
        key: 'group' + (++nGroupIndex),
        parentKeys: [],
        // parents: '',
        nodeType: 10001, // 节点类型-工序
        opType: 10001, // 动作类型-工序
        isGroup: true,
        groupCode: null,
        groupName: null,
        groupSeq: null,
        detailInfo: {},
        isShowRemain: o.isShowRemain,
        processingNum: -9999,
        remainNum: -9999,
        totalNum: -9999
      }

      // 找到该组下的所有子节点，设置该组中子工序的group值。
      o.group = oGroup.key
      let aSub = _getSubGroupNode(o)

      // 获取该group新插入的数据
      let aAddToGroup = productionLineInfo[o.groupCode]

      aAddToGroup = (sPageType === 'trace' ? aAddToGroup.reverse() : aAddToGroup)

      if (aAddToGroup && aAddToGroup.length && aAddToGroup.length !== aSub.length) {
        // 存在且有插入的节点。
        aAddToGroup = aAddToGroup.map((oa, nIn) => {
          // 判断当前oa是否存在aSub中，不存在则加入。
          let oFind = aSub.find(os => os.code === oa.processCode)

          if (!oFind) {
            // 不存在
            return {
              code: oa.processCode,
              name: oa.processName,
              key: 'groupAdd' + (++nGroupIndex),
              nodeType: 10001, // 节点类型-工序
              opType: 10001, // 动作类型-工序
              group: oGroup.key,
              groupCode: oGroup.code,
              groupName: oGroup.name,
              iconType: o.iconType,
              detailInfo: {
                equipmentOpIdMap: (() => {
                  let oMap = {}
                  oa.equipmentIdList.forEach(sId => {
                    oMap[sId] = []
                  })
                  return oMap
                })(),
                materialInfoList: [],
                opIdList: [],
                shiftEndTime: sPageType === 'track' ? aSub[aSub.length - 1].detailInfo.shiftEndTime : aSub[0].detailInfo.shiftEndTime,
                shiftStartTime: sPageType === 'track' ? aSub[0].detailInfo.shiftStartTime : aSub[aSub.length - 1].detailInfo.shiftStartTime
              },
              isShowRemain: o.isShowRemain,
              processingNum: -9999,
              remainNum: -9999,
              totalNum: -9999
            }
          } else {
            return Object.assign({}, oFind)
          }
        })

        // 断开aSub中的连线
        aSub.forEach((os, nIn) => {
          if (nIn !== aSub.length - 1) {
            _removeLine(os.key, aSub[nIn + 1].key)
          }
        })

        // 修改parentKeys
        aAddToGroup.forEach((oa, nIn) => {
          nIn === 0 ? oa.parentKeys = aSub[0].parentKeys : oa.parentKeys = [aAddToGroup[nIn - 1].key]

          // 将点加入到数据中，并创建连线
          if (!aSub.find(os => os.key === oa.key)) {
            nodeList.push(oa)
          } else {
            nodeList.find(os => os.key === oa.key).parentKeys = oa.parentKeys
          }

          if (nIn !== aAddToGroup.length - 1) {
            _addLine(oa.key, aAddToGroup[nIn + 1].key)
          }

          // 修改连线，组内的工序到 组外的节点之间连线(第一个及最后一个除外)
          if (!nIn || nIn !== aAddToGroup.length - 1) {
            _setFromNodeLineSport(oa.key, aAddToGroup)
          }
        })

        if (aAddToGroup[aAddToGroup.length - 1].key !== aSub[aSub.length - 1].key) {
          // 替换修改其他节点parentKeys
          let sOldKey = aSub[aSub.length - 1].key
          let sNewKey = aAddToGroup[aAddToGroup.length - 1].key

          nodeList.forEach(on => {
            if (on.parentKeys.includes(sOldKey) && !aAddToGroup.some(oa => oa.key === on.key)) {
              on.parentKeys = on.parentKeys.filter(s => s !== sOldKey)
              on.parentKeys.push(sNewKey)
            }
          })
        }
      }

      // 节点之间增加连线。
      // console.log(aAddToGroup)

      if (aSub.length) {
        // 修改连线中to为第一个节点的key值； 修改from为最优一个节点的key值
        _updateLineKey([{type: 'to', key: aSub[0].key, newKey: oGroup.key}, {type: 'from', key: aSub[aSub.length - 1].key, newKey: oGroup.key}])
          // 设置group的显示值，为所有工序的和. 加工树/滞留数/产出总数
        aSub.forEach(oSub => {
          if (oGroup.isShowRemain) {
            if (oSub.processingNum >= 0) {
              oGroup.processingNum = oGroup.processingNum < 0 ? oSub.processingNum : (oGroup.processingNum + oSub.processingNum)
            }
            if (oSub.remainNum >= 0) {
              oGroup.remainNum = oGroup.remainNum < 0 ? oSub.remainNum : (oGroup.remainNum + oSub.remainNum)
            }
          }
          if (oSub.totalNum >= 0) {
            oGroup.totalNum = oGroup.totalNum < 0 ? oSub.totalNum : (oGroup.totalNum + oSub.totalNum)
          }
        })
      }

      // 将新增的group组数据放入数组中。
      nodeList.push(oGroup)
    }
  })

  // 返回数据。
  return {
    nodeList,
    linkList
  }

  /**
  * 修改连线的位置，修改fromKey为sKey的线
  */
  function _setFromNodeLineSport (sKey, aoData) {
    linkList.forEach(o => {
      // 中间节点到组外节点的连线
      if (o.from === sKey && !aoData.some(og => og.key === o.to)) {
        o.fromPort = 'FROMTOP'
        o.toPort = 'TO'
      }
    })
  }

  /**
  * 修改节点[{type:'to',key:1,newKey:3},{type:'from',key:2,newKey:3}]
  */
  function _updateLineKey (aoUpdated) {
    aoUpdated.forEach(o => {
          // 所有线的数据中匹配
      linkList.forEach(oLink => {
        // 修改group组的线，只是处理存在以前的线
        if (oLink[o.type] === o.key && !oLink.isAddNew) {
          oLink[o.type] = o.newKey
        }
      })
    })
  }

  /**
  * 新增连线
  */
  function _addLine (fromKey, toKey) {
    linkList.push({
      from: fromKey,
      to: toKey,
      fromPort: 'FROM',
      toPort: 'TO',
      isAddNew: true
    })
  }

  /**
  * 断开连线
  */
  function _removeLine (fromKey, toKey) {
    linkList = linkList.filter(ol => !(ol.from === fromKey && ol.to === toKey))
  }

  /**
   * 获取节点下的所有工序数据。
   * @param {Object}
   * @return {Array}
   */
  function _getSubGroupNode (o) {
    let aSub = []

    aSub.push(o)
    // 循环处理数据。获取该节点同组数据的集合。
    _getSubGroup(o)

    // 根据key值排序
    aSub = aSub.sort((o1, o2) => o1.key - o2.key > 0 ? 1 : -1)

    return aSub

    /**
     * 获取该节点的同组数据。
     * @param {Object}
     * @return {NULL}
     */
    function _getSubGroup (oNode) {
      // 工序
      let aReuslt = []
      aReuslt = _get(oNode)

      if (aReuslt.length) {
        aReuslt.forEach(oSub => {
          oSub.group = oNode.group
          aSub.push(oSub)
          _getSubGroup(oSub)
        })
      }

      function _get (oLevel) {
        return nodeList.filter(o => {
          // 当前数据父级包含且属于同一个组。
          return o.groupCode === oLevel.groupCode && linkList.some(oLink => oLink.from === oLevel.key && oLink.to === o.key)
        })
      }
    }
  }
}

// 获取节点图标及显示模板
var getNodeIconAndTemp = function (sType) {
  let oIcon = {
    icon: ''
  }

  switch (sType) {
    // 库存转储
    case 101:
    // 库存调整
    case 112:
     // 入库
    case 102:
    // 出库
    case 103:
    // 库存损益
    case 111:
    // 到货登记
    case 23:
    // 退货
    case 24:
      oIcon.icon = 'warehouse'
      break
    case 1:
    // 产出
    case 6:
    // 工序-- 工序显示一个模板。
    case 10001:
      oIcon.icon = 'process'
      break
      // 结转转入
    case 2:
    // 结转转出
    case 7:
      // 结转
    case 10002:
    // 退料
    case 8:
    // 车间调整
    case 11:
      oIcon.icon = 'workshop'
      break
      // 返工入站
    case 14:
    // 返工出站
    case 15:
      oIcon.icon = 'rework'
      break
      // 条码绑定： 绑定，解绑
    case 205:
    case 206:
    // 补料
    case 203:
    // 容器清空
    case 202:
      oIcon.icon = 'barcodeManage'
      break
      // 正常物料
    case 10003:
    // 废品
    case 10004:
      oIcon.icon = 'material'
      break
    // 可疑品登记
    case 16:
    // 可疑品判定
    case 17:
    // 检验取样
    case 18:
    // 检验返还
    case 19:
    // 检验结束
    case 20:
    // 检验报废
    case 21:
    // 检验封样
    case 22:
      oIcon.icon = 'inspect'
      break
    default:
      break
  }

  // 返回数据。
  return oIcon
}

/**
 * 树形数据修改。
 * 新增 sumList: [] 详细信息展示数据
 *  detailType: 详细信息展示模板
 *  detailTitle: 详细信息标题： -- 物料或其他组合
 *  iconType:   图标类型
 * @param {Object} oRowData
 * @param {String} sPageType 当前页面显示类型 trace|track
 * @param {Boolean} bIsOld 是否为老版本。  true-老版本  false-新版本
 */
var getTreeData = function (oRowData, sPageType, bIsOld) {
  // let aoData = parseTreeData(oRowData, sPageType, bIsOld)
  let {nodeList: aoDiagramData, linkList: aoDiagramLinkData} = oRowData

  aoDiagramLinkData = aoDiagramLinkData.map(o => {
    if (!o.fromPort) {
      o.fromPort = 'FROM'
      o.toPort = 'TO'
    }

    // 修改数据的小数位数。
    if (Number(o.num) === parseInt(o.num)) {
      o.num = parseInt(o.num)
    } else {
      o.num = Number(o.num).toFixed(2)
    }

    return o
  })

  return {
    node: aoDiagramData,
    link: aoDiagramLinkData
  }
}

// 判断是否是正常物料
var isMaterialNode = function (oData) {
  if (oData.nodeType === 10003 || oData.nodeType === 10004) {
    return true
  } else {
    return false
  }
}

// 第一个节点的parents值。
const SPARENTKEY = 0

var getCatalogData = function (oRowData, sType, bIsOld) {
  let aoCatalogData = []
  let aoCopyData = oRowData.nodeList // JSON.parse(JSON.stringify(parseTreeData(oRowData, sType, bIsOld).nodeList))
  let aResult = []
    // 追踪中新增的物料节点key值。
  let sNewMateiralNodekey = 'customerKey'

  // 追踪中，保存最后节点的key值。（除物料外）
  let aLastNodeKeys = []

  aoCopyData = aoCopyData.filter(o => !o.isGroup)
  // 修改节点的类型值。
  // aoCopyData.forEach(o => { o.iconType = getNodeIconAndTemp(o.nodeType).icon })

  if (sType === 'trace') {
    // 溯源。
    // 判断第一个节点是否为物料节点。 否则加一个虚构的物料节点。
    // let aoFirstNode = aoCopyData.filter(o => o.parents === SPARENTKEY)
    let aoFirstNode = aoCopyData.filter(o => isFirstNode(o))

    if (aoFirstNode.length && !isMaterialNode(aoFirstNode[0])) {
      // 第一个节点不是物料。则增加一个虚拟节点。
      aoCopyData.push({
        code: '000',
        name: '虚构物料节点',
        key: SPARENTKEY,
        // parents: SPARENTKEY,
        parentKeys: [SPARENTKEY],
        nodeType: 10003,
        opType: 0,
        iconType: 'material',
        isCustom: true
      })
    }

    for (let i = aoCopyData.length - 1; i >= 0; i--) {
      let oData = aoCopyData[i]

      if (oData && isMaterialNode(oData) && isFirstNode(oData)) { // oData.parents === SPARENTKEY
        oData.parent = ''
        aoCatalogData.push(oData)

        aoCopyData.splice(i, 1)
        _findChildrenData(aoCopyData, oData.key, oData.key)
      }
    }
  } else {
    // 追踪
    // 判断最后一个节点是否为物料节点，否则，创建一个虚拟的物料节点。-- 在最后创建，否则，会将其他节点加入
    aoCopyData.forEach(o => {
      if (!aoCopyData.some(o1 => o1.parentKeys.includes(o.key) && o1.key !== o.key) && !isMaterialNode(o)) { // o1.parents.split(',').includes(o.key)
        // 当前节点没有子节点，并且不是物料节点
        aLastNodeKeys.push(o.key)
      }
    })

    // 创建一个物料节点，其parents为当前所有的key值。
    if (aLastNodeKeys.length) {
      // 第一个节点不是物料。则增加一个虚拟节点。
      aoCopyData.unshift({
        code: '000',
        name: '虚构物料节点',
        key: sNewMateiralNodekey,
        // parents: aLastNodeKeys.join(','),
        parentKeys: aLastNodeKeys,
        nodeType: 10003,
        opType: 0,
        iconType: 'material',
        isCustom: true
      })
    }

    for (let i = aoCopyData.length - 1; i >= 0; i--) {
      let oData = aoCopyData[i]

      if (oData && isMaterialNode(oData) && !aoCatalogData.some(o => o.key === oData.key)) {
        oData.parent = ''
        aoCatalogData.push(oData)

        aoCopyData.splice(i, 1)

        _findParentsData(aoCopyData, oData.parentKeys, oData.key)// oData.parents
      }
    }
  }

  // 物料的合并
  for (let i = 0; i < aoCatalogData.length; i++) {
    let oData = aoCatalogData[i]
    let aKey = []
    if (isMaterialNode(oData) && !_isExist(oData)) {
      // 物料-找同名
      aKey = _getKeysOfSameName(oData).key
      aResult.push(Object.assign({}, oData, {
        name: (aKey.length - 1) ? oData.name + '(' + aKey.length + ')' : oData.name,
        sublings: aKey
      }))
    }
  }

  // 获取同名同物料下的工序。
  for (let i = 0; i < aoCatalogData.length; i++) {
    let oData = aoCatalogData[i]
    if (!isMaterialNode(oData) && !_isExist(oData)) {
      // 工序-找同名
      let oValue = _getKeysOfSameName(oData)
      aResult.push(Object.assign({}, oData, {
        name: (oValue.key.length - 1) ? oData.name + '(' + oValue.key.length + ')' : oData.name,
        sublings: oValue.key,
        parent: oValue.parent
      }))
    }
  }

  // 返回数据。
  return aResult

  /**
  * 是否为第一个节点
  */
  function isFirstNode (oNode) {
    if (oNode.parentKeys && oNode.parentKeys.length === 1 && oNode.parentKeys[0] === 0) {
      return true
    } else {
      return false
    }
  }

  /**
   * 递归查找父节点。
   * @param {Array} aoCopyData
   * @param {String} sKey
   * @param {String} sParentKey
   * @return {void}
   */
  function _findParentsData (aoCopyData, sKey, sParentKey) {
    for (let i = aoCopyData.length - 1; i >= 0; i--) {
      let oData = aoCopyData[i]
      let sNewKey = ''
      let oFlag = {}

      if (oData && sKey.includes(oData.key)) {
        // 当前元素的父级。
        if (isMaterialNode(oData)) {
          oData.parent = ''
          sNewKey = oData.key

          oFlag = Object.assign({}, oData)
          aoCopyData.splice(i, 1)
        } else if ((sParentKey !== sNewMateiralNodekey && (!aoCatalogData.some(o => (o.linkKey || o.key) === oData.key && o.parent === sParentKey))) || (aLastNodeKeys.length && sParentKey === sNewMateiralNodekey && !aoCatalogData.some(o => (o.linkKey || o.key) === oData.key))) {
          // 当不是自定义物料查询时的处理。
          // } else if(!aoCatalogData.some(o => (o.linkKey || o.key) == oData.key && o.parent == sParentKey)) {
          // 存在最后节点不为物料的数据，且匹配改物料下的数据，且改数据没有被其他物料加载，则会创建该节点。
          sNewKey = sParentKey
          // 判断该数据是否已加入到aoCatelogData中。
          if (oData.parent !== undefined) {
            // 复制该节点。
            oFlag = Object.assign({}, oData, {
              parent: sNewKey,
              // 当前节点的源节点。
              linkKey: oData.key,
              // 自定义改节点的key值。
              key: 'new-' + _getLength(oData.key) + '-' + oData.key // 通过长度获取。
            })
          } else {
            oData.parent = sParentKey
            oFlag = Object.assign({}, oData)
          }
        }

        // 判断是否已经重复加入。--- key相同且parent相同。
        if (!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key === oFlag.key && o.parent === oFlag.parent))) {
          aoCatalogData.push(oFlag)

          if (!isFirstNode(oFlag)) { // oFlag.parents !== SPARENTKEY
            _findParentsData(aoCopyData, oFlag.parentKeys, sNewKey)
          }
        }
      }
    }
  }

  /**
   * 递归查找子级节点。
   * @param {Array} aoCopyData
   * @param {String} sKey
   * @param {String} sParentKey
   * @return {void}
   */
  function _findChildrenData (aoCopyData, sKey, sParentKey) {
    for (let i = aoCopyData.length - 1; i >= 0; i--) {
      let oData = aoCopyData[i]
      let sNewKey = ''
      let oFlag = {}

      if (oData && oData.parentKeys.includes(sKey)) {
        // 当前元素的父级。
        if (isMaterialNode(oData)) {
          oData.parent = ''
          sNewKey = oData.key

          oFlag = Object.assign({}, oData)
          aoCopyData.splice(i, 1)
        } else if (!aoCatalogData.some(o => (o.linkKey || o.key) === oData.key && o.parent === sParentKey)) {
          sNewKey = sParentKey
          // 判断该数据是否已加入到aoCatelogData中。
          if (oData.parent !== undefined) {
            // 复制该节点。
            oFlag = Object.assign({}, oData, {
              parent: sNewKey,
              // 当前节点的源节点。
              linkKey: oData.key,
              // 自定义改节点的key值。
              key: 'new-' + _getLength(oData.key) + '-' + oData.key // 通过长度获取。
            })
          } else {
            oData.parent = sParentKey
            oFlag = Object.assign({}, oData)
          }
        }

        // 判断是否已经重复加入。--- key相同且parent相同。
        if (!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key === oFlag.key && o.parent === oFlag.parent))) {
          aoCatalogData.push(oFlag)

          _findChildrenData(aoCopyData, (oFlag.linkKey || oFlag.key), sNewKey)
        }
      }
    }
  }

  /**
   * 复制节点获取其key值。
   * @param {String} sKey
   * @return {String}
   */
  function _getLength (sKey) {
    return aoCatalogData.filter(o => (o.linkKey || o.key) === sKey).length
  }

  /**
   * 通过名称获取相同的名称的数据的key中。
   * @param {Object} oFilter
   * @return {Array}
   */
  function _getKeysOfSameName (oFilter) {
    let oResult = {
      key: [],
      parent: ''
    }

    for (let i = 0; i < aoCatalogData.length; i++) {
      let oData = aoCatalogData[i]

      if (isMaterialNode(oFilter)) {
        // 物料-找同名
        if (oData.name === oFilter.name) {
          oResult.key.push({
            key: oData.key,
            parent: oData.parent
          })
        }
      } else {
        // 工序，找同parent
        // 找到在aResulte中通存在的subling的值。
        let oValue = _isSameLevel(oData, oFilter)
        let sKey = oData.linkKey || oData.key

        // 如果该节点时复制节点，判断其原节点是否存在，（存在-不加入。 不存在-加入）
        if (oData.name === oFilter.name && oValue.bSame && !oResult.key.some(o => o.key === sKey)) {
          oResult.key.push({
            key: sKey,
            parent: oData.parent
          })
          oResult.parent = oValue.parent
        }
      }
    }

    // 返回数据。
    return oResult
  }

  /**
   * 判断元素是否存在已存在。
   * @param {Object} oData
   */
  function _isExist (oData) {
    // return aResult.some( o => o.sublings.includes(oData.key) )
    return aResult.some(o => {
      // key值相同  且节点的parent属于一样的。 || 物料只需判断key值
      return o.sublings.some(o1 => o1.key === (oData.linkKey || oData.key) && (isMaterialNode(oData) || _isExitCopy(o1, oData)))
    })
  }

  function _isExitCopy (o1, o2) {
    return aResult.some(o3 => {
      return o3.sublings.some(o => o.key === o1.parent) && o3.sublings.some(o => o.key === o2.parent)
    })
  }

  /**
   * 判断工序是否是同一个合并后的父级。
   */
  function _isSameLevel (oData, oValue) {
    let oR = {
      // 是否属于合并和、后的同一个显示的物料节点
      bSame: false,
      // 该显示的物料节点的key值。
      parent: ''
    }

    aResult.forEach(o => {
      //  if(!oR.bSame && o.sublings.includes(oData.parent) && o.sublings.includes(oValue.parent)) {
      //   oR.bSame = true
      //   oR.parent = o.key
      //  }

      if (!oR.bSame && o.sublings.some(o1 => o1.key === oData.parent) && o.sublings.some(o1 => o1.key === oValue.parent)) {
        oR.bSame = true
        oR.parent = o.key
      }
    })

    return oR
  }
}

// 处理追踪中树
var getTrackCatalogData = function (aoRowData) {
  let aoCatalogData = []
  let aoCopyData = JSON.parse(JSON.stringify(aoRowData))
  let aResult = []

  // 修改节点的类型值。
  aoCopyData.forEach(o => {
    o.iconType = getNodeIconAndTemp(o.nodeType).icon
  })

  for (let i = aoCopyData.length - 1; i >= 0; i--) {
    let oData = aoCopyData[i]

    if (oData && isMaterialNode(oData) && !aoCatalogData.some(o => o.key === oData.key)) {
      oData.parent = ''
      aoCatalogData.push(oData)

      aoCopyData.splice(i, 1)

      _findParentsData(aoCopyData, oData.parents, oData.key)
    }
  }

  // 物料的合并
  for (let i = 0; i < aoCatalogData.length; i++) {
    let oData = aoCatalogData[i]
    let aKey = []
    if (isMaterialNode(oData) && !_isExist(oData)) {
      // 物料-找同名
      aKey = _getKeysOfSameName(oData).key
      aResult.push(Object.assign({}, oData, {
        name: (aKey.length - 1) ? oData.name + '(' + aKey.length + ')' : oData.name,
        sublings: aKey
      }))
    }
  }

  // 获取同名同物料下的工序。
  for (let i = 0; i < aoCatalogData.length; i++) {
    let oData = aoCatalogData[i]
    if (!isMaterialNode(oData) && !_isExist(oData)) {
      // 工序-找同名
      let oValue = _getKeysOfSameName(oData)
      aResult.push(Object.assign({}, oData, {
        name: (oValue.key.length - 1) ? oData.name + '(' + oValue.key.length + ')' : oData.name,
        sublings: oValue.key,
        parent: oValue.parent
      }))
    }
  }

  // 返回数据。
  return aResult

  /**
   * 递归查找父节点。
   * @param {Array} aoCopyData
   * @param {String} sKey
   * @param {String} sParentKey
   * @return {void}
   */
  function _findParentsData (aoCopyData, sKey, sParentKey) {
    for (let i = aoCopyData.length - 1; i >= 0; i--) {
      let oData = aoCopyData[i]
      let sNewKey = ''
      let oFlag = {}

      if (oData && sKey.split(',').includes(oData.key)) {
        // 当前元素的父级。
        if (isMaterialNode(oData)) {
          oData.parent = ''
          sNewKey = oData.key

          oFlag = Object.assign({}, oData)
          aoCopyData.splice(i, 1)
        } else if (!aoCatalogData.some(o => (o.linkKey || o.key) === oData.key && o.parent === sParentKey)) {
          sNewKey = sParentKey
          // 判断该数据是否已加入到aoCatelogData中。
          if (oData.parent !== undefined) {
            // 复制该节点。
            oFlag = Object.assign({}, oData, {
              parent: sNewKey,
              // 当前节点的源节点。
              linkKey: oData.key,
              // 自定义改节点的key值。
              key: 'new-' + _getLength(oData.key) + '-' + oData.key // 通过长度获取。
            })
          } else {
            oData.parent = sParentKey
            oFlag = Object.assign({}, oData)
          }
        }

        // 判断是否已经重复加入。--- key相同且parent相同。
        if (!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key === oFlag.key && o.parent === oFlag.parent))) {
          aoCatalogData.push(oFlag)

          if (oFlag.parents !== SPARENTKEY) {
            _findParentsData(aoCopyData, oFlag.parents, sNewKey)
          }
        }
      }
    }
  }

  /**
   * 复制节点获取其key值。
   * @param {String} sKey
   * @return {String}
   */
  function _getLength (sKey) {
    return aoCatalogData.filter(o => (o.linkKey || o.key) === sKey).length
  }

  /**
   * 通过名称获取相同的名称的数据的key中。
   * @param {Object} oFilter
   * @return {Array}
   */
  function _getKeysOfSameName (oFilter) {
    let oResult = {
      key: [],
      parent: ''
    }

    for (let i = 0; i < aoCatalogData.length; i++) {
      let oData = aoCatalogData[i]

      if (isMaterialNode(oFilter)) {
        // 物料-找同名
        if (oData.name === oFilter.name) {
          oResult.key.push({
            key: oData.key,
            parent: oData.parent
          })
        }
      } else {
        // 工序，找同parent
        // 找到在aResulte中通存在的subling的值。
        let oValue = _isSameLevel(oData, oFilter)
        let sKey = oData.linkKey || oData.key

        // 如果该节点时复制节点，判断其原节点是否存在，（存在-不加入。 不存在-加入）
        if (oData.name === oFilter.name && oValue.bSame && !oResult.key.some(o => o.key === sKey)) {
          oResult.key.push({
            key: sKey,
            parent: oData.parent
          })
          oResult.parent = oValue.parent
        }
      }
    }

    // 返回数据。
    return oResult
  }

  /**
   * 判断元素是否存在已存在。
   * @param {Object} oData
   */
  function _isExist (oData) {
    // return aResult.some( o => o.sublings.includes(oData.key) )
    return aResult.some(o => {
      // key值相同  且节点的parent属于一样的。 || 物料只需判断key值
      return o.sublings.some(o1 => o1.key === (oData.linkKey || oData.key) && (isMaterialNode(oData) || _isExitCopy(o1, oData)))
    })
  }

  function _isExitCopy (o1, o2) {
    return aResult.some(o3 => {
      return o3.sublings.some(o => o.key === o1.parent) && o3.sublings.some(o => o.key === o2.parent)
    })
  }

  /**
   * 判断工序是否是同一个合并后的父级。
   */
  function _isSameLevel (oData, oValue) {
    let oR = {
      // 是否属于合并和、后的同一个显示的物料节点
      bSame: false,
      // 该显示的物料节点的key值。
      parent: ''
    }

    aResult.forEach(o => {
      // if(!oR.bSame && o.sublings.includes(oData.parent) && o.sublings.includes(oValue.parent)) {
      //  oR.bSame = true
      //  oR.parent = o.key
      // }

      if (!oR.bSame && o.sublings.some(o1 => o1.key === oData.parent) && o.sublings.some(o1 => o1.key === oValue.parent)) {
        oR.bSame = true
        oR.parent = o.key
      }
    })

    return oR
  }
}

/**
 * 物料，设备等下拉框数据改变，查询时参数处理。
 * @param {Object} oQuery 需拆分的对象
 * @param {Object} index 获取的字段
 * @param {Object} bSplit 是否需要拆分，当参数不存在于判断的字段中
 */
var parseQueryParam = function (oQuery, index, bSplit) {
  let oParam = Object.assign({}, oQuery)

  // 修改下拉框显示的值。
  for (let sParam in oParam) {
    // 下拉数据
    if (['materialCode', 'equipmentCode', 'processCode', 'personCode', 'materialCodeList', 'equipmentCodeList', 'processCodeList'].includes(sParam) || bSplit) {
      if (oParam[sParam] instanceof Array) {
        // 数组处理。
        oParam[sParam] = oParam[sParam].map(o => o.split(':')[index || 0])
      } else {
        oParam[sParam] = oParam[sParam].split(':')[index || 0]
      }
    }
  }

  // 返回需要查询的参数。
  return oParam
}

const needTableDatas = (pathMapping, nodeType, allColumns) => {
  let tableData = {}
  tableData.filename = pathMapping[nodeType]
  tableData.columns = allColumns[nodeType]
  tableData.data = []

  return tableData
}

const outerHeight = (el) => {
  var height = el.offsetHeight
  var style = el.currentStyle || window.getComputedStyle(el)

  height += parseInt(style.marginTop) + parseInt(style.marginBottom)
  return height
}

export default {
  parseData,
  parseTreeData,
  parseQueryParam,
  getTreeData,
  getCatalogData,
  getTrackCatalogData,
  SPARENTKEY,
  outerHeight
}

export {
  needTableDatas,
  outerHeight
}
