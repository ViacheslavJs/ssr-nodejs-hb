//TODO STEP 1: Определение функции-конструктора с использованием синтаксиса класса
class Product {
  constructor(name, priceFormatted, image) {
    this.name = name;
    this.priceFormatted = priceFormatted;
    this.image = image;
  }
}

//TODO STEP 2: Создание корзины с использованием синтаксиса класса
class Basket {
  constructor() {
    this.items = [];
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.product.name === product.name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.saveToLocalStorage();
    logBasketItems();
  }

  removeItem(product) {
    const existingItemIndex = this.items.findIndex(item => item.product.name === product.name);
    if (existingItemIndex !== -1) {
      this.items.splice(existingItemIndex, 1);
    }
    this.saveToLocalStorage();
    logBasketItems();
  }

  clearBasket() {
    this.items = [];
    this.saveToLocalStorage();
    logBasketItems();
  }

  saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  loadFromLocalStorage() {
    const savedItems = localStorage.getItem('cart');
    if (savedItems) {
      this.items = JSON.parse(savedItems);
    }
    logBasketItems();
  }

  totalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}

// Функция для вывода списка товаров в консоль
function logBasketItems() {
  const savedItems = localStorage.getItem('cart');
  if (savedItems) {
    const items = JSON.parse(savedItems);
    console.log('Items in basket:', items);
  } else {
    console.log('Basket is empty');
  }
}

//TODO STEP 3: Создание экземпляра корзины
const basket = new Basket();
basket.loadFromLocalStorage(); // Загрузка данных корзины из LocalStorage
logBasketItems();
updateBasketDisplay();

//TODO STEP 4: Обработчики событий для кнопок
const addButtons = document.querySelectorAll('.card__button');
addButtons.forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.card');
    const name = card.querySelector('.card__span-name').textContent;
    const priceFormatted = card.querySelector('.card__span-price').textContent;
    const image = card.querySelector('.card__image').src;

    const product = new Product(name, priceFormatted, image);
    basket.addItem(product);
    updateBasketDisplay();
  });
});

// Обработчик для кнопки "Очистить"
const clearButton = document.getElementById('delete');
clearButton.addEventListener('click', () => {
  basket.clearBasket();
  updateBasketDisplay();
});

//TODO STEP 5: Обновление отображения корзины
function updateBasketDisplay() {
  const basketItemsElement = document.getElementById('basket-items');
  basketItemsElement.innerHTML = '';

  const totalItemsElement = document.getElementsByClassName('basket-icon__circle')[0];
  totalItemsElement.textContent = basket.totalItems();

  basket.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'basket-item';

    const itemImage = document.createElement('img');
    itemImage.src = item.product.image;
    itemImage.alt = item.product.name;
    itemImage.className = 'basket-image';
    itemElement.appendChild(itemImage);

    const itemInfo = document.createElement('span');
    itemInfo.className = 'basket-item-info';
    itemInfo.textContent = `${item.product.name} - ${item.product.priceFormatted} x ${item.quantity}`;
    itemElement.appendChild(itemInfo);

    const removeButton = document.createElement('button');
    removeButton.className = 'basket-item-btn button-delete font-awesome-icon fas fa-trash-alt';
    removeButton.addEventListener('click', () => {
      basket.removeItem(item.product);
      updateBasketDisplay();
    });
    itemElement.appendChild(removeButton);

    basketItemsElement.appendChild(itemElement);
  });
}

// Обработчик для иконки корзины
document.addEventListener("DOMContentLoaded", function() {
  const basketIcon = document.getElementById("basket-icon");
  const basketElement = document.getElementById("basket");

  basketIcon.addEventListener("click", function() {
    if (basketElement.classList.contains("hide") || !basketElement.classList.contains("show")) {
      basketElement.classList.remove("hide");
      basketElement.classList.add("show");
    } else {
      basketElement.classList.remove("show");
      basketElement.classList.add("hide");
    }
  });
});

