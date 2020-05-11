import * as React from 'react';
import {xdate} from "../../common";
import {colors, PlotlyComponent} from "./common";


export const EstimatorPlot = (props) => {
    let {estimates, name, showPeak, x = [], y = [], text = [], yLabel} = props,
        days = estimates.days.map(m => m.toDate()),
        lowerY = [], upperY = [], today = xdate(), current,
        mean, lowerBound, upperBound, observations,
        data, layout, config, peak, peakDay, peakValue, i;

    layout = {
        height: 300,
        showlegend: false,
        title: `Predicted ${name}`,
        margin: {
            l: 65,
            r: 50,
            b: 50,
            t: 50
        }
    };

    if (estimates.days.length) {

        for (i = 0; i < estimates.days.length; i++) {
            let lower = estimates.means[i] - 2 * estimates.stds[i],
                upper = estimates.means[i] + 2 * estimates.stds[i];
            if (!peakDay) {
                peakDay = estimates.days[i];
                peakValue = lower;
            }
            else if (estimates.means[i] > peakValue) {
                peakDay = estimates.days[i];
                peakValue = estimates.means[i];
            }

            lowerY.push(lower);
            upperY.push(upper);

            if (estimates.days[i].dayOfYear() == today.dayOfYear() && estimates.days[i].year() == today.year()) {
                current = estimates.means[i];
            }
        }

        layout.yaxis = {title: yLabel, range: [0.9 * Math.min(...lowerY, ...y), 1.1 * Math.max(...upperY, ...y)]};

        upperBound = {
            x: days,
            y: upperY,
            line: {color: "transparent"},
            name: `Upper bound ${name}`,
            showlegend: false,
            type: "scatter",
            hoverinfo: "name+x+y",
            hoverlabel: {bgcolor: "rgb(64, 64, 64)", namelength: -1, font: {color: "white"}}
        };

        lowerBound = {
            x: days,
            y: lowerY,
            fill: "tonexty",
            fillcolor: colors.confidence,
            line: {color: "transparent"},
            name: `Lower bound ${name}`,
            showlegend: false,
            type: "scatter",
            hoverinfo: "name+x+y",
            hoverlabel: {bgcolor: "rgb(64, 64, 64)", namelength: -1, font: {color: "white"}}
        };

        mean = {
            x: days,
            y: estimates.means,
            line: {color: colors.prediction},
            mode: "lines",
            name: `Estimated ${name}`,
            type: "scatter",
            hoverinfo: "name+x+y",
            hoverlabel: {namelength: -1}
        };

        observations = {
            x, y,
            mode: 'markers',
            color: 'rgba(128, 0, 0, 0.5)',
            type: 'scatter',
            name: 'Observed',
            hoverinfo: "name+text"
        };

        if (text.length > 0) observations.text = text;

        current = {
            x: [new Date(today.format("YYYY/MM/DD")), new Date(today.format("YYYY/MM/DD"))],
            y: [0, 1.15 * Math.max(...upperY, ...y)],
            line: {color: 'rgba(128, 0, 0, 0.5)', dash: 'dot'},
            mode: "lines",
            name: 'Today',
            hoverinfo: "name"
        };

        peak = {
            x: [new Date(peakDay.format("YYYY/MM/DD")), new Date(peakDay.format("YYYY/MM/DD"))],
            y: [0, 1.15 * Math.max(...upperY)],
            line: {color: 'rgba(0, 128, 0, 0.5)', dash: 'dot'},
            mode: "lines",
            name: 'Peak',
            hoverinfo: "name"
        };

        data = [upperBound, lowerBound, mean, observations, current];
        if (showPeak && peakValue != estimates.means[estimates.means.length - 1]) data = [...data, peak];
        layout.xaxis = {range: [days[0].getTime(), days[days.length - 1].getTime()]}
    } else data = [];

    config = {
        showLink: false,
        displayModeBar: false
    };

    return (
        <div className="plot-div"><PlotlyComponent data={data} layout={layout} config={config}/></div>
    )
};