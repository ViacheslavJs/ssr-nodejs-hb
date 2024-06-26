//TODO STEP 1: Определение функции-конструктора с использованием синтаксиса класса
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

//TODO STEP 2: Создание корзины с использованием синтаксиса класса
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

  //TODO - суммирование для корзины
  totalPrice() {
    let total = 0;
    let currencySymbol = '';
    this.items.forEach(item => {
      //console.log(this.items);
      //console.log(item);
      //console.log(item.product);
      //console.log(item.product.priceFormatted);
      const itemPriceString = item.product.priceFormatted;
      const match = itemPriceString.match(/[\d,.]+/);
      console.log(match);

      if (match) {
        const cleanedPriceString = match[0];
        console.log(cleanedPriceString);
        const itemPrice = parseFloat(cleanedPriceString.replace(',', '.')); 
        console.log(itemPrice);

        const startIndex = itemPriceString.indexOf(cleanedPriceString);
        console.log(startIndex);
        const endIndex = startIndex + cleanedPriceString.length;
        console.log(endIndex);

        currencySymbol = itemPriceString.slice(endIndex).trim();
        console.log(currencySymbol);

        total += itemPrice * item.quantity;
      }
    });

    // Замена точки на запятую в общей сумме
    const formattedTotal = total.toFixed(2).replace('.', ',');

    return { total: formattedTotal, currencySymbol };
  }
  //TODO - суммирование для корзины

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
    const id = card.getAttribute('id');  // предполагается, что id у карточки это уникальный идентификатор
    const name = card.querySelector('.card__name').textContent;
    const priceFormatted = card.querySelector('.card__span-price').textContent;
    const image = card.querySelector('.card__image').src;

    const product = new Product(id, name, priceFormatted, image);
    basket.addItem(product);
    updateBasketDisplay();
  });
});

//TODO
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

        const { total, currencySymbol } = basket.totalPrice(); // Получение общей суммы и части справа
        const totalAmount = { total, currencySymbol }; // Создание объекта с total и currencySymbol

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
                    totalAmount: total, // Передача общей суммы 
                    currencySymbol: currencySymbol // Передача части справа
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send order');
            }

            const result = await response.json();
            console.log('Order sent:', result);
            alert('Ваш заказ успешно отправлен!');

            // Очистка корзины после успешной отправки
            basket.clearBasketAfterOrder();
            updateBasketDisplay();
        } catch (error) {
            console.error('Error sending order:', error);
            alert('Ошибка при отправке заказа');
        }
    });

 }//if

});

//TODO

// Обработчик для кнопки "Очистить"
const btnClear = document.getElementById('btnClear');
btnClear.addEventListener('click', () => {
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

    const btnDelete = document.createElement('btnDelete');
    btnDelete.className = 'basket-item-btn btn-delete font-awesome-icon fas fa-trash-alt';
    btnDelete.addEventListener('click', () => {
      basket.removeItem(item.product);
      updateBasketDisplay();
    });
    itemElement.appendChild(btnDelete);

    basketItemsElement.appendChild(itemElement);
  });

  //TODO отображение общей суммы в корзине
  const { total, currencySymbol } = basket.totalPrice();
  const totalPriceElement = document.createElement('div');
  totalPriceElement.className = 'total-price';
  totalPriceElement.textContent = `Total: ${total} ${currencySymbol}`;
  basketItemsElement.appendChild(totalPriceElement);
  //TODO отображение общей суммы в корзине

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
    } else {
      basketElement.classList.remove("show");
      basketElement.classList.add("hide");
    }
  });
});

