import * as maptalks from "maptalks";

class CustomTileLayer extends maptalks.TileLayer {
  override getTileUrl(x: number, y: number, z: number) {
    // 19 이상의 레벨에서는 빈타일을 반환
    // vworld에서는 19 이상의 레벨에서는 빈타일을 제공하지 않음
    if (z > 19) {
      return "https://xdworld.vworld.kr/2d/Base/service/4/12/4.png";
    }

    if (typeof this.options.urlTemplate === "string") {
      return this.options.urlTemplate
        .replace("{x}", x + "")
        .replace("{y}", y + "")
        .replace("{z}", z + "");
    }
    return this.options.urlTemplate(x, y, z);
  }
}

function createMap() {
  const map = new maptalks.Map("map", {
    center: [127.3325, 36.3513],
    zoom: 19.3,
    zoomControl: true,
    scrollWheelZoom: false, // 스크롤로 줌인/아웃 막기
    seamlessZoom: true,
    baseLayer: new CustomTileLayer("base", {
      urlTemplate: "https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      attribution:
        '&copy; <a href="http://www.osm.org/copyright">OSM</a> contributors, ' +
        '&copy; <a href="https://vworld.com/attributions">VWORLD</a>',
      cssFilter: "grayscale(100%)",
    }),
  });

  map.on("zoomend", () => {
    if (map) {
      const zoom = map.getZoom();
      const nodeLayer = map.getLayer("nodeLayer");
      const edgeLayer = map.getLayer("edgeLayer");
      if (zoom >= 18) {
        edgeLayer && edgeLayer.show();
      } else {
        edgeLayer && edgeLayer.hide();
      }

      if (zoom >= 17) {
        nodeLayer && nodeLayer.show();
      } else {
        nodeLayer && nodeLayer.hide();
      }
    }
  });

  const nodeLayer = new maptalks.VectorLayer("nodes", [], {
    enableAltitude: true,
  });
  const edgeLayer = new maptalks.VectorLayer("edges", [], {
    enableAltitude: true,
  });

  map.addLayer(nodeLayer);
  map.addLayer(edgeLayer);

  return {
    map,
  };
}

export { createMap };
