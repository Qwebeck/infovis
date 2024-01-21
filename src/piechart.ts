import * as d3 from 'd3';
import { width, height, margin } from './piechart_sizes';
import { Collection } from 'lodash';
import { OTHER_KEY, colorScheme, rectHeight, visibleRecords } from './barchart_params';
import { addTootip } from './addTootip';


export const updateGlobalSummary = <T extends { key: string; count: number }>(data_old: Collection<T>, color: d3.ScaleOrdinal<string, unknown, never>) => {

    const data = data_old.take(visibleRecords).value();


    const otherCount = data_old.drop(visibleRecords).sumBy("count");
    console.log(otherCount)
    if (otherCount > 0) {
        data.push({ key: OTHER_KEY, count: otherCount } as T);
    }
    const radius: number = Math.min(width, height) / 2 - margin;


    const svg = d3.select("#global_summary")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Compute the position of each group on the pie:
    const pie = d3.pie<T>().value((d: T) => d.count);
    const data_ready = pie(data);


    // The arc generator
    const arc = d3.arc<d3.PieArcDatum<T>>()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.5 + rectHeight);

    // Another arc that won't be drawn. Just for labels positioning
    // const tooltip = d3.select("#tooltip");
    const piechart = svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', (d) => color(d.data.key) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);

    addTootip(piechart, (d) => `${d.data.key}: ${d.data.count}`)

}



