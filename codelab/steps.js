window.CODELAB_STEPS = [
  {
    "title": "Why Data Engineering",
    "time": "00:00:36",
    "learn": "Data engineering is about making data reliably available for downstream use.",
    "bullets": [
      "Think Source → Ingestion → Storage → Transformation → Serving.",
      "Orchestration, quality, observability, and security cut across the pipeline.",
      "Tools change; the pipeline responsibilities are the durable mental model."
    ],
    "example": "Source → Ingestion → Raw Storage → Transform → Serve",
    "output": "A complete data flow, not just a single tool.",
    "challenge": "Write the five main pipeline stages in order.",
    "starter": "Source → ",
    "solution": "Source → Ingestion → Storage → Transformation → Serving",
    "takeaway": "Think in pipeline stages and guarantees, not in product names.",
    "type": "text",
    "check": [
      "source",
      "ingestion",
      "storage",
      "transformation",
      "serving"
    ]
  },
  {
    "title": "Docker: Image vs Container",
    "time": "00:03:14",
    "learn": "An image is a packaged template. A container is a running instance of that image.",
    "bullets": [
      "Images are immutable build artifacts.",
      "Containers add runtime configuration and a writable layer.",
      "Containers should be replaceable."
    ],
    "example": "postgres:15  → image\nsource_postgres → running container",
    "output": "One image can create many containers.",
    "challenge": "Complete the sentence: an image is a ___; a container is a ___ instance of it.",
    "starter": "An image is a ...\nA container is a ...",
    "solution": "An image is a packaged template.\nA container is a running instance of it.",
    "takeaway": "Image = packaged template. Container = running instance.",
    "type": "text",
    "check": [
      "image",
      "template",
      "container",
      "running"
    ]
  },
  {
    "title": "Run PostgreSQL in Docker",
    "time": "00:08:00",
    "learn": "docker run starts a container with runtime settings such as name, environment variables, and port mappings.",
    "bullets": [
      "`docker run` creates and starts a new container from an image.",
      "`--name demo-postgres` gives it a stable human-readable name for later commands.",
      "`-e POSTGRES_PASSWORD=secret` injects a required environment variable used by the official PostgreSQL image.",
      "`-p 5433:5432` maps host port 5433 to PostgreSQL port 5432 inside the container.",
      "`-d` runs detached so your terminal returns immediately.",
      "`postgres:15` is the image and tag used to create the container."
    ],
    "example": "docker run --name demo-postgres \\\n  -e POSTGRES_PASSWORD=secret \\\n  -p 5433:5432 \\\n  -d postgres:15",
    "output": "The container runs PostgreSQL internally on 5432, while your laptop reaches it on localhost:5433.",
    "challenge": "Write the command to run postgres:15 as my-postgres with password secret and host port 5433.",
    "starter": "docker run ",
    "solution": "docker run --name my-postgres -e POSTGRES_PASSWORD=secret -p 5433:5432 -d postgres:15",
    "takeaway": "docker run turns an image into a configured runtime.",
    "type": "text",
    "check": [
      "docker run",
      "--name my-postgres",
      "postgres_password=secret",
      "5433:5432",
      "postgres:15"
    ]
  },
  {
    "title": "Essential Docker Commands",
    "time": "00:12:00",
    "learn": "These commands are the basic operational toolkit for understanding container state, reading failures, and interacting with a running service.",
    "bullets": [
      "`docker ps` — lists only containers that are currently running. Use it first to confirm whether a service is actually up.",
      "`docker ps -a` — lists all containers, including stopped and crashed ones. Use it when a container is missing from `docker ps`.",
      "`docker logs demo-postgres` — shows stdout/stderr from the process inside that container. This is usually your next step after seeing `Exited (...)`.",
      "`docker stop demo-postgres` — asks the running container to shut down gracefully. The container still exists afterward.",
      "`docker start demo-postgres` — starts the same existing stopped container again. It does not create a new container.",
      "`docker rm demo-postgres` — removes the container object. Normally stop it first. Named volumes are separate and may still preserve data.",
      "`docker exec -it demo-postgres ...` — runs a new command inside an already-running container; useful for shells, psql, and debugging."
    ],
    "example": "docker ps\n# show running containers\n\ndocker ps -a\n# show running + stopped/exited containers\n\ndocker logs demo-postgres\n# inspect application/database output\n\ndocker stop demo-postgres\n# stop without deleting\n\ndocker start demo-postgres\n# start the same existing container\n\ndocker rm demo-postgres\n# remove the stopped container\n\ndocker exec -it demo-postgres psql -U postgres\n# run psql inside the running container",
    "output": "A practical debugging loop: check state → read logs → inspect inside the container → stop/start/remove only when needed.",
    "challenge": "Your container does not appear in `docker ps`. Which command should you run next, and why?",
    "starter": "",
    "solution": "Run `docker ps -a` because it also shows stopped and crashed containers. If the container is `Exited`, then inspect the cause with `docker logs <container-name>`.",
    "takeaway": "Do not memorize Docker commands as a list. Associate each command with the diagnostic question it answers.",
    "type": "text",
    "check": [
      "docker ps -a",
      "docker logs"
    ]
  },
  {
    "title": "Dockerfile",
    "time": "00:15:00",
    "learn": "A Dockerfile is a recipe for building an image.",
    "bullets": [
      "FROM chooses the base image.",
      "RUN executes build-time commands.",
      "WORKDIR sets the working directory.",
      "COPY adds files.",
      "CMD defines the default container process."
    ],
    "example": "FROM python:3.11-slim\nRUN apt-get update && apt-get install -y postgresql-client\nWORKDIR /app\nCOPY elt_script.py .\nCMD [\"python\", \"elt_script.py\"]",
    "output": "An image containing Python, PostgreSQL client tools, and the ELT script.",
    "challenge": "Complete a Dockerfile that copies app.py and runs it.",
    "starter": "FROM python:3.11-slim\nWORKDIR /app\n\n# copy file\n\n# run file",
    "solution": "FROM python:3.11-slim\nWORKDIR /app\nCOPY app.py .\nCMD [\"python\", \"app.py\"]",
    "takeaway": "Your image must contain every runtime dependency the process needs.",
    "type": "text",
    "check": [
      "from python:3.11-slim",
      "workdir /app",
      "copy app.py",
      "cmd",
      "python",
      "app.py"
    ]
  },
  {
    "title": "Ports & Container Networking",
    "time": "00:19:00",
    "learn": "Host networking and container-to-container networking are different contexts.",
    "bullets": [
      "5433:5432 means host 5433 → container 5432.",
      "Inside Compose, service names are DNS hostnames.",
      "localhost inside elt_script means elt_script itself."
    ],
    "example": "Host laptop → localhost:5433 → source_postgres:5432\nELT container → source_postgres:5432",
    "output": "The same database is reached differently depending on where the client runs.",
    "challenge": "From elt_script, what hostname and port should connect to the source DB?",
    "starter": "",
    "solution": "source_postgres:5432",
    "takeaway": "Use service name + internal port between Compose containers.",
    "type": "text",
    "check": [
      "source_postgres",
      "5432"
    ]
  },
  {
    "title": "Volumes & Persistence",
    "time": "00:23:00",
    "learn": "Volumes keep important state outside the lifecycle of replaceable containers.",
    "bullets": [
      "Named volumes persist database files.",
      "Bind mounts expose host files/directories.",
      "Deleting a container does not automatically delete a named volume."
    ],
    "example": "volumes:\n  - source_pgdata:/var/lib/postgresql/data",
    "output": "PostgreSQL state survives container recreation.",
    "challenge": "Why use a named volume for PostgreSQL?",
    "starter": "Because ...",
    "solution": "Because the database state should survive container replacement.",
    "takeaway": "Containers are ephemeral; state should be durable.",
    "type": "text",
    "check": [
      "survive",
      "container"
    ]
  },
  {
    "title": "Environment Variables",
    "time": "00:26:00",
    "learn": "Environment variables separate runtime configuration from code.",
    "bullets": [
      "Use .env.example for safe placeholders.",
      "Do not commit real secrets.",
      "Production secrets belong in a secret manager or secure deployment mechanism."
    ],
    "example": "POSTGRES_USER=postgres\nPOSTGRES_PASSWORD=secret\nSOURCE_DB=source_db",
    "output": "The same image can run with different settings.",
    "challenge": "Which file should be committed: .env or .env.example?",
    "starter": "",
    "solution": ".env.example",
    "takeaway": "Commit configuration templates, not real credentials.",
    "type": "text",
    "check": [
      ".env.example"
    ]
  },
  {
    "title": "Docker Compose",
    "time": "00:28:00",
    "learn": "Docker Compose describes a multi-service application in one YAML file.",
    "bullets": [
      "`docker compose up --build` reads the Compose file, builds build-based images, creates missing containers/network/volumes, then starts services.",
      "`docker compose ps` shows the status of services in this Compose project.",
      "`docker compose logs <service>` shows logs for one service; add `-f` to follow new lines live.",
      "`docker compose stop` stops services but keeps containers so they can be started again.",
      "`docker compose down` stops and removes project containers/network but normally preserves named volumes.",
      "`docker compose down -v` also deletes named volumes, so it resets local database state.",
      "`docker compose build` builds images without starting services."
    ],
    "example": "docker compose up --build\n# build + start the stack\n\ndocker compose ps\n# inspect service status\n\ndocker compose logs -f elt_script\n# follow ELT logs live\n\ndocker compose down\n# stop/remove containers, preserve named volumes\n\ndocker compose down -v\n# also delete local DB volumes",
    "output": "Compose becomes the command surface for operating the full local data stack, not just one container.",
    "challenge": "What command starts and rebuilds the project?",
    "starter": "docker compose ",
    "solution": "docker compose up --build",
    "takeaway": "Compose is an executable definition of your local data platform.",
    "type": "text",
    "check": [
      "docker compose up --build"
    ]
  },
  {
    "title": "SQL: CREATE TABLE",
    "time": "00:30:38",
    "learn": "Relational data lives in tables with typed columns and keys.",
    "bullets": [
      "A primary key uniquely identifies a row.",
      "Data types constrain values.",
      "Foreign keys describe relationships between tables."
    ],
    "example": "CREATE TABLE users (\n  user_id INTEGER PRIMARY KEY,\n  full_name TEXT,\n  email TEXT\n);",
    "output": "A users table with one row per user.",
    "challenge": "Create a simple products table with product_id primary key and name.",
    "starter": "CREATE TABLE products (\n  \n);",
    "solution": "CREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name TEXT\n);",
    "takeaway": "Know the grain and key of every table you work with.",
    "type": "sql",
    "sqlSolution": "CREATE TABLE products (product_id INTEGER PRIMARY KEY, name TEXT); SELECT name FROM sqlite_master WHERE type='table' AND name='products';",
    "sqlExpected": "products"
  },
  {
    "title": "SQL: SELECT & DISTINCT",
    "time": "00:34:00",
    "learn": "SELECT chooses the data you want to inspect; DISTINCT removes duplicates in the selected output.",
    "bullets": [
      "Prefer explicit columns while debugging.",
      "DISTINCT applies to the selected column combination.",
      "SELECT is your first inspection tool."
    ],
    "example": "SELECT first_name, email\nFROM users;\n\nSELECT DISTINCT country\nFROM users;",
    "output": "Rows from users, then unique countries.",
    "challenge": "Return the unique countries from users.",
    "starter": "SELECT \nFROM users;",
    "solution": "SELECT DISTINCT country\nFROM users;",
    "takeaway": "SELECT inspects; DISTINCT de-duplicates output.",
    "type": "sql",
    "sqlSolution": "SELECT DISTINCT country FROM users;"
  },
  {
    "title": "SQL: WHERE & UPDATE",
    "time": "00:38:00",
    "learn": "WHERE filters rows. UPDATE changes data and should almost always be scoped carefully.",
    "bullets": [
      "Preview the target rows with SELECT first.",
      "Without WHERE, UPDATE can affect every row.",
      "Filtering is both analytical and operational."
    ],
    "example": "UPDATE users\nSET country = 'United States'\nWHERE user_id = 2;",
    "output": "Only user_id 2 is changed.",
    "challenge": "Return paid orders only.",
    "starter": "SELECT *\nFROM orders\nWHERE ;",
    "solution": "SELECT *\nFROM orders\nWHERE status = 'paid';",
    "takeaway": "Always be explicit about the population you are changing or analyzing.",
    "type": "sql",
    "sqlSolution": "SELECT * FROM orders WHERE status = 'paid';"
  },
  {
    "title": "SQL: INSERT & LIMIT",
    "time": "00:42:00",
    "learn": "INSERT adds rows. LIMIT keeps exploratory queries small.",
    "bullets": [
      "Column order must match values.",
      "LIMIT is useful on large unfamiliar tables.",
      "Inspect before performing broad operations."
    ],
    "example": "SELECT *\nFROM orders\nLIMIT 5;",
    "output": "At most five orders.",
    "challenge": "Return the first three users.",
    "starter": "SELECT *\nFROM users\n",
    "solution": "SELECT *\nFROM users\nLIMIT 3;",
    "takeaway": "LIMIT is a simple safety tool for exploration.",
    "type": "sql",
    "sqlSolution": "SELECT * FROM users LIMIT 3;"
  },
  {
    "title": "SQL: Aggregate Functions",
    "time": "00:46:00",
    "learn": "COUNT, SUM, AVG, MIN, and MAX summarize many rows into metrics.",
    "bullets": [
      "COUNT(*) counts rows.",
      "SUM adds numeric values.",
      "AVG returns a mean.",
      "MIN/MAX help check ranges and freshness."
    ],
    "example": "SELECT COUNT(*) AS order_count,\n       SUM(amount) AS total_amount\nFROM orders;",
    "output": "One summary row.",
    "challenge": "Calculate total amount of paid orders.",
    "starter": "SELECT \nFROM orders\nWHERE status = 'paid';",
    "solution": "SELECT SUM(amount) AS paid_total\nFROM orders\nWHERE status = 'paid';",
    "takeaway": "Aggregates are useful for analytics and for validating pipeline loads.",
    "type": "sql",
    "sqlSolution": "SELECT SUM(amount) AS paid_total FROM orders WHERE status = 'paid';"
  },
  {
    "title": "SQL: GROUP BY",
    "time": "00:49:00",
    "learn": "GROUP BY changes the grain of the result.",
    "bullets": [
      "One output row is produced per grouping key.",
      "Every selected non-aggregate column should usually be part of the grouping.",
      "Grain awareness prevents double counting."
    ],
    "example": "SELECT user_id, SUM(amount) AS revenue\nFROM orders\nGROUP BY user_id;",
    "output": "One row per user_id.",
    "challenge": "Count orders per user_id.",
    "starter": "SELECT user_id, \nFROM orders\n",
    "solution": "SELECT user_id, COUNT(*) AS order_count\nFROM orders\nGROUP BY user_id;",
    "takeaway": "GROUP BY deliberately changes row-level detail into grouped summaries.",
    "type": "sql",
    "sqlSolution": "SELECT user_id, COUNT(*) AS order_count FROM orders GROUP BY user_id;"
  },
  {
    "title": "SQL: INNER JOIN & Aliases",
    "time": "00:53:00",
    "learn": "JOIN combines related tables horizontally using keys.",
    "bullets": [
      "INNER JOIN keeps matching rows.",
      "Aliases improve readability.",
      "Predict post-join grain before aggregating."
    ],
    "example": "SELECT u.full_name, o.order_id, o.amount\nFROM users AS u\nINNER JOIN orders AS o\n  ON u.user_id = o.user_id;",
    "output": "One row per matched order, enriched with user information.",
    "challenge": "Return full_name and amount for matching user/order rows.",
    "starter": "SELECT \nFROM users u\nJOIN orders o\n  ON ;",
    "solution": "SELECT u.full_name, o.amount\nFROM users u\nJOIN orders o\n  ON u.user_id = o.user_id;",
    "takeaway": "A one-to-many join usually creates one row per record on the many side.",
    "type": "sql",
    "sqlSolution": "SELECT u.full_name, o.amount FROM users u JOIN orders o ON u.user_id = o.user_id;"
  },
  {
    "title": "SQL: LEFT JOIN",
    "time": "00:57:00",
    "learn": "LEFT JOIN preserves every row from the left table.",
    "bullets": [
      "Unmatched right-side values become NULL.",
      "Use it when missing relationships are meaningful.",
      "The left side defines what must be preserved."
    ],
    "example": "SELECT u.full_name, o.order_id\nFROM users u\nLEFT JOIN orders o\n  ON u.user_id = o.user_id;",
    "output": "Users remain visible even if they have no order.",
    "challenge": "Return every user and any matching order_id.",
    "starter": "SELECT u.full_name, o.order_id\nFROM users u\nJOIN orders o\n  ON u.user_id = o.user_id;",
    "solution": "SELECT u.full_name, o.order_id\nFROM users u\nLEFT JOIN orders o\n  ON u.user_id = o.user_id;",
    "takeaway": "LEFT JOIN answers: preserve this population, enrich where possible.",
    "type": "sql",
    "sqlSolution": "SELECT u.full_name, o.order_id FROM users u LEFT JOIN orders o ON u.user_id = o.user_id;"
  },
  {
    "title": "SQL: UNION vs UNION ALL",
    "time": "01:00:00",
    "learn": "UNION stacks compatible result sets vertically.",
    "bullets": [
      "UNION removes duplicates.",
      "UNION ALL keeps duplicates.",
      "JOIN combines columns; UNION stacks rows."
    ],
    "example": "SELECT country AS value FROM users\nUNION\nSELECT status AS value FROM orders;",
    "output": "One combined de-duplicated list.",
    "challenge": "Combine user countries and order statuses, keeping duplicates.",
    "starter": "SELECT country AS value FROM users\nUNION\nSELECT status AS value FROM orders;",
    "solution": "SELECT country AS value FROM users\nUNION ALL\nSELECT status AS value FROM orders;",
    "takeaway": "Use UNION ALL when duplicate rows are meaningful or when de-duplication is unnecessary.",
    "type": "sql",
    "sqlSolution": "SELECT country AS value FROM users UNION ALL SELECT status AS value FROM orders;"
  },
  {
    "title": "SQL: Subqueries",
    "time": "01:02:00",
    "learn": "A subquery lets one query depend on the result of another.",
    "bullets": [
      "Subqueries can appear in WHERE, SELECT, or FROM.",
      "Start by solving the inner question separately.",
      "Use CTEs when nesting becomes difficult to read."
    ],
    "example": "SELECT full_name\nFROM users\nWHERE user_id IN (\n  SELECT user_id\n  FROM orders\n  WHERE amount > 200\n);",
    "output": "Users with at least one order over 200.",
    "challenge": "Return users who have any paid order.",
    "starter": "SELECT full_name\nFROM users\nWHERE user_id IN (\n  SELECT \n);",
    "solution": "SELECT full_name\nFROM users\nWHERE user_id IN (\n  SELECT user_id FROM orders WHERE status = 'paid'\n);",
    "takeaway": "Break complex questions into smaller queries.",
    "type": "sql",
    "sqlSolution": "SELECT full_name FROM users WHERE user_id IN (SELECT user_id FROM orders WHERE status = 'paid');"
  },
  {
    "title": "ETL vs ELT",
    "time": "01:04:32",
    "learn": "ETL transforms before loading; ELT loads first and transforms later.",
    "bullets": [
      "ETL = Extract → Transform → Load.",
      "ELT = Extract → Load → Transform.",
      "This project is ELT because dbt transforms after raw loading."
    ],
    "example": "Source → Extract → Load → Destination → dbt Transform",
    "output": "An ELT architecture.",
    "challenge": "Which sequence describes this project?",
    "starter": "",
    "solution": "Extract → Load → Transform",
    "takeaway": "Name the pattern based on where transformation happens.",
    "type": "text",
    "check": [
      "extract",
      "load",
      "transform"
    ]
  },
  {
    "title": "Project Architecture",
    "time": "01:08:00",
    "learn": "The course project separates source, ingestion, destination, and transformation.",
    "bullets": [
      "Source PostgreSQL holds operational data.",
      "Python coordinates extraction and load.",
      "Destination PostgreSQL receives raw data.",
      "dbt transforms destination tables."
    ],
    "example": "Source PostgreSQL → Python ELT → Destination PostgreSQL → dbt",
    "output": "A small but complete batch ELT stack.",
    "challenge": "Write the four components in order.",
    "starter": "Source PostgreSQL → ",
    "solution": "Source PostgreSQL → Python ELT → Destination PostgreSQL → dbt",
    "takeaway": "Separate responsibilities so each layer can evolve independently.",
    "type": "text",
    "check": [
      "source postgresql",
      "python elt",
      "destination postgresql",
      "dbt"
    ]
  },
  {
    "title": "Source Database Initialization",
    "time": "01:12:00",
    "learn": "The official PostgreSQL image can run initialization SQL from /docker-entrypoint-initdb.d on first setup.",
    "bullets": [
      "Our init.sql creates users and orders.",
      "It runs when PostgreSQL initializes a fresh data directory.",
      "Existing named volumes prevent automatic re-initialization."
    ],
    "example": "./source_db_init/init.sql → /docker-entrypoint-initdb.d/init.sql",
    "output": "Source tables and sample rows are created on first initialization.",
    "challenge": "What command resets the local project including database volumes?",
    "starter": "docker compose down ",
    "solution": "docker compose down -v",
    "takeaway": "Initialization scripts are tied to data-directory initialization, not every container start.",
    "type": "text",
    "check": [
      "docker compose down -v"
    ]
  },
  {
    "title": "Python ELT Coordinator",
    "time": "01:16:00",
    "learn": "Python coordinates external PostgreSQL tools instead of copying rows one by one.",
    "bullets": [
      "Wait for dependencies.",
      "Run pg_dump to extract.",
      "Run psql to load.",
      "Validate after load."
    ],
    "example": "wait_for_postgres()\npg_dump ...\npsql ...\nvalidate()",
    "output": "A simple control plane around database-native tools.",
    "challenge": "Write the four pipeline phases in order.",
    "starter": "1.\n2.\n3.\n4.",
    "solution": "1. Wait\n2. Extract\n3. Load\n4. Validate",
    "takeaway": "Use proven data-transfer tools and keep orchestration logic simple.",
    "type": "text",
    "check": [
      "wait",
      "extract",
      "load",
      "validate"
    ]
  },
  {
    "title": "Readiness Checks",
    "time": "01:19:00",
    "learn": "A running container is not necessarily a ready database.",
    "bullets": [
      "pg_isready checks real service readiness.",
      "Bounded retries handle transient startup delay.",
      "Fixed sleep values are brittle."
    ],
    "example": "pg_isready -h source_postgres -U postgres -d source_db",
    "output": "Success only when PostgreSQL is accepting connections.",
    "challenge": "Why is pg_isready better than sleep(10)?",
    "starter": "Because ...",
    "solution": "Because it checks the actual database state instead of guessing a delay.",
    "takeaway": "Wait for a condition, not an arbitrary number of seconds.",
    "type": "text",
    "check": [
      "actual",
      "state"
    ]
  },
  {
    "title": "Extract with pg_dump",
    "time": "01:22:00",
    "learn": "pg_dump creates a logical PostgreSQL dump.",
    "bullets": [
      "`pg_dump` creates a logical PostgreSQL dump; in this project it is the Extract step.",
      "`-h source_postgres` selects the database host inside the Compose network.",
      "`-U postgres` connects as PostgreSQL user `postgres`.",
      "`-d source_db` selects the source database.",
      "`-f dump.sql` writes the dump to a file instead of standard output.",
      "A full dump is simple for learning, but large production systems often need incremental extraction or CDC."
    ],
    "example": "pg_dump \\\n  -h source_postgres \\\n  -U postgres \\\n  -d source_db \\\n  -f /tmp/source_dump.sql",
    "output": "A logical SQL dump file that can later be replayed into another PostgreSQL database.",
    "challenge": "Write the command to dump source_db to dump.sql.",
    "starter": "pg_dump ",
    "solution": "pg_dump -h source_postgres -U postgres -d source_db -f dump.sql",
    "takeaway": "A full dump is simple and reliable for learning, but not always scalable.",
    "type": "text",
    "check": [
      "pg_dump",
      "source_postgres",
      "source_db",
      "dump.sql"
    ]
  },
  {
    "title": "Load with psql",
    "time": "01:26:00",
    "learn": "psql executes the dump against the destination database.",
    "bullets": [
      "`psql` is PostgreSQL's command-line client; here it executes the dump against the destination.",
      "`-h destination_postgres` selects the destination host.",
      "`-U postgres` chooses the database user.",
      "`-d destination_db` selects the target database.",
      "`-f dump.sql` executes SQL from the dump file.",
      "`-v ON_ERROR_STOP=1` makes SQL errors stop the load instead of silently continuing."
    ],
    "example": "psql \\\n  -h destination_postgres \\\n  -U postgres \\\n  -d destination_db \\\n  -v ON_ERROR_STOP=1 \\\n  -f /tmp/source_dump.sql",
    "output": "The destination database replays the dump. Any SQL error should fail the load.",
    "challenge": "Why use ON_ERROR_STOP=1?",
    "starter": "Because ...",
    "solution": "Because the load should fail instead of silently continuing after a SQL error.",
    "takeaway": "Reliable pipelines should fail loudly on partial-load errors.",
    "type": "text",
    "check": [
      "fail",
      "sql",
      "error"
    ]
  },
  {
    "title": "Validate the Load",
    "time": "01:29:00",
    "learn": "Process success is not the same as data correctness.",
    "bullets": [
      "Compare counts.",
      "Check uniqueness.",
      "Check freshness.",
      "Check control totals."
    ],
    "example": "SELECT COUNT(*) FROM orders;\nSELECT COUNT(*) - COUNT(DISTINCT order_id) FROM orders;\nSELECT MAX(order_date) FROM orders;",
    "output": "Completeness, duplicate, and freshness signals.",
    "challenge": "Write a query that counts duplicate order_id values.",
    "starter": "SELECT ",
    "solution": "SELECT COUNT(*) - COUNT(DISTINCT order_id) AS duplicate_order_ids FROM orders;",
    "takeaway": "Validate the data outcome, not only the command exit code.",
    "type": "sql",
    "sqlSolution": "SELECT COUNT(*) - COUNT(DISTINCT order_id) AS duplicate_order_ids FROM orders;"
  },
  {
    "title": "dbt: Why It Exists",
    "time": "01:31:03",
    "learn": "dbt manages SQL transformations as version-controlled models with dependencies, tests, and documentation.",
    "bullets": [
      "dbt is not the ingestion layer here.",
      "Models are SELECT statements.",
      "Lineage is created from source() and ref() dependencies."
    ],
    "example": "raw tables → staging models → marts",
    "output": "A managed transformation graph.",
    "challenge": "What does dbt own in this project?",
    "starter": "",
    "solution": "Transformations after loading, plus lineage and tests.",
    "takeaway": "dbt turns SQL transformations into a maintainable software project.",
    "type": "text",
    "check": [
      "transform",
      "lineage",
      "test"
    ]
  },
  {
    "title": "dbt Project & Profile",
    "time": "01:37:00",
    "learn": "dbt_project.yml defines project behavior; profiles.yml defines database connectivity.",
    "bullets": [
      "`dbt_project.yml` configures the dbt project itself: project name, model paths, defaults, and the profile name.",
      "`profiles.yml` contains connection targets such as host, port, user, database, schema, and environment.",
      "`dbt debug` verifies project/profile configuration and tests database connectivity.",
      "`dbt run` compiles and executes models in dependency order.",
      "`dbt test` executes data tests such as `not_null`, `unique`, and `relationships`.",
      "A useful debugging sequence is: `dbt debug` → `dbt run` → `dbt test`."
    ],
    "example": "dbt debug\n# Can dbt find the project/profile and connect?\n\ndbt run\n# Build the models\n\ndbt test\n# Validate the data assumptions",
    "output": "Connect → build → validate.",
    "challenge": "What command should you run first when dbt cannot connect?",
    "starter": "dbt ",
    "solution": "dbt debug",
    "takeaway": "Debug configuration before changing model SQL.",
    "type": "text",
    "check": [
      "dbt debug"
    ]
  },
  {
    "title": "dbt Sources & Staging",
    "time": "01:43:00",
    "learn": "Sources name raw external tables; staging models create a clean, source-aligned interface.",
    "bullets": [
      "source() references declared raw tables.",
      "Staging should usually preserve source grain.",
      "Use staging for naming, types, and simple cleanup."
    ],
    "example": "SELECT *\nFROM {{ source('raw', 'orders') }}",
    "output": "A dbt model reading the raw orders table.",
    "challenge": "Write the dbt source reference for raw.users.",
    "starter": "{{ source(",
    "solution": "{{ source('raw', 'users') }}",
    "takeaway": "Use source() for raw tables and keep staging thin.",
    "type": "text",
    "check": [
      "source('raw', 'users')"
    ]
  },
  {
    "title": "dbt ref() & Lineage",
    "time": "01:49:00",
    "learn": "ref() references another dbt model and declares the dependency.",
    "bullets": [
      "dbt builds the DAG from refs.",
      "Build order follows dependencies.",
      "Lineage becomes visible."
    ],
    "example": "SELECT *\nFROM {{ ref('stg_orders') }}",
    "output": "A downstream model depending on stg_orders.",
    "challenge": "Reference stg_users.",
    "starter": "{{ ",
    "solution": "{{ ref('stg_users') }}",
    "takeaway": "ref() is both a relation reference and a dependency declaration.",
    "type": "text",
    "check": [
      "ref('stg_users')"
    ]
  },
  {
    "title": "dbt Marts & Grain",
    "time": "01:54:00",
    "learn": "Marts are business-ready models with an explicit grain.",
    "bullets": [
      "customer_revenue is one row per customer.",
      "Aggregations should align to the target grain.",
      "Clear grain prevents metric ambiguity."
    ],
    "example": "customer_revenue: one row per user_id",
    "output": "Customer-level metrics such as total_revenue and order_count.",
    "challenge": "What is the grain of customer_revenue?",
    "starter": "One row per ...",
    "solution": "One row per customer/user.",
    "takeaway": "Every analytical model should have a one-sentence grain definition.",
    "type": "text",
    "check": [
      "customer"
    ]
  },
  {
    "title": "dbt Tests",
    "time": "01:59:00",
    "learn": "dbt tests turn assumptions into executable data checks.",
    "bullets": [
      "unique checks uniqueness.",
      "not_null checks required values.",
      "relationships checks referential integrity."
    ],
    "example": "tests:\n  - not_null\n  - unique",
    "output": "A failing assumption becomes a failing dbt test.",
    "challenge": "Which test catches orders whose user_id has no matching user?",
    "starter": "",
    "solution": "relationships",
    "takeaway": "Data quality improves when assumptions are executable.",
    "type": "text",
    "check": [
      "relationships"
    ]
  },
  {
    "title": "Cron Scheduling",
    "time": "02:04:11",
    "learn": "Cron schedules commands at fixed times.",
    "bullets": [
      "Cron has five scheduling fields before the command: minute, hour, day-of-month, month, day-of-week.",
      "`0 7 * * *` means minute 0, hour 7, every day of month, every month, every weekday.",
      "The command after the schedule is what actually runs.",
      "Cron is appropriate for simple time-based jobs, but it does not naturally provide rich dependency graphs, retries, backfills, or workflow history."
    ],
    "example": "0 7 * * * /path/to/run_elt.sh\n│ │ │ │ │\n│ │ │ │ └─ day of week: every\n│ │ │ └─── month: every\n│ │ └───── day of month: every\n│ └─────── hour: 7\n└───────── minute: 0",
    "output": "Run `/path/to/run_elt.sh` every day at 07:00.",
    "challenge": "What does 0 7 * * * mean?",
    "starter": "",
    "solution": "Run at 07:00 every day.",
    "takeaway": "Use the simplest scheduler that meets the operational need.",
    "type": "text",
    "check": [
      "07:00",
      "every day"
    ]
  },
  {
    "title": "Airflow: DAG Mental Model",
    "time": "02:07:54",
    "learn": "Airflow represents workflows as Directed Acyclic Graphs of dependent tasks.",
    "bullets": [
      "DAG = Directed Acyclic Graph: tasks are nodes and dependencies are directed edges.",
      "`elt >> dbt_run` means `dbt_run` is downstream of `elt` and should wait for it.",
      "Airflow schedules and tracks task execution; it does not perform the database transformation itself.",
      "If an upstream task fails, downstream tasks normally should not run unless trigger rules explicitly say otherwise."
    ],
    "example": "elt >> dbt_run >> dbt_test\n\n# Read as:\n# 1. run ELT\n# 2. if successful, build dbt models\n# 3. if successful, run dbt tests",
    "output": "An explicit dependency chain with observable task-level state.",
    "challenge": "Write a dependency chain: extract_load → transform → quality_check.",
    "starter": "extract_load ",
    "solution": "extract_load >> transform >> quality_check",
    "takeaway": "Airflow coordinates tasks; it does not replace the task tools.",
    "type": "text",
    "check": [
      "extract_load",
      ">> transform",
      ">> quality_check"
    ]
  },
  {
    "title": "Airflow Components",
    "time": "02:16:00",
    "learn": "Airflow is a system with scheduler, metadata database, web UI, and task execution components.",
    "bullets": [
      "Scheduler — decides which task instances are ready to run based on schedules and dependencies.",
      "Metadata database — stores DAG run, task instance, connection, and other Airflow operational state.",
      "Webserver/UI — lets you inspect DAGs, task history, logs, and run state.",
      "Executor/workers — execute the task instances according to the configured execution model."
    ],
    "example": "Scheduler → decides what should run\nMetadata DB → stores Airflow state\nWeb UI → inspect DAGs/runs/logs\nExecutor/Workers → execute tasks",
    "output": "Airflow is a control plane composed of several cooperating services.",
    "challenge": "Which Airflow component decides what tasks should run?",
    "starter": "",
    "solution": "Scheduler",
    "takeaway": "Understand the system roles before memorizing configuration.",
    "type": "text",
    "check": [
      "scheduler"
    ]
  },
  {
    "title": "Airflow Retries & Idempotency",
    "time": "02:25:00",
    "learn": "Retries are useful only when a task is safe to run again.",
    "bullets": [
      "Transient failures are normal.",
      "Idempotent tasks avoid duplicate side effects.",
      "Backfills also depend on rerunnable logic."
    ],
    "example": "default_args = {'retries': 2}",
    "output": "A failed task may be attempted again.",
    "challenge": "What property makes retries safer?",
    "starter": "",
    "solution": "Idempotency",
    "takeaway": "Design reruns before adding retries.",
    "type": "text",
    "check": [
      "idempot"
    ]
  },
  {
    "title": "Airbyte: Connector-Based Ingestion",
    "time": "02:41:14",
    "learn": "Airbyte provides reusable source and destination connectors for ingestion.",
    "bullets": [
      "It can reduce custom extractor code.",
      "It belongs primarily in the ingestion layer.",
      "Connector quality and schema behavior still matter."
    ],
    "example": "Source Connector → Airbyte → Destination Connector",
    "output": "Configured data movement without writing a bespoke extractor for every source.",
    "challenge": "Where does Airbyte fit: ingestion, transformation, or visualization?",
    "starter": "",
    "solution": "Ingestion",
    "takeaway": "Connector platforms reduce custom movement code, not the need for engineering judgment.",
    "type": "text",
    "check": [
      "ingestion"
    ]
  },
  {
    "title": "Airbyte Sync Modes",
    "time": "02:49:00",
    "learn": "Full refresh re-reads the whole dataset; incremental sync tracks state and reads only new or changed data.",
    "bullets": [
      "Incremental sync needs a trustworthy cursor/state.",
      "Deduping often needs a stable key.",
      "Updates to old rows require an update-aware cursor or CDC."
    ],
    "example": "Full refresh → all rows\nIncremental → rows after stored cursor",
    "output": "Different cost and correctness trade-offs.",
    "challenge": "If old rows can be updated later, which is more useful: created_at only or updated_at/CDC?",
    "starter": "",
    "solution": "updated_at or CDC",
    "takeaway": "Incremental ingestion requires reliable change tracking.",
    "type": "text",
    "check": [
      "updated_at",
      "cdc"
    ]
  },
  {
    "title": "Build vs Buy Ingestion",
    "time": "02:55:00",
    "learn": "Custom code gives control; connector platforms reduce standard integration maintenance.",
    "bullets": [
      "Custom code means you own auth, pagination, retries, schema drift, and rate limits.",
      "Managed connectors can accelerate common sources.",
      "Choose based on total operational cost."
    ],
    "example": "Custom Python → more control, more maintenance\nConnector platform → faster standard setup, less bespoke control",
    "output": "A trade-off, not a universal winner.",
    "challenge": "A mature connector exists for a standard SaaS source with no special logic. What should you evaluate first?",
    "starter": "",
    "solution": "Use/evaluate the mature connector before building custom ingestion.",
    "takeaway": "Optimize for requirements and maintenance burden, not for the amount of code you write.",
    "type": "text",
    "check": [
      "connector"
    ]
  },
  {
    "title": "Beyond the Video: Idempotency",
    "time": "03:01:54",
    "learn": "Idempotency means repeating the same intended operation does not corrupt state or create unintended duplicates.",
    "bullets": [
      "Important for retries.",
      "Important for backfills.",
      "Can be achieved with replace, MERGE/UPSERT, dedupe, or stable checkpoints."
    ],
    "example": "Bad retry → append same batch twice\nSafer retry → merge by stable key",
    "output": "Reruns produce the same correct state.",
    "challenge": "Why is idempotency important in pipelines?",
    "starter": "Because ...",
    "solution": "Because retries and reruns are normal, and they should not create duplicate or corrupted data.",
    "takeaway": "Recovery is only safe when side effects are designed for reruns.",
    "type": "text",
    "check": [
      "retry",
      "duplicate"
    ]
  },
  {
    "title": "Beyond the Video: Incremental Loads & CDC",
    "time": "03:01:54",
    "learn": "Production pipelines often move only new or changed records instead of full snapshots.",
    "bullets": [
      "Watermarks track successful progress.",
      "CDC captures inserts, updates, and deletes.",
      "Advance checkpoints only after successful load and validation."
    ],
    "example": "SELECT *\nFROM orders\nWHERE updated_at > :last_watermark;",
    "output": "Only changed rows are extracted.",
    "challenge": "When should a watermark advance?",
    "starter": "",
    "solution": "After the batch loads and validates successfully.",
    "takeaway": "Incremental loading saves work but adds state management.",
    "type": "text",
    "check": [
      "after",
      "validat"
    ]
  },
  {
    "title": "Beyond the Video: Observability",
    "time": "03:01:54",
    "learn": "Observability must cover both pipeline execution and data health.",
    "bullets": [
      "Operational: status, duration, retries, errors.",
      "Data: freshness, volume, duplicates, nulls, test failures.",
      "Alerts should be actionable."
    ],
    "example": "Operational metric: run duration\nData metric: max loaded timestamp",
    "output": "You know whether the job ran and whether the resulting data is usable.",
    "challenge": "Give one operational metric and one data-health metric.",
    "starter": "Operational: \nData: ",
    "solution": "Operational: pipeline run duration\nData: freshness / max loaded timestamp",
    "takeaway": "Healthy infrastructure does not guarantee healthy data.",
    "type": "text",
    "check": [
      "operational",
      "data"
    ]
  },
  {
    "title": "Final Mental Model",
    "time": "03:01:54",
    "learn": "The whole course reduces to a small set of responsibilities that transfer to other stacks.",
    "bullets": [
      "Docker → reproducible runtime.",
      "SQL → relational inspection and manipulation.",
      "Custom ELT/Airbyte → ingestion.",
      "dbt → transformations/tests/lineage.",
      "Cron/Airflow → scheduling/orchestration."
    ],
    "example": "Source → Ingestion → Raw → Transform → Serve\n           ↑        Quality + Observability",
    "output": "A reusable architecture mental model.",
    "challenge": "Write a 5-line summary of the pipeline and why each layer exists.",
    "starter": "1.\n2.\n3.\n4.\n5.",
    "solution": "1. Source produces operational data.\n2. Ingestion moves it reliably.\n3. Raw storage preserves it.\n4. dbt transforms it into tested models.\n5. Cron/Airflow schedules and observes the workflow.",
    "takeaway": "If you can reconstruct the architecture from requirements, you learned the course.",
    "type": "text",
    "check": [
      "source",
      "ingestion",
      "storage",
      "dbt",
      "airflow"
    ]
  }
];