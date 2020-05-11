import * as React from 'react';
import {prettyNum} from "../../common";
import {colors, PlotlyComponent} from "./common";
import * as gaussian from 'gaussian';


export const RepsPlot = ({weight, max, error}) => {
    let data, layout, config, repMean, repVar, minReps, repRange, repDelta, maxReps, repInterval, repDist,
        xRange, yRange, x, y, text, discreteRange, hoverX, hoverY;
    if (weight > 0) {
        repMean = 30 * max / weight - 30;
        repVar = 30 * error / weight;

        repInterval = 3.5 * Math.sqrt(repVar);
        minReps = repMean - repInterval;
        maxReps = repMean + repInterval;
        repRange = maxReps - minReps;
        discreteRange = Math.ceil(maxReps) - Math.floor(minReps);
        repDelta = repRange / 100;
        repDist = gaussian(repMean, repVar);

        x = Array.from(Array(100).keys()).map(k => minReps + repDelta * k);
        hoverX = Array.from(Array(discreteRange).keys()).map(k => Math.floor(minReps) + k);
        hoverY = hoverX.map(r => repDist.pdf(r));
        y = x.map(r => repDist.pdf(r));
        text = hoverX.map(r => `${r} repetitions: ${prettyNum((1 - repDist.cdf(r)) * 100)}%`);
        xRange = [minReps, maxReps];
        yRange = [0, 1.05 * repDist.pdf(repMean)];
    } else {
        x = [];
        y = [];
        xRange = [0, 1];
        yRange = [0, 1];
    }


    data = [{
        x: [minReps - 1, ...x, maxReps + 1], y: [0, ...y, 0],
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
        xaxis: {title: `Repetitions at ${prettyNum(weight)} Pounds`, range: xRange},
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