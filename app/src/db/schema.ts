import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// ──────────────────────────────────────────
// Enums
// ──────────────────────────────────────────

export const tripStatusEnum = pgEnum("trip_status", [
  "planning",
  "active",
  "completed",
]);

export const tripTypeEnum = pgEnum("trip_type", [
  "free_and_easy",
  "city_break",
  "road_trip",
  "beach_and_resort",
  "adventure",
  "business",
]);

export const travellerRoleEnum = pgEnum("traveller_role", [
  "planner",
  "traveller",
]);

export const activityCategoryEnum = pgEnum("activity_category", [
  "flights",
  "accommodation",
  "food",
  "transport",
  "activities",
  "shopping",
  "misc",
]);

// ──────────────────────────────────────────
// Account
// ──────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: uuid("auth_id").notNull().unique(), // links to Supabase auth.users.id
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  homeCurrency: text("home_currency").notNull().default("MYR"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Trip
// ──────────────────────────────────────────

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  tripType: tripTypeEnum("trip_type").notNull(),
  localCurrency: text("local_currency").notNull(), // e.g. "VND"
  fxRate: numeric("fx_rate", { precision: 12, scale: 4 }).notNull(), // 1 MYR = N local
  status: tripStatusEnum("status").notNull().default("planning"),
  plannerId: uuid("planner_id")
    .notNull()
    .references(() => accounts.id),
  shareSlug: text("share_slug").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Traveller
// ──────────────────────────────────────────

export const travellers = pgTable("travellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  role: travellerRoleEnum("role").notNull().default("traveller"),
  accountId: uuid("account_id").references(() => accounts.id), // nullable = name-only
  budgetTotal: integer("budget_total"), // MYR, per person, nullable until set
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Activity
// ──────────────────────────────────────────

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  time: text("time"), // "09:00" 24h format, nullable
  title: text("title").notNull(),
  notes: text("notes"),
  category: activityCategoryEnum("category").notNull().default("misc"),
  cost: numeric("cost", { precision: 12, scale: 2 }), // local currency, nullable
  costShared: boolean("cost_shared").notNull().default(false),
  placeName: text("place_name"),
  placeLat: numeric("place_lat", { precision: 10, scale: 7 }),
  placeLng: numeric("place_lng", { precision: 10, scale: 7 }),
  sortOrder: integer("sort_order").notNull().default(0),
  ideaId: uuid("idea_id"), // FK added when ideas table exists
  expenseId: uuid("expense_id"), // FK added when expenses table exists
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Idea
// ──────────────────────────────────────────

export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  link: text("link"),
  notes: text("notes"),
  promoted: boolean("promoted").notNull().default(false),
  promotedActivityId: uuid("promoted_activity_id").references(() => activities.id, {
    onDelete: "set null",
  }),
  promotedDate: text("promoted_date"), // "Day 3" label
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Checklist
// ──────────────────────────────────────────

export const checklists = pgTable("checklists", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────
// Checklist Item
// ──────────────────────────────────────────

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  checklistId: uuid("checklist_id")
    .notNull()
    .references(() => checklists.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  assignedTo: uuid("assigned_to").references(() => travellers.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
