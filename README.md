# Conceitos:
1. Orders API: é o produtor de mensagens de requisição e o consumidor de respostas;
2. Products API: consome as requisições e responde pela fila orderQueue;

# Fazer funcionar:
## 1. RabbitMQ
```
docker pull rabbitmq:management
```
```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```
```
http://localhost:15672
```
Os credenciais padrão para login são:
* Username: guest
* Password: guest

## 2. Orders API
```
cd rabbitmq
```
```
cd orders-api
```
```
npm i
```
```
npm start
```

## 2. Products API
```
cd rabbitmq
```
```
cd products-api
```
```
npm i
```
```
npm start
```