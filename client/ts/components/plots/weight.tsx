import * as React from 'react';
import {prettyNum} from "../../common";
import {colors, PlotlyComponent} from "./common";
import * as gaussian from 'gaussian';


export const WeightPlot = ({reps, max, error}) => {
    let data, layout, config, weightMean, weightVar, minWeight, weightRange, weightDelta, maxWeight, weightInterval,
        weightDist, xRange = [0, 1], yRange = [0, 1], x = [], y = [], discreteRange, hoverX = [], hoverY = [], b,
        text = [];
    if (reps > 0) {
        b = 30 / (30 + reps);
        weightMean = b * max;
        weightVar = b * error;
        weightInterval = 3.5 * Math.sqrt(weightVar);
        minWeight = weightMean - weightInterval;
        maxWeight = weightMean + weightInterval;
        weightRange = maxWeight - minWeight;
        discreteRange = Math.ceil(maxWeight) - Math.floor(minWeight);
        weightDelta = weightRange / 100;
        weightDist = gaussian(weightMean, weightVar);

        x = Array.from(Array(100).keys()).map(k => minWeight + weightDelta * k);
        y = x.map(r => weightDist.pdf(r));
        hoverX = Array.from(Array(discreteRange * 2).keys()).map(k => Math.floor(minWeight) + 0.5 * k);
        hoverY = hoverX.map(r => weightDist.pdf(r));
        text = hoverX.map(r => `${r} pounds: ${prettyNum((1 - weightDist.cdf(r)) * 100)}%`);
        xRange = [minWeight, maxWeight];
        yRange = [0, 1.05 * weightDist.pdf(weightMean)];
    }

    data = [{
        x: [minWeight - 1, ...x, maxWeight + 1], y: [0, ...y, 0],
        fill: 'tozerox',
        fillColor: colors.confidence,
        type: "scatter",
        mode: "lines",
        shape: "spline",
        line: {color: "rgb(100, 149, 237)"},
        hoverinfo: "none"
    }, {
        x: hoverX, y: hoverY, text,
        type: "scatter",
        mode: "none",
        hoverinfo: "text"
    }];

    layout = {
        height: 200,
        showlegend: false,
        xaxis: {title: 'Weight (Pounds)', range: xRange},
        yaxis: {showline: false, showticklabels: false, range: yRange},
        margin: {
            l: 30,
            r: 30,
            b: 35,
            t: 30
        }
    };

    config = {
        showLink: false,
        displayModeBar: false
    };

    return (
        <div className="plot-div"><PlotlyComponent data={data} layout={layout} config={config}/></div>
    )
};