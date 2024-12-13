import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addItem, getItems } from "./db_ops.js";
import { randomBytes } from 'crypto';

// Secret key to sign JWT
const JWT_SECRET = randomBytes(64).toString('hex');

// Register a new user
export async function registerUser(email, password, username) {
    try {
        const hashPassword = await bcrypt.hash(password, 10); // Hash the password

        // Add the user to DB
        const data = { 
            "email": email, 
            "hash_password": hashPassword,
            "username": username 
        };
        await addItem(data); 

        console.log('User registered successfully!');
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

// Login a user and generate JWT
export async function checkLoginCreds(email, password) {
    try {
        // Fetch user based on email
        const users = await getItems({ email });
        
        // Check if user exists
        if (users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0]; // Since we expect a unique email, take the first result

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.hash_password);
        if (!isPasswordValid) {
            console.log('Invalid password');
            throw new Error('Invalid password');
        }
        console.log('User logged in successfully!');
        // Generate JWT token
        const jwt_token = jwt.sign(
            { email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        console.log('JWT token generated successfully!');
        return jwt_token;
    } catch (error) {
        throw error;
    } 
}

// Decode the JWT with the secret
export function decodeToken(jwt_token) {
    const decoded = jwt.verify(jwt_token, JWT_SECRET);
    return decoded;
}