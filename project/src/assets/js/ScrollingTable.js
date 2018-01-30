'use strict'
/*
 *  Copyright (C) 1998-2017 by Northwoods Software Corporation. All Rights Reserved.
 */

// A "ScrollingTable" Panel

// This also defines an "AutoRepeatButton" Panel,
// which is used by the scrollbar in the "ScrollingTable" Panel.

// This defines a custom "Button" that automatically repeats its click
// action when the user holds down the mouse.
window.go.GraphObject.defineBuilder('AutoRepeatButton', function (args) {
  var $ = window.go.GraphObject.make
  // some internal helper functions for auto-repeating
  function delayClicking (e, obj) {
    endClicking(e, obj)
    if (obj.click) {
      obj._timer =
        setTimeout(function () {
          repeatClicking(e, obj)
        },
          500) // wait 0.5 seconds before starting clicks
    }
  }

  function repeatClicking (e, obj) {
    if (obj._timer) clearTimeout(obj._timer)
    if (obj.click) {
      obj._timer =
        setTimeout(function () {
          if (obj.click) {
            (obj.click)(e, obj)
            repeatClicking(e, obj)
          }
        },
          100) // 0.1 seconds between clicks
    }
  }

  function endClicking (e, obj) {
    if (obj._timer) {
      clearTimeout(obj._timer)
      obj._timer = undefined
    }
  }

  return $(window.go.Panel, 'Table', {
    actionDown: delayClicking,
    actionUp: endClicking
  })
})

// Create a scrolling Table Panel, whose name is given as the optional first argument.
// If not given the name defaults to "TABLE".
// Example use:
//   $("ScrollingTable", "TABLE",
//     new window.go.Binding("TABLE.itemArray", "someArrayProperty"),
//     ...)
// Note that if you have more than one of these in a Part,
// you'll want to make sure each one has a unique name.
window.go.GraphObject.defineBuilder('ScrollingTable', function (args) {
  var $ = window.go.GraphObject.make
  var tablename = window.go.GraphObject.takeBuilderArgument(args, 'TABLE')
  var timer = null

  // an internal helper function for actually performing a scrolling operation
  function incrTableIndex (obj, i) {
    var diagram = obj.diagram
    var table = obj.panel.panel.panel.findObject(tablename)
    if (i === +Infinity || i === -Infinity) { // page up or down
      var tabh = table.actualBounds.height
      var rowh = table.elt(table.topIndex).actualBounds.height // assume each row has same height?
      if (i === +Infinity) {
        i = Math.max(1, Math.ceil(tabh / rowh) - 1)
      } else {
        i = -Math.max(1, Math.ceil(tabh / rowh) - 1)
      }
    }
    var idx = table.topIndex + i
    if (idx < 0) idx = 0
    else if (idx >= table.rowCount - 1) idx = table.rowCount - 1
    if (table.topIndex !== idx) {
      if (diagram !== null) diagram.startTransaction('scroll')
      table.topIndex = idx
      var node = table.part // may need to reroute links if the table contains any ports
      if (node instanceof window.go.Node) node.invalidateConnectedLinks()
      updateScrollBar(table)
      if (diagram !== null) diagram.commitTransaction('scroll')
    }
  }

  function updateScrollBar (table) {
    var up = table.panel.elt(0)
    var bar = table.panel.elt(1) // the scrollbar is a sibling of the table
    var down = table.panel.elt(2)

    if (!bar) return
    var idx = table.topIndex

    if (up) {
      // 向上箭头是否隐藏。
      if (idx > 0) {
        if (!up.opacity) {
          up.opacity = 0.6
        }
      } else {
        up.opacity = 0.0
      }
    }

    if (down) {
      // 向下箭头是否隐藏。
      if (idx < table.rowCount - 1) {
        if (!down.opacity) {
          down.opacity = 0.6
        }
      } else {
        down.opacity = 0.0
      }
    }

    //  if (up) up.opacity = (idx > 0) ? 1.0 : 0.0;
    //  if (down) down.opacity = (idx < table.rowCount - 1) ? 1.0 : 0.0;

    //  var tabh = bar.actualBounds.height;
    //  var rowh = table.elt(idx).actualBounds.height;  //?? assume each row has same height?
    //  if (rowh === 0 && idx < table.rowCount-2) rowh = table.elt(idx + 1).actualBounds.height;
    //  var numVisibleRows = Math.max(1, Math.ceil(tabh / rowh) - 1);
    //  var needed = idx > 0 || idx + numVisibleRows <= table.rowCount;
    //  bar.opacity = needed ? 1.0 : 0.0;
  }

  /**
   * 设置元素的hover事件。
   * @param obj
   * @param sShape {String} up | down
   * @param sHandleType {String} 'enter' | 'leave'
   */
  function setHoverStyle (obj, sShape, sHandleType) {
    var table = obj.panel.panel.panel.findObject(tablename)

    var up = table.panel.elt(0)
    var down = table.panel.elt(2)
    var button = sShape === 'up' ? up : down
    // var nOpacity = button.opacity

    if (button.opacity) {
      if (sHandleType === 'enter') {
        button.opacity = 1.0
      } else {
        button.opacity = 0.6
      }
    }
  }

  /**
   * 设置元素的click样式。
   * @param obj
   * @param sShape {String} up | down
   * @param sHandleType {String} 'enter' | 'leave'
   */
  function setClickFillStyle (obj, sShape, sHandleType) {
    var table = obj.panel.panel.panel.findObject(tablename)

    var up = table.panel.elt(0)
    var down = table.panel.elt(2)
    var button = sShape === 'up' ? up : down

    var shape = button.findObject('arrowShape')
    if (shape) {
      if (sHandleType === 'enter') {
        shape.fill = '#ccc'
      } else {
        shape.fill = '#928f8f'
      }
    }
  }

  /**
   *清空运动定时器。
   * @param {void}
   * @return {void}
   */
  function clearButtonMoveInterval () {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /**
   * 设置运动的定时器。
   * @param {Object} obj
   * @param {String} sType
   */
  function setButtonMoveInterval (obj, sType) {
    if (sType === 'up') {
      incrTableIndex(obj, -1)
    } else {
      incrTableIndex(obj, +1)
    }

    // 设置定时器。
    timer = setInterval(function () {
      // 循环操作。
      if (sType === 'up') {
        incrTableIndex(obj, -1)
      } else {
        incrTableIndex(obj, +1)
      }
    }, 100)
  }

  return $(window.go.Panel, 'Table', {
    _updateScrollBar: updateScrollBar
  },
    // this actually holds the item elements
    $(window.go.Panel, 'Vertical',
      // the scroll up button
      $('AutoRepeatButton', {
        name: 'UP',
        row: 0,
        alignment: window.go.Spot.TopCenter,
        stretch: window.go.GraphObject.Fill,
        height: 20,
        opacity: 0,
        background: 'transparent',
        isActionable: true,
        actionDown: function (e, obj) {
            // 设置点击样式。
          setClickFillStyle(obj, 'up', 'enter')

            // 清空定时器。
          clearButtonMoveInterval()
            // 设置定时器。
          setButtonMoveInterval(obj, 'up')
        },
        actionUp: function (e, obj) {
            // 设置点击后的样式。
          setClickFillStyle(obj, 'up', 'leave')

            // 清空定时器。
          clearButtonMoveInterval()
        },
        mouseHover: function (e, obj) {
          setHoverStyle(obj, 'up', 'enter')
        },
        mouseLeave: function (e, obj) {
          setHoverStyle(obj, 'up', 'leave')
        }
          //                click: function(e, obj) { incrTableIndex(obj, -1); }
      },
        $(window.go.Shape, 'TriangleUp', {
          name: 'arrowShape',
          figure: 'Chevron',
          margin: new window.go.Margin(1, 0, 0, 0),
          fill: '#928f8f',
          width: 12,
          height: 25,
          alignment: window.go.Spot.Center,
          stroke: null,
          angle: -90,
          stretch: window.go.GraphObject.Fill
        })),
      // this actually holds the item elements
      $(window.go.Panel, 'Table', {
        name: tablename,
        row: 1,
        rowSizing: window.go.RowColumnDefinition.None,
        background: 'transparent' // "whitesmoke"
      }),
      // the scroll down button
      $('AutoRepeatButton', {
        name: 'DOWN',
        row: 2,
        alignment: window.go.Spot.BottomCenter,
        stretch: window.go.GraphObject.Fill,
        height: 20,
        opacity: 0.6,
        background: 'transparent',
        isActionable: true,
        actionDown: function (e, obj) {
            // 设置点击的样式。
          setClickFillStyle(obj, 'down', 'enter')

            // 清空定时器。
          clearButtonMoveInterval()

            // 设置定时器。
          setButtonMoveInterval(obj, 'down')
        },
        actionUp: function (e, obj) {
            // 设置点击 后的样式。
          setClickFillStyle(obj, 'down', 'leave')

            // 清空定时器。
          clearButtonMoveInterval()
        },
        mouseHover: function (e, obj) {
          setHoverStyle(obj, 'down', 'enter')
        },
        mouseLeave: function (e, obj) {
          setHoverStyle(obj, 'down', 'leave')
        }
          //                click: function(e, obj) { incrTableIndex(obj, +1); }
      },
        $(window.go.Shape, {
          name: 'arrowShape',
          figure: 'Chevron',
          fill: '#928f8f',
          width: 12,
          height: 25,
          stroke: null,
          angle: 90
        }))
    )
  )
})
