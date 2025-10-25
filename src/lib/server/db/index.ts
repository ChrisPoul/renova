import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || 'file:local.db';

export const db = drizzle(databaseUrl, { schema });
