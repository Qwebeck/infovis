import * as d3 from 'd3';
import { opacityTransitionDuration } from './barchart_params';

export function addTootip<T>(
    selection: d3.Selection<SVGPathElement, T, SVGGElement, unknown>,
    text: (d: T) => string
) {
    const tooltip = d3.select("#tooltip");
    selection
        .on('mouseover', function (event, d: T) {
            d3.select(this).transition()
                .duration(opacityTransitionDuration)
                .style('opacity', 0.5);

            // `${d.data.key}: ${d.data.count}`)
            tooltip.html(text(d))

                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            tooltip.transition()
                .duration(opacityTransitionDuration)
                .style("opacity", 1);
        })
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration(opacityTransitionDuration)
                .style('opacity', 1);

            tooltip.transition()
                .duration(opacityTransitionDuration)
                .style("opacity", 0);
        });

}
