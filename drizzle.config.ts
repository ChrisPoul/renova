import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: { url: "file:local.db" },
	verbose: true,
	strict: true,
	dialect: 'sqlite'
});
