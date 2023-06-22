const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const app = express()

const persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())
app.use(cors())

morgan.token("postBody", (req, res) => {
  if (req.method === "POST") {
    const { name, number, id } = req.body
    return JSON.stringify({ name, number })
  }
})
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"), "-",
    tokens["response-time"](req, res), "ms",
    tokens.postBody(req, res)
  ].join(" ")
}))

app.get("/", (req, res) => {
  res.send("Phonebook API")
})

app.get("/info", (req, res) => {
  const time = new Date()
  const message = `Phonebook has info for ${persons.length} people`
  res.send(`
    <p>${message}</p>
    <p>${time}</p>
  `)
})

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.post("/api/persons", (req, res) => {
  const person = req.body
  if (!person.name || !person.number) 
    return res.status(400).json({ error: "missing name or number" })
  if (persons.some(p => p.name === person.name)) 
    return res.status(400).json({ error: "name must be unique" })

  let id 
  do {
    id = Math.floor(Math.random() * 100000)
  } while (persons.some(person => person.id === id))
  person.id = id

  persons.push(person)
  res.status(201).json(person)
})

app.get("/api/persons/:id", (req, res) => {
  const id = +req.params.id
  const person = persons.find(person => person.id === id)

  if (!person) res.status(404).send({ error: "requested person not found" })
  res.json(person)
})

app.delete("/api/persons/:id", (req, res) => {
  const id = +req.params.id
  const personIndx = persons.findIndex(person => person.id === id)

  if (personIndx !== -1) {
    persons.splice(personIndx, 1)
    return res.status(204).end()
  }
  return res.status(404).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})