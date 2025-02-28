import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

class DatabaseUtil {
    private static instance: DatabaseUtil;
    private connection: mysql.Connection | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {
        // Initialize the database connection synchronously
        this.initialize();
    }

    // Singleton instance getter
    public static getInstance(): DatabaseUtil {
        if (!DatabaseUtil.instance) {
            DatabaseUtil.instance = new DatabaseUtil();
        }
        return DatabaseUtil.instance;
    }

    // Initialize the MySQL connection
    private async initialize() {
        console.log('Connecting to the database...');
        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });
            console.log('Database connected successfully!');
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    }

    // Ensure connection is established before querying
    private async checkConnection() {
        if (!this.connection) {
            await this.initialize(); // Ensure the connection is initialized
        }
    }

    // Get operation - Retrieve data based on a query
    public async get(query: string, params: any[] = []) {
        try {
            await this.checkConnection(); // Ensure connection before querying
            const [rows] = await this.connection!.execute(query, params); // Non-null assertion because we check connection earlier
            // Return as json array
            return JSON.parse(JSON.stringify(rows));
        } catch (error) {
            console.error('Error executing GET query:', error);
            throw error;
        }
    }

    // Update operation - Execute update queries
    public async update(query: string, params: any[] = []) {
        try {
            await this.checkConnection(); // Ensure connection before querying
            const [result] = await this.connection!.execute(query, params);
            return result;
        } catch (error) {
            console.error('Error executing UPDATE query:', error);
            throw error;
        }
    }

    // Delete operation - Execute delete queries
    public async delete(query: string, params: any[] = []) {
        try {
            await this.checkConnection(); // Ensure connection before querying
            const [result] = await this.connection!.execute(query, params);
            return result;
        } catch (error) {
            console.error('Error executing DELETE query:', error);
            throw error;
        }
    }

    // Close the connection when done
    public async closeConnection() {
        try {
            if (this.connection) {
                await this.connection.end();
                console.log('Database connection closed.');
            }
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
}

export default DatabaseUtil;
