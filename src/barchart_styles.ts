// set the dimensions and margins of the graph

const style = getComputedStyle(document.documentElement);


export const margin = {
    top: parseInt(style.getPropertyValue('--chart-margin-top')),
    right: parseInt(style.getPropertyValue('--chart-margin-right')),
    bottom: parseInt(style.getPropertyValue('--chart-margin-bottom')),
    left: parseInt(style.getPropertyValue('--chart-margin-left'))
};
export const width = parseInt(style.getPropertyValue('--chart-width')) - margin.left - margin.right;
export const height = parseInt(style.getPropertyValue('--chart-height')) - margin.top - margin.bottom;
export const color = style.getPropertyValue('--chart-color');






