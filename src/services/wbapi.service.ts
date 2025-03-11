import axios from "axios";
import knex from "#postgres/knex.js";
import dotenv from "dotenv";
import axiosRetry from "axios-retry";
import { Warehouse } from "#types/types.js";

dotenv.config();

if (!process.env.WB_API_URL) {
  throw new Error("!WB_API_URL");
}
if (!process.env.WB_API_TOKEN) {
  throw new Error("!WB_API_TOKEN");
}

const apiUrl: string = process.env.WB_API_URL;
const token: string = process.env.WB_API_TOKEN;

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export const fetchTariffs = async () => {
  try {
   
    const currentDate = new Date().toISOString().split("T")[0];

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { date: currentDate },
    });

    if (!response.data?.response?.data?.warehouseList) {
      return;
    }

    const tariffs = response.data.response.data.warehouseList.map((item: Warehouse) => ({
      warehouse_name: item.warehouseName,
      box_delivery_and_storage_expr: parseFloat(item.boxDeliveryAndStorageExpr.replace(",", ".")) || 0,
      box_delivery_base: parseFloat(item.boxDeliveryBase.replace(",", ".")) || 0,
      box_delivery_liter: parseFloat(item.boxDeliveryLiter.replace(",", ".")) || 0,
      box_storage_base: item.boxStorageBase !== "-" ? parseFloat(item.boxStorageBase.replace(",", ".")) : null,
      box_storage_liter: item.boxStorageLiter !== "-" ? parseFloat(item.boxStorageLiter.replace(",", ".")) : null,
      date: currentDate,
      updated_at: new Date(),
    }));

    const tableExists = await knex.schema.hasTable("tariffs");
    if (!tableExists) {
      return;
    }

    await knex("tariffs")
      .insert(tariffs)
      .onConflict(["warehouse_name", "date"])
      .merge();
  } catch (error) {
    console.error("err wb:", error);
  }
};

fetchTariffs();
