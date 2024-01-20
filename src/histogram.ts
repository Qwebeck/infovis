import * as d3 from 'd3';
import { width, margin, height, color } from './barchart_styles';
import _ from 'lodash';

export const updateHistogram = <T extends { key: string; count: number; }>(data: T[]) => {

    const svg = d3.select("#bar_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, Math.max(...data.map(d => d.count))])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleBand()
        .range([0, height])
        .domain(data.map((d) => d.key)) //TODO: format name
        .padding(0.1);

    svg.append("g")
        .call(d3.axisLeft(y));

    const tooltip = d3.select("#tooltip");
    //Bars
    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", (d) => y(d.key))
        .attr("width", (d) => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", color)
        .on('mouseover', function (event, d) {
            d3.select(this).transition()
                .duration(50)
                .attr('opacity', '.5')

            tooltip.transition()
                .duration(50)
                .style("opacity", 1);

            tooltip.html(`${d.key}: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration(50)
                .attr('opacity', '1')

            tooltip.transition()
                .duration(50)
                .style("opacity", 0);
        });
    ;
};


function formatName(name: string): string {
    return name
        .split('-') // split the string into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}