import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insert, retrieve } from "./db_ops.js";
import { randomBytes } from 'crypto';

// Secret key to sign JWT
const JWT_SECRET = randomBytes(64).toString('hex');

// Register a new user
export async function registerUser(email, password, username) {
    try {
        const hashPassword = await bcrypt.hash(password, 10); // Hash the password
        await insert(email, hashPassword, username); // Store the hashed password and other credentials
        console.log('User registered successfully!');
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

// Login a user and generate JWT
export async function checkLoginCreds(email, password) {
    try {
        const user = await retrieve(email);
        const isPasswordValid = await bcrypt.compare(password, user.hash_password);

        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const jwt_token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

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