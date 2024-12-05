import shapefile from "shapefile";

async function read(shp: any, dbf: any, convert: any) {
  const result = await shapefile.open(shp, dbf, { encoding: "UTF-8" });
  const features = [];
  try {
    for (;;) {
      const { done, value: feature } = await result.read();
      if (feature) {
        // if (convert) {
        //   feature.geometry.coordinates = convert(feature.geometry.coordinates);
        // }
        features.push(feature);
      }
      if (done) break;
    }
  } catch (err) {
    console.log(err);
  }

  const jeoJson = {
    type: "FeatureCollection",
    features: features,
  };

  return jeoJson;
}

export { read };
