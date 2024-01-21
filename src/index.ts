import * as d3 from 'd3';
import { updateGlobalSummary } from './piechart'
import _, { Collection, includes } from 'lodash';
import { Product, ProductCategory, ProductCountry } from './dataset_interfaces'
import { updateHistogram } from './barchart';
import { visibleRecords } from './barchart_params';


(window as any).update = function update(category: 'product_category' | 'country') {
    cleanScreen();
    if (category === 'product_category') {
        loadProductCategoryData()
    }
    if (category === 'country') {
        loadCountryData()
    }
}

const cleanScreen = () => {
    d3.selectAll("svg").remove();
}


const loadCountryData = () => {
    Promise.all([
        d3.tsv('/2018-openfoodfacts_mock/products_countries.tsv'),
        d3.tsv('/2018-openfoodfacts_mock/products.tsv')
    ]).then(([countries, products]) => {
        // hack

        const key = 'nutriscore';

        const [typedCountries, typedProducts] = [countries as unknown as ProductCountry[], products as unknown as Product[]];


        let productsWithCountries = _(typedProducts)
            .keyBy('code')
            .merge(_.keyBy(typedCountries, 'code'))
            .filter(item => !!item.country)


        const mostPopularCountries = productsWithCountries
            .countBy('country')
            .toPairs()
            .orderBy(pair => pair[1], 'desc')
            .take(visibleRecords)
            .map(pair => pair[0])
            .value();

        productsWithCountries = productsWithCountries.filter(item => includes(mostPopularCountries, item.country))

        updateView(productsWithCountries, mostPopularCountries);
    })
}


const loadProductCategoryData = () => {

    Promise.all([
        d3.tsv('/2018-openfoodfacts_mock/products_categories_full.tsv'),
        d3.tsv('/2018-openfoodfacts_mock/products.tsv')
    ]).then(([categories, products]) => {
        // hack
        const [typedCategories, typedProducts] = [categories as unknown as ProductCategory[], products as unknown as Product[]];
        const result = _(typedProducts)
            .keyBy('code')
            .merge(_.keyBy(typedCategories, 'code'))
            .filter(item => !!item.category)
            .countBy('category')
            .toPairs()
            .orderBy(pair => pair[1], 'desc')
            .map(([country, count], i) => ({ 'key': country, 'parentKey': `${country}_${i}`, 'count': count }));
        ;

        // updateView(result)
    })
}



const updateView = (data: Collection<Product & ProductCountry>, mostPopularCountries: string[]) => {

    const dataPreparedForHistogram = data
        .countBy((d) => `${d.country},${d.nutriscore}`)
        .toPairs()
        .map(([key, value]) => ({ key: key.split(',')[1], parentKey: key.split(',')[0], count: value }))
        .filter(item => !!item.parentKey)
        .value();
    mostPopularCountries.forEach(country => {
        dataPreparedForHistogram.push({ key: country, parentKey: 'world', count: data.filter(item => item.country === country).size() })
    })
    dataPreparedForHistogram.push({ key: 'world', parentKey: undefined, count: data.size() })
    console.log(dataPreparedForHistogram)
    updateHistogram(dataPreparedForHistogram);
    updateGlobalSummary(data.countBy('country').toPairs().map(item => ({ 'key': item[0], 'count': item[1] })));
}







