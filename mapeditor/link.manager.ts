import * as maptalks from "maptalks";

import { calcAngle } from "./geo.utils";

function LinkManager(map: maptalks.Map, edgeLayer: maptalks.VectorLayer) {
  const inforPanel = new maptalks.control.Panel({
    position: "top-right",
    // @ts-ignore
    draggable: true,
    custom: true,
    content: `<div class="bg-indigo-100 p-2"></div>`,
  });

  map.addControl(inforPanel);

  function _showEdgeInfo(edge: any) {
    const { LINK_ID, F_NODE, T_NODE, LANES, ROAD_NAME } = edge.properties;
    inforPanel.setContent(`
      <div class="bg-white rounded p-3 flex flex-col gap-1 text-slate-900 text-sm">
        <div><span class="font-bold"> 🚗 ${ROAD_NAME}</span> (${LINK_ID}) </div>
        <div>${F_NODE} - ${T_NODE} </div>
        <div>차선수: ${LANES} </div>
      </div>`);
    inforPanel.show();
  }

  function _hideEdgeInfo() {
    inforPanel.hide();
  }

  const textRotation = (coord: number[][]) => {
    let textRotation = calcAngle(coord[0], coord[1]);

    if (textRotation < 180) {
      textRotation += 180;
    }
    return textRotation;
  };

  function _makeEdgeSymbol(edge: any) {
    return {
      textDx: 0,
      textDy: 0,
      textSize: 12,
      textWeight: "bold",
      // textName: edge.properties.LINK_ID + "\n" + edge.properties.ROAD_NAME,
      textName: `  ${edge.properties.LINK_ID}  `,
      textFill: "#00008B",
      textHaloFill: "#FFFFE0",
      textHaloRadius: 4,
      textRotation: textRotation(edge.getCoordinates()),
      textWrapCharacter: "\n",
      textLineSpacing: 6,
      textHorizontalAlignment: "auto",
      lineColor: "gray",
    };
  }

  const menu = {
    items: [
      {
        item: "편집 모드",
        click(e: maptalks.HandlerFnResultType) {
          e.target?.getOwner()?.startEdit();
        },
      },
      "-",
      {
        item: "저장",
        click(e: maptalks.HandlerFnResultType) {
          e.target?.getOwner()?.endEdit();
        },
      },
      {
        item: "정보",
        click(e: maptalks.HandlerFnResultType) {
          console.log(e.target?.getOwner()?.properties);
        },
      },
    ],
  };

  const addEdgeFunc = (edge: any) => {
    edge.on("click", (e: any) => {
      const { target, domEvent } = e;
      if (domEvent?.altKey) {
        target.isEditing() ? target.endEdit() : target.startEdit();
      }
    });

    edge.setMenu(menu).openMenu();

    const defaultSymbol = _makeEdgeSymbol(edge);
    edge.updateSymbol(defaultSymbol);

    edge.on("mouseover", (e: any) => {
      const { domEvent, target } = e;
      if (domEvent?.altKey) {
        return;
      }

      target.updateSymbol({
        textHaloFill: "#6495ED",
        textFill: "white",
        lineColor: "skyblue",
        lineWidth: 5,
        textRotation: 0,
      });
      _showEdgeInfo(target);
    });

    edge.on("mouseout", (e: any) => {
      const { domEvent, target } = e;
      if (domEvent.altKey) {
        return;
      }

      target.updateSymbol({
        ...defaultSymbol,
        lineColor: "gray",
        lineWidth: 2,
      });
      inforPanel.hide();
      _hideEdgeInfo();
    });
  };

  function loadEdges(features: any): void {
    const edges = maptalks.GeoJSON.toGeometry(features, addEdgeFunc);
    edgeLayer.addGeometry(edges);
  }

  return {
    loadEdges,
  };
}

export default LinkManager;
