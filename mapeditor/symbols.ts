function edgeSymbol(lineColor: string = "black") {
  return {
    lineColor: lineColor,
    lineWidth: 1,
    lineDasharray: [10, 5],
  };
}

function nodeSymbol(node: maptalks.Marker) {
  return {
    markerType: "ellipse",
    // markerFile: "./images/j1.png",
    textName: `${node.properties.NODE_ID}\n${node.properties.NODE_NAME}`,
    textFaceName: "sans-serif",
    textHorizontalAlignment: "middle",
    textVerticalAlignment: "middle",
    textWrapCharacter: "\n",
    textLineSpacing: 7,
    textAlign: "center",
    // textDx: 0,
    // textDy: 0,
    textSize: 12,
    textFill: "white",
    textHaloFill: "#2e5d78",
    textHaloRadius: 2,
    markerFill: "#6495ED",
    markerLineColor: "#2e5d78",
    markerWidth: 100,
    markerHeight: 100,
    markerDx: 0,
    markerDy: 0,
    markerOpacity: 0.8,
    markerFillOpacity: 0.2,
  };
}

export { edgeSymbol, nodeSymbol };
