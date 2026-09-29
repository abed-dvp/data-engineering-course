# 🧪 Data Engineering Course — End-to-End Practical Lab

This lab takes the **real repository** from zero to a working batch ELT + dbt pipeline.

You will work with the actual project files:

- [docker-compose.yml](./docker-compose.yml)
- [source_db_init/init.sql](./source_db_init/init.sql)
- [elt_script/Dockerfile](./elt_script/Dockerfile)
- [elt_script/elt_script.py](./elt_script/elt_script.py)
- [dbt_project/](./dbt_project)
- [orchestration/cron/run_elt.sh](./orchestration/cron/run_elt.sh)
- [orchestration/airflow/elt_dag.py](./orchestration/airflow/elt_dag.py)

> **Rule:** do the steps in order. Do not mark a step complete until you ran the commands and can explain what happened.

Start in the repository root:

```powershell
cd data-engineering-course
```

---

# Step 1 — Verify the tools you already need

## Goal

Make sure Docker is working before debugging the project itself.

### Terminal

```powershell
docker --version
docker compose version
```

Then:

```powershell
docker run hello-world
```

### What this proves

```text
Docker CLI works
      ↓
Docker Engine works
      ↓
Image can be pulled
      ↓
Container can be created
      ↓
Process can run
```

Then:

```powershell
docker ps -a
```

You should see the exited `hello-world` container.

### Check yourself

Why does `hello-world` appear in `docker ps -a` but not necessarily in `docker ps`?

---

# Step 2 — Create your local environment file

The repository contains:

```text
.env.example
```

with:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
SOURCE_DB=source_db
DESTINATION_DB=destination_db
```

Create your local `.env`.

### PowerShell

```powershell
Copy-Item .env.example .env
```

### Git Bash / macOS / Linux

```bash
cp .env.example .env
```

Open `.env` and understand every value.

### Mental model

```text
docker-compose.yml
      ↓ reads
.env
      ↓ injects
container environment variables
```

### Important

The real `.env` should not be committed.

Check:

```powershell
git status
```

The repository's `.gitignore` already ignores `.env`.

---

# Step 3 — Read the architecture before running it

Open:

```text
docker-compose.yml
```

Identify these three services:

```text
source_postgres
destination_postgres
elt_script
```

Reconstruct the architecture:

```text
source_postgres
      ↓
    pg_dump
      ↓
   elt_script
      ↓
     psql
      ↓
destination_postgres
      ↓
      dbt
      ↓
analytics models
```

Now identify the host ports:

```text
Source PostgreSQL
localhost:5433 → container:5432

Destination PostgreSQL
localhost:5434 → container:5432
```

Inside the Docker network, however:

```text
elt_script → source_postgres:5432
elt_script → destination_postgres:5432
```

### Check yourself

Why does `elt_script` use `source_postgres` instead of `localhost`?

Do not continue until this distinction is clear.

---

# Step 4 — Start only the two databases

For learning, start the infrastructure before running ELT.

### Terminal

```powershell
docker compose up -d source_postgres destination_postgres
```

Now:

```powershell
docker compose ps
```

You should see both PostgreSQL services.

Pay attention to:

- STATUS
- PORTS
- health state

If a service is not healthy:

```powershell
docker compose logs source_postgres
docker compose logs destination_postgres
```

### Mental model

```text
docker compose up
      ↓
create network
      ↓
create/attach volumes
      ↓
create containers
      ↓
start PostgreSQL
      ↓
healthcheck waits for readiness
```

---

# Step 5 — Explore the source database

Enter PostgreSQL inside the source container:

```powershell
docker exec -it source_postgres psql -U postgres -d source_db
```

Now you are inside `psql`.

List tables:

```sql
\dt
```

You should see:

```text
users
orders
```

Inspect users:

```sql
SELECT * FROM users;
```

Inspect orders:

```sql
SELECT * FROM orders;
```

Expected baseline:

```text
users  → 5 rows
orders → 8 rows
```

Exit:

```text
\q
```

### What created these tables?

The Compose service mounts:

```text
source_db_init/init.sql
→
/docker-entrypoint-initdb.d/init.sql
```

The official PostgreSQL image runs initialization scripts when it initializes a **fresh data directory**.

---

# Step 6 — Practice SQL on the source

Enter source PostgreSQL again:

```powershell
docker exec -it source_postgres psql -U postgres -d source_db
```

### Count rows

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

### Paid orders only

```sql
SELECT *
FROM orders
WHERE status = 'paid';
```

### Revenue per user

```sql
SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY user_id;
```

### Join users and orders

```sql
SELECT
    u.full_name,
    o.order_date,
    o.amount,
    o.status
FROM users u
JOIN orders o
    ON u.user_id = o.user_id
ORDER BY o.order_date;
```

Exit:

```text
\q
```

### Why do this before ELT?

You need to understand the source data before you can validate that the destination is correct.

---

# Step 7 — Understand persistence with volumes

Check Compose volumes:

```powershell
docker volume ls
```

Your project should have named volumes corresponding to:

```text
source_pgdata
destination_pgdata
```

Now stop the containers:

```powershell
docker compose down
```

Start the databases again:

```powershell
docker compose up -d source_postgres destination_postgres
```

Query the source again.

The data is still there.

Why?

```text
container removed
      ↓
named volume survived
      ↓
database files survived
```

### Important distinction

```text
docker compose down
→ containers/network removed
→ named volumes normally remain

docker compose down -v
→ containers/network removed
→ named volumes removed too
```

---

# Step 8 — Read the ELT Dockerfile

Open:

```text
elt_script/Dockerfile
```

It contains:

```dockerfile
FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY elt_script.py .

CMD ["python", "elt_script.py"]
```

Translate it:

```text
What runtime?
→ Python 3.11 slim

What extra system tools?
→ PostgreSQL client tools

Why PostgreSQL client?
→ pg_isready + pg_dump + psql

Where does app run?
→ /app

What code is copied?
→ elt_script.py

What runs at container startup?
→ python elt_script.py
```

### Critical distinction

```text
RUN
→ image build time

CMD
→ container runtime
```

---

# Step 9 — Build the ELT image

Build only the ELT service:

```powershell
docker compose build elt_script
```

Then:

```powershell
docker images
```

Look for the image created for the Compose ELT service.

### What happened?

```text
elt_script/Dockerfile
      +
elt_script.py
      ↓
docker build
      ↓
ELT image
```

If the build fails, read the exact failing Dockerfile instruction before changing anything.

---

# Step 10 — Read the Python ELT control flow

Open:

```text
elt_script/elt_script.py
```

Find these stages:

```text
1. read environment variables
2. wait for source PostgreSQL
3. wait for destination PostgreSQL
4. pg_dump source
5. psql load destination
6. run validation queries
7. print success
```

Key functions:

```text
env()
run()
wait_for_postgres()
main()
```

Notice:

```python
subprocess.run(..., check=True)
```

Why `check=True`?

Because a non-zero exit code should raise an exception and fail the ELT process.

Also notice:

```python
process_env["PGPASSWORD"] = password
```

That passes the password to PostgreSQL client commands through the child-process environment.

---

# Step 11 — Run the ELT pipeline

Make sure databases are running:

```powershell
docker compose ps
```

Now run the ELT service using the same pattern used by the repository's orchestration scripts:

```powershell
docker compose up --build --abort-on-container-exit elt_script
```

Watch the logs.

You should see stages resembling:

```text
source_postgres/source_db is ready
destination_postgres/destination_db is ready

$ pg_dump ...

$ psql ... source_dump.sql

$ psql ... SELECT COUNT(*) ...

users_loaded
5

orders_loaded
8

ELT completed successfully
```

### What actually happened?

```text
Source PostgreSQL
      ↓ pg_dump
/tmp/source_dump.sql
      ↓ psql
Destination PostgreSQL
```

Python coordinated the tools.

Python did **not** loop through every database row itself.

---

# Step 12 — Validate the destination yourself

Do not trust only:

```text
ELT completed successfully
```

Inspect the data.

```powershell
docker exec -it destination_postgres psql -U postgres -d destination_db
```

List tables:

```sql
\dt
```

Counts:

```sql
SELECT COUNT(*) AS users_loaded FROM users;
SELECT COUNT(*) AS orders_loaded FROM orders;
```

Expected:

```text
users_loaded  = 5
orders_loaded = 8
```

Check total paid revenue:

```sql
SELECT SUM(amount) AS paid_revenue
FROM orders
WHERE status = 'paid';
```

Expected baseline:

```text
1145.00
```

Check duplicate order IDs:

```sql
SELECT
    COUNT(*) - COUNT(DISTINCT order_id)
        AS duplicate_order_ids
FROM orders;
```

Expected:

```text
0
```

Exit:

```text
\q
```

### Mental model

```text
command success
≠
data correctness
```

A data engineer validates both.

---

# Step 13 — Prove that ELT really moves changed data

Now change the **source**, not the destination.

Enter source:

```powershell
docker exec -it source_postgres psql -U postgres -d source_db
```

Add a user:

```sql
INSERT INTO users (full_name, email, country)
VALUES ('Practice User', 'practice@example.com', 'Germany');
```

Add an order for that user:

```sql
INSERT INTO orders (user_id, order_date, amount, status)
SELECT
    user_id,
    CURRENT_DATE,
    99.00,
    'paid'
FROM users
WHERE email = 'practice@example.com';
```

Verify source:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

Now you should have:

```text
6 users
9 orders
```

Exit:

```text
\q
```

Run ELT again:

```powershell
docker compose up --build --abort-on-container-exit elt_script
```

Now inspect destination:

```powershell
docker exec -it destination_postgres psql -U postgres -d destination_db
```

```sql
SELECT *
FROM users
WHERE email = 'practice@example.com';

SELECT *
FROM orders
WHERE user_id = (
    SELECT user_id
    FROM users
    WHERE email = 'practice@example.com'
);
```

You should see the new data.

### What you proved

```text
source changed
      ↓
ELT reran
      ↓
destination changed
```

You are now testing **data movement**, not just container startup.

---

# Step 14 — Reset the pipeline and understand init.sql

Return to a clean baseline:

```powershell
docker compose down -v
```

This removes:

- containers
- network
- named volumes

Now start databases again:

```powershell
docker compose up -d source_postgres destination_postgres
```

Because the source volume is new, PostgreSQL initializes again and runs:

```text
source_db_init/init.sql
```

Verify:

```powershell
docker exec -it source_postgres psql -U postgres -d source_db -c "SELECT COUNT(*) FROM users;"
```

Expected:

```text
5
```

Then rebuild/load destination again:

```powershell
docker compose up --build --abort-on-container-exit elt_script
```

### Important lesson

Editing `init.sql` does not mean PostgreSQL reruns it on every restart.

Initialization scripts run against a **fresh database data directory**.

---

# Step 15 — Install and configure dbt locally

The ELT stage is now working.

Next:

```text
raw destination
      ↓
dbt transformations
      ↓
analytics models
```

## Windows / PowerShell

From repository root:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install dbt-postgres
```

Create dbt's profile directory:

```powershell
New-Item -ItemType Directory -Force "$HOME\.dbt"
Copy-Item .\dbt_project\profiles.yml.example "$HOME\.dbt\profiles.yml"
```

Verify dbt:

```powershell
.\.venv\Scripts\dbt.exe --version
```

## macOS / Linux

Equivalent approach:

```bash
python3 -m venv .venv
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install dbt-postgres

mkdir -p ~/.dbt
cp dbt_project/profiles.yml.example ~/.dbt/profiles.yml
```

### Why does the profile use port 5434?

Because dbt runs on your **host machine**.

So it connects through:

```text
localhost:5434
      ↓
destination_postgres:5432
```

Different context from `elt_script`, which connects over the Docker network.

---

# Step 16 — dbt debug, staging models, and lineage

Move into the dbt project.

### PowerShell

```powershell
cd dbt_project
..\.venv\Scripts\dbt.exe debug
```

You want the connection check to pass.

Now inspect:

```text
models/sources.yml
models/staging/stg_users.sql
models/staging/stg_orders.sql
```

Understand this distinction:

```text
source('raw', 'orders')
→ raw table outside dbt

ref('stg_orders')
→ another dbt model
```

Run models:

```powershell
..\.venv\Scripts\dbt.exe run
```

Expected conceptually:

```text
public.users
      ↓
analytics.stg_users

public.orders
      ↓
analytics.stg_orders
      ↓
analytics.customer_revenue
```

---

# Step 17 — Inspect the dbt models in PostgreSQL

Open destination:

```powershell
docker exec -it destination_postgres psql -U postgres -d destination_db
```

List analytics relations:

```text
\dt analytics.*
\dv analytics.*
```

Remember the project config:

```text
staging → views
marts   → tables
```

Inspect staging:

```sql
SELECT *
FROM analytics.stg_users
ORDER BY user_id;
```

Then inspect the mart:

```sql
SELECT *
FROM analytics.customer_revenue
ORDER BY user_id;
```

Expected baseline customer revenue:

```text
Ada Lovelace       → 2 paid orders → 200
Grace Hopper       → 1 paid order  → 250
Guido van Rossum   → 1 paid order  → 175
Margaret Hamilton  → 2 paid orders → 410
Linus Torvalds     → 1 paid order  → 110
```

### Grain

The mart is:

```text
one row per customer
```

Do not continue until you understand why the raw `orders` table and this mart have different grain.

Exit:

```text
\q
```

---

# Step 18 — Run dbt tests

From `dbt_project`:

### PowerShell

```powershell
..\.venv\Scripts\dbt.exe test
```

The project tests assumptions including:

```text
stg_users.user_id
→ not null
→ unique

stg_users.email
→ not null
→ unique

stg_orders.order_id
→ not null
→ unique

stg_orders.user_id
→ not null
→ must exist in stg_users

customer_revenue.user_id
→ not null
→ unique
```

### Mental model

```text
dbt run
→ can I build the models?

dbt test
→ are important data assumptions true?
```

A model can build successfully and still contain bad data.

---

# Step 19 — Practice a real dbt failure and debug it

This step intentionally breaks something.

Open:

```text
dbt_project/models/marts/customer_revenue.sql
```

Temporarily change:

```text
ref('stg_orders')
```

to:

```text
ref('stg_orderz')
```

Now run:

```powershell
..\.venv\Scripts\dbt.exe run
```

It should fail because the referenced model does not exist.

### Debugging sequence

1. read the exact dbt error
2. identify the missing node/model
3. inspect the changed `ref()`
4. restore the file

From repository root:

```powershell
git diff -- dbt_project/models/marts/customer_revenue.sql
git restore dbt_project/models/marts/customer_revenue.sql
```

Run again:

```powershell
cd dbt_project
..\.venv\Scripts\dbt.exe run
..\.venv\Scripts\dbt.exe test
```

### Why this exercise matters

You are practicing:

```text
failure
→ evidence
→ hypothesis
→ fix
→ rerun
```

instead of random changes.

---

# Step 20 — Orchestration: Cron and Airflow

The data pipeline works manually.

Now inspect how the repository represents scheduling/orchestration.

---

## Part A — Cron wrapper

Open:

```text
orchestration/cron/run_elt.sh
```

It contains the essential pattern:

```bash
set -euo pipefail

cd "$(dirname "$0")/../.."
docker compose up --build --abort-on-container-exit elt_script
```

### What does it do?

- fails the shell script on errors
- moves to repository root
- executes the ELT Compose service

If you have Git Bash / WSL / macOS / Linux:

```bash
bash orchestration/cron/run_elt.sh
```

This tests the script manually.

A Cron schedule could later call that script, for example:

```cron
0 7 * * * /absolute/path/to/run_elt.sh
```

Meaning:

```text
every day at 07:00
```

On native Windows, treat actual Cron scheduling as optional and use WSL or another scheduler if you want to execute it.

---

## Part B — Airflow DAG

Open:

```text
orchestration/airflow/elt_dag.py
```

Find:

```python
schedule="0 7 * * *"
```

Find retries:

```python
"retries": 2
```

Find task dependency:

```python
elt >> dbt_run >> dbt_test
```

Translate it:

```text
run ELT
   ↓ only after success
dbt run
   ↓ only after success
dbt test
```

Check Python syntax without requiring a running Airflow installation:

```powershell
py -m py_compile orchestration/airflow/elt_dag.py
```

### Important

This repository contains the Airflow **DAG example**, not a full local Airflow deployment.

The practical lesson here is to understand:

- DAG
- task
- dependency
- schedule
- retries
- catchup

rather than pretending Airflow itself is already deployed by this project.

---

# Final Challenge — rebuild the pipeline without this guide

Reset everything:

```powershell
docker compose down -v
```

Then close this guide.

From memory, complete this flow:

```text
1. Create .env
2. Start source + destination PostgreSQL
3. Inspect source data
4. Build ELT image
5. Run ELT
6. Validate destination
7. Configure dbt
8. dbt debug
9. dbt run
10. dbt test
11. Query customer_revenue
12. Explain how Cron/Airflow would automate it
```

Commands you should be comfortable with:

```text
docker compose up
docker compose down
docker compose ps
docker compose logs
docker compose build

docker exec

psql
pg_isready
pg_dump

dbt debug
dbt run
dbt test

git diff
git restore
```

---

# Mastery Check

You are ready to move on when you can explain without notes:

- why the project is ELT rather than ETL
- host port vs container port
- why `elt_script` uses Docker service names
- why PostgreSQL data survives `docker compose down`
- why `down -v` changes initialization behavior
- why the ELT container needs `postgresql-client`
- what `pg_dump` does
- what `psql -f` does
- why `ON_ERROR_STOP=1` matters
- why successful execution is not enough without data validation
- `source()` vs `ref()` in dbt
- staging model vs mart
- table grain
- `dbt run` vs `dbt test`
- Cron vs Airflow
- why retries require idempotent pipeline behavior

If one of these is fuzzy, repeat the corresponding step.
