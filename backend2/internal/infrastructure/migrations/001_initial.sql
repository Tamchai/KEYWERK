DO $$ BEGIN CREATE TYPE user_role AS ENUM ('member', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
    user_id uuid PRIMARY KEY,
    image varchar(255),
    name varchar(100),
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    address_id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
    title varchar(255), receiver_name varchar(255), phone_number varchar(255),
    address_line1 varchar(255), address_line2 varchar(255), district varchar(255),
    province varchar(255), postal_code varchar(255), is_default boolean DEFAULT false,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    brand_id uuid PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
    category_id uuid PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS images (
    image_id uuid PRIMARY KEY,
    image_url varchar(255),
    created_at timestamp,
    updated_at timestamp
);

CREATE TABLE IF NOT EXISTS products (
    product_id uuid PRIMARY KEY,
    category_id uuid REFERENCES categories(category_id) ON DELETE SET NULL,
    brand_id uuid REFERENCES brands(brand_id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
    total_sold integer NOT NULL DEFAULT 0 CHECK (total_sold >= 0)
);

CREATE TABLE IF NOT EXISTS productvariants (
    variant_id uuid PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    image_id uuid REFERENCES images(image_id) ON DELETE SET NULL,
    sold_count integer NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    attributes jsonb
);

CREATE TABLE IF NOT EXISTS carts (
    cart_id uuid PRIMARY KEY,
    user_id uuid UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cartitems (
    cartitem_id uuid PRIMARY KEY,
    cart_id uuid REFERENCES carts(cart_id) ON DELETE CASCADE,
    variant_id uuid REFERENCES productvariants(variant_id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    CONSTRAINT cartitems_cart_variant_key UNIQUE (cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(user_id),
    status order_status NOT NULL DEFAULT 'pending',
    total_price numeric(10, 2) NOT NULL CHECK (total_price >= 0),
    shipping_method varchar(255), tracking_number varchar(255), receiver_name varchar(255),
    phone_number varchar(20), address_line1 varchar(255), address_line2 varchar(255),
    district varchar(255), province varchar(255), postal_code varchar(10),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordersitems (
    orderitem_id uuid PRIMARY KEY,
    order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
    variant_id uuid NOT NULL REFERENCES productvariants(variant_id),
    unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id uuid PRIMARY KEY,
    order_id uuid UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL CHECK (amount > 0),
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method varchar(255) NOT NULL CHECK (payment_method IN ('promptpay_qr', 'bank_transfer', 'credit_card', 'stripe', 'cash_on_delivery')),
    paid_at timestamp,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user ON addresses (user_id) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS productvariants_product_idx ON productvariants (product_id);
CREATE INDEX IF NOT EXISTS cartitems_cart_idx ON cartitems (cart_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
