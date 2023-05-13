export * from "./_view";
export * from "./_viewMap";
export * from "./_viewMapMarker";
export * from "./_measurment";
export * from "./_measureDistance";
export * from "./_measureArea";
export * from "./_measureAzimuth";
export * from "./_measurePoint";

export * from "./_handle";
export function addCursorCrosshair(map) {
  if (!map) {
    return;
  }
  let canvas = map.getCanvas();
  canvas.classList.add("cursor-crosshair");
}

export function removeCursorCrosshair(map) {
  if (!map) {
    return;
  }
  let canvas = map.getCanvas();
  canvas.classList.remove("cursor-crosshair");
}
