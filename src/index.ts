import * as d3 from 'd3';
import { updateGlobalSummary } from './piechart'
import _, { Collection } from 'lodash';
import { Product, ProductCategory, ProductCountry } from './dataset_interfaces'
import { updateHistogram } from './histogram';


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
        const result = _(typedProducts)
            .keyBy('code')
            .merge(_.keyBy(typedCountries, 'code'))
            .filter(item => !!item.country)
            .countBy('country')
            .toPairs()
            .orderBy(pair => pair[1], 'desc')
            .take(10)
            .map(([country, count]) => ({ 'key': country, 'count': count }))
            .value()
            ;
        updateHistogram(result);
        updateGlobalSummary(result);
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
            .take(10)
            .map(([catName, count]) => ({ 'key': catName, 'count': count }))
            .value()
            ;
        updateHistogram(result);
        updateGlobalSummary(result);
    })
}



