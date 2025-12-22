CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"lastname" varchar(100),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"phone" varchar(20),
	"phone_verified" timestamp,
	"password_hash" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"avatar" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
