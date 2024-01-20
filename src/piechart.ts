import * as d3 from 'd3';
import { width, height, margin } from './piechart_sizes';


export const updateGlobalSummary = <T extends { key: string; count: number }>(data: T[]) => {

    const radius: number = Math.min(width, height) / 2 - margin;


    const svg = d3.select("#global_summary")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);



    // set the color scale
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.key))
        .range(d3.schemeTableau10);


    // Compute the position of each group on the pie:
    const pie = d3.pie<T>().value((d: T) => d.count);
    const data_ready = pie(data);


    // The arc generator
    const arc = d3.arc<d3.PieArcDatum<T>>()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.8);

    // Another arc that won't be drawn. Just for labels positioning
    const tooltip = d3.select("#tooltip");
    svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', (d) => color(d.data.key) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on('mouseover', function (event, d) {
            d3.select(this).transition()
                .duration(50)
                .attr('opacity', '.5')
                .attr('fill', '#3498db'); // Change fill color on mouseover

            tooltip.transition()
                .duration(50)
                .style("opacity", 1);

            tooltip.html(`${d.data.key}: ${d.data.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration(50)
                .attr('opacity', '1')
                .attr('fill', (d: d3.PieArcDatum<T>) => color(d.data.key) as string); // Change fill color back on mouseout


            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
        });


}

