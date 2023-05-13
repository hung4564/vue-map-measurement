import { View } from "./_view";

export class FormView extends View {
  start({ setting } = {}) {
    if (this.onChangeSetting) {
      this.onChangeSetting(setting);
    }
  }
  view({ coordinates = [], setting = {}, fields = [] } = {}) {
    if (this.onChangeValue) {
      this.onChangeValue(coordinates);
    }
    if (this.onChangeSetting) {
      setting.fields = fields;
      this.onChangeSetting(setting);
    }
  }
  reset() {
    if (this.onChangeValue) {
      this.onChangeValue([]);
    }
    if (this.onChangeSetting) {
      this.onChangeSetting();
    }
  }
}
