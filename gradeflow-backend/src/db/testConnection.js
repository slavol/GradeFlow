const db = require("./database");

(async () => {
    try{
        const result = await db.query("SELECT NOW()");
        console.log("DB connected", result.rows);
    } catch(err){
        console.log("DB connection error",err);
    }
})();