import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const profiles=sqliteTable('profiles',{id:text('id').primaryKey(),email:text('email').notNull().unique(),best:integer('best').notNull().default(0),gameState:text('game_state').notNull().default('{}'),revision:integer('revision').notNull().default(0),createdAt:integer('created_at').notNull()});
export const sessions=sqliteTable('sessions',{tokenHash:text('token_hash').primaryKey(),profileId:text('profile_id').notNull().references(()=>profiles.id),expiresAt:integer('expires_at').notNull()});
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});

export const runReceipts=sqliteTable('run_receipts',{id:text('id').primaryKey(),profileId:text('profile_id').notNull().references(()=>profiles.id),createdAt:integer('created_at').notNull()});
