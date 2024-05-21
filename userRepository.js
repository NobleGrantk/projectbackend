const mysql = require('mysql');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',  // Consider using a non-root user for application purposes
    password: 'HunterNC',  // Ensure to secure your real password
    database: 'medical_database'
});

// Test the database connection without closing the pool
pool.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
        console.error('Error executing query:', error);
    } else {
        console.log('The solution is:', results[0].solution); // Should log: The solution is: 2
    }
});

function registerUser(username, password, fullname, email, phone_number, gender, callback) {
    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return callback(err);
        }

        pool.query(
            'INSERT INTO users (username, password, fullname, email, phone_number, gender) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hash, fullname, email, phone_number, gender],
            (error, results) => {
                if (error) {
                    console.error('Error registering user:', error);
                    return callback(error);
                }
                callback(null, results);
            }
        );
    });
}

function verifyUser(username, password, callback) {
    pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return callback(error);
            }

            if (results.length === 0) {
                return callback(null, null); // No user found
            }

            const user = results[0];
            // Compare the hashed password with the provided password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return callback(err);
                }

                if (!isMatch) {
                    return callback(null, null); // Passwords do not match
                }

                callback(null, user); // User verified
            });
        }
    );
}

// Graceful shutdown
function closePool() {
    pool.end((err) => {
        if (err) {
            console.error('Error closing the database pool:', err);
        } else {
            console.log('Database pool closed.');
        }
    });
}

process.on('SIGINT', () => {
    closePool();
    process.exit(0);
});

module.exports = { registerUser, verifyUser, closePool };
