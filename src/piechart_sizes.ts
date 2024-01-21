import {
    width as barchartWidth,
    height as barchartHeight,
} from './barchart_params';

const windoWidth: number = window.innerWidth;
const windowHeight: number = window.innerHeight;
export const margin: number = 40;
export const width: number = windoWidth - barchartWidth - margin * 2;
export const height: number = windowHeight - barchartHeight - margin * 2;
