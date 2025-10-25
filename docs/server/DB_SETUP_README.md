
# Neon DB + Drizzle ORM Setup 🚀

This guide explains how to set up **Neon PostgreSQL** with **Drizzle ORM**, run migrations, and update schemas later.

---

## 1. Create Neon Database

1. Go to [Neon](https://neon.tech) and **sign up / log in**.
2. Create a **new project** → Choose **PostgreSQL**.
3. Once the project is created, go to the **Dashboard → Connection Details**.
4. Copy the **connection string** (something like):

   ```
   postgres://<username>:<password>@<host>/<dbname>
   ```

---

## 2. Setup Environment Variables

In your project root, create a `.env` file:

```env
DATABASE_URL=postgres://<username>:<password>@<host>/<dbname>
```

⚠️ Keep this private. Do not commit `.env` to GitHub.

---

## 3. Configure Drizzle

Create or update `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",   // path to your schema file
  out: "./drizzle",               // where migrations will be stored
  dbCredentials: {
    url: process.env.DATABASE_URL!, // from .env
  },
});
```

---

## 4. Define Schema

Example `src/db/schema.ts`:

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## 5. Generate & Apply Migrations

Run these commands:

```bash
# Generate SQL migration from schema
npx drizzle-kit generate

# Push migration to Neon DB
npx drizzle-kit push
```

If successful, you should see your tables created in Neon DB.

---

## 6. Making Schema Changes Later

Whenever you add new tables or columns in `schema.ts`:

```bash
# Regenerate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit push
```

✅ This ensures Neon DB stays in sync with your code.

---

## 7. Checking DB State

To see the current DB schema:

```bash
npx drizzle-kit studio
```

This opens a local UI to inspect your database tables.

---

## 8. Useful Notes

* Always run `generate` after schema changes.
* Always run `push` to sync changes to Neon DB.
* Keep `.env` secrets safe. Use environment managers in production.

---

## 9. Example Workflow (Later Updates)

1. Add a new column in `schema.ts`:

   ```ts
   export const users = pgTable("users", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     email: text("email").notNull().unique(),
     age: integer("age"),  // new column
   });
   ```

2. Run migrations again:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

3. Done 🎉 New column is now in Neon DB.

---

# ✅ You’re All Set!

Now you can use Neon DB with Drizzle ORM seamlessly in your app. 🚀
