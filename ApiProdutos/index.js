const express = require('express');
const app = express();

app.use(express.json());

let products = [
  { id: 1, name: 'Produto 1', price: 100 },
  { id: 2, name: 'Produto 2', price: 200 }
];

app.get('/produtos', (req, res) => {
  res.json(products);
});

app.get('/produtos/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
  res.json(product);
});

app.post('/produtos', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/produtos/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

  product.name = req.body.name;
  product.price = req.body.price;
  res.json(product);
});

app.delete('/produtos/:id', (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.status(204).send();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API de Produtos rodando em http://localhost:${PORT}`);
});