import * as React from 'react';
import {prettyNum} from "../../common";
import {colors, PlotlyComponent} from "./common";


export const BodyCompositionPlot = props => {
    let data = [], layout, config, dataOpts, fm;

    fm = props.fm.map((e, i) => e + props.lbm[i]);

    dataOpts = {
        x: props.days,
        type: "scatter",
        hoverinfo: "x+text",
        fill: "tonexty",
        showlegend: false,
        line: {color: "transparent"}
    };

    data.push({
        ...dataOpts,
        y: props.lbm,
        text: props.lbm.map(m => `Lean body mass: ${prettyNum(m)} pounds`),
        fillcolor: colors.protein
    });

    data.push({
        ...dataOpts,
        y: fm,
        text: props.fm.map(m => `Fat mass: ${prettyNum(m)} pounds`),
        fillcolor: colors.fat
    });

    data.push({
        ...dataOpts,
        y: fm,
        text: fm.map(m => `Body mass: ${prettyNum(m)} pounds`),
        fillcolor: colors.calories
    });

    layout = {
        height: 300,
        showlegend: false,
        title: `Body composition`,
        margin: {
            l: 65,
            r: 50,
            b: 50,
            t: 50
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