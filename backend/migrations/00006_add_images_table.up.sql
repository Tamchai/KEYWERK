CREATE TABLE images (
    image_id uuid PRIMARY KEY NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- drop column image in products table
alter table products drop column image;


alter table  products add column total_sold int default 0;
alter table  productvariants add column sold_count int default 0;

ALTER TABLE productvariants ADD COLUMN attributes JSONB;