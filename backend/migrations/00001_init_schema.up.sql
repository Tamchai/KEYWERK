CREATE TYPE user_role AS ENUM ('member', 'admin');

CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'cancelled');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');

CREATE TABLE
  Users (
    user_id UUID PRIMARY KEY NOT NULL,
    image VARCHAR(255),
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  Categories (
    category_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );

CREATE TABLE
  Brands (
    brand_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );

CREATE TABLE
  Addresses (
    address_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users (user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    receiver_name VARCHAR(255),
    phone_number VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    district VARCHAR(255),
    province VARCHAR(255),
    postal_code VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  Orders (
    order_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users (user_id),
    status order_status NOT NULL DEFAULT 'pending',
    total_price NUMERIC(10, 2) NOT NULL,
    shipping_address text,
    shipping_method VARCHAR(255),
    tracking_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  Products (
    product_id UUID PRIMARY KEY,
    category_id UUID REFERENCES Categories (category_id) ON DELETE SET NULL,
    brand_id UUID REFERENCES Brands (brand_id) ON DELETE SET NULL,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  ProductVariants (
    variant_id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES Products (product_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL
  );

CREATE TABLE
  OrdersItems (
    orderitem_id UUID PRIMARY KEY,
    order_id UUID REFERENCES Orders (order_id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES ProductVariants (variant_id),
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL
  );

CREATE TABLE
  Carts (
    cart_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users (user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  CartItems (
    cartitem_id UUID PRIMARY KEY,
    cart_id UUID REFERENCES Carts (cart_id) ON DELETE CASCADE,
    variant_id UUID REFERENCES ProductVariants (variant_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1
  );

CREATE Table
  payments (
    payment_id UUID PRIMARY KEY,
    order_id UUID REFERENCES Orders (order_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(255),
    paid_at TIMESTAMP
  )