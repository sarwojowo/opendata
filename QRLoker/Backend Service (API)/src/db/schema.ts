import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, integer, serial, decimal, pgEnum } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    roleId: text("role_id").default('915a2e8c-4f35-4047-aef6-66022e537cd4').references(() => userRole.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const userRole = pgTable("userRole", {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    roleName: text("role_name").notNull().unique(),
    description: text("description"),
    roleAccess: jsonb("role_access"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

// @ts-ignore
export const menu = pgTable("menu", {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    icon: text("icon"),
    // @ts-ignore
    menuParentId: integer("menu_parent_id").references(() => menu.id, { onDelete: "cascade" }),
    menuOrder: integer("menu_order"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const userRelation = relations(user, ({ many, one }) => ({
    sessions: many(session),
    accounts: many(account),
    merchant: many(merchant),
    role: one(userRole, {
        fields: [user.roleId],
        references: [userRole.id],
    }),
}));

export const userRoleRelation = relations(userRole, ({ many }) => ({
    user: many(user),
}));

export type User = typeof user.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;
export type InsertUserRole = typeof session.$inferInsert;
export type Menu = typeof menu.$inferSelect;
export type InsertMenu = typeof menu.$inferInsert;

export const station = pgTable("station", {
    id: serial("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    location: text("location"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const merchant = pgTable("merchant", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    description: text("description"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});

export const merchantRelation = relations(merchant, ({ one, many }) => ({
    user: one(user, {
        fields: [merchant.userId],
        references: [user.id],
    }),
    merchantStations: many(merchantStation),
}));

export const merchantStation = pgTable("merchant_station", {
    id: serial("id").primaryKey(),
    merchantId: integer("merchant_id").notNull().references(() => merchant.id, { onDelete: "cascade" }),
    stationId: integer("station_id").notNull().references(() => station.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const merchantStationRelation = relations(merchantStation, ({ one, many }) => ({
    merchant: one(merchant, {
        fields: [merchantStation.merchantId],
        references: [merchant.id],
    }),
    station: one(station, {
        fields: [merchantStation.stationId],
        references: [station.id],
    }),
    products: many(product),
}));

export const product = pgTable("product", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    stock: integer("stock").notNull().default(0),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 5, scale: 2 }).default("0"), // percent
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image"),
    description: text("description"),
    merchantStationId: integer("merchant_station_id").notNull().references(() => merchantStation.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
});


export const productRelation = relations(product, ({ one }) => ({
    merchantStation: one(merchantStation, {
        fields: [product.merchantStationId],
        references: [merchantStation.id],
    }),
}));


// ENUMS
export const lockerStatusEnum = pgEnum("locker_status", ["available", "occupied", "maintenance"]);
export const logLockerStatusEnum = pgEnum("log_locker_status", ["ready for pickup", "maintenance", "successfully opened", "failed to open"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "paid", "cancelled", "completed"]);
export const transactionPickUpStatusEnum = pgEnum("pickup_status", ["pending", "ready", "done"]);
export const transactionPayMethodEnum = pgEnum("payment_method", ["QRIS", "KMT"]);

// LOCKER TABLE
export const locker = pgTable("locker", {
    id: serial("id").primaryKey(),
    stationId: integer("station_id").notNull().references(() => station.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    status: lockerStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// LOCKER TABLE
export const logLocker = pgTable("log_locker", {
    id: serial("id").primaryKey(),
    lockerId: integer("locker_id").references(() => locker.id, { onDelete: "set null" }),
    transactionId: integer("transaction_id").references(() => transaction.id, { onDelete: "set null" }),
    status: logLockerStatusEnum("status"),
    activityTime: timestamp("activity_time").defaultNow().notNull(),
});

// TRANSACTION TABLE
export const transaction = pgTable("transaction", {
    id: serial("id").primaryKey(),
    stationId: integer("station_id").references(() => station.id, { onDelete: "set null" }),
    lockerId: integer("locker_id").references(() => locker.id, { onDelete: "set null" }),
    pickupCode: text("pickup_code").unique().notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    paymentMethod: transactionPayMethodEnum("payment_method").notNull(),
    transactionTimeAt: timestamp("transaction_time_at").defaultNow().notNull(),                         // time when order created
    paymentTimeoutAt: timestamp("payment_timeout_at"),                                                  // timeout of payment
    paymentTimeAt: timestamp("payment_time_at"),                                                        // set when paid
    status: transactionStatusEnum("status").notNull().default("pending"),                               // transaction status
    pickupStatus: transactionPickUpStatusEnum("pickup_status").default("pending"),                      // pickup status: pending | ready | done
    pickupTimeAt: timestamp("pickup_time_at"),                                                          // set when picked up
    transactionDuration: integer("transaction_duration"),                                               // total transaction duration (in second) from create transaction till the finish page
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// TRANSACTION ITEM TABLE (junction)
export const transactionItem = pgTable("transaction_item", {
    id: serial("id").primaryKey(),
    transactionId: integer("transaction_id").notNull().references(() => transaction.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const lockerRelations = relations(locker, ({ one, many }) => ({
    station: one(station, {
        fields: [locker.stationId],
        references: [station.id],
    }),
    transactions: many(transaction),
    logLocker: many(logLocker),
}));

export const logLockerRelations = relations(logLocker, ({ one }) => ({
    locker: one(locker, {
        fields: [logLocker.lockerId],
        references: [locker.id],
    }),
    transaction: one(transaction, {
        fields: [logLocker.transactionId],
        references: [transaction.id],
    }),
}));

export const transactionRelations = relations(transaction, ({ one, many }) => ({
    locker: one(locker, {
        fields: [transaction.lockerId],
        references: [locker.id],
    }),
    station: one(station, {
        fields: [transaction.stationId],
        references: [station.id],
    }),
    items: many(transactionItem),
}));

export const transactionItemRelations = relations(transactionItem, ({ one }) => ({
    transaction: one(transaction, {
        fields: [transactionItem.transactionId],
        references: [transaction.id],
    }),
    product: one(product, {
        fields: [transactionItem.productId],
        references: [product.id],
    }),
}));


export const schema = {
    user, session, account, verification, menu, userRole, userRelation, userRoleRelation,
    station, merchant, merchantStation, product, merchantRelation, merchantStationRelation, productRelation,
    locker, transaction, transactionItem, lockerRelations, transactionRelations, transactionItemRelations,
    logLocker, logLockerRelations
};