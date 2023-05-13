import { Measure } from "./_measurment";
import { point } from "@turf/turf";

export class MeasurePoint extends Measure {
  get setting() {
    return { maxLength: 1 };
  }
  add(coordinate) {
    if (this.value.length > 0) {
      this.value = [];
    }
    this.value.push(coordinate);
  }
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
    result.features = [point(this.coordinates[0])];
    let lng = this.coordinates[0][0].toFixed(6);
    let lat = this.coordinates[0][1].toFixed(6);
    result.value = `${lng}, ${lat}`;
    result.features_label = [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: this.coordinates[0]
        },
        properties: {
          is_label: true,
          text: result.value
        }
      }
    ];
    result.fields = [
      {
        trans: "map.measurement.setting.point",
        value: result.value
      }
    ];
    return result;
  }
}
