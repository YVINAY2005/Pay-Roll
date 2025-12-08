const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pay-enroll', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  // Seed demo user
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const demoUser = await User.findOne({ email: 'hire-me@anshumat.org' });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('HireMe@2025!', 10);
    const user = new User({
      email: 'hire-me@anshumat.org',
      password: hashedPassword,
      name: 'Demo User',
      role: 'admin'
    });
    await user.save();
    console.log('Demo user seeded');
  }
})
.catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/salary-slip', require('./routes/salarySlip'));
app.use('/expense', require('./routes/expense'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
