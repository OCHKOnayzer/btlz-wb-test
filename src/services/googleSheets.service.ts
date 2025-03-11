import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import knex from "#postgres/knex.js";
import dotenv from "dotenv";

dotenv.config();

const SHEET_IDS = process.env.SHEET_IDS?.split(",") || [];
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

if (!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || !GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL) {
    throw new Error("!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY и GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL");
}

const auth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: SCOPES,
});

const BASE_SHEET_NAME = "stocks_coefs";
const HEADERS = [
    "warehouse_name",
    "box_delivery_and_storage_expr",
    "box_delivery_base",
    "box_delivery_liter",
    "box_storage_base",
    "box_storage_liter",
    "updated_at",
    "date",
];

export const exportToGoogleSheets = async () => {
    try {
        console.log(`[${new Date().toISOString()}] выгрузка данных в Google Sheets`);

        const tariffs = await knex("tariffs")
            .select("*")
            .orderBy("box_delivery_and_storage_expr", "asc");

        if (tariffs.length === 0) {
            return;
        }

        const currentDate = new Date().toISOString().split("T")[0];

        const sheetName = `${BASE_SHEET_NAME}_${currentDate}`;

        for (const sheetId of SHEET_IDS) {

            const doc = new GoogleSpreadsheet(sheetId, auth);
            await doc.loadInfo();

            let sheet = Object.values(doc.sheetsByTitle).find(s => s.title === sheetName);

            if (!sheet) {
                sheet = await doc.addSheet({
                    title: sheetName,
                    headerValues: HEADERS,
                });
            } else {
                await sheet.clear();
                await sheet.setHeaderRow(HEADERS);
            }

            const rows = tariffs.map(tariff => ({
                warehouse_name: tariff.warehouse_name,
                box_delivery_and_storage_expr: tariff.box_delivery_and_storage_expr,
                box_delivery_base: tariff.box_delivery_base,
                box_delivery_liter: tariff.box_delivery_liter,
                box_storage_base: tariff.box_storage_base ?? "",
                box_storage_liter: tariff.box_storage_liter ?? "",
                updated_at: new Date(tariff.updated_at).toISOString(),
                date: new Date(tariff.date).toISOString().split('T')[0],
            }));

            await sheet.addRows(rows);

            console.log(`Данные выгружены: ${sheetId}, лист: ${sheetName}`);
        }
    } catch (error) {
        console.error("Ошибка при выгрузке:", error);
    }
};

exportToGoogleSheets();
