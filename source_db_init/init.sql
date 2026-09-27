CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    country VARCHAR(60) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    order_date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(30) NOT NULL
);

INSERT INTO users (full_name, email, country, created_at) VALUES
('Ada Lovelace', 'ada@example.com', 'UK', '2026-01-05'),
('Grace Hopper', 'grace@example.com', 'USA', '2026-01-12'),
('Guido van Rossum', 'guido@example.com', 'Netherlands', '2026-02-01'),
('Margaret Hamilton', 'margaret@example.com', 'USA', '2026-02-14'),
('Linus Torvalds', 'linus@example.com', 'Finland', '2026-03-01');

INSERT INTO orders (user_id, order_date, amount, status) VALUES
(1, '2026-02-01', 120.00, 'paid'),
(1, '2026-03-15', 80.00, 'paid'),
(2, '2026-02-05', 250.00, 'paid'),
(2, '2026-03-21', 40.00, 'cancelled'),
(3, '2026-03-02', 175.00, 'paid'),
(4, '2026-03-08', 320.00, 'paid'),
(4, '2026-04-01', 90.00, 'paid'),
(5, '2026-04-03', 110.00, 'paid');
