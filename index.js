/*
 При развертывании проекта на реальном хостинге убедитесь, 
что ваш хостинг-провайдер поддерживает версию Node.js, которая 
поддерживает ключевое слово async/await, так как оно было добавлено 
в версии ECMAScript 2017 (ES8). Большинство современных 
хостинг-провайдеров поддерживают актуальные версии Node.js, но убедитесь, 
что вы выбираете соответствующую версию при настройке вашего сервера.
*/

const express = require('express')
const expressHandlebars = require('express-handlebars')
const fs = require('fs').promises; // Добавляем импорт модуля fs
const path = require('path'); // Импортируем модуль path для работы
const fortune = require('./lib/fortune.js')
const { priceFormatting } = require('./lib/priceFormatting')
const { sendOrderEmail } = require('./mailer'); //TODO Импорт функции отправки email

const app = express()

// configure Handlebars view engine
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main',
}))
app.set('view engine', 'handlebars')

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

//app.get('/', (req, res) => res.render('home'))

app.get('/about', (req, res) => {
  res.render('about', { fortune: fortune.getFortune() })
})

//
async function readDataFromJSON() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON file:', err);
    throw err;
  }
}

// Route to output JSON in browser
app.get('/data', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//

app.get('/', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"home" page:', '\n', data);
    
    // or
    //res.render('home', { description: data.ourCompany }); 

    // or
    // если categories находится в home.handlebars 
    res.render('home', { 
      description: data.ourCompany,
      categories: data.categories  
    });

  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

//TODO Маршрут для страницы checkout
app.get('/checkout', (req, res) => {
    res.render('checkout');
});
//TODO

//TODO Маршрут для отправки email с данными корзины
app.post('/send-order', express.json(), async (req, res) => {
    const { basket, customerName, customerEmail, totalAmount, rightPart } = req.body;

    const basketItems = basket.map(item => `
        <div>
            <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px;">
            <span>${item.product.name} - ${item.product.priceFormatted} x ${item.quantity}</span>
        </div>
    `).join('');

    const emailContent = `
        <h2>Заказ</h2>
        ${basketItems}
        <h3>Общая сумма: ${totalAmount}${rightPart}</h3>  <!-- Добавление общей суммы -->
        <h3>Заранее спасибо!</h3>
    `;

    try {
        await sendOrderEmail(customerName, customerEmail, 'Новый заказ', 'Ваш заказ был успешно отправлен.', emailContent);
        res.status(200).send({ message: 'Email отправлен успешно!' });
    } catch (error) {
        res.status(500).send({ error: 'Не удалось отправить email.' });
    }
});

//TODO

app.get('/services', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"services" page:', '\n', data);
    res.render('services', { services: data.ourServices });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

/*
// отключить если categories в home.handlebars
app.get('/categories', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"categories" page:', '\n', data);
    res.render('categories', { categories: data.categories });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//
*/

/*
// 1
app.get('/main-courses', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log(data);
    
    const products = data.mainCoursesList.map(product => ({
      ...product,
      // formatting the price for each product
      formatPrice: priceFormatting(product.price, data.exchangeRates[0].currency, data.exchangeRates[0].rate)
    }));
    
    // Template rendering, goods transfer
    res.render('main-courses', { products });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//
*/

/*
// 2
app.get('/main-courses', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log(data);

    res.render('main-courses', { 
      products: data.mainCoursesList.map(product => ({
        ...product,
        formatPrice: priceFormatting(product.price, data.exchangeRates[0].currency, data.exchangeRates[0].rate)
      }))
    });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//
*/

/*
// 3 - маршрут /main-courses объединено в одну функц.:
app.get('/main-courses', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8');
    const jsonData = JSON.parse(data);
    console.log(jsonData);

    const productsFormatPrice = jsonData.mainCoursesList.map(product => {
      return {
        name: product.name,
        price: product.price,
        image: product.image,
        formatPrice: priceFormatting(product.price, jsonData.exchangeRates[0].currency, jsonData.exchangeRates[0].rate)
      };
    });
    res.render('main-courses', { products: productsFormatPrice });
  } catch (err) {
    console.error('Error reading JSON file:', err);
    res.status(500).send('Internal Server Error');
  }
});
//
*/


// 4 main-courses
app.get('/main-courses', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"main-courses" page:', '\n', data);

    // We format the price and create a new array of products
    const productsFormatPrice = data.mainCoursesList.map(product => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        formatPrice: priceFormatting(product.price, data.exchangeRates[0].currency, data.exchangeRates[0].rate)
      };
    });

    // Passing data to the template
    res.render('main-courses', { products: productsFormatPrice });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//

// 4 appetizers
app.get('/appetizers', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"appetizers" page:', '\n', data);

    // We format the price and create a new array of products
    const productsFormatPrice = data.appetizersList.map(product => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        formatPrice: priceFormatting(product.price, data.exchangeRates[0].currency, data.exchangeRates[0].rate)
      };
    });

    // Passing data to the template
    res.render('appetizers', { products: productsFormatPrice });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//

// 4 desserts
app.get('/desserts', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"desserts" page:', '\n', data);

    // We format the price and create a new array of products
    const productsFormatPrice = data.dessertsList.map(product => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        formatPrice: priceFormatting(product.price, data.exchangeRates[0].currency, data.exchangeRates[0].rate)
      };
    });

    // Passing data to the template
    res.render('desserts', { products: productsFormatPrice });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//


app.get('/booking', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"booking" page:', '\n', data);
    res.render('booking');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/delivery', async (req, res) => {
  try {
    const data = await readDataFromJSON();
    console.log('"delivery" page:', '\n', data);    
    res.render('delivery');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});


// custom 404 page
app.use((req, res) => {
  res.status(404)
  res.render('404')
})

// custom 500 page
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500)
  res.render('500')
})

app.listen(port, () => {
  console.log( `Express started on http://localhost:${port}` +
    '; press Ctrl-C to terminate.' )
})
