import fs from 'fs';
import path from 'path';
import { MongoClient, ServerApiVersion} from 'mongodb';

// Resolve the absolute path to config.json
const configPath = path.join(process.cwd(), './config.json');

// Read the config file
const rawData = fs.readFileSync(configPath);

// Parse the JSON data
const config = JSON.parse(rawData);

const uri = `mongodb+srv://${config.user}:${config.password}@eco-bot-cluster.vrfg6.mongodb.net/?retryWrites=true&w=majority&appName=Eco-bot-cluster`;

// Create the connection pool using the database config
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
async function connectDB() {
    if (!client.isConnected) {
        await client.connect();
    }
    return client.db(config.dbName).collection(config.collectionName); // Replace with your dbName and collectionName from config
}

// Add a document to the collection
export async function addItem(data) {
    const collection = await connectDB();
    try {
        const result = await collection.insertOne(data);
        console.log('Document inserted:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('Error inserting document:', error);
    }
}

// Get documents from the collection
export async function getItems(query = {}) {
    const collection = await connectDB();
    try {
        const results = await collection.find(query).toArray();
        console.log('Documents retrieved:', results);
        return results;
    } catch (error) {
        console.error('Error retrieving documents:', error);
    }
}

// Close the connection
export async function closeConnection() {
    await client.close();
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
