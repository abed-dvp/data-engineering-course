# 🏗️ Data Engineering 101 — Learn by Building an ELT Pipeline

A hands-on data engineering repository with **three ways to learn**:

1. **Interactive browser Codelab** — read the lesson, inspect examples, solve exercises, run SQL, check answers.
2. **Complete README reference** — a self-contained tutorial you can read without watching the video.
3. **Runnable end-to-end project** — Docker + PostgreSQL + Python ELT + dbt + scheduling/orchestration examples.

This repository follows the learning sequence of freeCodeCamp / Justin Chau's **Data Engineering Course for Beginners**, while using independently written explanations, examples, exercises, and a smaller project you can actually run and explain.

> 🚀 **Launch the interactive Codelab:** https://abed-dvp.github.io/data-engineering-course/  
> 🎥 **Source video:** https://www.youtube.com/watch?v=PHsC_t0j1dU  
> 🧪 **Runnable project:** the files in this repository
> 🧭 **Step-by-step Practical Lab:** [PRACTICE.md](./PRACTICE.md)
> ✅ **Interactive Practical Lab:** https://abed-dvp.github.io/data-engineering-course/codelab/practice.html

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


## 🧭 How to Use This as a Self-Study Source

This repository is written so that you should **not need the video open beside it**.

Whenever a command or concept appears, try to answer six questions:

1. **What is it?**
2. **What does it do?**
3. **When would I use it?**
4. **What does each important option mean?**
5. **What should I expect to see?**
6. **What is the common mistake or danger?**

The tutorial therefore explains commands rather than only listing them.

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

Docker is used in this course to give every learner the **same reproducible environment**.

Without Docker, two people may have:

- different PostgreSQL versions
- different Python versions
- different system packages
- different environment variables
- different operating-system behavior

With Docker, we package most of that runtime configuration.

---

## Image vs container

An **image** is a packaged template.

A **container** is a running instance created from an image.

Example:

```text
postgres:15       → Docker image
source_postgres   → running container created from postgres:15
```

One image can create many containers.

A useful analogy:

```text
Image     = class / blueprint
Container = instance / running object
```

The analogy is not technically perfect, but it is useful when you are learning.

---

## `docker pull` — download an image

```bash
docker pull postgres:15
```

### What it does

Downloads the `postgres:15` image from a container registry, normally Docker Hub.

### When you use it

Use it when you want the image available locally before creating a container.

Docker can also pull an image automatically when you run a container and the image is missing.

### What to check

After pulling:

```bash
docker images
```

You should see a PostgreSQL image in the local image list.

---

## `docker run` — create and start a container

```bash
docker run --name demo-postgres \
  -e POSTGRES_PASSWORD=secret \
  -p 5433:5432 \
  -d postgres:15
```

This command does several things at once:

1. creates a new container
2. configures it
3. starts it

### Breaking down the options

#### `--name demo-postgres`

Gives the container a readable name.

Without this, Docker generates a random name.

The name is useful later:

```bash
docker logs demo-postgres
docker stop demo-postgres
docker start demo-postgres
```

#### `-e POSTGRES_PASSWORD=secret`

Sets an environment variable inside the container.

The official PostgreSQL image reads this variable during initialization.

#### `-p 5433:5432`

Maps:

```text
host port 5433 → container port 5432
```

PostgreSQL listens on port `5432` inside the container.

Your laptop can reach it through:

```text
localhost:5433
```

#### `-d`

Runs the container in **detached mode**.

That means your terminal returns immediately instead of staying attached to the PostgreSQL process.

#### `postgres:15`

The image used to create the container.

---

# Useful Docker Commands — Explained

These commands form the core Docker debugging workflow.

---

## `docker ps` — show running containers

```bash
docker ps
```

### What it does

Lists containers that are **currently running**.

### When to use it

This is usually the first command to run when you ask:

> Is my container actually running?

### Important output columns

You will typically see columns like:

```text
CONTAINER ID
IMAGE
COMMAND
STATUS
PORTS
NAMES
```

Example:

```text
CONTAINER ID   IMAGE         STATUS        PORTS                    NAMES
8a21...        postgres:15   Up 2 minutes  0.0.0.0:5433->5432/tcp  demo-postgres
```

What matters here:

- `STATUS = Up` → container is running
- `PORTS` → confirms the host/container port mapping
- `NAMES` → the name used by other Docker commands

### Common confusion

If a container crashed, it will **not** appear in `docker ps`.

Use `docker ps -a` instead.

---

## `docker ps -a` — show all containers

```bash
docker ps -a
```

### What it does

Lists:

- running containers
- stopped containers
- containers that exited because of an error

### When to use it

Use this when:

```text
docker ps
```

does not show the container you expected.

Example:

```text
STATUS
Exited (1) 20 seconds ago
```

This tells you the process inside the container failed.

The next command should usually be:

```bash
docker logs <container-name>
```

---

## `docker logs` — read container output

```bash
docker logs demo-postgres
```

### What it does

Shows the container process's standard output and standard error.

In practice, this means:

> show me what the application inside this container has been printing.

### When to use it

Use it when:

- a container exits
- PostgreSQL does not start
- your ELT script fails
- you need to inspect startup messages

### Follow logs live

```bash
docker logs -f demo-postgres
```

`-f` means **follow**.

New log lines continue appearing until you stop following with:

```text
Ctrl + C
```

This does **not** stop the container. It only stops your log viewer.

### Show only recent lines

```bash
docker logs --tail 50 demo-postgres
```

This shows the last 50 lines instead of the entire history.

---

## `docker stop` — stop a running container

```bash
docker stop demo-postgres
```

### What it does

Asks the process inside the container to shut down gracefully.

The container still exists afterward.

Check:

```bash
docker ps -a
```

You should see it with a stopped/exited status.

### Important

`docker stop` is **not the same as deleting** the container.

You can start it again.

---

## `docker start` — start an existing stopped container

```bash
docker start demo-postgres
```

### What it does

Starts the same existing container again.

Its existing container configuration remains:

- name
- environment variables
- port mapping
- attached volumes

### Difference from `docker run`

```text
docker run   → create a new container + start it
docker start → start an already-created container
```

This distinction is important.

---

## `docker restart` — stop and start

```bash
docker restart demo-postgres
```

Equivalent conceptually to:

```text
stop → start
```

Useful after a configuration-independent temporary problem.

Do not use restart as a substitute for understanding recurring failures.

If it repeatedly crashes:

```bash
docker logs demo-postgres
```

and diagnose the cause.

---

## `docker rm` — remove a container

```bash
docker rm demo-postgres
```

### What it does

Deletes the container object.

Normally the container must already be stopped.

### Important distinction

Deleting a container does not necessarily delete data in a **named volume**.

That is one of the reasons we store PostgreSQL state in volumes.

### Force-remove a running container

```bash
docker rm -f demo-postgres
```

This forcefully stops and removes it.

Use this carefully.

For normal learning workflows, prefer:

```text
stop → inspect → remove
```

---

## `docker exec` — run a command inside a running container

Open a shell:

```bash
docker exec -it demo-postgres bash
```

### What it does

Runs a **new command inside an already-running container**.

It does not create another container.

### What does `-it` mean?

It combines two options:

- `-i` → interactive input
- `-t` → allocate a terminal

Together, they make interactive terminal programs practical.

### When to use it

Use it when you want to:

- inspect files
- test networking
- run a database client
- investigate the environment inside the container

---

## Run `psql` directly with `docker exec`

Instead of first entering Bash:

```bash
docker exec -it demo-postgres psql -U postgres
```

This directly starts PostgreSQL's CLI client inside the container.

Later, when a specific database exists:

```bash
docker exec -it source_postgres \
  psql -U postgres -d source_db
```

Options:

- `-U postgres` → connect as PostgreSQL user `postgres`
- `-d source_db` → connect to database `source_db`

---

## `docker inspect` — inspect low-level configuration

```bash
docker inspect demo-postgres
```

### What it does

Returns detailed JSON describing the container.

It includes:

- network configuration
- mounts
- environment
- ports
- image information
- container state

### When to use it

Use it when a normal status/log check is not enough and you need to verify the actual runtime configuration.

---

## Recommended Docker debugging sequence

When something is wrong, do not randomly rebuild everything.

Use this order:

```text
1. docker ps -a
      ↓
2. docker logs <container>
      ↓
3. docker inspect <container>       if configuration is suspicious
      ↓
4. docker exec -it <container> ... if you need to inspect/test inside
```

Example:

```bash
docker ps -a
docker logs elt_script
docker logs source_postgres
docker exec -it source_postgres psql -U postgres -d source_db
```

This sequence helps isolate whether the problem is:

- process startup
- application configuration
- networking
- credentials
- database state

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

Docker Compose describes a **multi-container application** in one YAML file.

Our project has three main services:

```text
source_postgres
destination_postgres
elt_script
```

Instead of manually starting each container with a long `docker run` command, Compose stores the configuration in:

```text
docker-compose.yml
```

---

## `docker compose up --build`

```bash
docker compose up --build
```

### What it does

- reads `docker-compose.yml`
- builds images that use `build:`
- creates missing containers
- creates the project network
- creates/attaches declared volumes
- starts the services
- shows combined service logs in your terminal

### Why `--build`?

It tells Compose to rebuild build-based images before starting.

Useful after changing:

- a Dockerfile
- Python files copied into the image
- build dependencies

---

## Run in the background

```bash
docker compose up -d
```

`-d` means detached mode.

The services continue running after your shell prompt returns.

To see their logs afterward:

```bash
docker compose logs
```

---

## `docker compose ps`

```bash
docker compose ps
```

### What it does

Shows the status of services belonging to this Compose project.

This is usually clearer than global `docker ps` when you only care about this project.

Use it to check:

- which services are running
- mapped ports
- health status

---

## `docker compose logs`

All project logs:

```bash
docker compose logs
```

One service:

```bash
docker compose logs elt_script
```

Follow live:

```bash
docker compose logs -f source_postgres
```

This is one of the most useful commands when debugging the stack.

---

## `docker compose stop`

```bash
docker compose stop
```

Stops services but keeps the containers.

You can start them again with:

```bash
docker compose start
```

---

## `docker compose down`

```bash
docker compose down
```

Stops and removes the project's containers and default network.

Named volumes are normally preserved.

That means your PostgreSQL data can survive.

---

## `docker compose down -v`

```bash
docker compose down -v
```

This also removes the project's named volumes.

### Why this matters in our project

The PostgreSQL initialization script runs when PostgreSQL initializes a **new data directory**.

So if you changed:

```text
source_db_init/init.sql
```

and need a completely clean database:

```bash
docker compose down -v
docker compose up --build
```

### Warning

`-v` deletes the local database state stored in the Compose volumes.

Use it intentionally.

---

## `docker compose build`

```bash
docker compose build
```

Builds images without starting the services.

Useful when you want to isolate:

> Does my Dockerfile build successfully?

from:

> Does my application run successfully?

---

## Quick Compose troubleshooting loop

```bash
docker compose ps
docker compose logs elt_script
docker compose logs source_postgres
docker compose logs destination_postgres
```

If the state is badly confused and you intentionally want a fresh learning environment:

```bash
docker compose down -v
docker compose up --build
```

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

# 23. 📤 Extract with `pg_dump`

`pg_dump` is a PostgreSQL command-line tool for creating a **logical backup/dump**.

Our learning pipeline uses it as the Extract step.

```bash
pg_dump \
  -h source_postgres \
  -U postgres \
  -d source_db \
  -f /tmp/source_dump.sql
```

## What each option means

### `-h source_postgres`

Host.

It tells `pg_dump` which PostgreSQL server to connect to.

Inside our Docker Compose network, the hostname is the service name:

```text
source_postgres
```

### `-U postgres`

Database user.

Connect as:

```text
postgres
```

### `-d source_db`

Database to dump.

### `-f /tmp/source_dump.sql`

Write the dump to this file.

Without `-f`, output can be written to stdout instead.

---

## What is inside the dump?

A logical SQL dump can contain SQL needed to reconstruct:

- tables
- data
- sequences
- constraints
- other database objects depending on options

It is not a raw copy of PostgreSQL's internal storage files.

---

## Why use `pg_dump` in this course?

Because it gives us a clear, understandable full-copy pipeline:

```text
source PostgreSQL
      ↓ pg_dump
SQL dump file
```

For small databases and learning, this is excellent.

For very large or frequently changing production data, repeatedly dumping everything may be inefficient.

That is where strategies such as:

- incremental extraction
- CDC
- replication
- managed connectors

become relevant.

---


# 24. 📥 Load with `psql`

`psql` is PostgreSQL's command-line client.

In this pipeline we use it to execute the dump against the destination database.

```bash
psql \
  -h destination_postgres \
  -U postgres \
  -d destination_db \
  -v ON_ERROR_STOP=1 \
  -f /tmp/source_dump.sql
```

## What each option means

### `-h destination_postgres`

Connect to the destination PostgreSQL service.

### `-U postgres`

Connect as database user `postgres`.

### `-d destination_db`

Run against the destination database.

### `-f /tmp/source_dump.sql`

Read SQL commands from this file.

### `-v ON_ERROR_STOP=1`

Tell `psql` to stop when a SQL error occurs.

This is important in a pipeline.

Without explicit failure behavior, a script could continue after part of the load failed.

We want:

```text
SQL error
   ↓
load fails
   ↓
pipeline fails
   ↓
investigate
```

not:

```text
SQL error
   ↓
ignore it
   ↓
continue
   ↓
report success with incomplete data
```

---

## `psql -c` — run one SQL command

Example:

```bash
psql \
  -h destination_postgres \
  -U postgres \
  -d destination_db \
  -c "SELECT COUNT(*) FROM orders;"
```

`-c` means:

> execute this command and exit.

This is useful for automated validation.

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

`dbt_project.yml` describes the dbt project itself.

Examples of project-level configuration:

- project name
- model directories
- materialization defaults
- profile name

`profiles.yml` tells dbt **where and how to connect**.

Typical connection information includes:

- database type
- host
- port
- username
- password
- database name
- schema
- target environment

Keep real credentials out of Git.

---

## `dbt debug` — check configuration and connection

```bash
dbt debug
```

### What it does

Checks important setup pieces such as:

- whether dbt can find the project
- whether it can find the configured profile
- whether connection settings are valid
- whether it can connect to the destination database

### When to use it

This is usually the **first command** when dbt is not working.

If `dbt debug` cannot connect, changing model SQL probably will not help.

---

## `dbt run` — build models

```bash
dbt run
```

### What it does

Compiles and executes dbt models in dependency order.

A SQL model such as:

```text
models/staging/stg_orders.sql
```

becomes a database relation according to its materialization, such as:

- view
- table
- incremental model

### Important

`dbt run` builds models.

It does **not** automatically mean your data assumptions are valid.

That is why we also run tests.

---

## `dbt test` — validate model assumptions

```bash
dbt test
```

Runs configured data tests such as:

- `not_null`
- `unique`
- `relationships`
- other custom/generic tests

Example question:

> Did every `orders.user_id` match an existing user?

A relationships test can validate that.

---

## Useful learning sequence

```bash
cd dbt_project
dbt debug
dbt run
dbt test
```

Think of it as:

```text
Can I connect?
      ↓
Can I build?
      ↓
Is the resulting data valid?
```

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
