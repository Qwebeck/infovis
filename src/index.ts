import * as d3 from 'd3';
import { updateGlobalSummary } from './piechart'
import _, { Collection, includes } from 'lodash';
import { Product, ProductCategory, ProductCountry } from './dataset_interfaces'
import { updateHistogram } from './barchart';
import { OTHER_KEY, colorScheme as sharedColorScheme, visibleRecords } from './barchart_params';


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
        // typing hack
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

        updateView(productsWithCountries, 'country', mostPopularCountries, 'nutriscore');
    })
}


const loadProductCategoryData = () => {

    Promise.all([
        d3.tsv('/2018-openfoodfacts_mock/products_categories_full.tsv'),
        d3.tsv('/2018-openfoodfacts_mock/products.tsv')
    ]).then(([categories, products]) => {
        // typing hack
        const [typedCategories, typedProducts] = [categories as unknown as ProductCategory[], products as unknown as Product[]];


        let productsWithCategories = _(typedProducts)
            .keyBy('code')
            .merge(_.keyBy(typedCategories, 'code'))
            .filter(item => !!item.category)


        const mostPopularCategories = productsWithCategories
            .countBy('category')
            .toPairs()
            .orderBy(pair => pair[1], 'desc')
            .take(visibleRecords)
            .map(pair => pair[0])
            .value();


        updateView(productsWithCategories, 'category', mostPopularCategories, 'nutriscore')
    })
}



const updateView = <T extends Product>(data: Collection<T>, keyName: string, mostPopularKeys: string[], subcategoryName: string) => {


    const colorMapping = d3.scaleOrdinal()
        .domain([...mostPopularKeys, OTHER_KEY])
        .range(sharedColorScheme);


    const updateGlobalSummaryData = updateGlobalSummary(
        data
            .countBy(keyName)
            .toPairs()
            .map(item => ({ 'key': item[0], 'count': item[1] }))
        , colorMapping);

    const histogramData = prepareHistogramData<T>(data, mostPopularKeys, keyName, subcategoryName);
    updateHistogram(histogramData,
        colorMapping,
        (d) => {

            const nodeData = d.children.map((node) => ({ key: node.data.key, parentKey: node.data.parentKey, count: node.data.count }));
            updateGlobalSummaryData(_(nodeData) as any)
        }
        , () => {
            updateGlobalSummaryData(data
                .countBy(keyName)
                .toPairs()
                .map(item => ({ 'key': item[0], 'count': item[1] })))
        });


}

/**
 * Creates table, from which hierarchical data structure needed for hierarchical histogram can be built.
 */
function prepareHistogramData<T extends Product>(data: _.Collection<T>, mostPopularKeys: string[], mainCategoryName: string, subCategoryName: string) {
    const dataPreparedForHistogram = data
        .filter(item => includes(mostPopularKeys, item[mainCategoryName]))
        .countBy((d) => `${d[mainCategoryName]},${d[subCategoryName]}`)
        .toPairs()
        .map(([key, value]) => ({ key: key.split(',')[1], parentKey: key.split(',')[0], count: value }))
        .filter(item => !!item.parentKey)
        .value();

    mostPopularKeys.forEach(popularKey => {
        dataPreparedForHistogram.push({ key: popularKey, parentKey: 'root', count: data.filter(item => item[mainCategoryName] === popularKey).size() });
    });

    dataPreparedForHistogram.push({ key: 'root', parentKey: undefined, count: data.size() });
    return dataPreparedForHistogram;
}

