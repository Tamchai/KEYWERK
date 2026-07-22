ALTER TABLE carts
ADD CONSTRAINT unique_user_cart
UNIQUE (user_id);