import {asyncComponent} from 'react-async-component';

export var PlotlyComponent: any = asyncComponent({
    resolve: () => import('./plotly').then(module => module.PlotlyComponent as any)
});

export const colors = {
    confidence: "rgba(100, 149, 237, 0.2)",
    prediction: "rgb(16, 16, 96)",
    fat: 'rgba(255, 247, 147, 0.5)',
    protein: 'rgba(178, 44, 0, 0.5)',
    fiber: 'rgba(68, 132, 0, 0.5)',
    carbohydrates: 'rgba(165, 102, 0, 0.5)',
    calories: 'rgba(225, 225, 225, 0.5)'
};