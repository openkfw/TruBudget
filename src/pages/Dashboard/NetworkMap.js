import React, { Component } from 'react';
import { Map, MarkerGroup } from 'react-d3-map';

export default class NetworkMap extends Component {
  render() {
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
    var height = 500;
    // set your zoom scale
    var scale = 700;
    // min and max of your zoom scale
    var scaleExtent = [1 << 12, 1 << 13]
    // set your center point
    var center = [15, 45];

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
          markerClass={"your-marker-css-class"}
        />
      </Map>
    );

  }
}
