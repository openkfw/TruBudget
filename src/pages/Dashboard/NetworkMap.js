import React, { Component } from 'react';
import { Map, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import { CardHeader } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import ListItem from 'material-ui/List/ListItem';

export default class NetworkMap extends Component {
  parseAddresses(nodeInformation) {

    console.log("<<<< input: ", nodeInformation);
    let addresses = [];

    for (let node in nodeInformation) {
      if (nodeInformation.hasOwnProperty(node)) {
        addresses.push(nodeInformation[node]);
      }
    }
    console.log("<<<< addresses: ", addresses);
    return addresses;
  }

  createMesh(addresses) {
    let allDirections = [];
    for (let i = 0; i < addresses.length - 1; i++) {
      for (let j = i + 1; j < addresses.length; j++) {
        allDirections.push(
          {
            "type": "Feature",
            "properties": {
              "stroke": "#555555",
              "stroke-width": 2,
              "stroke-opacity": 1
            },
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [addresses[i].lng, addresses[i].lat],
                [addresses[j].lng, addresses[j].lat],
              ]
            }
          });
      }
    }
    console.log("<<<< alldirections: ", allDirections);
    const mesh = {
      "type": "FeatureCollection",
      "features": allDirections
    }

    return mesh;
  }

  createPoints(addresses) {
    const points = addresses.map((address, index) => {
      return (
        <Marker key={index} position={[address.lat, address.lng]}>
          <Popup>
            <div>
              {address.country} - {address.description}
            </div>
          </Popup>
        </Marker>
      )
    });

    return points
  }
  renderMap(mesh, points) {
    const position = [15, 0];

    return (
      <Map
        center={position}
        zoom={3}
        style={{ width: '100%', height: '500px' }}>
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          ref="geojson"
          data={mesh}
        />
        {points}
      </Map>
    )
  }

  render() {
    console.log('render');
    const nodeInformation = this.props.nodeInformation;
    const addresses = this.parseAddresses(nodeInformation);
    const mesh = this.createMesh(addresses);
    const points = this.createPoints(addresses);
    console.log(mesh, points);

    return (addresses.length > 0 ? this.renderMap(mesh, points) : null);

  }
}


