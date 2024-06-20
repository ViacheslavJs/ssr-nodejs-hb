//TODO STEP 1: определяется функция-конструктор с помощью синтаксиса класса
// Свойства экземпляра класса объявляются и инициализируются внутри конструктора класса
class Product {
  // метод constructor, для объявления/создания/определения свойств и инициализация их значениями:
  constructor(name, priceFormatted, image) {
    this.name = name; // свойство name объекта Product получает значение аргумента name
    this.priceFormatted = priceFormatted; // свойство priceFormatted - получает значение priceFormatted
    this.image = image; // свойство image объекта Product получает значение аргумента image
  }
}


//TODO STEP 2: создание корзины с помощью синтаксиса класса
class Basket {
  constructor() {
    // корзина пуста
    this.items = []; // объявляение свойства items и его инициализация пустым массивом
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.product.name === product.name);
    console.log('addItem ', existingItem);
    if (existingItem) {
      // Если продукт уже есть в корзине, увеличиваем его количество
      existingItem.quantity++;
    } else {
      // Если продукта еще нет в корзине, добавляем его
      this.items.push({ product, quantity: 1 });
    }
  }

  removeItem(product) {
    const existingItemIndex = this.items.findIndex(item => item.product.name === product.name);
    if (existingItemIndex !== -1) {
      // Если продукт найден, удаляем его из корзины
      this.items.splice(existingItemIndex, 1);
    }
  }

  totalItems() {
    let total = 0;
    this.items.forEach(item => {
      total += item.quantity;
    });
    return total;
  }

  clearBasket() {
    // корзина очищена
    this.items = [];
  }
}

//TODO STEP 3: Создаётся экземпляр корзины - класса Basket
// Конструктор не нуждается в явном операторе return, потому что он неявно 
//возвращает созданный объект, если явно не возвращается другой объект.
// Переменная basket - экземпляр класса Basket - будет содержать ссылку на 
//новый объект класса Basket, и мы можем обращаться к его свойствам и методам.
const basket = new Basket(); // - 'Вызови new Basket(), и всё что new Basket() вернёт - присвой cart'.
console.log(basket.items); // Array []
//console.log(basket); // Object { items: [] }
updateBasketDisplay();


//TODO STEP 4 - click: Находим кнопки "Add to cart" и соотв. им карточки
const addButtons = document.querySelectorAll('.card__button');
//console.log(addButtons); // NodeList - все кнопки

// Добавляем обработчик события для каждой кнопки
addButtons.forEach(button => {
  button.addEventListener('click', () => {    
    const card = button.closest('.card'); // Находим соответств. карточку
    console.log(card);
    // извлекаем данные из соответств. карточки
    const name = card.querySelector('.card__span-name').textContent;
    console.log(name);
    const priceFormatted = card.querySelector('.card__span-price').textContent;
    console.log(priceFormatted);
    const image = card.querySelector('.card__image').src;
    console.log(image);
    
    /* // на будущее для какой-нибудь логики
    const imageNode = card.querySelector('.card__image');
    const imageNodeInfo = [
      imageNode.classList,
      imageNode.src,
      imageNode.alt
    ];
    console.log(imageNodeInfo);
    */

    //TODO STEP 5: экземпляр карточки
    // создается новый объект product с помощью ключевого слова new и передачей значений 
    // для свойств name, priceFormatted и image.
    const product = new Product(name, priceFormatted, image); // вызов функции-конструктора 
    console.log(product); // Object { name: "...", priceFormatted: "...", image: "..." }
    // Добавляем продукт в корзину
    basket.addItem(product); // вызов метода addItem описанного в классе Basket с передачей product
    // Обновляем отображение корзины
    updateBasketDisplay(); // обновляем отображение корзины

  }); // click
}); // forEach


// Функция обновления отображения корзины
function updateBasketDisplay() {
  const basketItemsElement = document.getElementById('basket-items');
  // Очищаем содержимое корзины
  basketItemsElement.innerHTML = '';

  // Общее количество товаров
  const totalItemsElement = document.getElementsByClassName('basket-icon__circle')[0];
  totalItemsElement.textContent = basket.totalItems();


  // Добавляем элементы в корзину
  basket.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'basket-item'; 

    // Create image element
    const itemImage = document.createElement('img');
    itemImage.src = item.product.image;
    itemImage.alt = item.product.name;
    itemImage.className = 'basket-image';
    itemElement.appendChild(itemImage);


    const itemInfo = document.createElement('span');
    itemInfo.className = 'basket-item-info';
    itemInfo.textContent = `${item.product.name} - ${item.product.priceFormatted} x ${item.quantity}`;
    itemElement.appendChild(itemInfo);

    // Создаем кнопку удаления для каждого товара
    const removeButton = document.createElement('button');
    //removeButton.textContent = 'Удалить';
    removeButton.className = 'basket-item-btn button-delete font-awesome-icon fas fa-trash-alt';
    removeButton.addEventListener('click', () => {
      basket.removeItem(item.product);
      updateBasketDisplay();
    });
    itemElement.appendChild(removeButton);

    basketItemsElement.appendChild(itemElement);
  });

  console.log(basket.items);
  //console.log(JSON.stringify(basket.items));

}


// Обработчик события для кнопки "Очистить"
const clearButton = document.getElementById('delete');
clearButton.addEventListener('click', () => {
  // Очищаем корзину
  basket.clearBasket();
  // Обновляем отображение корзины
  updateBasketDisplay();
});

document.addEventListener("DOMContentLoaded", function() {
  const basketIcon = document.getElementById("basket-icon");
  const basket = document.getElementById("basket");

  basketIcon.addEventListener("click", function() {
    if (basket.classList.contains("hide") || !basket.classList.contains("show")) {
      basket.classList.remove("hide");
      basket.classList.add("show");
    } else {
      basket.classList.remove("show");
      basket.classList.add("hide");
    }
  });
});

