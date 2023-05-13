export class Measure {
  constructor() {
    this.value = [];
  }
  get coordinates() {
    return this.value.filter((x) => x[0] != null && x[1] != null);
  }
  start() {}
  add(coordinate) {
    let index = getFirstIndexNotVaild(this.value);
    if (index >= 0) {
      this.value[index] = coordinate;
    } else {
      this.value.push(coordinate);
    }
  }
  init(coordinates) {
    this.value = coordinates;
  }
  getResult() {}
  reset() {
    this.value = [];
  }
  destroy() {
    this.value = [];
  }
}
function getFirstIndexNotVaild(coordinates = []) {
  return coordinates.findIndex((value) => !value[0] || !value[1]);
}
export function formatNumber(number, locales = "vi") {
  return new Intl.NumberFormat(locales).format(number);
}
