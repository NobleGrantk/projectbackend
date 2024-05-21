const express = require('express');
const userRepository = require('./userRepository');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());

app.post('/register', (req, res) => {  // Changed the endpoint to '/register'
    console.log(req.body);
    const { username, password, fullname, email, phoneNumber, gender } = req.body;

    if (!username || !password || !fullname || !email || !phoneNumber || !gender) {
        console.log('Validation error: All fields are required');
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        console.log('Validation error: Password must be at least 6 characters long');
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        console.log('Validation error: Invalid email address');
        return res.status(400).json({ error: 'Invalid email address' });
    }

    userRepository.registerUser(username, password, fullname, email, phoneNumber, gender, (error, results) => {
        if (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json({ message: 'User registered successfully', user: { username, fullname, email, phoneNumber, gender } });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Validation error: Username and password are required');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    userRepository.verifyUser(username, password, (error, user) => {
        if (error) {
            console.error('Error verifying user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
            console.log('Validation error: Invalid username or password');
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful', user: { username: user.username, fullname: user.fullname, email: user.email, phone_number: user.phone_number, gender: user.gender } });
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to the backend of your application!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
