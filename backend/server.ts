import app from "./app";
import { env } from "./src/config/env";
import {
  checkDatabaseConnection,
  closeDatabaseConnection,
} from "./src/db/db.config";

const PORT = Number(env.PORT) || 3000;

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await closeDatabaseConnection();
          console.log("Database connection closed");
        } catch (error) {
          console.error("Error while closing database connection:", error);
        } finally {
          process.exit(0);
        }
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
