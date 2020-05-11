import * as React from 'react';
import {prettyNum} from "../../common";
import {colors, PlotlyComponent} from "./common";


export const Sparkline = ({x, y}) => {
    let data, layout, config;

    data = [{x, y, text: y.map(v => prettyNum(v)), line: {color: colors.prediction}, hoverinfo: "text+x"}];

    layout = {
        height: 40,
        showlegend: false,
        xaxis: {showline: false, showticklabels: false},
        yaxis: {showline: false, showticklabels: false},
        margin: {
            l: 2,
            r: 2,
            b: 2,
            t: 2
        }
    };

    config = {
        showLink: false,
        displayModeBar: false
    };

    return (
        <div className="spark-plot-div"><PlotlyComponent data={data} layout={layout} config={config}/></div>
    );
};