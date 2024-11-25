const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let ordersList = [
  { id: 1, customer: 'Cliente 1', productsId: [1, 2] },
  { id: 2, customer: 'Cliente 2', productsId: [2] }
];

app.post('/Orders/Create', (req, res) => {
  const newOrder = {
    id: ordersList.length + 1,
    customer: req.body.customer,
    products: req.body.products
  };

  ordersList.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/Orders/GetAll', (req, res) => {
  res.json(ordersList);
});

app.get('/Orders/GetById/:id', async (req, res) => {
  const order = ordersList.find(o => o.id === parseInt(req.params.id));

  if (!order) return res.status(404).json({ message: 'Order not found' });

  try {
    const productDetails = await Promise.all(
      order.productsId.map(productId => axios.get(`http://localhost:3001/Products/GetById/${productId}`))
    );
    const products = productDetails.map(response => response.data);

    res.json({ ...order, products });
  } catch (error) {
    res.status(500).json({ message: 'Error getting products', error: error.message });
  }
});

app.put('/Orders/Update/:id', (req, res) => {
  const order = ordersList.find(o => o.id === parseInt(req.params.id));

  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.customer = req.body.customer;
  order.productsId = req.body.products;

  res.json(order);
});

app.delete('/orders/:id', (req, res) => {
  orders = ordersList.filter(o => o.id !== parseInt(req.params.id));

  res.status(204).send();
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Orders API running on http://localhost:${PORT}`);
});