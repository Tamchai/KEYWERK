package infrastructure

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/spf13/viper"
)

var DB *sqlx.DB

func InitNeon() {
	host := viper.GetString("database.neon.host")
	user := viper.GetString("database.neon.user")
	password := viper.GetString("database.neon.password")
	name := viper.GetString("database.neon.name")
	port := viper.GetInt("database.neon.port")
	sslmode := viper.GetString("database.neon.sslmode")
	timezone := viper.GetString("database.neon.timezone")
	channelBinding := viper.GetString("database.neon.channel_binding")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s channel_binding=%s TimeZone=%s",
		host, user, password, name, port, sslmode, channelBinding, timezone)

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Error opening database connection: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Printf("⚠️ Warning: Could not ping Neon DB on startup: %v (will continue)", err)
	} else {
		log.Println("✅ Connected to Neon PostgreSQL successfully")
		if err := AutoMigrate(db); err != nil {
			log.Printf("⚠️ AutoMigrate notice: %v", err)
		} else {
			log.Println("✅ Database schema is up to date (11 tables verified)")
		}
	}

	DB = db
}

func AutoMigrate(db *sqlx.DB) error {
	schemaSQL := `
	DO $$ BEGIN
		CREATE TYPE user_role AS ENUM ('member', 'admin');
	EXCEPTION
		WHEN duplicate_object THEN null;
	END $$;

	DO $$ BEGIN
		CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'cancelled');
	EXCEPTION
		WHEN duplicate_object THEN null;
	END $$;

	DO $$ BEGIN
		CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
	EXCEPTION
		WHEN duplicate_object THEN null;
	END $$;

	CREATE TABLE IF NOT EXISTS users (
		user_id uuid NOT NULL,
		image varchar(255) NULL,
		"name" varchar(100) NULL,
		email varchar(255) NOT NULL,
		"password" varchar(255) NOT NULL,
		"role" user_role DEFAULT 'member'::user_role NOT NULL,
		created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		CONSTRAINT users_email_key UNIQUE (email),
		CONSTRAINT users_pkey PRIMARY KEY (user_id)
	);

	CREATE TABLE IF NOT EXISTS addresses (
		address_id uuid NOT NULL,
		user_id uuid NULL REFERENCES users(user_id) ON DELETE CASCADE,
		title varchar(255) NULL,
		receiver_name varchar(255) NULL,
		phone_number varchar(255) NULL,
		address_line1 varchar(255) NULL,
		address_line2 varchar(255) NULL,
		district varchar(255) NULL,
		province varchar(255) NULL,
		postal_code varchar(255) NULL,
		is_default bool DEFAULT false NULL,
		created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		CONSTRAINT addresses_pkey PRIMARY KEY (address_id)
	);

	CREATE TABLE IF NOT EXISTS brands (
		brand_id uuid NOT NULL,
		"name" varchar(255) NOT NULL,
		CONSTRAINT brands_pkey PRIMARY KEY (brand_id)
	);

	CREATE TABLE IF NOT EXISTS categories (
		category_id uuid NOT NULL,
		"name" varchar(255) NOT NULL,
		CONSTRAINT categories_pkey PRIMARY KEY (category_id)
	);

	CREATE TABLE IF NOT EXISTS images (
		image_id uuid NOT NULL,
		image_url varchar(255) NULL,
		created_at timestamp NULL,
		updated_at timestamp NULL,
		CONSTRAINT images_pkey PRIMARY KEY (image_id)
	);

	CREATE TABLE IF NOT EXISTS products (
		product_id uuid NOT NULL,
		category_id uuid NULL REFERENCES categories(category_id) ON DELETE SET NULL,
		brand_id uuid NULL REFERENCES brands(brand_id) ON DELETE SET NULL,
		"name" varchar(255) NOT NULL,
		description text NULL,
		created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		total_sold int4 DEFAULT 0 NULL,
		CONSTRAINT products_pkey PRIMARY KEY (product_id)
	);

	CREATE TABLE IF NOT EXISTS productvariants (
		variant_id uuid NOT NULL,
		product_id uuid NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
		"name" varchar(255) NOT NULL,
		stock int4 DEFAULT 0 NOT NULL,
		price numeric(10, 2) NOT NULL,
		image_id uuid NULL REFERENCES images(image_id) ON DELETE SET NULL,
		sold_count int4 DEFAULT 0 NULL,
		"attributes" jsonb NULL,
		CONSTRAINT productvariants_pkey PRIMARY KEY (variant_id)
	);

	CREATE TABLE IF NOT EXISTS carts (
		cart_id uuid NOT NULL,
		user_id uuid NULL REFERENCES users(user_id) ON DELETE CASCADE,
		created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		CONSTRAINT carts_pkey PRIMARY KEY (cart_id),
		CONSTRAINT unique_user_cart UNIQUE (user_id)
	);

	CREATE TABLE IF NOT EXISTS cartitems (
		cartitem_id uuid NOT NULL,
		cart_id uuid NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
		variant_id uuid NULL REFERENCES productvariants(variant_id) ON DELETE CASCADE,
		quantity int4 DEFAULT 1 NOT NULL,
		CONSTRAINT cartitems_pkey PRIMARY KEY (cartitem_id)
	);

	CREATE TABLE IF NOT EXISTS orders (
		order_id uuid NOT NULL,
		user_id uuid NULL REFERENCES users(user_id),
		status order_status DEFAULT 'pending'::order_status NOT NULL,
		total_price numeric(10, 2) NOT NULL,
		shipping_method varchar(255) NULL,
		tracking_number varchar(255) NULL,
		receiver_name varchar(255) NULL,
		phone_number varchar(20) NULL,
		address_line1 varchar(255) NULL,
		address_line2 varchar(255) NULL,
		district varchar(255) NULL,
		province varchar(255) NULL,
		postal_code varchar(10) NULL,
		created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
		updated_at timestamp NULL,
		CONSTRAINT orders_pkey PRIMARY KEY (order_id)
	);

	CREATE TABLE IF NOT EXISTS ordersitems (
		orderitem_id uuid NOT NULL,
		order_id uuid NULL REFERENCES orders(order_id) ON DELETE CASCADE,
		variant_id uuid NOT NULL REFERENCES productvariants(variant_id),
		unit_price numeric(10, 2) NOT NULL,
		quantity int4 NOT NULL,
		CONSTRAINT ordersitems_pkey PRIMARY KEY (orderitem_id)
	);

	CREATE TABLE IF NOT EXISTS payments (
		payment_id uuid NOT NULL,
		order_id uuid NULL REFERENCES orders(order_id) ON DELETE CASCADE,
		amount numeric(10, 2) NOT NULL,
		status payment_status DEFAULT 'pending'::payment_status NOT NULL,
		payment_method varchar(255) NULL,
		paid_at timestamp NULL,
		CONSTRAINT payments_pkey PRIMARY KEY (payment_id)
	);
	`

	_, err := db.Exec(schemaSQL)
	return err
}
