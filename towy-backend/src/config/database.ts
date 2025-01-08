import { DataSource } from 'typeorm';
import { User } from "../models/User";
import { ServiceRequest } from "../models/ServiceRequest";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "mysecretpassword",
    database: process.env.DB_NAME || "towy_db",
    synchronize: true,
    logging: false,
    entities: [User, ServiceRequest],
    subscribers: [],
    migrations: []
}) 