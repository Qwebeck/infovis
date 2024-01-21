import { margin as barcharMargin } from './barchart_params';
// const windoWidth: number = window.innerWidth;
// const windowHeight: number = window.innerHeight;

const style = getComputedStyle(document.documentElement);


export const margin = 40;
export const width = parseInt(style.getPropertyValue('--piechart-width')) - barcharMargin.left - barcharMargin.right;
export const height = parseInt(style.getPropertyValue('--piechart-height')) - barcharMargin.top - barcharMargin.bottom;



// export const width: number = windoWidth - barchartWidth - margin * 2;
// export const height: number = windowHeight - barchartHeight - margin * 2;
