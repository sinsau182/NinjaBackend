const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB connection string)
mongoose.connect('mongodb+srv://singhsaurav182001:aCQJ79c76g1mTSyw@cluster0.qcvw5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// User schema and model with dob field
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Date of birth field
});

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).send("User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).send("Invalid credentials");

  const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token, user });
});

app.get('/users/emails', async (req, res) => {
  try {
    // Fetch only the email field from all users
    const users = await User.find({}, 'email');
    res.json(users.map(user => user.email)); // Return an array of emails
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});




app.get('/', (req, res) => {
    res.send('Hello !');
});


const PORT = 5000
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})