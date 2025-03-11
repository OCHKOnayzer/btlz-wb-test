import cron from "node-cron";
import { fetchTariffs } from "#services/wbapi.service.js";
import { exportToGoogleSheets } from "#services/googleSheets.service.js";

cron.schedule("0 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] получение данных с Wildberries`);
    await fetchTariffs();
    console.log(`[${new Date().toISOString()}] Данные загружены в БД`);

    console.log(`[${new Date().toISOString()}] Экспорт данных`);
    await exportToGoogleSheets();
    console.log(`[${new Date().toISOString()}] выгружено в Google Sheets.`);
});