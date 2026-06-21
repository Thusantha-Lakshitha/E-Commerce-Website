import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the server root
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Fix Windows Node.js DNS resolution bug where it fails to resolve MongoDB Atlas SRV records
// by falling back to Google & Cloudflare public DNS servers when loopback is default
const currentDns = dns.getServers();
if (currentDns.includes('127.0.0.1') || currentDns.includes('::1') || currentDns.length === 0) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (dnsErr) {
    // Fallback silently if DNS setServers is not supported or fails
  }
}

export default dotenv;
