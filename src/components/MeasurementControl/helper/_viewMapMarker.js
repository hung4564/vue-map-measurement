import { Marker } from "mapbox-gl";
import { View } from "./_view";

export class MapMarkerView extends View {
  constructor(map) {
    super();
    this.map = map;
    this.markers = [];
  }
  setColor(color) {
    this.color = color;
    return this;
  }
  view({ coordinates = [] } = {}) {
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
    if (this.onRighClickMarker && !this.bindOnRighClickMarker) {
      this.bindOnRighClickMarker = function (marker, index, coordinates) {
        const lngLat = marker.getLngLat();
        this.onRighClickMarker(
          coordinates,
          [lngLat.lng, lngLat.lat],
          index,
          marker
        );
      };
    }
    let marker_remove = this.markers.slice(coordinates.length - 1);
    this.markers = this.markers.slice(0, coordinates.length - 1);
    marker_remove.forEach((m) => {
      m.remove();
    });
    coordinates.forEach((coordinate, index) => {
      if (!coordinate[0] || !coordinate[1]) {
        return;
      }
      let marker = this.markers[index];
      if (!marker) {
        marker = getMarkerNode({ color: this.color, draggable });
        this.markers[index] = marker;
      }
      marker
        .setLngLat({ lng: coordinate[0], lat: coordinate[1] })
        .addTo(this.map);
      if (draggable) {
        marker.off("dragend", this.bindOnDragMaker);
        marker.on(
          "dragend",
          this.bindOnDragMaker.bind(this, marker, index, coordinates)
        );
      }
      let element = marker.getElement();
      if (this.bindOnRighClickMarker) {
        element.removeEventListener("contextmenu", this.bindOnRighClickMarker);
        element.addEventListener(
          "contextmenu",
          this.bindOnRighClickMarker.bind(this, marker, index, coordinates)
        );
      }
    });
  }
  reset() {
    this.markers.forEach((m) => {
      m.remove();
    });
    this.markers = [];
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
