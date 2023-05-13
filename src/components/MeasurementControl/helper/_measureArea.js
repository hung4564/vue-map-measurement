import { Measure, formatNumber } from "./_measurment";
import { area, centroid, lineString, point, polygon } from "@turf/turf";
export class MeasureArea extends Measure {
  getResult() {
    let features = [];
    let value = 0;
    let features_label = [];
    let result = {
      features,
      value,
      features_label
    };
    if (!this.coordinates || this.coordinates.length < 1) {
      return result;
    }
    if (this.coordinates.length == 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }
    if (this.coordinates.length == 2) {
      result.features = [lineString(this.coordinates)];
      return result;
    }
    let geometry = polygon([[...this.coordinates, this.coordinates[0]]]);
    result.features = [geometry];
    result.value = area(geometry);
    result.features_label = [
      centroid(geometry, {
        properties: {
          is_label: true,
          is_center: true,
          text: formatAreaText(result.value)
        }
      })
    ];
    result.fields = [
      {
        trans: "map.measurement.setting.area",
        value: formatAreaText(result.value)
      }
    ];
    return result;
  }
}
function formatAreaText(value = 0) {
  if (value < 10_000_000) {
    return `${formatNumber(value.toFixed(2))} m²`;
  }
  return `${formatNumber((value / 1_000_000).toFixed(2))} km²`;
}
