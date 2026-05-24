import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Auth.js users table
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  password_salt: text("password_salt").notNull(),
  display_name: text("display_name"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// User profiles
// ---------------------------------------------------------------------------
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    display_name: text("display_name"),
    organisation: text("organisation"),
    tier: text("tier").notNull().default("Free"),
    message_credits_used: integer("message_credits_used").notNull().default(0),
    credits_reset_date: timestamp("credits_reset_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    tabular_model: text("tabular_model").notNull().default("gemini-3-flash-preview"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_profiles_user").on(table.user_id),
  ]
);

// ---------------------------------------------------------------------------
// User API keys
// ---------------------------------------------------------------------------
export const userApiKeys = pgTable(
  "user_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encrypted_key: text("encrypted_key").notNull(),
    iv: text("iv").notNull(),
    auth_tag: text("auth_tag").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_api_keys_user").on(table.user_id),
    uniqueIndex("user_api_keys_user_provider_unique").on(table.user_id, table.provider),
  ]
);

// ---------------------------------------------------------------------------
// Projects and documents
// ---------------------------------------------------------------------------
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    name: text("name").notNull(),
    cm_number: text("cm_number"),
    visibility: text("visibility").notNull().default("private"),
    shared_with: jsonb("shared_with").notNull().default("[]"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_projects_user").on(table.user_id),
    index("projects_shared_with_idx").using("gin", table.shared_with),
  ]
);

export const projectSubfolders = pgTable(
  "project_subfolders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    user_id: text("user_id").notNull(),
    name: text("name").notNull(),
    parent_folder_id: uuid("parent_folder_id"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_project_subfolders_project").on(table.project_id),
    foreignKey({
      columns: [table.parent_folder_id],
      foreignColumns: [table.id],
      name: "project_subfolders_parent_folder_id_fkey",
    }),
  ]
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    user_id: text("user_id").notNull(),
    filename: text("filename").notNull(),
    file_type: text("file_type"),
    size_bytes: integer("size_bytes").notNull().default(0),
    page_count: integer("page_count"),
    structure_tree: jsonb("structure_tree"),
    status: text("status").notNull().default("pending"),
    folder_id: uuid("folder_id").references(() => projectSubfolders.id, {
      onDelete: "set null",
    }),
    current_version_id: uuid("current_version_id"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_documents_user_project").on(table.user_id, table.project_id),
    index("idx_documents_project_folder").on(table.project_id, table.folder_id),
  ]
);

export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    storage_path: text("storage_path").notNull(),
    pdf_storage_path: text("pdf_storage_path"),
    source: text("source").notNull().default("upload"),
    version_number: integer("version_number"),
    display_name: text("display_name"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("document_versions_document_id_idx").on(
      table.document_id,
      table.created_at
    ),
    index("document_versions_doc_vnum_idx").on(
      table.document_id,
      table.version_number
    ),
  ]
);

export const documentEdits = pgTable(
  "document_edits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chat_message_id: uuid("chat_message_id"),
    version_id: uuid("version_id")
      .notNull()
      .references(() => documentVersions.id, { onDelete: "cascade" }),
    change_id: text("change_id").notNull(),
    del_w_id: text("del_w_id"),
    ins_w_id: text("ins_w_id"),
    deleted_text: text("deleted_text").notNull().default(""),
    inserted_text: text("inserted_text").notNull().default(""),
    context_before: text("context_before"),
    context_after: text("context_after"),
    status: text("status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolved_at: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("document_edits_document_id_idx").on(
      table.document_id,
      table.created_at
    ),
    index("document_edits_message_id_idx").on(table.chat_message_id),
    index("document_edits_version_id_idx").on(table.version_id),
  ]
);

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------
export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id"),
    title: text("title").notNull(),
    type: text("type").notNull(),
    prompt_md: text("prompt_md"),
    columns_config: jsonb("columns_config"),
    practice: text("practice"),
    is_system: boolean("is_system").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_workflows_user").on(table.user_id),
  ]
);

export const hiddenWorkflows = pgTable(
  "hidden_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id").notNull(),
    workflow_id: text("workflow_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_hidden_workflows_user").on(table.user_id),
    uniqueIndex("hidden_workflows_user_workflow_unique").on(
      table.user_id,
      table.workflow_id
    ),
  ]
);

export const workflowShares = pgTable(
  "workflow_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflow_id: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    shared_by_user_id: text("shared_by_user_id").notNull(),
    shared_with_email: text("shared_with_email").notNull(),
    allow_edit: boolean("allow_edit").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("workflow_shares_workflow_id_idx").on(table.workflow_id),
    index("workflow_shares_email_idx").on(table.shared_with_email),
    uniqueIndex("workflow_shares_workflow_email_unique").on(
      table.workflow_id,
      table.shared_with_email
    ),
  ]
);

// ---------------------------------------------------------------------------
// Assistant chats
// ---------------------------------------------------------------------------
export const chats = pgTable(
  "chats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    user_id: text("user_id").notNull(),
    title: text("title"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_chats_user").on(table.user_id),
    index("idx_chats_project").on(table.project_id),
  ]
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chat_id: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: jsonb("content"),
    files: jsonb("files"),
    annotations: jsonb("annotations"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_chat_messages_chat").on(table.chat_id),
  ]
);

// ---------------------------------------------------------------------------
// Tabular reviews
// ---------------------------------------------------------------------------
export const tabularReviews = pgTable(
  "tabular_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    user_id: text("user_id").notNull(),
    title: text("title"),
    columns_config: jsonb("columns_config"),
    document_ids: jsonb("document_ids"),
    workflow_id: uuid("workflow_id").references(() => workflows.id, {
      onDelete: "set null",
    }),
    practice: text("practice"),
    shared_with: jsonb("shared_with").notNull().default("[]"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_tabular_reviews_user").on(table.user_id),
    index("idx_tabular_reviews_project").on(table.project_id),
    index("tabular_reviews_shared_with_idx").using("gin", table.shared_with),
  ]
);

export const tabularCells = pgTable(
  "tabular_cells",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    review_id: uuid("review_id")
      .notNull()
      .references(() => tabularReviews.id, { onDelete: "cascade" }),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    column_index: integer("column_index").notNull(),
    content: text("content"),
    citations: jsonb("citations"),
    status: text("status").notNull().default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_tabular_cells_review").on(
      table.review_id,
      table.document_id,
      table.column_index
    ),
  ]
);

export const tabularReviewChats = pgTable(
  "tabular_review_chats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    review_id: uuid("review_id")
      .notNull()
      .references(() => tabularReviews.id, { onDelete: "cascade" }),
    user_id: text("user_id").notNull(),
    title: text("title"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("tabular_review_chats_review_idx").on(table.review_id, table.updated_at),
    index("tabular_review_chats_user_idx").on(table.user_id),
  ]
);

export const tabularReviewChatMessages = pgTable(
  "tabular_review_chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chat_id: uuid("chat_id")
      .notNull()
      .references(() => tabularReviewChats.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: jsonb("content"),
    annotations: jsonb("annotations"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("tabular_review_chat_messages_chat_idx").on(
      table.chat_id,
      table.created_at
    ),
  ]
);

// ---------------------------------------------------------------------------
// Standalone foreign keys (cross-table references defined after all tables)
// ---------------------------------------------------------------------------

export const documentsCurrentVersionFk = foreignKey({
  columns: [documents.current_version_id],
  foreignColumns: [documentVersions.id],
  name: "documents_current_version_id_fkey",
});

export const documentEditsMessageFk = foreignKey({
  columns: [documentEdits.chat_message_id],
  foreignColumns: [chatMessages.id],
  name: "document_edits_chat_message_id_fkey",
});
