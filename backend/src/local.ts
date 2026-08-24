import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { serve } from "@hono/node-server";
import { createClient } from "@libsql/client";
import { createApp } from "./app.js";
import type { DiagnosticDependencies } from "./diagnostics.js";

const localDatabaseUrl =
  process.env.LOCAL_LIBSQL_URL ?? "http://127.0.0.1:8080";
const localStorageEndpoint =
  process.env.LOCAL_R2_ENDPOINT ?? "http://127.0.0.1:9000";
const localStorageAccessKeyId =
  process.env.LOCAL_R2_ACCESS_KEY_ID ?? "local-development";
const localStorageSecretAccessKey =
  process.env.LOCAL_R2_SECRET_ACCESS_KEY ?? "local-development-password";
const localStorageBucket =
  process.env.LOCAL_R2_BUCKET ?? "neon-underrealm-local";
const localPort = Number(process.env.BACKEND_PORT ?? "8787");

const database = createClient({ url: localDatabaseUrl });
const objectStorage = new S3Client({
  credentials: {
    accessKeyId: localStorageAccessKeyId,
    secretAccessKey: localStorageSecretAccessKey,
  },
  endpoint: localStorageEndpoint,
  forcePathStyle: true,
  region: "auto",
});

const localDiagnostics: DiagnosticDependencies = {
  database: {
    async probe() {
      const result = await database.execute("SELECT 1 AS ready");
      if (result.rows[0]?.ready !== 1) {
        throw new Error("Local SQLite diagnostic query returned no result.");
      }
    },
  },
  objectStore: {
    async delete(key) {
      await objectStorage.send(
        new DeleteObjectCommand({ Bucket: localStorageBucket, Key: key }),
      );
    },
    async get(key) {
      try {
        const result = await objectStorage.send(
          new GetObjectCommand({ Bucket: localStorageBucket, Key: key }),
        );
        return (await result.Body?.transformToString()) ?? null;
      } catch (error) {
        if (error instanceof Error && error.name === "NoSuchKey") {
          return null;
        }

        throw error;
      }
    },
    async put(key, value) {
      await objectStorage.send(
        new PutObjectCommand({
          Body: value,
          Bucket: localStorageBucket,
          Key: key,
        }),
      );
    },
  },
};

serve({ fetch: createApp(localDiagnostics).fetch, port: localPort });
