import { Marker } from "mapbox-gl";
import { View } from "./_view";

export class MapMarkerView extends View {
  constructor(map) {
    super();
    this.map = map;
    this.marker_cache = {};
    this.marker_ids = [];
  }
  setColor(color) {
    this.color = color;
    return this;
  }
  view({ coordinates = [] } = {}) {
    let marker_has = {};
    let draggable = !!this.onDragMarker;
    if (this.onDragMarker && !this.bindOnDragMaker) {
      this.bindOnDragMaker = function (marker, index, coordinates) {
        const lngLat = marker.getLngLat();
        let new_coordinate = [lngLat.lng, lngLat.lat];
        let new_coordinates = [...coordinates];
        new_coordinates[index] = new_coordinate;
        this.onDragMarker(new_coordinates, new_coordinate, index, marker);
      };
    }
    coordinates.forEach((coordinate, index) => {
      if (!coordinate[0] || !coordinate[1]) {
        return;
      }
      let key = `${coordinate[0]}-${coordinate[1]}`;
      let marker = this.marker_cache[key];
      if (!marker) {
        marker = getMarkerNode({ color: this.color, draggable })
          .setLngLat({ lng: coordinate[0], lat: coordinate[1] })
          .addTo(this.map);
        this.marker_cache[key] = marker;
      } else {
        marker.off("dragend", this.bindOnDragMaker);
      }
      if (draggable) {
        marker.on(
          "dragend",
          this.bindOnDragMaker.bind(this, marker, index, coordinates)
        );
      }
      marker_has[key] = true;
    });
    Object.keys(this.marker_cache).forEach((key) => {
      let m = this.marker_cache[key];
      if (!marker_has[key]) {
        m.remove();
        delete this.marker_cache[key];
      }
    });
  }
  reset() {
    Object.keys(this.marker_cache).forEach((key) => {
      let m = this.marker_cache[key];
      m.remove();
    });
    this.marker_cache = {};
  }
  destroy() {
    this.reset();
  }
}
function getMarkerNode({ color, draggable = false } = {}) {
  const node = document.createElement("div");
  node.style.width = "12px";
  node.style.height = "12px";
  node.style.borderRadius = "50%";
  node.style.background = "#fff";
  node.style.boxSizing = "border-box";
  node.style.border = `2px solid ${color}`;
  node.style.cursor = "pointer";
  return new Marker({
    element: node,
    draggable
  });
}
