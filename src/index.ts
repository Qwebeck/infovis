import * as d3 from 'd3';
import { width, margin, height } from './barchart_sizes';
import { updateGlobalSummary } from './piechart'

// d3.tsv('/2018-openfoodfacts/tsv/categories_taxonomy.tsv').then((d: any[]) => {
//     console.log(d)
// })


(window as any).update = function update(category: 'product_category' | 'country') {
    cleanScreen();
    if (category === 'product_category') {
        loadProductCategoryData()
    }
    if (category === 'country') {
        loadCountryData()
    }
    updateGlobalSummary();
}



const cleanScreen = () => {
    d3.selectAll("svg").remove();
}


const loadCountryData = () => {
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then((data:
        any[]) => {
        const svg = d3.select("#bar_chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 13000])
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
            .domain(data.map((d: any) => d.Country))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", (d: any) => y(d.Country))
            .attr("width", (d: any) => x(d.Value))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2");
    });

}

const loadProductCategoryData = () => {

    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then((data: any[]) => {

        const svg = d3.select("#bar_chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);


        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 13000])
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
            .domain(data.map((d: any) => d.Country))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", (d: any) => y(d.Country))
            .attr("width", (d: any) => x(d.Value))
            .attr("height", y.bandwidth())
            .attr("fill", "#111111");
    });
}