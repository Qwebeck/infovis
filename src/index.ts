import * as d3 from 'd3';
import { updateGlobalSummary } from './piechart'
import _, { Collection, includes } from 'lodash';
import { Product, ProductCategory, ProductCountry } from './dataset_interfaces'
import { updateHistogram } from './barchart';
import { OTHER_KEY, colorScheme, visibleRecords } from './barchart_params';


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

        // productsWithCountries = productsWithCountries.filter(item => includes(mostPopularCountries, item.country))

        updateView(productsWithCountries, 'country', mostPopularCountries);
    })
}


const loadProductCategoryData = () => {

    Promise.all([
        d3.tsv('/2018-openfoodfacts_mock/products_categories_full.tsv'),
        d3.tsv('/2018-openfoodfacts_mock/products.tsv')
    ]).then(([categories, products]) => {
        // hack
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

        // productsWithCategories = productsWithCategories.filter(item => includes(mostPopularCategories, item.category))


        updateView(productsWithCategories, 'category', mostPopularCategories)
    })
}



const updateView = <T extends Product>(data: Collection<T>, keyName: string, mostPopularKeys: string[]) => {


    const color = d3.scaleOrdinal()
        .domain([...mostPopularKeys, OTHER_KEY])
        .range(colorScheme);

    const dataPreparedForHistogram = data
        .filter(item => includes(mostPopularKeys, item[keyName]))
        .countBy((d) => `${d[keyName]},${d.nutriscore}`)
        .toPairs()
        .map(([key, value]) => ({ key: key.split(',')[1], parentKey: key.split(',')[0], count: value }))
        .filter(item => !!item.parentKey)
        .value();

    mostPopularKeys.forEach(popularKey => {
        dataPreparedForHistogram.push({ key: popularKey, parentKey: 'root', count: data.filter(item => item[keyName] === popularKey).size() })
    })

    dataPreparedForHistogram.push({ key: 'root', parentKey: undefined, count: data.size() })

    updateHistogram(dataPreparedForHistogram,
        color,
        (d) => {
            const nodeData = [{ key: d.data.key, parentKey: d.data.parentKey, count: d.data.count }]
            d.each((node) => {
                nodeData.push({ key: node.data.key, parentKey: node.data.parentKey, count: node.data.count })
            });
            // updateGlobalSummary(_(nodeData))
        }
        , () => { });

    updateGlobalSummary(
        data
            .countBy(keyName)
            .toPairs()
            .map(item => ({ 'key': item[0], 'count': item[1] }))
        , color);
}







