# 🏗️ Data Engineering 101 — Learn by Building an ELT Pipeline

A hands-on data engineering repository with **three ways to learn**:

1. **Interactive browser Codelab** — read the lesson, inspect examples, solve exercises, run SQL, check answers.
2. **Complete README reference** — a self-contained tutorial you can read without watching the video.
3. **Runnable end-to-end project** — Docker + PostgreSQL + Python ELT + dbt + scheduling/orchestration examples.

This repository follows the learning sequence of freeCodeCamp / Justin Chau's **Data Engineering Course for Beginners**, while using independently written explanations, examples, exercises, and a smaller project you can actually run and explain.

> 🚀 **Launch the interactive Codelab:** https://abed-dvp.github.io/data-engineering-course/  
> 🎥 **Source video:** https://www.youtube.com/watch?v=PHsC_t0j1dU  
> 🧪 **Runnable project:** the files in this repository

---

## 📚 What You'll Learn

By the end, you should be able to explain and use:

- what data engineers actually build
- Docker images, containers, ports, networks, volumes, environment variables
- Docker Compose for a multi-service data stack
- PostgreSQL basics
- `SELECT`, `DISTINCT`, `UPDATE`, `INSERT`, `LIMIT`
- aggregate functions and `GROUP BY`
- `INNER JOIN`, `LEFT JOIN`, aliases
- `UNION`, `UNION ALL`, subqueries
- ETL vs ELT
- a custom Python ELT pipeline
- `pg_dump` and `psql`
- dbt sources, models, `ref()`, tests, and lineage
- Cron scheduling
- Airflow DAGs and task dependencies
- Airbyte and connector-based ingestion
- production concepts: idempotency, incremental loading, validation, observability

---

# Course Map

The original course chapters are:

| Chapter | Video |
|---|---:|
| Introduction | 00:00:00 |
| Why Data Engineering | 00:00:36 |
| Docker | 00:03:14 |
| SQL | 00:30:38 |
| Build a Data Pipeline from Scratch | 01:04:32 |
| dbt | 01:31:03 |
| Cron Job | 02:04:11 |
| Airflow | 02:07:54 |
| Airbyte | 02:41:14 |
| Outro | 03:01:54 |

---

# 1. 🧠 Why Data Engineering — `00:00:36`

A data engineer builds systems that make data **reliably available** to analysts, data scientists, applications, and other downstream consumers.

A useful mental model is:

```text
Source
  ↓
Ingestion
  ↓
Raw / Destination Storage
  ↓
Transformation
  ↓
Analytics Models / Serving
```

And around that entire flow:

```text
Orchestration + Data Quality + Observability + Security
```

### Data engineer vs analyst vs data scientist

A simplified distinction:

- **Data engineer** → builds reliable data infrastructure and pipelines.
- **Data analyst** → answers business questions using data.
- **Data scientist / ML engineer** → builds statistical or machine-learning systems.

The borders overlap, but this mental model is useful.

### Key idea

Do not define data engineering as “using Airflow” or “writing SQL.”

Tools change.

The durable skill is designing systems that move, organize, validate, and serve data reliably.

---

# 2. 🐳 Docker — `00:03:14`

Docker is used heavily in this course because it gives us repeatable environments.

Instead of saying:

> Install PostgreSQL version X, Python version Y, these OS packages, these environment variables...

we package the runtime.

## Image vs container

An **image** is a packaged template.

A **container** is a running instance of an image.

For example:

```text
postgres:15  → image
source_postgres → running container created from that image
```

## Pull an image

```bash
docker pull postgres:15
```

## Run a container

```bash
docker run --name demo-postgres \
  -e POSTGRES_PASSWORD=secret \
  -p 5433:5432 \
  -d postgres:15
```

Important pieces:

- `--name` → container name
- `-e` → environment variable
- `-p 5433:5432` → host port 5433 maps to container port 5432
- `-d` → detached mode

## Useful Docker commands

```bash
docker ps
docker ps -a
docker logs demo-postgres
docker stop demo-postgres
docker start demo-postgres
docker rm demo-postgres
```

Enter a running container:

```bash
docker exec -it demo-postgres bash
```

Or run PostgreSQL directly inside it:

```bash
docker exec -it demo-postgres psql -U postgres
```

---

# 3. 📦 Dockerfile

A Dockerfile describes how to build an image.

The ELT image in this repository is intentionally simple:

```dockerfile
FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY elt_script.py .

CMD ["python", "elt_script.py"]
```

### What each line does

- `FROM` → base image
- `RUN` → execute a command while building the image
- `WORKDIR` → set working directory
- `COPY` → copy files into the image
- `CMD` → default command when the container starts

Why install `postgresql-client`?

Because our Python script calls:

- `pg_isready`
- `pg_dump`
- `psql`

Those programs must exist **inside the ELT container**, not only on your laptop.

---

# 4. 🌐 Ports, Networks, Volumes & Environment Variables

These four Docker ideas matter a lot in data engineering.

## Ports

In:

```text
5433:5432
```

- `5433` = port on your laptop
- `5432` = port inside the PostgreSQL container

From your laptop:

```text
localhost:5433
```

From another Compose container:

```text
source_postgres:5432
```

## Why not localhost inside the ELT container?

Inside `elt_script`, `localhost` means:

> this ELT container itself

It does **not** mean the source PostgreSQL container.

Docker Compose provides DNS using service names.

So:

```text
elt_script → source_postgres:5432
elt_script → destination_postgres:5432
```

## Volumes

Containers are replaceable.

Database state should survive container replacement.

```yaml
volumes:
  - source_pgdata:/var/lib/postgresql/data
```

A bind mount is different:

```yaml
volumes:
  - ./source_db_init/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

This maps a file from your repository into the container.

## Environment variables

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
SOURCE_DB=source_db
DESTINATION_DB=destination_db
```

In this repository:

- commit `.env.example`
- do not commit real `.env` secrets

---

# 5. 🧩 Docker Compose

Docker Compose describes multiple services together.

Our project contains:

```text
source_postgres
destination_postgres
elt_script
```

Start the stack:

```bash
cp .env.example .env
docker compose up --build
```

Inspect services:

```bash
docker compose ps
```

Read logs:

```bash
docker compose logs source_postgres
docker compose logs destination_postgres
docker compose logs elt_script
```

Stop everything:

```bash
docker compose down
```

Remove persistent volumes too:

```bash
docker compose down -v
```

Be careful: `-v` deletes the database data stored in the named volumes.

---

# 6. 🗄️ SQL & PostgreSQL — `00:30:38`

SQL is the language we use to create, inspect, and manipulate relational data.

The video builds PostgreSQL inside Docker and then uses SQL as a playground.

## Create a database

Example from a running PostgreSQL container:

```bash
docker exec -it demo-postgres createdb -U postgres postgres_db
```

Connect:

```bash
docker exec -it demo-postgres psql -U postgres -d postgres_db
```

Inside `psql`:

```text
\dt
```

lists tables.

---

# 7. 🧱 CREATE TABLE

Example:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    date_of_birth DATE
);
```

Important ideas:

- table → collection of related rows
- row → one record
- column → one attribute
- primary key → uniquely identifies a row
- data type → defines valid values

---

# 8. 🔎 SELECT & DISTINCT

Return every column:

```sql
SELECT *
FROM users;
```

Return only specific columns:

```sql
SELECT first_name, email
FROM users;
```

Unique values:

```sql
SELECT DISTINCT email
FROM users;
```

### Key idea

For debugging pipelines, `SELECT` is your microscope.

---

# 9. ✏️ UPDATE & WHERE

Update one row:

```sql
UPDATE users
SET email = 'new_mail@example.com'
WHERE id = 1;
```

The `WHERE` clause matters.

This is dangerous:

```sql
UPDATE users
SET email = 'new_mail@example.com';
```

It updates **every row**.

A useful habit before an UPDATE:

```sql
SELECT *
FROM users
WHERE id = 1;
```

First verify the population. Then modify it.

---

# 10. ➕ INSERT

Insert one row:

```sql
INSERT INTO films (
    title,
    release_date,
    price,
    rating,
    user_rating
)
VALUES (
    'Inception',
    '2010-07-16',
    12.99,
    'PG-13',
    5
);
```

The order of values must match the listed columns.

---

# 11. ✂️ LIMIT

When a table is huge, do not fetch everything just to inspect its shape.

```sql
SELECT *
FROM films
LIMIT 5;
```

This is especially useful while exploring unfamiliar data.

---

# 12. 🧮 Aggregate Functions

## COUNT

```sql
SELECT COUNT(*)
FROM films;
```

## SUM

```sql
SELECT SUM(price)
FROM films;
```

## AVG

```sql
SELECT AVG(user_rating)
FROM films;
```

## MIN / MAX

```sql
SELECT
    MIN(price),
    MAX(price)
FROM films;
```

These are fundamental for both analytics and pipeline validation.

---

# 13. 📊 GROUP BY

`GROUP BY` changes the grain of the result.

Example:

```sql
SELECT
    rating,
    AVG(user_rating) AS avg_user_rating
FROM films
GROUP BY rating;
```

Now the output is:

```text
one row per rating
```

rather than:

```text
one row per film
```

That concept—**grain**—is extremely important in data engineering.

---

# 14. 🔗 INNER JOIN & Aliases

Imagine:

```text
films
actors
film_actors
```

`film_actors` acts as a bridge.

```sql
SELECT
    f.film_id,
    f.title,
    a.actor_name
FROM films AS f
INNER JOIN film_actors AS fa
    ON f.film_id = fa.film_id
INNER JOIN actors AS a
    ON fa.actor_id = a.actor_id
ORDER BY f.film_id;
```

Aliases:

- `films AS f`
- `film_actors AS fa`
- `actors AS a`

make longer queries easier to read.

### INNER JOIN

Returns rows with matching relationships.

---

# 15. ⬅️ LEFT JOIN

```sql
SELECT
    f.film_id,
    f.title,
    a.actor_name
FROM films AS f
LEFT JOIN film_actors AS fa
    ON f.film_id = fa.film_id
LEFT JOIN actors AS a
    ON fa.actor_id = a.actor_id;
```

A LEFT JOIN keeps every row from the left table.

If a film has no matching actor:

```text
actor_name = NULL
```

### Mental model

- INNER JOIN → matching rows
- LEFT JOIN → preserve left side

---

# 16. 🧵 UNION vs UNION ALL

Combine compatible SELECT result sets vertically:

```sql
SELECT title AS name
FROM films

UNION

SELECT actor_name AS name
FROM actors;
```

`UNION` removes duplicates.

```sql
UNION ALL
```

keeps duplicates.

### Do not confuse JOIN and UNION

- JOIN → combine columns horizontally
- UNION → stack rows vertically

---

# 17. 🪆 Subqueries

A subquery is a query inside another query.

Example:

```sql
SELECT title
FROM films
WHERE film_id IN (
    SELECT fa.film_id
    FROM film_actors AS fa
    INNER JOIN actors AS a
        ON fa.actor_id = a.actor_id
    WHERE a.actor_name IN (
        'Leonardo DiCaprio',
        'Tom Hanks'
    )
);
```

The inner query answers one smaller question.

The outer query uses that result.

---

# 18. 🔄 ETL vs ELT — `01:04:32`

## ETL

```text
Extract → Transform → Load
```

## ELT

```text
Extract → Load → Transform
```

This repository demonstrates **ELT**.

Why?

1. Extract the source PostgreSQL database.
2. Load it into the destination PostgreSQL database.
3. Transform the destination with dbt.

---

# 19. 🏗️ The Project Architecture

```text
┌─────────────────────┐
│ Source PostgreSQL   │
└──────────┬──────────┘
           │ pg_dump
           ▼
┌─────────────────────┐
│ Python ELT process  │
└──────────┬──────────┘
           │ psql
           ▼
┌─────────────────────┐
│ Destination Postgres│
└──────────┬──────────┘
           │ dbt
           ▼
┌─────────────────────┐
│ Analytics Models    │
└─────────────────────┘
```

Scheduling can later be handled by:

```text
Cron
or
Airflow
```

Airbyte represents an alternative ingestion approach.

---

# 20. 🗃️ Source & Destination Databases

The Compose file runs two PostgreSQL containers.

From your laptop:

```text
Source      → localhost:5433
Destination → localhost:5434
```

Inside the Docker network:

```text
Source      → source_postgres:5432
Destination → destination_postgres:5432
```

This distinction is critical.

---

# 21. 🌱 Initializing the Source Database

PostgreSQL images automatically execute scripts inside:

```text
/docker-entrypoint-initdb.d/
```

on first initialization.

Our Compose file mounts:

```text
source_db_init/init.sql
```

into that location.

That script creates:

```text
users
orders
```

and inserts sample rows.

### Important

The init script runs when PostgreSQL initializes a new data directory.

If a named volume already contains an initialized database, editing `init.sql` will not automatically replay it.

For a clean learning reset:

```bash
docker compose down -v
docker compose up --build
```

---

# 22. 🐍 The Python ELT Coordinator

The ELT script is not manually copying every row in Python.

Python coordinates proven PostgreSQL tools.

High-level flow:

```python
wait_for_postgres(source)
wait_for_postgres(destination)

extract_with_pg_dump()
load_with_psql()
validate()
```

Why wait?

A container can be **running** before PostgreSQL is actually **ready**.

The script uses:

```bash
pg_isready
```

instead of assuming a fixed sleep is enough.

---

# 23. 📤 Extract with pg_dump

Conceptually:

```bash
pg_dump \
  -h source_postgres \
  -U postgres \
  -d source_db \
  -f /tmp/source_dump.sql
```

`pg_dump` creates a logical database dump.

This is simple and useful for learning.

For large production systems, full dumps every run may become too expensive.

---

# 24. 📥 Load with psql

Conceptually:

```bash
psql \
  -h destination_postgres \
  -U postgres \
  -d destination_db \
  -v ON_ERROR_STOP=1 \
  -f /tmp/source_dump.sql
```

`ON_ERROR_STOP=1` matters.

If a SQL statement fails, we want the job to fail rather than quietly continue.

---

# 25. ✅ Validate the Load

A command returning exit code 0 is not enough.

Check the actual data.

Examples:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

Check uniqueness:

```sql
SELECT
    COUNT(*) - COUNT(DISTINCT order_id)
        AS duplicate_order_ids
FROM orders;
```

Check freshness:

```sql
SELECT MAX(order_date)
FROM orders;
```

A production pipeline should validate both:

- **system success**
- **data correctness**

---

# 26. 🧱 dbt — `01:31:03`

dbt manages SQL transformations as code.

In this project:

```text
Destination raw tables
        ↓
     staging
        ↓
       marts
```

dbt is not the ingestion layer here.

It transforms data **after loading**.

---

# 27. 🔌 dbt Profile & Project

`dbt_project.yml` describes the project.

`profiles.yml` tells dbt how to connect to PostgreSQL.

Typical workflow:

```bash
cd dbt_project

dbt debug
dbt run
dbt test
```

`dbt debug` is the first command to use when you suspect connection or configuration problems.

---

# 28. 🌱 dbt Sources & Staging

Raw tables are declared as sources:

```yaml
sources:
  - name: raw
    schema: public
    tables:
      - name: users
      - name: orders
```

Then SQL models can reference them:

```sql
SELECT
    order_id,
    user_id,
    order_date,
    amount,
    LOWER(status) AS status
FROM {{ source('raw', 'orders') }}
```

A staging layer usually handles:

- renaming
- simple type casting
- basic cleanup
- source conventions

while preserving source grain.

---

# 29. 🔗 dbt ref() & Lineage

Reference another dbt model:

```sql
SELECT *
FROM {{ ref('stg_orders') }}
```

`ref()` does two things:

1. resolves the database relation
2. tells dbt about the dependency

That creates lineage.

For example:

```text
raw.orders
   ↓
stg_orders
   ↓
customer_revenue
```

---

# 30. 🧪 dbt Tests

Examples:

```yaml
columns:
  - name: user_id
    tests:
      - not_null
      - unique
```

Relationship test:

```yaml
- relationships:
    to: ref('stg_users')
    field: user_id
```

Important built-in ideas:

- `not_null`
- `unique`
- `relationships`
- `accepted_values`

Tests turn assumptions into executable checks.

---

# 31. ⏰ Cron — `02:04:11`

Cron is a simple time-based scheduler.

Example:

```cron
0 7 * * * /path/to/run_elt.sh
```

Meaning:

```text
minute 0
hour 7
every day
```

Cron is good when:

- the workflow is simple
- there are few dependencies
- you mainly need a schedule

Cron becomes less comfortable when you need:

- dependency graphs
- retries
- backfills
- task history
- centralized observability

That is where orchestration tools become useful.

---

# 32. 🌬️ Airflow — `02:07:54`

Airflow is a workflow orchestrator.

Its core abstraction is a **DAG**:

```text
Directed Acyclic Graph
```

A simple pipeline DAG:

```text
ELT
 ↓
dbt run
 ↓
dbt test
```

In Python:

```python
elt >> dbt_run >> dbt_test
```

Airflow does not replace:

- PostgreSQL
- dbt
- your ELT code

It coordinates them.

---

# 33. 🧠 Airflow Components

A typical Airflow deployment has more than one component.

Conceptually:

```text
Metadata DB
     ↑
Scheduler
     ↓
Tasks

Webserver → UI
```

The metadata database stores Airflow's operational state.

The scheduler determines which tasks should run.

The webserver exposes the UI.

In Docker-based local environments, these often run as separate services.

---

# 34. 🔁 Retries & Dependencies

If:

```text
ELT fails
```

then:

```text
dbt should not run against incomplete data
```

That is the value of explicit dependencies.

Retries are also common:

```python
default_args = {
    "retries": 2
}
```

But retries introduce an important requirement:

> your task should be safe to run again

This is called **idempotency**.

---

# 35. 🔌 Airbyte — `02:41:14`

Our Python script is a **custom ingestion implementation**.

Airbyte represents a connector-based alternative.

Conceptually:

```text
Source Connector
      ↓
   Airbyte
      ↓
Destination Connector
```

Instead of writing a custom extractor for every SaaS/database source, a connector may already exist.

### Custom code

Advantages:

- maximum control
- specialized behavior
- no platform abstraction limitations

Costs:

- you own authentication changes
- pagination
- retries
- rate limits
- schema changes
- maintenance

### Connector platform

Advantages:

- fast setup for common sources
- less custom movement code
- reusable connector ecosystem

Costs:

- connector limitations
- platform dependency
- still requires monitoring and data modeling

---

# 36. 🧭 Full End-to-End Mental Model

The entire course can be reconstructed as:

```text
Operational Source
      ↓
Ingestion
      ↓
Raw Destination
      ↓
Transformation
      ↓
Analytics Models
      ↓
Consumers
```

With:

```text
Docker → reproducible runtime
SQL → inspect/manipulate relational data
Python + pg_dump/psql → custom ingestion
dbt → transformations + tests + lineage
Cron → simple scheduling
Airflow → orchestration
Airbyte → connector-based ingestion alternative
```

---

# 37. 🚀 Beyond the Video: Production Concepts

These concepts are deliberately separated from the core course.

They are the natural next step.

## Idempotency

Running the same batch twice should not accidentally duplicate or corrupt data.

Typical strategies:

- replace a snapshot
- UPSERT / MERGE by stable key
- deduplicate by key
- transactional loads

## Incremental loading

Instead of copying everything:

```sql
SELECT *
FROM orders
WHERE updated_at > :last_successful_watermark;
```

Only move new/changed data.

Possible techniques:

- timestamps
- watermarks
- CDC
- log-based replication

## Observability

Track both system health and data health.

System examples:

- run status
- duration
- retry count
- error logs

Data examples:

- freshness
- row count
- duplicate keys
- null rates
- dbt test failures

## Schema evolution

Sources change.

Columns may be:

- added
- removed
- renamed
- retyped

A robust pipeline needs an explicit strategy for change.

## Secrets

A local `.env` file is fine for learning.

Production credentials belong in a proper secret-management mechanism.

---

# 🛠️ Run the Project

Clone:

```bash
git clone https://github.com/abed-dvp/data-engineering-course.git
cd data-engineering-course
```

Create local configuration:

```bash
cp .env.example .env
```

Run:

```bash
docker compose up --build
```

Inspect source:

```bash
docker exec -it source_postgres \
  psql -U postgres -d source_db
```

Inspect destination:

```bash
docker exec -it destination_postgres \
  psql -U postgres -d destination_db
```

Useful SQL:

```sql
\dt

SELECT * FROM users;
SELECT * FROM orders;
```

---

# 📁 Repository Structure

```text
data-engineering-course/
├── README.md                  # complete learning reference
├── docker-compose.yml         # source + destination + ELT
├── .env.example
│
├── source_db_init/
│   └── init.sql
│
├── elt_script/
│   ├── Dockerfile
│   └── elt_script.py
│
├── dbt_project/
│   ├── dbt_project.yml
│   ├── profiles.yml.example
│   └── models/
│
├── orchestration/
│   ├── cron/
│   └── airflow/
│
└── codelab/
    ├── index.html
    ├── steps.js
    ├── app.js
    └── styles.css
```

---

# 🧪 Recommended Learning Workflow

For each topic:

1. Read the README section.
2. Predict what the example does.
3. Open the Codelab.
4. Complete the exercise without looking at the solution.
5. Inspect the real project file.
6. Run it locally where applicable.
7. Explain the concept out loud without looking.

The goal is not:

> memorize Docker, dbt, and Airflow commands

The goal is:

> understand why every layer exists and how data moves through the system.

---

# 🎯 Interview-Ready Explanation

A compact explanation of this project:

> I built a containerized batch ELT pipeline with separate source and destination PostgreSQL databases. A Python coordinator waits for both databases, extracts the source with pg_dump, loads the destination with psql, and validates the result. I keep transformations separate in dbt, where staging and mart models add lineage and data tests. For scheduling I can use Cron for a simple fixed job or Airflow when I need explicit dependencies, retries, and workflow visibility. The teaching version uses full reloads for simplicity; at production scale I would consider incremental or CDC ingestion, stronger observability, schema-evolution handling, and managed secrets.

---

## Credits

The topic order follows freeCodeCamp's **Data Engineering Course for Beginners**, created by Justin Chau.

The course's official chapter sequence is Introduction, Why Data Engineering, Docker, SQL, building a data pipeline, dbt, Cron, Airflow, Airbyte, and Outro.

The explanations, examples, exercises, sample data, project code, and Codelab in this repository are independently written for learning and portfolio use.
