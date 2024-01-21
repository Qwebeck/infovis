import * as d3 from 'd3';
import { updateGlobalSummary } from './piechart'
import _, { Collection, includes } from 'lodash';
import { Product, ProductCategory, ProductCountry } from './dataset_interfaces'
import { updateHistogram } from './barchart';
import { OTHER_KEY, ROOT_KEY, buttonHighlightedColor, buttonNormalColor, opacityTransitionDuration, colorScheme as sharedColorScheme, visibleRecords } from './barchart_params';


(window as any).mainKey = 'product_category';
(window as any).subKey = 'proteins_100g'; //'nutriscore';


(window as any).update = function update(key: 'product_category' | 'country', subKey: 'nutriscore' | 'proteins_100g') {
    highlightSelection(key, subKey);
    removeGraphs();
    (window as any).mainKey = key;
    (window as any).subKey = subKey;

    if (key === 'product_category') {
        loadProductCategoryData(subKey)
    }
    if (key === 'country') {
        loadCountryData(subKey)
    }
}


const removeGraphs = () => {
    d3.selectAll("svg").remove();
}

const highlightSelection = (key: string, subKey: string) => {
    const transition = d3.transition().duration(opacityTransitionDuration);
    const transition2 = transition.transition();
    d3.selectAll(`button:not(#${key}):not(#${subKey})`)
        .transition(transition)
        .style("background-color", buttonNormalColor);

    d3.select(`#${key}`)
        .transition(transition2)
        .style("background-color", buttonHighlightedColor)

    d3.select(`#${subKey}`)
        .transition(transition2)
        .style("background-color", buttonHighlightedColor)
}


const loadCountryData = (subKey: string) => {
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

        updateView(productsWithCountries, 'country', mostPopularCountries, subKey);
    })
}



const loadProductCategoryData = (subKey: string) => {

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


        updateView(productsWithCategories, 'category', mostPopularCategories, subKey)
    })
}



const updateView = <T extends Product>(data: Collection<T>, keyName: string, mostPopularKeys: string[], subKey: string) => {

    if (isContinous(data, subKey)) {
        data = categorizeNotCategoricalData(data, subKey)
    }

    const colorMapping = d3.scaleOrdinal()
        .domain([...mostPopularKeys, OTHER_KEY])
        .range(sharedColorScheme);


    const updateGlobalSummaryData = updateGlobalSummary(
        data
            .countBy(keyName)
            .toPairs()
            .map(item => ({ 'key': item[0], 'count': item[1] }))
        , colorMapping);

    const histogramData = prepareHistogramData<T>(data, mostPopularKeys, keyName, subKey);
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

const isContinous = (data, keyName: string) => {
    return keyName.endsWith("100g");
}

const categorizeNotCategoricalData = <T extends Product>(data: Collection<T>, keyName: string): Collection<T> => {
    const min = data.minBy(keyName)[keyName];
    const max = data.maxBy(keyName)[keyName];
    const binSize = parseInt((max - min) / (visibleRecords + 1));
    const bins = _.range(min, max, binSize);
    const categorizedData = data.map(item => {
        // Find the bin that the item belongs to
        const newItem = { ...item };
        const binIndex = _.findIndex(bins, bin => _.inRange(item[keyName], bin, bin + binSize));
        // Replace the item's value with the bin name
        if (binIndex > -1) {

            newItem[keyName] = `from ${binIndex * binSize}g to ${(binIndex + 1) * binSize}g`;
        } else {
            newItem[keyName] = `Unknown`;
        }

        return newItem;
    });
    return categorizedData;
}

/**
 * Creates table, from which hierarchical data structure needed for hierarchical histogram can be built.
 */
const prepareHistogramData = <T extends Product>(data: _.Collection<T>, mostPopularKeys: string[], mainCategoryName: string, subCategoryName: string) => {
    const dataPreparedForHistogram = data
        .filter(item => includes(mostPopularKeys, item[mainCategoryName]))
        .countBy((d) => `${d[mainCategoryName]},${d[subCategoryName]}`)
        .toPairs()
        .map(([key, value]) => ({ key: key.split(',')[1], parentKey: key.split(',')[0], count: value }))
        .filter(item => !!item.parentKey)
        .value();

    mostPopularKeys.forEach(popularKey => {
        dataPreparedForHistogram.push({ key: popularKey, parentKey: ROOT_KEY, count: data.filter(item => item[mainCategoryName] === popularKey).size() });
    });

    dataPreparedForHistogram.push({ key: ROOT_KEY, parentKey: undefined, count: data.size() });
    return dataPreparedForHistogram;
}

