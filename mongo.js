// Only used in 3.12
const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("give password as argument")
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://nickpartalis:${password}@cluster0.v0hcr70.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set("strictQuery",false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema)

if (process.argv.length === 3) {
  Person
    .find({})
    .then(result => {
      console.log("phonebook:")
      result.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })
}
else if (process.argv.length >= 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  
  person.save().then(result => {
    console.log("Person saved to database!")
    mongoose.connection.close()
  })
}
else {
  console.log("Incorrect number of arguments.")
  mongoose.connection.close()
}
