import { Measure, formatNumber } from "./_measurment";
import { length, lineString, point } from "@turf/turf";

export class MeasureDistance extends Measure {
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
    let line = lineString(this.coordinates);
    result.features = [line];
    result.value = length(line);
    result.features_label = this.coordinates.map((x, i, array) => {
      return {
        type: "Feature",
        properties: {
          is_label: true,
          text: formatDistanceText(
            i < 1 ? 0 : length(lineString(array.slice(0, i + 1)))
          )
        },
        geometry: { type: "Point", coordinates: x }
      };
    });
    result.fields = [
      {
        trans: "map.measurement.setting.distance",
        value: formatDistanceText(result.value)
      }
    ];
    return result;
  }
}
function formatDistanceText(value = 0) {
  if (value < 10) {
    return `${formatNumber((value * 1000).toFixed(2))} m`;
  }
  return `${formatNumber(value.toFixed(2))} km`;
}
