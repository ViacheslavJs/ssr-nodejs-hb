function priceFormatting(price, currency, rate) {
  // setting formatting options
  const options = {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol' // setting currency symbol - 'narrowSymbol' or 'code'
  };

  // format the price and return the string
  //return new Intl.NumberFormat('ru-RU', options).format(price / rate);
  return new Intl.NumberFormat('en-US', options).format(price / rate);
}

// export
module.exports = { priceFormatting };

