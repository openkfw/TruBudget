import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import React, { Component } from "react";
import LiquidFillGauge from "react-liquid-gauge";

import red from "@material-ui/core/colors/red";
import indigo from "@material-ui/core/colors/indigo";

class GaugeChart extends Component {
  state = {
    value: 0
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    const { size = 0.25, responsive = false, startColor = indigo[200], endColor = red[200] } = this.props;

    const radius = this.myInput && responsive ? this.myInput.offsetHeight * size : 200 * size;
    const interpolate = interpolateRgb(startColor, endColor);
    const fillColor = interpolate(0);
    const overSpent = interpolate(this.state.value / 100);

    const selectedColor = this.state.value > 100 ? overSpent : fillColor;

    const gradientStops = [
      {
        key: "0%",
        stopColor: color(selectedColor)
          .darker(0.5)
          .toString(),
        stopOpacity: 1,
        offset: "0%"
      },
      {
        key: "50%",
        stopColor: selectedColor,
        stopOpacity: 0.75,
        offset: "50%"
      },
      {
        key: "100%",
        stopColor: color(selectedColor)
          .brighter(0.5)
          .toString(),
        stopOpacity: 0.5,
        offset: "100%"
      }
    ];

    return (
      <div ref={input => (this.myInput = input)}>
        <LiquidFillGauge
          style={{ margin: "0 auto" }}
          width={radius * 2}
          height={radius * 2}
          value={this.state.value}
          percent="%"
          textSize={1}
          textOffsetX={0}
          textOffsetY={0}
          textRenderer={props => {
            const value = Math.round(props.value);
            const radius = Math.min(props.height / 2, props.width / 2);
            const textPixels = props.textSize * radius / 2;
            const valueStyle = {
              fontSize: textPixels
            };
            const percentStyle = {
              fontSize: textPixels * 0.6
            };

            return (
              <tspan>
                <tspan className="value" style={valueStyle}>
                  {value}
                </tspan>
                <tspan style={percentStyle}>{props.percent}</tspan>
              </tspan>
            );
          }}
          riseAnimation
          waveAnimation
          waveFrequency={2}
          waveAmplitude={1}
          gradient
          gradientStops={gradientStops}
          circleStyle={{
            fill: selectedColor
          }}
          waveStyle={{
            fill: selectedColor
          }}
          textStyle={{
            fill: color("#444").toString(),
            fontFamily: "Arial"
          }}
          waveTextStyle={{
            fill: color("#fff").toString(),
            fontFamily: "Arial"
          }}
        />
      </div>
    );
  }
}

export default GaugeChart;
