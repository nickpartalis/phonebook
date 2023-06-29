const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose
  .connect(url)
  .then((res) => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^\d{2,3}-\d{5,}$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (doc, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
