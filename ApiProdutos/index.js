const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

let products = [];

app.post('/products', (req, res) => {
  const product = req.body;
  product.id = products.length + 1;
  products.push(product);
  res.status(201).json(product);
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(c => c.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

app.put('/products/:id', (req, res) => {
  const product = products.find(c => c.id === parseInt(req.params.id));
  if (product) {
    Object.assign(product, req.body);
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

app.delete('/products/:id', (req, res) => {
  const productIndex = products.findIndex(c => c.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Product not found');
  }
});

app.listen(port, () => {
  console.log(`Products API running on http://localhost:${port}`);
});
