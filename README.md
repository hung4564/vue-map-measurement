<h1 align="center">Vue map measurement</h1>

# Vue library draggable

## Install

```
npm i @hungpv4564/vue-map-measurement
```

```
yarn add @hungpv4564/vue-map-measurement
```

## Usage

```vue
<template>
  <div id="app">
    <Map locale="vi">
      <BaseMapControl position="bottom-left" />
      <PrintControl />
      <GeolocateControl />
      <HomeControl />
      <ZoomControl />

      <FullScreenControl />
      <MouseCoordinatesControl />
    </Map>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import {
  FullScreenControl,
  MouseCoordinatesControl,
  ZoomControl,
  HomeControl,
  GeolocateControl,
  BaseMapControl,
  Map,
  PrintControl
} from "@hungpv4564/vue-library-draggable";
import "@hungpv4564/vue-library-map/dist/map.css";

export default {
  name: "App",
  components: {
    FullScreenControl,
    MouseCoordinatesControl,
    ZoomControl,
    HomeControl,
    GeolocateControl,
    BaseMapControl,
    Map,
    PrintControl
  }
};
</script>
<style>
* {
  padding: 0;
  margin: 0;
}

body,
html,
#app {
  height: 100%;
}
</style>
```

## Components

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.

```bash
# serve with hot reload at localhost:8080
npm run serve

# distribution build
npm run build

```

## License

[MIT license](LICENSE)
