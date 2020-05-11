import * as React from 'react';
import * as moment from 'moment';
import {prettyNum, xdate} from "../../common";
import {colors, PlotlyComponent} from "./common";


export const PaceEstimatorPlot = (props) => {
    let {estimates, name, showPeak, x = [], y = []} = props,
        days = estimates.days.map(m => m.toDate()),
        lowerY = [], upperY = [], today = xdate(), current,
        means, mean, lowerBound, upperBound, observations,
        data, layout, config, peak, peakDay, peakValue, i;

    let fpsToPace = fps => {
        return 5280 / fps / 60;
    };

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

    means = estimates.means.map(t => fpsToPace(t));

    if (estimates.days.length) {

        for (i = 0; i < estimates.days.length; i++) {
            let upper = fpsToPace(estimates.means[i] - 2 * estimates.stds[i]),
                lower = fpsToPace(estimates.means[i] + 2 * estimates.stds[i]);
            if (!peakDay) {
                peakDay = days[i];
                peakValue = means[i];
            }
            else if (means[i] > peakValue) {
                peakDay = days[i];
                peakValue = means[i];
            }

            lowerY.push(lower);
            upperY.push(upper);

            if (estimates.days[i].dayOfYear() == today.dayOfYear() && estimates.days[i].year() == today.year()) {
                current = means[i];
            }
        }

        layout.yaxis = {range: [0.9 * Math.min(...lowerY), 1.1 * Math.max(...upperY)]};

        upperBound = {
            x: days,
            y: upperY,
            text: upperY.map(v => moment.utc(v * 60000).format("m:ss")),
            line: {color: "transparent"},
            name: `Upper bound ${name}`,
            showlegend: false,
            type: "scatter",
            hoverinfo: "name+x+text",
            hoverlabel: {bgcolor: "rgb(64, 64, 64)", namelength: -1, font: {color: "white"}}
        };

        lowerBound = {
            x: days,
            y: lowerY,
            text: lowerY.map(v => moment.utc(v * 60000).format("m:ss")),
            fill: "tonexty",
            fillcolor: colors.confidence,
            line: {color: "transparent"},
            name: `Lower bound ${name}`,
            showlegend: false,
            type: "scatter",
            hoverinfo: "name+x+text",
            hoverlabel: {bgcolor: "rgb(64, 64, 64)", namelength: -1, font: {color: "white"}}
        };

        mean = {
            x: days,
            y: means,
            text: means.map(v => moment.utc(v * 60000).format("m:ss")),
            line: {color: colors.prediction},
            mode: "lines",
            name: `Estimated ${name}`,
            type: "scatter",
            hoverinfo: "name+x+text",
            hoverlabel: {namelength: -1}
        };

        observations = {
            x, y, text: y.map(v => moment.utc(v * 60000).format("m:ss")),
            mode: 'markers',
            color: 'rgba(128, 0, 0, 0.5)',
            type: 'scatter',
            name: "Observed",
            hoverinfo: "name+text+x"
        };

        current = {
            x: [new Date(today.format("YYYY/MM/DD")), new Date(today.format("YYYY/MM/DD"))],
            y: [0, 1.15 * Math.max(...upperY)],
            line: {color: 'rgba(128, 0, 0, 0.5)', dash: 'dot'},
            mode: "lines",
            name: 'Today',
            hoverinfo: "name"
        };

        peak = {
            x: [peakDay, peakDay],
            y: [0, 1.15 * Math.max(...upperY)],
            line: {color: 'rgba(0, 128, 0, 0.5)', dash: 'dot'},
            mode: "lines",
            name: 'Peak',
            hoverinfo: "name"
        };

        data = [upperBound, lowerBound, mean, observations, current];
        if (showPeak && peakValue != means[means.length - 1]) data = [...data, peak];
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
