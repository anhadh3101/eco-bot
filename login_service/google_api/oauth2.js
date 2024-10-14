import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const CREDENTIALS_PATH = path.join(process.cwd(), '../shared/credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'];

const content = await fs.readFile(CREDENTIALS_PATH);
const keys = JSON.parse(content);
const key = keys.installed || keys.web;

export function getAuthUrl() {
    const client = new OAuth2Client(key.client_id, key.client_secret, key.redirect_uris);

    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    
    return authUrl;
}

export async function getAccessToken(code) {
    const client = new OAuth2Client(key.client_id, key.client_secret, key.redirect_uris);
    
    try {
        const { tokens } = await client.getToken(code);
        return tokens; // Return both tokens and the client
    } catch (error) {
        throw error;
    }
}
