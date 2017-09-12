"use strict";
/*
*  Copyright (C) 1998-2017 by Northwoods Software Corporation. All Rights Reserved.
*/

// A "ScrollingTable" Panel

// This also defines an "AutoRepeatButton" Panel,
// which is used by the scrollbar in the "ScrollingTable" Panel.

// This defines a custom "Button" that automatically repeats its click
// action when the user holds down the mouse.
go.GraphObject.defineBuilder("AutoRepeatButton", function(args) {
  var $ = go.GraphObject.make;
  // some internal helper functions for auto-repeating
  function delayClicking(e, obj) {
    endClicking(e, obj);
    if (obj.click) {
      obj._timer =
        setTimeout(function() { repeatClicking(e, obj); },
                   500);  // wait 0.5 seconds before starting clicks
    }
  }
  function repeatClicking(e, obj) {
    if (obj._timer) clearTimeout(obj._timer);
    if (obj.click) {
      obj._timer =
        setTimeout(function() {
                     if (obj.click) {
                       (obj.click)(e, obj);
                       repeatClicking(e, obj);
                     }
                   },
                   100);  // 0.1 seconds between clicks
    }
  }
  function endClicking(e, obj) {
    if (obj._timer) {
      clearTimeout(obj._timer);
      obj._timer = undefined;
    }
  }

  return $(go.Panel,
           { actionDown: delayClicking, actionUp: endClicking });
});

// Create a scrolling Table Panel, whose name is given as the optional first argument.
// If not given the name defaults to "TABLE".
// Example use:
//   $("ScrollingTable", "TABLE",
//     new go.Binding("TABLE.itemArray", "someArrayProperty"),
//     ...)
// Note that if you have more than one of these in a Part,
// you'll want to make sure each one has a unique name.
go.GraphObject.defineBuilder("ScrollingTable", function(args) {
  var $ = go.GraphObject.make;
  var tablename = go.GraphObject.takeBuilderArgument(args, "TABLE");
 
  // an internal helper function for actually performing a scrolling operation
  function incrTableIndex(obj, i) {
    var diagram = obj.diagram;
    var table = obj.panel.panel.panel.findObject(tablename);
    if (i === +Infinity || i === -Infinity) {  // page up or down
      var tabh = table.actualBounds.height;
      var rowh = table.elt(table.topIndex).actualBounds.height;  // assume each row has same height?
      if (i === +Infinity) {
        i = Math.max(1, Math.ceil(tabh / rowh) - 1);
      } else {
        i = -Math.max(1, Math.ceil(tabh / rowh) - 1);
      }
    }
    var idx = table.topIndex + i;
    if (idx < 0) idx = 0;
    else if (idx >= table.rowCount - 1) idx = table.rowCount - 1;
    if (table.topIndex !== idx) {
      if (diagram !== null) diagram.startTransaction("scroll");
      table.topIndex = idx;
      var node = table.part;  // may need to reroute links if the table contains any ports
      if (node instanceof go.Node) node.invalidateConnectedLinks();
      updateScrollBar(table);
      if (diagram !== null) diagram.commitTransaction("scroll");
    }
  }

  function updateScrollBar(table) {
  	var up = table.panel.elt(0);
    var bar = table.panel.elt(1);  // the scrollbar is a sibling of the table
    var down = table.panel.elt(2);
    
    if (!bar) return;
    var idx = table.topIndex;
    
    if (up) up.opacity = (idx > 0) ? 1.0 : 0.0;
    if (down) down.opacity = (idx < table.rowCount - 1) ? 1.0 : 0.0;

//  var tabh = bar.actualBounds.height;
//  var rowh = table.elt(idx).actualBounds.height;  //?? assume each row has same height?
//  if (rowh === 0 && idx < table.rowCount-2) rowh = table.elt(idx + 1).actualBounds.height;
//  var numVisibleRows = Math.max(1, Math.ceil(tabh / rowh) - 1);
//  var needed = idx > 0 || idx + numVisibleRows <= table.rowCount;
//  bar.opacity = needed ? 1.0 : 0.0;
  }

  return $(go.Panel, "Table",
      {
        _updateScrollBar: updateScrollBar
      },
      // this actually holds the item elements
      $(go.Panel, "Vertical",
          // the scroll up button
          $("AutoRepeatButton",
              {
                  name: "UP",
                  row: 0,
                  alignment: go.Spot.Top,
                  height: 16,
                  opacity: 0,
                  click: function(e, obj) { incrTableIndex(obj, -1); }
              },
              $(go.Shape, "TriangleUp",
                  {figure: "Chevron", margin: new go.Margin(1,0,0,0),  fill: "#928f8f", width: 12, height: 25, alignment: go.Spot.Center, stroke: null, angle: -90, stretch: go.GraphObject.Fill})),
          // this actually holds the item elements
          $(go.Panel, "Table",
              {
                  name: tablename,
                  row: 1,
                  rowSizing: go.RowColumnDefinition.None,
                  background: "transparent"	// "whitesmoke"
              }),
          // the scroll down button
          $("AutoRepeatButton",
              {
                  name: "DOWN",
                  row: 2,
                  alignment: go.Spot.Bottom,
                  height: 16,
                  click: function(e, obj) { incrTableIndex(obj, +1); }
              },
              $(go.Shape,
                  {figure: "Chevron", fill: "#928f8f", width: 12, height: 25, alignment: go.Spot.Center, stroke: null, angle: 90, stretch: go.GraphObject.Fill}))
      )
    );
    
    
});
