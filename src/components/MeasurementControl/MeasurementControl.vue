<template>
  <ModuleContainer v-bind="bindModule">
    <template #btn>
      <MapControlGroupButton row v-if="!measurement_type">
        <MapControlButton
          :tooltip="$map.trans('map.measurement.tools.distance')"
          @click="onMeasureDistance()"
          :active="measurement_type == 'distance'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.distance" />
        </MapControlButton>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.tools.area')"
          @click="onMeasureArea()"
          :active="measurement_type == 'area'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.area" />
        </MapControlButton>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.tools.azimuth')"
          @click="onMeasureAzimuth()"
          :active="measurement_type == 'azimuth'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.azimuth" />
        </MapControlButton>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.tools.point')"
          @click="onMeasureMarker()"
          :active="measurement_type == 'point'"
        >
          <SvgIcon :size="18" type="mdi" :path="path.point" />
        </MapControlButton>
      </MapControlGroupButton>

      <MapControlGroupButton v-else row>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.action.setting')"
          @click="toggleSetting()"
          :active="setting.show"
        >
          <SvgIcon :size="18" type="mdi" :path="path.setting" />
        </MapControlButton>
        <MapControlButton
          :disabled="!coordinates || coordinates.length < 1"
          :tooltip="$map.trans('map.measurement.action.fly-to')"
          @click="onFlyTo()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.fillBound" />
        </MapControlButton>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.action.clear')"
          @click="reset()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.clear" />
        </MapControlButton>
        <MapControlButton
          :tooltip="$map.trans('map.measurement.action.close')"
          @click="clear()"
        >
          <SvgIcon :size="18" type="mdi" :path="path.close" />
        </MapControlButton>
      </MapControlGroupButton>
    </template>

    <slot />
    <MeasurementSettingPopup
      :show="!!measurement_type && setting.show"
      v-model="coordinates"
      @update:show="setting.show = $event"
      :position="position"
      @input="setValue"
      :maxLength="setting.maxLength"
      :fields="setting.fields"
    />
  </ModuleContainer>
</template>

<script>
//import mapboxgl from '@plugins/mapbox-gl'
import {
  ModuleMixin,
  MapControlButton,
  MapControlGroupButton
} from "@hungpv97/vue-library-map/mixin";
import { storeMapLang, storeEvent } from "@hungpv97/vue-library-map/store";
import { createMapboxImage, fitBounds } from "@hungpv97/vue-library-map/helper";
import enLang from "@/lang/en/map";
import viLang from "@/lang/vi/map";
import {
  mdiRulerSquareCompass,
  mdiRuler,
  mdiTableHeadersEye,
  mdiMapMarkerOutline,
  mdiDeleteOutline,
  mdiClose,
  mdiCogOutline,
  mdiCrosshairsGps
} from "@mdi/js";
import {
  MeasurementHandle,
  MeasureDistance,
  MapView,
  MapMarkerView,
  MeasureArea,
  MeasureAzimuth,
  MeasurePoint,
  addCursorCrosshair,
  removeCursorCrosshair
} from "./helper";
import MeasurementSettingPopup from "./MeasurementSettingPopup.vue";
import { FormView } from "./helper/_viewForm";
import { lineString, point, polygon } from "@turf/helpers";
let handler = new MeasurementHandle();
const DEFAULT_COLOR_HIGHLIGHT = "#004E98";
export default {
  components: {
    MapControlButton,
    MapControlGroupButton,
    MeasurementSettingPopup
  },
  mixins: [ModuleMixin],

  data() {
    return {
      coordinates: [],
      measurement_type: undefined,
      show: false,
      setting: { show: true, maxLength: 0, fields: [] }
    };
  },
  computed: {
    path() {
      return {
        fillBound: mdiCrosshairsGps,
        distance: mdiRuler,
        area: mdiRulerSquareCompass,
        azimuth: mdiTableHeadersEye,
        point: mdiMapMarkerOutline,
        clear: mdiDeleteOutline,
        close: mdiClose,
        setting: mdiCogOutline
      };
    }
  },
  watch: {
    "$map.locale": {
      handler(value) {
        this.setLocale(value);
      },
      immediate: true
    }
  },

  methods: {
    async setLocale(locale) {
      if (typeof locale == "object") {
        storeMapLang.updateMapLang(this.$map.id, locale);
      } else if (["en", "vi"].includes(locale)) {
        let res = locale == "en" ? enLang : viLang;
        storeMapLang.updateMapLang(this.$map.id, { map: res });
      }
    },
    onInit() {
      createMapboxImage(
        this.map,
        "azimuth-arrow",
        require("@/assets/img/arrow.png"),
        { sdf: true }
      );

      createMapboxImage(
        this.map,
        "measurment-round",
        require("@/assets/img/rounded.png"),
        {
          content: [4, 4, 12, 12],
          stretchX: [[6, 10]],
          stretchY: [[6, 10]]
        }
      );

      handler = new MeasurementHandle();
      let mapView = new MapView(this.map);
      mapView.init(
        [
          {
            type: "line", // For outline
            paint: {
              "line-color": DEFAULT_COLOR_HIGHLIGHT,
              "line-width": 2
            }
          },
          {
            type: "fill", // For outline
            filter: ["==", "$type", "Polygon"],
            paint: {
              "fill-color": DEFAULT_COLOR_HIGHLIGHT,
              "fill-opacity": 0.3
            }
          },

          {
            type: "symbol",
            filter: ["has", "rotation"],
            paint: { "icon-color": DEFAULT_COLOR_HIGHLIGHT },
            layout: {
              "icon-size": 1.2,
              "icon-rotate": {
                type: "identity",
                property: "rotation"
              },
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              // 'icon-ignore-placement': true,
              "icon-image": "azimuth-arrow",
              visibility: "visible"
            }
          },
          // {
          //   type: 'circle',
          //   filter: ['==', '$type', 'Point'],
          //   paint: {
          //     'circle-radius': 4,
          //     'circle-color': vm.color,
          //     'circle-stroke-color': 'black',
          //     'circle-stroke-width': 0.5,
          //   },
          // },
          {
            type: "symbol",
            filter: ["all", ["has", "is_label"], ["==", "$type", "Point"]],
            layout: {
              "text-field": "{text}",
              "text-offset": [
                "case",
                ["to-boolean", ["get", "is_center"]],
                ["literal", [0, 0]],
                ["literal", [0, 2]]
              ],
              "text-size": 14,
              "text-allow-overlap": true,
              "icon-allow-overlap": true,
              "icon-image": "measurment-round",
              "icon-text-fit": "both"
            },
            paint: {
              "text-color": "#fff",
              "text-halo-color": DEFAULT_COLOR_HIGHLIGHT,
              "text-halo-width": 2
            }
          }
        ],
        {
          data: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          }
        }
      );
      this.onMapClickBind = this.onMapClick.bind(this);
      mapView.onStart = () => {
        if (!this.map) {
          return;
        }
        this.eventClickId = storeEvent.addListenerMap(
          this.map.id,
          "click",
          this.onMapClickBind
        );
        addCursorCrosshair(this.map);
      };
      mapView.onRestet = () => {
        if (this.map) removeCursorCrosshair(this.map);
        if (this.eventClickId) {
          storeEvent.removeListenerMap(this.map.id, "click", this.eventClickId);
        }
      };
      let markerView = new MapMarkerView(this.map);
      markerView.setColor(DEFAULT_COLOR_HIGHLIGHT);
      markerView.onDragMarker = (coordinates) => {
        handler.init(coordinates);
      };

      markerView.onRighClickMarker = (coordinates, _, index) => {
        coordinates.splice(index, 1);
        handler.init(coordinates);
      };

      let formView = new FormView();
      formView.onChangeValue = (coordinates) => {
        this.coordinates = coordinates;
        this.$forceUpdate();
      };
      formView.onChangeSetting = (setting = {}) => {
        this.setting.maxLength = setting.maxLength || 0;
        let fields = setting.fields;
        if (!fields || fields.length == 0) {
          fields = [
            {
              text: this.$map.trans("map.measurement.no-data.text"),
              value: this.$map.trans("map.measurement.no-data.value")
            }
          ];
        }
        this.setting.fields = fields.map((x) => ({
          ...x,
          text: x.trans ? this.$map.trans(x.trans) : x.text
        }));
        this.$forceUpdate();
      };
      handler.addView(mapView);
      handler.addView(markerView);
      handler.addView(formView);
    },
    onDestroy() {
      if (handler) {
        handler.destroy();
      }
      this.clear();
    },
    onMeasureDistance() {
      if (!this.checkMeasureRun("distance")) return;
      this.measurement_type = "distance";
      handler.setAction(new MeasureDistance());
      handler.start();
    },
    onMeasureArea() {
      if (!this.checkMeasureRun("area")) return;
      handler.setAction(new MeasureArea());
      handler.start();
    },
    onMeasureAzimuth() {
      if (!this.checkMeasureRun("azimuth")) return;
      handler.setAction(new MeasureAzimuth());
      handler.start();
    },
    onMeasureMarker() {
      if (!this.checkMeasureRun("point")) return;
      handler.setAction(new MeasurePoint());
      handler.start();
    },
    onMapClick(event) {
      const newCoordinate = [event.lngLat.lng, event.lngLat.lat];
      if (handler.action) handler.add(newCoordinate);
    },
    checkMeasureRun(type) {
      this.reset();
      if (this.measurement_type == type) {
        this.measurement_type = null;
        handler.setAction(null);
        return false;
      }
      this.measurement_type = type;
      return true;
    },
    clear() {
      this.reset();
      this.measurement_type = null;
      if (handler) handler.setAction(null);
    },
    reset() {
      if (handler) handler.reset();
    },
    setValue(coordinates = []) {
      if (handler) handler.init(coordinates);
    },
    toggleSetting() {
      this.setting.show = !this.setting.show;
    },
    onFlyTo() {
      fitBounds(this.map, this.convertGeometry(this.coordinates));
    },
    convertGeometry(coordinates) {
      if (coordinates.length == 0) {
        return;
      }
      if (coordinates.length == 1) {
        return point(coordinates[0]);
      }
      if (coordinates.length == 2) {
        return lineString(coordinates);
      }
      return polygon([[...coordinates, coordinates[0]]]);
    }
  }
};
</script>
<style>
.cursor-crosshair {
  cursor: crosshair;
}
</style>
