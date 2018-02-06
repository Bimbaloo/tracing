/**
 * 选中节点事件。
 * @param {Object} oNode
 * @return {void}
 */
function onNodeSelectionChange (oNode) {}

/**
 *
 * @param {Object} e
 * @param {Object} node
 */
// function onClickCatalogNode (e, node) {

// }

/**
 * 节点单击事件。
 * @param {event} e
 * @param {Object} node
 * @returns {void}
 */
function onClickNode (e, node, oTree, oCatalog) {
  oTree.nodes.each(obj => {
    obj.background = null
    obj.findObject('TB') && (obj.findObject('TB').stroke = '#333')
  })

  let nodeInmenutree = null
  if (oCatalog) {
    nodeInmenutree = oCatalog.findNodeForKey(node.data.key)

    oCatalog.nodes.each(obj => {
      obj.isSelected = false
      obj.background = null
      obj.findObject('TB').stroke = '#fff'
    })
  }

  if (node.isSelected) {
    // goPage.pageHandler.getVerboseInfo(node);

    if (nodeInmenutree) {
      nodeInmenutree.background = 'white'
      nodeInmenutree.isSelected = true
      nodeInmenutree.findObject('TB').stroke = '#333'
    }

    node.background = '#40484a'
    node.findObject('TB') && (node.findObject('TB').stroke = '#fff')
  } else {
    node.background = null

    if (nodeInmenutree) {
      nodeInmenutree.isSelected = false
    }
  }
}

/**
 * 节点右键点击事件。
 * @param e
 * @param node
 * @returns void
 */
function onContextClickNode (e, node) {
  // console.log("rightclick");
}

/**
 * 节点双击事件。
 * @param e
 * @param node
 * @returns void
 */
function onDoubleClickNode (e, node) {
  if (node.wasTreeExpanded) {
    node.wasTreeExpanded = false
    node.expandTree()
  } else {
    node.wasTreeExpanded = true
    node.collapseTree()
  }
}

/**
 * tooltip数据。
 * @param {Object} data
 * @return {String}
 */
function tooltipTextConverter (data) {
  return data.name
}

/**
 * 双击背景放大缩小当前画布。
 * @returns {void}
 */
function zoomDiagram (oTree, bFlag, treeId) {
  if (bFlag) {
    oTree.zoomToFit()
  } else {
    let oDiagram = document.getElementById(treeId).querySelector('canvas')
    let nHeight = oDiagram.clientHeight
    let nWidth = oDiagram.clientWidth

    oTree.zoomToRect({
      width: nWidth,
      height: nHeight
    }, window.go.Diagram.UniformToFill)
  }
}

export {
  onNodeSelectionChange,
  // onClickCatalogNode,
  onClickNode,
  onContextClickNode,
  onDoubleClickNode,
  tooltipTextConverter,
  zoomDiagram
}
