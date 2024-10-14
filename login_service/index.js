import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { getAuthUrl, getAccessToken } from './google_api/oauth2.js';
import { checkLoginCreds, registerUser, decodeToken } from './login/login.js';
import { fetchToken, saveTokens } from "./login/db_ops.js";
import { logInfo, logError} from './development/logger.js';

// Configure the .env file for the service
dotenv.config();
const REACT_HOST = process.env.REACT_HOST;

const app = express();

// Middleware
// CORS (Cross-Origin Resource Sharing) for authorizing communication between microservices
const allowedOrigins = [REACT_HOST]; // Add more hosts to the list if there are CORS related errors
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and other credentials
};
app.use(cors(corsOptions));

// Other middlewares to allow sharing between microservices
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/*
API for signing into the application.
*/
app.post('/api/login', async (req, res) => {
    // Get the email and password from the request body
    const { email, password } = req.body;
    logInfo(`Login intialized with email ${email} and password ${password}`);

    try {
        // Get the JWT if valid credentials
        const jwtToken = await checkLoginCreds(email, password);
        logInfo(`User logged in with email: ${email}`);
        logInfo(`JWT for ${email}: ${jwtToken}`);
        
        // Generate and redirect to auth url
        const authUrl = getAuthUrl();
        const modUrl = `${authUrl}&state=${encodeURIComponent(jwtToken)}`;
        logInfo(`Authorization URL for ${email} is ${modUrl}`);

        res.cookie("TOKEN", jwtToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 3600000 });
        logInfo(`Cookie sent to user with email ${email}`);

        res.status(200).json({ modUrl });
    } catch (error) {
        logError("Login Failed:", error);
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

/*
Callback to generate and save access tokens
*/
app.get("/callback", async (req, res) => {
    const { code, state } = req.query;
    logInfo(`Callback for JWT: ${state}`);

    try {
        // Decode and get the email
        const jwtToken = decodeURIComponent(state);
        const decoded = decodeToken(jwtToken);
        const email = decoded.email;

        const tokens = await getAccessToken(code); // Handle callback and get tokens
        logInfo(`Access tokens for ${email}: ${tokens}`);

        // Save tokens into the DB
        await saveTokens(tokens, email);
        logInfo(`Tokens saved for ${email}`);
        logInfo(`Redirecting ${email} to REACT service`);

        // Redirect back to the react service
        res.redirect(`${REACT_HOST}/spreadsheets`);
    } catch (error) {
        logError("OAuth callback failed:", error);
        res.redirect(`${REACT_HOST}`); // Handle errors and redirect to a fallback
    }
});

/*
API to sign up a new user
*/
app.post("/api/register", async (req, res) => {
    const { email, password, username } = req.body;
    logInfo(`Registration request initiated by ${email} with username ${username}`);

    try {
        // Add the user to DB
        await registerUser(email, password, username);
        logInfo(`User registered: ${email}`);
        
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        logError(`Registration failed for ${email}:`, error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

/*
API to get the access token by exchanging the JWT
*/
app.get("/api/getAccessToken", async (req, res) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers['authorization'];

        // Check if the header is present
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Split the header to get the token (assuming it's in the format: "Bearer <token>")
        const jwtToken = authHeader.split(' ')[1];
        logInfo(`Recieved the JWT in the access token request: ${jwtToken}`);

        // Decode token and get email
        const decodedToken = decodeToken(jwtToken);  
        const email = decodedToken.email;

        // Get the access token from the DB ans return it in the response
        const tokens = await fetchToken(email);
        logInfo(`Access token for ${email} is ${tokens.access_token}`);
        
        res.status(200).json({ tokens });
        
    } catch (error) {
        logError("Error getting access token: ", error);
        res.status(404).json({ message: 'Failed to fetch access token' });
    }
});

app.listen(8000, () => {
    logInfo("Server is running at port 8000!");
});

