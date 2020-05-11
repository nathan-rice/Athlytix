import Plotly from 'plotly.js/lib/core';
import * as scatter from 'plotly.js/lib/scatter';
import createPlotlyComponent from 'react-plotlyjs';

Plotly.register([scatter]);

export const PlotlyComponent = createPlotlyComponent(Plotly);
