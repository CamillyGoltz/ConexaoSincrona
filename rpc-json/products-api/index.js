const express = require('express');
const app = express();

app.use(express.json());

let = [
  { id: 1, name: 'Product 1', price: 10.0 },
  { id: 2, name: 'Product 2', price: 7.5 }
];

app.post('/Products', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid JSON-RPC version' }, id });
  }

  switch (method) {
    case 'Create':
      const newProduct = {
        id: productsList.length + 1,
        name: params.name,
        price: params.price
      };

      productsList.push(newProduct);
      res.json({ jsonrpc: '2.0', result: newProduct, id });
      break;

    case 'GetAll':
      res.json({ jsonrpc: '2.0', result: productsList, id });
      break;

    case 'GetById':
      const product = productsList.find(p => p.id === parseInt(params.id));

      if (!product) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Product not found' }, id });

      res.json({ jsonrpc: '2.0', result: product, id });
      break;

    case 'Update':
      const productToUpdate = productsList.find(p => p.id === parseInt(params.id));

      if (!productToUpdate) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Product not found' }, id });

      productToUpdate.name = params.name;
      productToUpdate.price = params.price;

      res.json({ jsonrpc: '2.0', result: productToUpdate, id });
      break;

    case 'Delete':
      productsList = productsList.filter(p => p.id !== parseInt(params.id));

      res.json({ jsonrpc: '2.0', result: 'Produto deletado', id });
      break;

    default:
      res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id });
  }
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Products API running on http://localhost:${PORT}`);
});

// Criar produto:
// {
//   "jsonrpc": "2.0",
//   "method": "Create",
//   "params": {
//     "name": "New Product",
//     "price": 17.5
//   },
//   "id": 6
// }

// Listar produtos:
// {
//   "jsonrpc": "2.0",
//   "method": "GetAll",
//   "id": 7
// }

// Listar produto por ID:
// {
//   "jsonrpc": "2.0",
//   "method": "GetById",
//   "params": { "id": 1 },
//   "id": 8
// }

// Editar produto:
// {
//   "jsonrpc": "2.0",
//   "method": "Update",
//   "params": {
//     "id": 1,
//     "name": "Updated Product",
//     "price": 2.5
//   },
//   "id": 9
// }

// Excluir produto:
// {
//   "jsonrpc": "2.0",
//   "method": "Delete",
//   "params": { "id": 1 },
//   "id": 10
// }