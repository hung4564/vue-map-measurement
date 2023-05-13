import { bearing, bearingToAzimuth, lineString, point } from "@turf/turf";

import { Measure } from "./_measurment";

export class MeasureAzimuth extends Measure {
  get setting() {
    return { maxLength: 2 };
  }
  add(coordinate) {
    if (this.value.length > 1) {
      this.value = this.value.slice(0, 1);
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
    if (this.coordinates.length == 1) {
      result.features = [point(this.coordinates[0])];
      return result;
    }
    let end = this.coordinates[this.coordinates.length - 1];
    let start = this.coordinates[this.coordinates.length - 2];
    let line = lineString(this.coordinates);
    result.features = [line];
    const lineBearing = bearing(start, end);
    result.value = bearingToAzimuth(lineBearing).toFixed(3);
    result.features_label = [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: end
        },
        properties: {
          is_label: true,
          text: `${result.value} °`,
          rotation: lineBearing - 90
        }
      }
    ];
    result.fields = [
      {
        trans: "map.measurement.setting.azimuth",
        value: `${result.value} °`
      }
    ];
    return result;
  }
}
