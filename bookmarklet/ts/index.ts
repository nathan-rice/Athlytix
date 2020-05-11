import * as $ from 'jquery';
import * as picoModal from 'picomodal';
import {html} from './modal';

declare var SERVER: string;

const gramsPerTsp = 5;

const gramsPerTbsp = 15;

const gramsPerOunce = 28.3495;

const gramsPerCup = 236.59;

const gramsPerQuart = 946.35;

const ajaxParams = {
    url: `http://${SERVER}/api/calorie_intake/`,
    type: 'PUT',
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    xhrFields: {withCredentials: true}
};

interface INutritionData {
    name?: string;
    amount?: number | null;
    value?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fiber?: number | null;
    fat?: number | null;
}

const openModal = (data: INutritionData) => {
    let success = modal => {
        let name = $('#athlytix-food-name'),
            amount = $('#athlytix-food-amount'),
            value = $('#athlytix-food-value'),
            protein = $('#athlytix-food-protein'),
            carbohydrates = $('#athlytix-food-carbohydrates'),
            fiber = $('#athlytix-food-fiber'),
            fat = $('#athlytix-food-fat'),
            newAmount = $('#athlytix-food-new-amount'),
            round = v => Math.round(v * 10) / 10;

        $('#athlytix-food-submit').click(e => {
            e.preventDefault();
            let newData = {
                name: name.val(),
                amount: amount.val(),
                value: value.val(),
                protein: protein.val(),
                carbohydrates: carbohydrates.val(),
                fiber: fiber.val(),
                fat: fat.val()
            };
            $.ajax({
                ...ajaxParams,
                data: JSON.stringify(newData)
            }).then(modal.close());
        });

        $('#athlytix-food-cancel').click(e => {
            e.preventDefault();
            modal.close();
        });

        $('#athlytix-change-amount').click(e => {
            let sf = newAmount.val() / amount.val();
            if ($.isNumeric(amount.val())) amount.val(round(newAmount.val()));
            if ($.isNumeric(value.val())) value.val(round(sf * value.val()));
            if ($.isNumeric(protein.val())) protein.val(round(sf * protein.val()));
            if ($.isNumeric(carbohydrates.val())) carbohydrates.val(round(sf * carbohydrates.val()));
            if ($.isNumeric(fiber.val())) fiber.val(round(sf * fiber.val()));
            if ($.isNumeric(fat.val())) fat.val(round(sf * fat.val()));
            e.preventDefault();
        });

        if (data.name && !name.val()) name.attr('value', data.name);
        if ($.isNumeric(data.amount) && !amount.val()) amount.attr('value', round(data.amount));
        if ($.isNumeric(data.value) && !value.val()) value.attr('value', round(data.value));
        if ($.isNumeric(data.protein) && !protein.val()) protein.attr('value', round(data.protein));
        if ($.isNumeric(data.carbohydrates) && !carbohydrates.val())
            carbohydrates.attr('value', round(data.carbohydrates));
        if ($.isNumeric(data.fiber) && !fiber.val()) fiber.attr('value', round(data.fiber));
        if ($.isNumeric(data.fat) && !fat.val()) fat.attr('value', round(data.fat));
    };

    let modal = window["athlytixModal"];

    if (!modal) {
        window["athlytixModal"] = picoModal({content: html, width: 768}).afterCreate(success).show();
    } else {
        modal.show();
    }
};

const addTimeFoodData = () => {
    let items = $('div.recipe-nutrition li'),
        name = $('div.intro h1').text(), value = 0, protein = 0, carbohydrates = 0, fiber = 0, fat = 0;

    items.each((i, e) => {
        let t = e.innerText;
        if (t.search(/calories /i) >= 0) {
            value = parseFloat(t.match(/(\d+\.?\d*)/)[1]) || 0;
        }
        else if (t.search(/protein/i) >= 0) {
            protein = parseFloat(t.match(/(\d+\.?\d*)g/)[1]) || 0;
        }
        else if (t.search(/carbohydrate/i) >= 0) {
            carbohydrates = parseFloat(t.match(/(\d+\.?\d*)g/)[1]) || 0
        }
        else if (t.search(/fiber/i) >= 0) {
            fiber = parseFloat(t.match(/(\d+\.?\d*)g/)[1]) || 0
        }
        else if (t.search(/^fat/i) >= 0) {
            fat = parseFloat(t.match(/(\d+\.?\d*)g/)[1]) || 0
        }
    });

    openModal({name, value, protein, carbohydrates, fiber, fat});
};

const addFatSecretRecipeData = () => {
    let name = $('h1.fn').text(),
        value = parseFloat($('table.nutrition span.calories').text()) || 0,
        protein = parseFloat($('table.nutrition span.protein').text().replace("g", "")) || 0,
        carbohydrates = parseFloat($('table.nutrition span.carbohydrates').text().replace("g", "")) || 0,
        fiber = parseFloat($('table.nutrition span.fiber').text().replace("g", "")) || 0,
        fat = parseFloat($('table.nutrition span.fat').text().replace("g", "")) || 0;

    openModal({name, value, protein, carbohydrates, fiber, fat});
};

const addFatSecretData = () => {
    let rows = $('div.nutpanel tr'),
        name = $('div.summarypanelcontent h1').text(),
        [_, amount, units] = rows[1].innerText.match(/Serving Size: (\d+) ([a-zA-Z]+)/),
        value = parseFloat(rows[4].innerText.match(/Calories (\d+\.?\d*)/)[1]) || 0,
        protein = parseFloat(rows[17].innerText.match(/(\d+\.?\d*)g/)[1]) || 0,
        carbohydrates = parseFloat(rows[14].innerText.match(/(\d+\.?\d*)g/)[1]) || 0,
        fiber = parseFloat(rows[15].innerText.match(/(\d+\.?\d*)g/)[1]) || 0,
        fat = parseFloat(rows[7].innerText.match(/(\d+\.?\d*)g/)[1]) || 0,
        data = {name, value, protein, carbohydrates, fiber, fat};

    if (units == 'tsp') {
        amount *= gramsPerTsp;
        data["amount"] = amount;
    }
    else if (units == 'tbsp') {
        amount *= gramsPerTbsp;
        data["amount"] = amount
    }
    else if (units == 'cup') {
        amount *= gramsPerCup;
        data["amount"] = amount;
    }
    else if (units == 'quart') {
        amount *= gramsPerQuart;
        data["amount"] = amount;
    }

    openModal(data);
};

const addCalorieKingRecipeData = () => {
    let elements = $('table.nutrient_table_makeover tr'),
        name = $('div#recipe-content h2').text().trim(),
        value = parseFloat(elements[0].children[1].text().replace(" cals", "")) || 0,
        fat = parseFloat(elements[2].children[1].text().replace(" g", "")) || 0,
        carbohydrates = parseFloat(elements[6].children[1].text().replace(" g", "")) || 0,
        fiber = parseFloat(elements[7].children[1].text().replace(" g", "")) || 0,
        protein = parseFloat(elements[9].children[1].text().replace(" g", "")) || 0;

    openModal({name, value, fat, carbohydrates, fiber, protein});
};

const addCalorieKingData = () => {
    let getFloat = s => parseFloat($(s).text().replace("g", "")),
        name = $('span#heading-food-cat-desc').text().trim(),
        value = getFloat('td.calories span.amount') || 0,
        amount = parseFloat($('input#amount').val()) || 0,
        units = $('select#units').find(':selected').text(),
        fat = getFloat('tr.total-fat td.amount') || 0,
        carbohydrates = getFloat('tr.total-carbs td.amount') || 0,
        fiber = getFloat('tr.fiber td.amount') || 0,
        protein = getFloat('tr.protein td.amount') || 0;

    if (units != "g" && units != 'mL') {
        let oz = parseFloat(units.match(/\((\d+\.?\d*) \S*oz\)/)[1]);
        amount = oz * gramsPerOunce * amount;
    }

    openModal({name, amount, value, fat, carbohydrates, fiber, protein});
};

const addSelfData = () => {
    let name = $('div.facts-heading').text(),
        amount = $('select[name=serving] option:selected').text(),
        value = parseFloat($('span#NUTRIENT_0').text()),
        fat = parseFloat($('span#NUTRIENT_14').text()),
        carbohydrates = parseFloat($('span#NUTRIENT_4').text()),
        fiber = parseFloat($('span#NUTRIENT_5').text()),
        protein = parseFloat($('span#NUTRIENT_77').text());
    if (amount.endsWith("grams")) {
        amount = parseFloat(amount.replace(" grams", ""));
    } else {
        amount = parseFloat(amount.match(/\((.*)g\)/)[1])
    }

    openModal({name, amount, value, fat, carbohydrates, fiber, protein});
};

const addAllRecipesData = () => {
    let name = $('h1.recipe-summary__h1').text(),
        elements = $('ul.nutrientLine li:nth-child(2) span'),
        value = parseFloat(elements[0].innerText) || 0,
        fat = parseFloat(elements[1].innerText) || 0,
        carbohydrates = parseFloat(elements[2].innerText) || 0,
        protein = parseFloat(elements[3].innerText) || 0;

    openModal({name, value, fat, carbohydrates, protein});
};

const addEpicuruiousData = () => {
    let name = $('div.title-source h1').text(),
        elements = $('div.nutrition.content span.nutri-data'),
        value = parseFloat(elements[0].innerText.match(/(\S+)/)[1]) || 0,
        fat = parseFloat(elements[2].innerText.match(/(\S+)/)[1]) || 0,
        carbohydrates = parseFloat(elements[1].innerText.match(/(\S+)/)[1]) || 0,
        protein = parseFloat(elements[3].innerText.match(/(\S+)/)[1]) || 0;

    openModal({name, value, fat, carbohydrates, protein});
};

const addFoodComData = () => {
    let name = $('header.recipe h1').text(),
        amount = parseFloat($('div.nutrition div.modal-body span')[0]
            .innerText.match(/\((.*) g\)/)[1]) || 0,
        value = parseFloat($('dt.cals span.calories').text()) || 0,
        fat = parseFloat($('dt.nutrition span.fat').text()) || 0,
        carbohydrates = parseFloat($('dt.nutrition span.carbohydrates').text()) || 0,
        fiber = parseFloat($('dt.nutrition span.fiber').text()) || 0,
        protein = parseFloat($('dt.nutrition span.protein').text()) || 0;

    openModal({name, amount, value, fat, carbohydrates, fiber, protein});
};

window["athlytixAddData"] = () => {
    if (window.location.href.search(/calorieking\.com\/recipes/i) >= 0) {
        addCalorieKingRecipeData();
    } else if (window.location.href.search(/calorieking\.com/i) >= 0) {
        addCalorieKingData();
    } else if (window.location.href.search(/nutritiondata\.self\.com/i) >= 0) {
        addSelfData();
    } else if (window.location.href.search(/allrecipes\.com/i) >= 0) {
        addAllRecipesData();
    } else if (window.location.href.search(/epicurious\.com/i) >= 0) {
        addEpicuruiousData();
    } else if (window.location.href.search(/food\.com/i) >= 0) {
        addFoodComData();
    } else if (window.location.href.search(/fatsecret\.com\/recipes/) >= 0) {
        addFatSecretRecipeData();
    } else if (window.location.href.search(/fatsecret\.com/) >= 0) {
        addFatSecretData();
    } else if (window.location.href.search(/cookinglight\.com|myrecipes\.com|health\.com/) >= 0) {
        addTimeFoodData();
    }
};

(window as any).athlytixAddData();