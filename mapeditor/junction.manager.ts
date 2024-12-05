//    교차로의 엣지를 편집하는 클래스
//    author: beanpole
//    date: 2021-06-07

import * as maptalks from "maptalks";

import { layer } from "./map.utils";
import LinkManager from "./link.manager";
import Junction from "./junction";
import { nodeSymbol } from "./symbols";

import type { Emit, On } from "./events";

// type Emit = (event: string, callback: (data: any) => void) => void;
// type On = (event: string, callback: (data: any) => void) => void;
/**
 * 교차로의 엣지를 편집하는 클래스
 */
function JunctionManager(
  map: maptalks.Map,
  { mapId, projectId, envId }: any,
  $emit: Emit,
  $on: On,
  $off: any
): any {
  const edgeLayer = layer("edgeLayer");
  const nodeLayer = layer("nodeLayer");
  const junctionLayer = layer("junctionLayer");
  const connectionLayer = layer("connectionLayer");

  const inforPanel = new maptalks.control.Panel({
    position: "top-right",
    draggable: true,
    custom: true,
    content: `<div class="bg-blue-300 p-2"></div>`,
  } as any);

  map.addControl(inforPanel);

  map.addLayer([edgeLayer, nodeLayer, junctionLayer, connectionLayer]);

  // add enter key listener
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      console.log("Enter key pressed");
    }
  });

  /**
   * JSON features 로부터 교차로를 나타내는 노드를 생성한다.
   */
  function loadNodes(features: any): void {
    nodeLayer.clear();
    const marker = maptalks.GeoJSON.toGeometry(
      features,
      (node: maptalks.Geometry) => {}
    );

    marker.forEach((node: maptalks.Marker) => {
      node.updateSymbol({
        ...(nodeSymbol(node) as maptalks.AnyMarkerSymbol),
        markerFill: "gray",
      });
      node.on("click", (e: any) => {
        Junction(
          map,
          {
            mapId,
            projectId,
            envId,
          },
          node,
          {
            edgeLayer,
            junctionLayer,
            connectionLayer,
          },
          inforPanel,
          $emit,
          $on,
          $off
        );
      });
    });
    nodeLayer.addGeometry(marker);
  }

  const linkManager = LinkManager(map, edgeLayer);

  function loadEdges(features: any): void {
    edgeLayer.clear();
    linkManager.loadEdges(features);
  }

  function getCenter(): maptalks.Coordinate {
    const nodes = nodeLayer.getGeometries();
    if (nodes.length === 0) {
      return map.getCenter();
    }
    return nodeLayer
      .getGeometries()
      [Math.floor(nodeLayer.getGeometries().length / 2)].getCenter();
  }

  return {
    loadEdges,
    loadNodes,
    edgeLayer,
    nodeLayer,
    getCenter,
  };
}

export default JunctionManager;
