// set the dimensions and margins of the graph

import * as d3 from "d3";

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

export const rectHeight = parseInt(style.getPropertyValue('--button-height'));


export const visibleRecords = 9;

export const moveTransitionDuration = 750;
export const opacityTransitionDuration = 100;
//
export const colorScheme = d3.schemeCategory10
//
export const OTHER_KEY = 'other';



