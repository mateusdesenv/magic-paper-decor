import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: ".env.local" });
const port = Number(process.env.API_PORT || 3001);
app.listen(port, "127.0.0.1", () => console.log(`API pronta em http://127.0.0.1:${port}`));
