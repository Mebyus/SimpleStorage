"use strict";

/**
 * Класс для управления записью о товаре.
 * @constructor
 * @param {number} itemId
 * Числовой идентификатор товара.
 * @param {string} name
 * Наименование товара.
 * @param {number} price
 * Цена единицы товара.
 * @param {number} stock
 * Количество единиц товара в данной записи.
 */
class ItemEntry {
    constructor(itemId, name, price, stock) {
        this.itemId = itemId;
        this.button = null;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    /**
     * Создает кнопку в документе, отображающую данные ItemEntry.
     * @param {object} parent 
     * Родительский HTML элемент, к которому будет прикреплена кнопка.
     * @param {EventListenerObject} handleButtonClick 
     * Обработчик события 'click' для создаваемой кнопки.
     */
    createButton(parent, handleButtonClick) {
        this.button = document.createElement('div');
        this.button.innerText = this.buttonCaption();
        this.button.classList.add('entryButton');
        this.button.addEventListener('click', handleButtonClick);
        parent.appendChild(this.button);
    }

    /**
     * Обновляет отображаемое значение кнопки, если она существует для данной записи.
     */
    updateButton() {
        if (this.button)
        {
            this.button.innerText = this.buttonCaption();
        }
    }

    /**
     * Удаляет кнопку связанную с текущей записью как из документа, так и из самой записи.
     */
    deleteButton() {
        this.button.parentElement.removeChild(this.button);
        this.button = null;
    }

    /**
     * Возвращает представление информации данной записи в виде строки.
     * @returns {string}
     */
    buttonCaption() {
        return this.name + ' | ' + this.price + ' | ' + this.stock;
    }
}

/**
 * Класс для управления списком товаров.
 * @constructor
 * @param {HTMLElment}
 * HTML элемент, к которому будет прикреплено отображение данного списка.
 * @param {EventListenerObject}
 * Обработчик события 'click' для кнопок товара в данном списке.
 */
class Container {
    constructor(element, handleButtonClick) {
        this.list = [];
        this.element = element;
        this.handleButtonClick = handleButtonClick;
    }

    /**
     * Добавляет новый ItemEntry в Container.list и возвращает 
     * эту новую запись.
     * @param {string} name
     * Наименование товара.
     * @param {number} price
     * Цена товара.
     * @param {number} stock
     * Количество товара в созданной записи.
     * @param {number} [itemId]
     * Если аргумент пропущен, значение itemId будет сгенерировано атоматически.
     * @returns {ItemEntry}
     * Возвращает созданную запись.
     */
    addEntry(name, price, stock, itemId = this.list.length) {
        let newEntry = new ItemEntry(itemId, name, price, stock);
        newEntry.createButton(this.element, this.handleButtonClick);
        this.list.push(newEntry);
        return newEntry;
    }

    /**
     * Поиск записи в Container по данному идентификатору.
     * @param {number} itemId
     * Индентификатор для поиска записи.
     * @returns {ItemEntry}
     * Возвращает найденную запись. В случае если записи с данным идентификатором
     * не существует, возвращает undefined. 
     */
    getEntryById(itemId) {
        for (const item of this.list) {
            if (item.itemId == itemId) {
                return item;
            }
        }
    }

    /**
     * Поиск записи в Container по данной кнопке.
     * @param {HTMLElement} button
     * Кнопка для поиска записи.
     * @returns {ItemEntry} 
     * Возвращает найденную запись. В случае если записи с данной кнопкой
     * не существует, возвращает undefined. 
     */
    getEntryByButton(button) {
        for (const item of this.list) {
            if (item.button === button) {
                return item;
            }
        }
    }

    /**
     * Удаляет запись из Container по данному идентификатору. В случае если записи 
     * с данным идентификатором не существует, не делает ничего.
     * @param {number} itemId 
     */
    deleteEntryById(itemId) {
        this.list.every((item, index) => {
            if (item.itemId == itemId) {
                this.list.splice(index, 1);
                return false;
            } else {
                return true;
            }
        })
    }
}

/**
 * Класс для управления элементами магазина: склад, корзина, итог.
 * @constructor
 * @param {HTMLElement} storeElement
 * HTML элемент, к которому будет прикреплено отображение склада.
 * @param {HTMLElement} cartElement 
 * HTML элемент, к которому будет прикреплено отображение корзины.
 * @param {HTMLElement} totalElement 
 * HTML элемент, к которому будет прикреплено отображение итоговой суммы. 
*/
class Shop {
    constructor(storeElement, cartElement, totalElement) {
        this.store = new Container(storeElement, (event) => {
            handleStoreButtonClick.call(this, event);
        });
        this.cart = new Container(cartElement, (event) => {
            handleCartButtonClick.call(this, event);
        });
        this.total = 0;
        this.totalElement = totalElement;
    }

    /**
     * Перемещение единицы товара с данным идентификатором из склада в корзину.
     * В случае если данного товара нет на складе (т.е. его количество равно 0), 
     * не делает ничего.
     * @param {number} itemId
     * Идентификатор товара для перемещения. 
     */
    moveToCart(itemId) {
        let storeEntry = this.store.getEntryById(itemId);
        if (storeEntry.stock > 0) {
            storeEntry.stock--;
            let cartEntry = (this.cart.getEntryById(itemId) || 
                this.cart.addEntry(storeEntry.name, storeEntry.price, 0, storeEntry.itemId));
            cartEntry.stock++;
            this.total += storeEntry.price;
        }
    }

    /**
     * Перемещение единицы товара с данным идентификатором из корзины на склад.
     * В случае если данная единица товара последняя (т.е. его количество равно 1),
     * соответствующая запись и кнопка товара будут удалены из корзины после перемещения.
     * @param {number} itemId
     * Идентификатор товара для перемещения. 
     */
    moveToStore(itemId) {
        let cartEntry = this.cart.getEntryById(itemId);
        let storeEntry = this.store.getEntryById(itemId);
        cartEntry.stock--;
        storeEntry.stock++;
        this.total -= storeEntry.price;
        if (cartEntry.stock === 0) {
            cartEntry.deleteButton();
            this.cart.deleteEntryById(itemId);
        }
    }

    /**
     * Обновляет HTML элемент отображающий итоговую сумму в корзине.
     */
    updateTotal() {
        this.totalElement.innerText = 'Cart total: ' + this.total;
    }
}

/**
 * Обработчик события 'click' для кнопок товара в корзине. Обновляет 
 * содержание измененных элементов HTML.
 * @param {MouseEvent} event 
 */
function handleCartButtonClick(event) {
    let button = event.target;
    let cartEntry = this.cart.getEntryByButton(button);
    let storeEntry = this.store.getEntryById(cartEntry.itemId);
    this.moveToStore(cartEntry.itemId); 
    cartEntry.updateButton();
    storeEntry.updateButton();
    this.updateTotal();
}

/**
 * Обработчик события 'click' для кнопок товара на складе. Обновляет 
 * содержание измененных элементов HTML.
 * @param {MouseEvent} event 
 */
function handleStoreButtonClick(event) {
    let button = event.target;
    let storeEntry = this.store.getEntryByButton(button);
    this.moveToCart(storeEntry.itemId);
    let cartEntry = this.cart.getEntryById(storeEntry.itemId);
    cartEntry.updateButton();
    storeEntry.updateButton();
    this.updateTotal();
}

let storeElement = document.getElementById('store');
let cartElement = document.getElementById('cart')
let cartTotalElement = document.getElementById('total');

let myShop = new Shop(storeElement, cartElement, cartTotalElement);

// Тестовые товары
myShop.store.addEntry('Milk', 200, 3);
myShop.store.addEntry('Table', 50, 2);
myShop.store.addEntry('Hammer', 80, 5);
myShop.store.addEntry('Fancy vase', 1223, 1);
