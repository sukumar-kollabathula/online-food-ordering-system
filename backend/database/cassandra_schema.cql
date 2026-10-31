-- Run with cqlsh. For a single-node development setup only.
CREATE KEYSPACE IF NOT EXISTS food_ordering WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE food_ordering;

CREATE TABLE IF NOT EXISTS orders_by_id (
  order_id text PRIMARY KEY,
  customer_name text,
  customer_contact text,
  delivery_address text,
  items text,
  total double,
  date text,
  status text
);

-- order_id in the clustering key prevents same-timestamp orders overwriting.
CREATE TABLE IF NOT EXISTS orders_by_customer (
  customer_contact text,
  date text,
  order_id text,
  customer_name text,
  delivery_address text,
  items text,
  total double,
  status text,
  PRIMARY KEY (customer_contact, date, order_id)
) WITH CLUSTERING ORDER BY (date DESC, order_id ASC);
