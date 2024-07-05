// STEP 1: Определение функции-конструктора с использованием синтаксиса класса
class Product {
  constructor(id, name, priceFormatted, image) {
    this.id = id;
    this.name = name;
    this.priceFormatted = priceFormatted;
    this.image = image;
  }
}

function updateConfirmButtonState() {
  const btnConfirm = document.getElementById('btnConfirm');
  if (btnConfirm) {    
    if (basket.totalItems() === 0) {
      btnConfirm.disabled = true;
    } else {
      btnConfirm.disabled = false;
    }
  }
}

// STEP 2: Создание корзины с использованием синтаксиса класса
class Basket {
  constructor() {
    this.items = [];
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.saveToLocalStorage();
    logBasketItems();
    updateConfirmButtonState();
  }

  removeItem(product) {
    const existingItemIndex = this.items.findIndex(item => item.product.id === product.id);
    if (existingItemIndex !== -1) {
      this.items.splice(existingItemIndex, 1);
    }
    this.saveToLocalStorage();
    logBasketItems();
    updateConfirmButtonState();
  }

  clearBasket() {
    this.items = [];
    this.saveToLocalStorage();
    logBasketItems();
    updateConfirmButtonState();
  }

  // метод очистки корзины после успешной отправки
  clearBasketAfterOrder() {
    this.items = [];
    this.saveToLocalStorage();
    updateConfirmButtonState();
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
    updateConfirmButtonState();
  }

  totalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // суммирование для корзины
  totalPrice() {
    let total = 0;
    let currencySymbol = '';

    this.items.forEach(item => {
      const itemPriceString = item.product.priceFormatted;
      console.log(itemPriceString);

      // Извлечение числовой части из строки!-цены
      //const itemPrice = parseFloat(itemPriceString.replace(/\s/g, '').replace(',', '.')); // если 'ru-RU'
      const itemPrice = parseFloat(itemPriceString.replace(/[^\d.-]/g, '')); // если 'en-US'
      console.log(itemPrice);

      if (!isNaN(itemPrice)) {
        total += itemPrice * item.quantity;
        currencySymbol = itemPriceString.replace(/[\d\s.,]/g, '').trim(); 
      }
    });

    //const formattedTotal = total.toLocaleString('ru-RU', { minimumFractionDigits: 2 }); // если 'ru-RU'
    const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2 }); // если 'en-US'
    console.log(formattedTotal);
    console.log(currencySymbol);

    console.log( { total: formattedTotal, currencySymbol } );
    return { total: formattedTotal, currencySymbol };
  }
  // суммирование для корзины

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

// STEP 3: Создание экземпляра корзины
const basket = new Basket();
basket.loadFromLocalStorage(); // Загрузка данных корзины из LocalStorage
logBasketItems();
updateBasketDisplay();

// STEP 4: Обработчики событий для кнопок
const addButtons = document.querySelectorAll('.card__button');
addButtons.forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.card');
    const id = card.getAttribute('id');  // id карточки
    const name = card.querySelector('.card__name').textContent;
    const priceFormatted = card.querySelector('.card__span-price').textContent;
    const image = card.querySelector('.card__image').src;

    const product = new Product(id, name, priceFormatted, image);
    basket.addItem(product);
    updateBasketDisplay();
  });
});

//
document.addEventListener('DOMContentLoaded', () => {
    const btnConfirm = document.getElementById('btnConfirm');

  if (btnConfirm) {

    btnConfirm.addEventListener('click', async () => {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;

        if (!customerName || !customerEmail) {
            alert('Пожалуйста, введите имя и телефон.');
            return;
        }

        const { total, currencySymbol } = basket.totalPrice(); // получение суммы и символа
        const totalAmount = { total, currencySymbol }; // создание объекта с total и currencySymbol

        try {
            const response = await fetch('/send-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    basket: basket.items, 
                    customerName: customerName,
                    customerEmail: customerEmail,
                    totalAmount: total, // сумма
                    currencySymbol: currencySymbol // символ
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send order');
            }

            const result = await response.json();
            console.log('Order sent:', result);
            alert('Ваш заказ успешно отправлен!');

            // Очистка корзины после отправки
            basket.clearBasketAfterOrder();
            updateBasketDisplay();
        } catch (error) {
            console.error('Error sending order:', error);
            alert('Ошибка при отправке заказа');
        }
    });

 }//if

});
//

// Обработчик для кнопки "Очистить"
const btnClear = document.getElementById('btnClear');
btnClear.addEventListener('click', () => {
  basket.clearBasket();
  updateBasketDisplay();
});

// STEP 5: Обновление отображения корзины
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

    const btnDelete = document.createElement('btnDelete');
    btnDelete.className = 'basket-item-btn btn-delete font-awesome-icon fas fa-trash-alt';
    btnDelete.addEventListener('click', () => {
      basket.removeItem(item.product);
      updateBasketDisplay();
    });
    itemElement.appendChild(btnDelete);

    basketItemsElement.appendChild(itemElement);
  });

  // отображение общей суммы в корзине
  const { total, currencySymbol } = basket.totalPrice();
  const totalPriceElement = document.createElement('div');
  totalPriceElement.className = 'total-price';
  //totalPriceElement.textContent = `Total: ${total} ${currencySymbol}`; // если 'ru-RU'
  totalPriceElement.textContent = `Total: ${currencySymbol}${total}`; // если 'en-US'
  basketItemsElement.appendChild(totalPriceElement);
  // отображение общей суммы в корзине

  updateConfirmButtonState();

}

document.addEventListener('DOMContentLoaded', () => {
  basket.loadFromLocalStorage();
  updateBasketDisplay();
});

// Обработчик для иконки корзины
document.addEventListener("DOMContentLoaded", function() {
  const basketIcon = document.getElementById("basket-icon");
  const basketElement = document.getElementById("basket");

  basketIcon.addEventListener("click", function() {
    if (basketElement.classList.contains("hide") || !basketElement.classList.contains("show")) {
      basketElement.classList.remove("hide");
      basketElement.classList.add("show");
      basket.loadFromLocalStorage(); //TODO test
      updateBasketDisplay(); //TODO test
    } else {
      basketElement.classList.remove("show");
      basketElement.classList.add("hide");
    }
  });
});

//TODO test - popstate: 'вперёд-назад' обновление корзины
window.addEventListener('popstate', () => {
  basket.loadFromLocalStorage();
  updateBasketDisplay(); 
  reload();
});

//TODO test
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // обновление корзины, если страница возвращена из кэша
    basket.loadFromLocalStorage();
    updateBasketDisplay();
  }
});

