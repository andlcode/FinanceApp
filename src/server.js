const express = require('express');
const { v4:uuidv4 } = require('uuid');

const app = express();

app.use(express.json())

const customers = []

/**
 * 
 * cpf - String
 * Name - String
 * id - UUID
 * statement []
 * 
 */

/**
 * 
 * Middleware - Uma função que fica no meio das REQ RES
 * 
 */

// Middleware

function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);  

  if(!customer){
    return response.status(400).json({
      error: 'Customer not found'
    })
  } 

  request.customer = customer

  return next()
  

}
function getBalance(statement){
  const balance = statement.reduce((acc, operation) => {
      if (operation.type === "credit"){
          return acc + operation.amount
      } else {
          return acc - operation.amount; 
      }
  }, 0)
  return balance 
}
app.post('/account', (request, response) => {
  const {cpf, name} = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf)

if(customerAlreadyExists) {
  return response.status(400).json({
    error: "Customer already exists"
  })
}



 app.get('/statement', verifyExistsAccountCPF, (request, response) => {

    const { customer} = request

    return response.json(customer.statement)
    }) 

    app.get('/statement/date', verifyExistsAccountCPF, (request, response) => {

      const { customer} = request
      const {date} = request.query
      const dateFormat = new Date(date + "00:00")
  
      const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

      return response.json(statement)
    })
  
app.get('/balance', verifyExistsAccountCPF, (request, response) => {
  const {customer} = request

  const balance = getBalance(customer.statement)

  return response.json(balance).status(200)
})

 app.post('/deposit', verifyExistsAccountCPF, (request, response) => { 
      const { description, amount } = request.body;

      const {customer} = request;

      const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
      }

      customer.statement.push(statementOperation);
console.log('depositado')
      return response.status(201).send();
 })

app.put('/account', verifyExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name

  return response.status(201).send();
})

app.get('/account', verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
})

app.delete('/account', verifyExistsAccountCPF, (request, response) => {
   const { customer } = request;

   customers.splice(customer, 1)

   return response.status(200).json(customers)

   
})

app.post("/withdraw", verifyExistsAccountCPF, (request, response) => {
    const { amount } = request.body

    const { customer } = request

    const balance = getBalance(customer.statement)

    if(balance < amount) {
      return response.status(400).json({error: "Insufficient funds"})
    }

    const statementOperation = {
      amount,
      created_at: new Date(),
      type: 'debit'
    }

    customer.statement.push(statementOperation);

    return response.status(201).send()


})


 customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: [],
  })
  console.log('User created.')
  return response.status(201).send()
})

PORT = 3000

app.listen(PORT, () => {
  console.log('listening on port 3000')
})