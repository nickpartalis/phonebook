require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Person = require('./models/person')

// MIDDLEWARE
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('postBody', (req, res) => {
  if (req.method === 'POST') {
    const { name, number } = req.body
    return JSON.stringify({ name, number })
  }
})
app.use(morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
  tokens.postBody(req, res),
].join(' ')))

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  return next(err)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// ROUTES
app.get('/', (req, res) => {
  res.send('Phonebook API')
})

app.get('/info', async (req, res) => {
  const count = await Person.count()
  const time = new Date()
  const message = `Phonebook has info for ${count} people`
  res.send(`
    <p>${message}</p>
    <p>${time}</p>
  `)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((notes) => {
    res.json(notes)
  })
})

app.post('/api/persons', (req, res, next) => {
  const { body } = req
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Missing name or number' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then((savedPerson) => {
      res.status(201).json(person)
    })
    .catch((err) => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((err) => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((err) => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person,
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((err) => next(err))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
