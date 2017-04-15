import React from 'react';
import { Map, MarkerGroup } from 'react-d3-map';

const NetworkMap = () => {
  var data = {
    "type": "Feature",
    "properties": {
      "text": "this is a Point!!!"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [122, 23.5]
    }
  }
  var width = 700;
  var height = 700;
  // set your zoom scale
  var scale = 1200 * 5;
  // min and max of your zoom scale
  var scaleExtent = [1 << 12, 1 << 13]
  // set your center point
  var center = [122, 23.5];
  // set your popupContent
  var popupContent = function (d) { return d.properties.text; }


  return (
    <Map
      width={width}
      height={height}
      scale={scale}
      scaleExtent={scaleExtent}
      center={center}
    >
      <MarkerGroup
        key={"polygon-test"}
        data={data}
        popupContent={popupContent}
        markerClass={"your-marker-css-class"}
      />
    </Map>
  );
}

export default NetworkMap;
