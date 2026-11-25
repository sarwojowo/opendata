CREATE TABLE IF NOT EXISTS users
(
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT,
    wallet     TEXT UNIQUE                 NOT NULL,
    biodata    TEXT,
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP(3) WITH TIME ZONE,
    deleted_at TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS postings
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT                      NOT NULL
        CONSTRAINT postings_user_id_fkey
            REFERENCES users (id),
    title       TEXT                        NOT NULL,
    likes_count INTEGER,
    image_url   TEXT                        NOT NULL,
    created_at  TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP(3) WITH TIME ZONE,
    deleted_at  TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS creators
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                      NOT NULL
        CONSTRAINT creators_user_id_fkey
            REFERENCES users (id),
    phone_number TEXT                        NOT NULL,
    created_at   TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP(3) WITH TIME ZONE,
    deleted_at   TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS services
(
    id          BIGSERIAL PRIMARY KEY,
    creator_id  BIGINT                      NOT NULL
        CONSTRAINT services_creator_id_fkey
            REFERENCES creators (id),
    name        TEXT                        NOT NULL,
    description TEXT,
    price       NUMERIC                     NOT NULL,
    image_url   TEXT                        NOT NULL,
    created_at  TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP(3) WITH TIME ZONE,
    deleted_at  TIMESTAMP(3) WITH TIME ZONE
);

CREATE TYPE order_status AS ENUM (
    'PENDING_ACCEPTANCE',
    'IN_PROGRESS',
    'NEEDS_REVISION',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS orders
(
    id           BIGSERIAL PRIMARY KEY,
    service_id   BIGINT                      NOT NULL
        CONSTRAINT orders_service_id_fkey
            REFERENCES services (id),
    user_id      BIGINT                      NOT NULL
        CONSTRAINT orders_user_id_fkey
            REFERENCES users (id),
    status order_status NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    created_at   TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP(3) WITH TIME ZONE,
    deleted_at   TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS likes
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                      NOT NULL
        CONSTRAINT likes_user_id_fkey
            REFERENCES users (id),
    posting_id      BIGINT                      NOT NULL
        CONSTRAINT likes_posting_id_fkey
            REFERENCES postings (id),
    created_at   TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS chatting_room
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                      NOT NULL
        CONSTRAINT chatting_room_user_id_fkey
            REFERENCES users (id),
    creator_id      BIGINT                      NOT NULL
        CONSTRAINT chatting_room_creator_id_fkey
            REFERENCES creators (id),
    created_at   TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS messages
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                      NOT NULL
        CONSTRAINT messages_user_id_fkey
            REFERENCES users (id),
    chatting_room_id      BIGINT                      NOT NULL
        CONSTRAINT messages_chatting_room_id_fkey
            REFERENCES chatting_room (id),
    created_at   TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMP(3) WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS order_historical
(
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT                      NOT NULL
        CONSTRAINT order_historical_order_id_fkey
            REFERENCES orders (id),
    tx_hash    TEXT,
    created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP(3) WITH TIME ZONE
);

INSERT INTO users (name, wallet)
VALUES ('test', '0x7945F1e92950a5EC926DE28FFDB8140D98121535');

INSERT INTO users (name, wallet)
VALUES ('test2', '0x7945F1e92950a5EC926DE28FFDB8140D98121555');

INSERT INTO creators (user_id, phone_number)
VALUES (1, '081232213452');