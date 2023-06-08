import { Reader } from "@models/GeoJsonIO/Reader/Reader";
import gjv from "geojson-validation";

export async function validateSimpleFileGeojson(file, options = {}) {
  let { max_size = 1 } = options;
  if (!file) {
    throw new Error("Tập tin không tồn tại");
  }
  const fileSize = file.size / 1024 / 1024; // in MiB
  if (fileSize > max_size) {
    throw new Error("Tập tin không được lớn hơn " + max_size + " MB");
  }
  if (!validate_fileupload(file.name)) {
    throw new Error("Tập tin không đúng định dạng");
  }
  let geojson = await new Reader().read(file).catch(() => {
    throw new Error("Tập tin không đọc được hoặc không đúng định dạng");
  });
  if (!gjv.valid(geojson)) {
    throw new Error("Tập tin không đúng định dạng GeoJSON");
  }
  return geojson;
}
export function vallidatePolygonGeojson(geojson) {
  let feature = null;
  if (geojson.type == "FeatureCollection") {
    feature = geojson.features.find((x) =>
      ["Polygon"].includes(x.geometry.type)
    );
  } else if (geojson.type == "Feature") {
    feature = geojson;
  }
  if (
    !feature ||
    !feature.geometry ||
    !["Polygon"].includes(feature.geometry.type)
  ) {
    feature = null;
  }
  return feature;
}
export function vallidatePointGeojson(geojson) {
  let feature = null;
  if (geojson.type == "FeatureCollection") {
    feature = geojson.features.find((x) => ["Point"].includes(x.geometry.type));
  }
  if (
    !feature.geometry ||
    (feature && !["Point"].includes(feature.geometry.type))
  ) {
    feature = null;
  }
  return feature;
}
export function vallidateLineStringGeojson(geojson) {
  let feature = null;
  if (geojson.type == "FeatureCollection") {
    feature = geojson.features.find((x) =>
      ["LineString"].includes(x.geometry.type)
    );
  }
  if (
    !feature.geometry ||
    (feature && !["LineString"].includes(feature.geometry.type))
  ) {
    feature = null;
  }
  return feature;
}
function validate_fileupload(
  fileName,
  allowed_extensions = ["json", "geojson"]
) {
  let file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.

  for (let i = 0; i <= allowed_extensions.length; i++) {
    if (allowed_extensions[i] == file_extension) {
      return true; // valid file extension
    }
  }

  return false;
}
