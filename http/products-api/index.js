const express = require('express');
const app = express();

app.use(express.json());

let productsList = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 200 }
];

app.post('/Products/Create', (req, res) => {
  const newProduct = {
    id: productsList.length + 1,
    name: req.body.name,
    price: req.body.price
  };

  productsList.push(newProduct);
  res.status(201).json(newProduct);
});

app.get('/Products/GetAll', (req, res) => {
  res.json(productsList);
});

app.get('/Products/GetById/:id', (req, res) => {
  const product = productsList.find(p => p.id === parseInt(req.params.id));

  if (!product) return res.status(404).json({ message: 'Product not found' });

  res.json(product);
});

app.put('/Products/Update/:id', (req, res) => {
  const product = productsList.find(p => p.id === parseInt(req.params.id));

  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.name = req.body.name;
  product.price = req.body.price;

  res.json(product);
});

app.delete('/Products/Delete/:id', (req, res) => {
  products = productsList.filter(p => p.id !== parseInt(req.params.id));

  res.status(204).send();
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Products API running on http://localhost:${PORT}`);
});