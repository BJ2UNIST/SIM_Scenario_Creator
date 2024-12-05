import type { Emit, On } from "./events";
import { layer } from "./map.utils";
import * as maptalks from "maptalks";

function EventManager(
  map: maptalks.Map,
  { mapId, projectId, envId }: any,
  $emit: Emit,
  $on: On,
  $off: any
): any {
  const eventLayer = layer("eventLayer");
  map.addLayer(eventLayer);
  function addEvent(event: any) {
    const point = new maptalks.Circle(map.getCenter(), 5, {
      visible: true,
      editable: true,
      cursor: "pointer",
      draggable: true,
      dragShadow: false, // display a shadow during dragging
      symbol: {
        lineColor: "#34495e",
        lineWidth: 2,
        polygonFill: "#1bbc9b",
        polygonOpacity: 0.4,
        textName: event.eventType,
        textFaceName: "sans-serif",
        textSize: 20,
        textFill: "#34495e",
        textHaloFill: "#fff",
        textHaloRadius: 2,
        textVerticalAlignment: "middle",
        textHorizontalAlignment: "center",
      },
    });
    point.setId(event.id);
    point.setProperties(event);

    // point.setSymbol({
    //   textFaceName: "sans-serif",
    //   textName: event.eventName,
    //   textWeight: "normal",
    //   textStyle: "normal",
    //   textSize: 40,
    //   textFill: "#34495e",
    //   textHaloFill: "#fff",
    //   textHaloRadius: 5,
    //   // textHorizontalAlignment: "center",
    //   textVerticalAlignment: "middle",
    // });

    point.on("click", function (e: any) {
      console.log("click", point.properties, e.target.getCoordinates());
      $emit("event-click", {
        ...point.properties,
        coordinates: e.target.getCoordinates(),
      });
    });

    eventLayer.addGeometry(point);
  }

  function deleteEvent(event: any) {
    const e = eventLayer.getGeometryById(event.id);
    if (e) {
      eventLayer.removeGeometry(e);
    }
  }

  function findEvent(event: any) {
    const e: any = eventLayer.getGeometryById(event.id);
    if (e) {
      map.setCenter(e.getCoordinates());
    }
  }

  return {
    addEvent,
    deleteEvent,
    findEvent,
  };
}

export default EventManager;
