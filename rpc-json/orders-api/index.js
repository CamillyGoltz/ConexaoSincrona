const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let = [
  { id: 1, customer: 'Customer 1', productsId: [1, 2] },
  { id: 2, customer: 'Customer 2', productsId: [2] }
];

app.post('/Orders', async (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid JSON-RPC version' }, id });
  }

  try {
    switch (method) {
      case 'Create':
        const newOrder = {
          id: ordersList.length + 1,
          customer: params.customer,
          products: params.products
        };

        ordersList.push(newOrder);
        res.json({ jsonrpc: '2.0', result: newOrder, id });
        break;

      case 'GetAll':
        res.json({ jsonrpc: '2.0', result: ordersList, id });
        break;

      case 'GetById':
        const order = ordersList.find(o => o.id === parseInt(params.id));

        if (!order) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Order not found!' }, id });

        const productDetails = await Promise.all(
          order.productsId.map(productId => axios.get(`http://localhost:3003/Products`, {
            method: 'POST',
            data: {
              jsonrpc: '2.0',
              method: 'GetById',
              params: { id: productId },
              id: 8
            }
          }))
        );
        const products = productDetails.map(response => response.data.result);

        res.json({ jsonrpc: '2.0', result: { ...order, products }, id });
        break;

      case 'Update':
        const orderToUpdate = ordersList.find(o => o.id === parseInt(params.id));

        if (!orderToUpdate) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Order not found!' }, id });

        orderToUpdate.customer = params.customer;
        orderToUpdate.productsId = params.products;

        res.json({ jsonrpc: '2.0', result: orderToUpdate, id });
        break;

      case 'Delete':
        ordersList = ordersList.filter(o => o.id !== parseInt(params.id));

        res.json({ jsonrpc: '2.0', result: 'Order deleted!', id });
        break;

      default:
        res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'method not found!' }, id });
    }
  } catch (error) {
    res.json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error', data: error.message }, id });
  }
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Orders API running on http://localhost:${PORT}`);
});

// Criar pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "Create",
//     "params": {
//       "customer": "New Customer",
//       "products": [1, 2]
//     },
//     "id": 1
// }

// Listar pedidos:
// {
//     "jsonrpc": "2.0",
//     "method": "GetAll",
//     "id": 2
// }

// Listar pedido por ID:
// {
//     "jsonrpc": "2.0",
//     "method": "GetById",
//     "params": { "id": 1 },
//     "id": 3
// }

// Editar pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "Update",
//     "params": {
//       "id": 1,
//       "customer": "Updated Customer",
//       "products": [2, 3]
//     },
//     "id": 4
// }

// Excluir pedido:
// {
//     "jsonrpc": "2.0",
//     "method": "Delete",
//     "params": { "id": 1 },
//     "id": 5
// }