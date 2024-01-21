import * as d3 from 'd3';
import { width, height, margin } from './piechart_sizes';
import { Collection, } from 'lodash';
import { OTHER_KEY, moveTransitionDuration, rectHeight, visibleRecords } from './barchart_params';
import { addTootip } from './addTootip';
import { formatName } from './formatName';

interface GlobalSummaryData { key: string; count: number }

export const updateGlobalSummary = <T extends GlobalSummaryData>(collection: Collection<T>, color: d3.ScaleOrdinal<string, unknown, never>) => {


    const radius: number = Math.min(width, height) / 2 - margin;
    const svg = d3.select("#global_summary")
        .append("svg")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // The arc generator
    const arc = d3.arc<d3.PieArcDatum<T>>()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.5 + rectHeight);

    inflatePieChart(svg, arc, collection, color);



    function updatePieChart(newCollection: Collection<T>) {
        const transition1 = svg.transition().duration(moveTransitionDuration).remove();
        const transtion2 = transition1.transition();

        const exit = svg.selectAll(".enter")
            .attr("class", "exit");
        exit.transition(transition1)
            .attr("fill-opacity", 0)
            .style("stroke-width", "0px")
        exit.remove();

        const piechart = inflatePieChart(svg, arc, newCollection, color).attr("fill-opacity", 0);
        piechart.transition(transtion2)
            .attr("fill-opacity", 1);

    }

    return updatePieChart

}


function inflatePieChart<T extends GlobalSummaryData>(svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>, arc: d3.Arc<any, d3.PieArcDatum<T>>, collection: Collection<T>, color: d3.ScaleOrdinal<string, unknown, never>) {

    const data = prepareData(collection);
    const pie = d3.pie<T>().value((d: T) => d.count);
    const dataReady = pie(data);

    const piechart = svg
        .selectAll("allSlices")
        .data(dataReady)
        .enter()
        .append('path')
        .attr("class", "enter")
        .attr('d', d => arc(d))
        .attr('fill', (d) => color(d.data.key) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .attr("fill-opacity", 1);

    addTootip(piechart, (d) => `${formatName(d.data.key)}: ${d.data.count}`)
    return piechart;
}

function prepareData<T extends GlobalSummaryData>(data: Collection<T>) {

    const newData = data.take(visibleRecords).value();
    const otherCount = data.drop(visibleRecords).sumBy("count");
    if (otherCount > 0) {
        newData.push({ key: OTHER_KEY, count: otherCount } as T);
    }

    return newData;
}

