import pool from '../lib/db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupDatabase() {
	try {
		console.log('Setting up database schema...');

		// Read and execute create-tables.sql
		const createTablesSQL = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');

		await pool.query(createTablesSQL);
		console.log('Tables created successfully!');

		// Read and execute seed-data.sql (optional)
		const seedDataSQL = fs.readFileSync(path.join(__dirname, 'seed-data.sql'), 'utf8');

		await pool.query(seedDataSQL);
		console.log('Sample data inserted successfully!');
	} catch (error) {
		console.error('Error setting up database:', error);
		throw error;
	} finally {
		await pool.end();
	}
}

// Run if called directly
// if (import.meta.url === `file://${process.argv[1]}`) {
// 	setupDatabase().catch(console.error);
// }

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	setupDatabase().catch(console.error);
}
