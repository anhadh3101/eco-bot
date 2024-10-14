import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

// Resolve the absolute path to config.json
const configPath = path.join(process.cwd(), './config.json');

// Read the config file
const rawData = fs.readFileSync(configPath);

// Parse the JSON data
const config = JSON.parse(rawData);

// Create the connection pool using the database config
const pool = mysql.createPool(config.db);

export async function insert(email, hashPassword, username) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (email, hash_password, username) VALUES (?, ?, ?)', 
            [email, hashPassword, username]
        );
        console.log('User added successfully:', result);
    } catch (error) {
        throw error;
    }
}

export async function retrieve(email) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        return rows[0];

    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

export async function saveTokens(tokens, email) {
    try {
        await pool.execute(
            'UPDATE users SET token = ? WHERE email = ?',
            [tokens, email]
        );
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

export async function fetchToken(email) {
    try {
        const [rows] = await pool.execute(
            'SELECT token FROM users WHERE email = ?',
            [email]
        );

        if (rows.length > 0) {
            return rows[0].token;  // Return the token if found
        } else {
            throw new Error(`Token not found for email: ${email}`);
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}
