import knex, { migrate, seed } from "#postgres/knex.js";
import "./jobs/cronJobs.js";

(async () => {
    try {
        await migrate.latest();
        await seed.run();
    } catch (error) {
        console.error("err:", error);
    }
})();
