import * as React from 'react';
import {prettyNum} from "../../common";
import {colors, PlotlyComponent} from "./common";


export const DietPlot = props => {
    let data = [], layout, config, calories, protein, carbohydrates, fiber, fat, dataOpts;

    protein = props.protein.map(e => 4 * e);
    fiber = props.fiber.map((e, i) => protein[i] + 4 * e);
    carbohydrates = props.carbohydrates.map((e, i) => protein[i] + 4 * e);
    fat = props.fat.map((e, i) => carbohydrates[i] + 9 * e);
    calories = props.calories.map((e, i) => Math.max(e, fat[i]));

    dataOpts = {
        type: "scatter",
        hoverinfo: "x+text",
        fill: "tonexty",
        showlegend: false,
        line: {color: "transparent"}
    };

    data.push({
        ...dataOpts,
        x: props.days,
        y: protein,
        text: props.protein.map((p, i) => `Protein: ${prettyNum(p)}g, ${prettyNum(4*props.protein[i]/calories[i] * 100)}%`),
        fillcolor: colors.protein,
    });

    data.push({
        ...dataOpts,
        x: props.days,
        y: fiber,
        text: props.fiber.map((f, i) => `Fiber: ${prettyNum(f)}g`),
        fillcolor: colors.fiber
    });

    data.push({
        ...dataOpts,
        x: props.days,
        y: carbohydrates,
        text: props.carbohydrates.map((c, i) => `Carbohydrates: ${prettyNum(c)}g, ${prettyNum(4*props.carbohydrates[i]/calories[i] * 100)}%`),
        fillcolor: colors.carbohydrates
    });

    data.push({
        ...dataOpts,
        x: props.days,
        y: fat,
        text: props.fat.map((f, i) => `Fat: ${prettyNum(f)}g, ${prettyNum(9*props.fat[i]/calories[i] * 100)}%`),
        fillcolor: colors.fat
    });

    data.push({
        ...dataOpts,
        x: props.days,
        y: calories,
        text: props.calories.map(c => `Total: ${prettyNum(c)} cal`),
        fillcolor: colors.calories
    });

    data.push({
        x: props.days,
        y: props.tdees,
        text: props.tdees.map(e => `Estimated TDEE: ${prettyNum(e)} cal`),
        line: {color: 'rgb(128, 128, 128)', dash: 'dot'},
        mode: "lines",
        hoverinfo: "x+text",
    });

    layout = {
        height: 300,
        showlegend: false,
        title: `Diet details`,
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