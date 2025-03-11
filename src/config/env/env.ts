import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),
    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: z
        .string()
        .regex(/^[0-9]+$/)
        .transform((value) => parseInt(value)),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    APP_PORT: z.union([
        z.undefined(),
        z
            .string()
            .regex(/^[0-9]+$/)
            .transform((value) => parseInt(value)),
    ]),
    SHEET_IDS: z.union([z.string(), z.undefined()]),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: z.string(),
    WB_API_TOKEN: z.string(),
    WB_API_URL: z.string(),
});

const env = envSchema.parse({
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    WB_API_TOKEN: process.env.WB_API_TOKEN,
    WB_API_URL: process.env.WB_API_URL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    SHEET_IDS: process.env.SHEET_IDS,
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: process.env.APP_PORT,
});

export default env;
