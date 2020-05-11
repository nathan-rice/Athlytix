export const html = `
<div id="athlytx-nutrition-modal">
    <style>
        label.athlytix-label {
            text-align: right !important;
            flex-basis: 12.5% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
            padding-top: 11px !important;
            font-size: 15px !important;
            
        }
        div.athlytix-form-group {
            display: flex !important;
            width: 100% !important;
            height: 45px !important;
        }
        div.athlytix-large-input {
            flex-basis: 85% !important;
        }
        div.athlytix-form-group input {
            width: 100% !important;
            height: 33px !important;
            font-size: 15px !important;
            border: 1px solid #888;
            color: black;
        }   
        button.athlytix-button {
            flex-basis: 15% !important;
            height: 33px !important;
            min-height: 33px !important;
            margin: 2px 0px 2px 10px !important;
        }
    </style>
    <form>
        <div class="athlytix-form-group">
            <label for="athlytix-food-name" class="athlytix-label">Name</label>
            <div class="athlytix-large-input">
                <input id="athlytix-food-name">
            </div>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-amount" class="athlytix-label">Amount</label>
            <div class="athlytix-small-input">
                <input type="number" formnovalidate id="athlytix-food-amount">
            </div>
            <label for="athlytix-food-new-amount" class="athlytix-label">Scale</label>
            <div class="athlytix-small-input">
                <input type="number" formnovalidate id="athlytix-food-new-amount"
                       placeholder="New amount (grams)">
            </div>
            <button class="athlytix-button" id="athlytix-change-amount">Change</button>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-value" class="athlytix-label">Calories</label>
            <div class="athlytix-large-input">
                <input class="number" formnovalidate id="athlytix-food-value">
            </div>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-protein" class="athlytix-label">Protein</label>
            <div class="athlytix-large-input">
                <input class="number" formnovalidate id="athlytix-food-protein">
            </div>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-carbohydrates" class="athlytix-label">Carbs</label>
            <div class="athlytix-large-input">
                <input class="number" formnovalidate id="athlytix-food-carbohydrates">
            </div>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-fiber" class="athlytix-label">Fiber</label>
            <div class="athlytix-large-input">
                <input class="number" formnovalidate id="athlytix-food-fiber">
            </div>
        </div>
        <div class="athlytix-form-group">
            <label for="athlytix-food-fat" class="athlytix-label">Fat</label>
            <div class="athlytix-large-input">
                <input class="number" formnovalidate id="athlytix-food-fat">
            </div>
        </div>
        <div style="display: flex; flex-direction: row-reverse">
            <button id="athlytix-food-submit" class="athlytix-button">Add</button>
            <button id="athlytix-food-cancel" class="athlytix-button">Cancel</button>
        </div>  
    </form>
</div>`;