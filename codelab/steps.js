window.DE_STEPS = [
  {
    title: "What Data Engineering Does",
    intro: "Understand the job before learning the tools.",
    learn: [
      "Data engineers move, organize, validate, and serve data for downstream users and systems.",
      "A useful mental model is Source → Ingestion → Storage → Transformation → Serving.",
      "Orchestration coordinates when and in what order pipeline tasks run."
    ],
    challenge: "Which layer should usually own business-ready transformations in an ELT architecture?",
    options: ["Source system", "Transformation layer / warehouse", "Client browser", "Docker network"],
    answer: 1,
    takeaway: "Tools change. The pipeline stages and engineering concerns are the durable concepts."
  },
  {
    title: "ETL vs ELT",
    intro: "Learn the sequencing difference that shapes modern analytics stacks.",
    learn: [
      "ETL = Extract → Transform → Load.",
      "ELT = Extract → Load → Transform.",
      "ELT works well when the destination warehouse has strong compute and SQL capabilities."
    ],
    challenge: "In this repository, where does transformation happen?",
    options: ["Before extraction", "Inside the source database only", "After loading into the destination", "Inside Docker Compose"],
    answer: 2,
    takeaway: "This project uses ELT: load raw data first, transform later with dbt."
  },
  {
    title: "Docker Mental Model",
    intro: "Use containers to make the learning environment reproducible.",
    learn: [
      "An image is a packaged template; a container is a running instance.",
      "Docker Compose defines several services together.",
      "Services on the same Compose network can address each other by service name."
    ],
    challenge: "From the ELT container, which hostname should connect to the source database?",
    options: ["localhost", "127.0.0.1", "source_postgres", "5433"],
    answer: 2,
    takeaway: "Inside Compose, use service names—not localhost—to reach sibling containers."
  },
  {
    title: "Docker Compose",
    intro: "Model the source, destination, and ELT worker as one reproducible system.",
    learn: [
      "source_postgres exposes host port 5433.",
      "destination_postgres exposes host port 5434.",
      "The ELT service depends on both databases being healthy."
    ],
    challenge: "Why do the two Postgres services map to different host ports?",
    options: ["Postgres requires two ports", "To avoid port collisions on the host", "Docker cannot use 5432", "dbt requires 5434"],
    answer: 1,
    takeaway: "Both containers can use 5432 internally while the host maps them to distinct ports."
  },
  {
    title: "PostgreSQL Source Data",
    intro: "Treat the source database as an operational system you do not transform destructively.",
    learn: [
      "The source contains users and orders.",
      "Primary keys identify rows; foreign keys encode relationships.",
      "The pipeline should copy data without changing the source."
    ],
    challenge: "Which key connects orders to users?",
    options: ["order_id", "email", "user_id", "status"],
    answer: 2,
    takeaway: "Understand source keys and grain before moving data."
  },
  {
    title: "Wait for Dependencies",
    intro: "A pipeline should not assume infrastructure is ready instantly.",
    learn: [
      "Containers can start before their services are actually ready.",
      "pg_isready checks PostgreSQL availability.",
      "Retries make startup timing more robust."
    ],
    challenge: "What problem does wait_for_postgres solve?",
    options: ["Schema design", "Race conditions during startup", "SQL formatting", "Docker image size"],
    answer: 1,
    takeaway: "Readiness checks prevent the pipeline from failing just because a dependency needs a few seconds."
  },
  {
    title: "Extract with pg_dump",
    intro: "Extract the source database into a portable SQL dump.",
    learn: [
      "pg_dump exports schema and data from PostgreSQL.",
      "The dump is an intermediate artifact in this simple batch pipeline.",
      "Production pipelines often use incremental extraction instead of full dumps."
    ],
    challenge: "Which command performs extraction in this project?",
    options: ["psql", "pg_dump", "dbt run", "docker network"],
    answer: 1,
    takeaway: "Extraction means reading from the source and producing transferable data."
  },
  {
    title: "Load with psql",
    intro: "Load the extracted dump into the destination PostgreSQL database.",
    learn: [
      "psql can execute the SQL dump against the destination.",
      "ON_ERROR_STOP makes the load fail fast when SQL errors occur.",
      "A successful command is not enough; validate row counts afterward."
    ],
    challenge: "Why use ON_ERROR_STOP?",
    options: ["To compress the dump", "To stop the pipeline on SQL failure", "To start PostgreSQL", "To transform with dbt"],
    answer: 1,
    takeaway: "Pipelines should fail loudly instead of silently producing partial data."
  },
  {
    title: "Validate the Load",
    intro: "A pipeline is not done merely because a command returned exit code 0.",
    learn: [
      "Compare row counts and important invariants.",
      "Validate expected tables and schema.",
      "Production validation should include freshness and quality checks."
    ],
    challenge: "What is the strongest validation among these options?",
    options: ["Container is running", "Log says completed", "Source and destination checks match expected data", "File exists"],
    answer: 2,
    takeaway: "Validate the data outcome, not only the process."
  },
  {
    title: "dbt: Why Transform in SQL",
    intro: "Move analytics transformations into a version-controlled model layer.",
    learn: [
      "dbt turns SELECT statements into managed models.",
      "ref() expresses dependencies between models.",
      "Tests and documentation live near transformation code."
    ],
    challenge: "What does dbt mainly handle in this project?",
    options: ["Source extraction", "Transformation after loading", "Docker networking", "Postgres installation"],
    answer: 1,
    takeaway: "dbt manages transformations, lineage, and data tests—not ingestion."
  },
  {
    title: "dbt Sources & Staging",
    intro: "Create a clean interface between raw tables and downstream models.",
    learn: [
      "source() points to raw destination tables.",
      "Staging models standardize naming, types, and simple cleanup.",
      "Keep staging models close to source grain."
    ],
    challenge: "Which layer should usually standardize email casing and basic column cleanup?",
    options: ["Staging", "Dashboard", "Source application", "Airflow scheduler"],
    answer: 0,
    takeaway: "Staging models create a clean, predictable contract for downstream transformations."
  },
  {
    title: "dbt Marts",
    intro: "Build business-ready tables from staged data.",
    learn: [
      "The customer_revenue mart has one row per customer.",
      "It aggregates paid orders into revenue metrics.",
      "Marts should have an explicit grain and clear business meaning."
    ],
    challenge: "What is the grain of customer_revenue?",
    options: ["One row per order", "One row per day", "One row per customer", "One row per country"],
    answer: 2,
    takeaway: "Always be able to state a model's grain in one sentence."
  },
  {
    title: "dbt Tests",
    intro: "Turn important data assumptions into executable checks.",
    learn: [
      "unique checks key uniqueness.",
      "not_null checks required values.",
      "relationships checks referential integrity between models."
    ],
    challenge: "Which test catches an order referencing a non-existent user?",
    options: ["unique", "relationships", "not_null", "accepted_values"],
    answer: 1,
    takeaway: "Data tests encode contracts that would otherwise live only in people's heads."
  },
  {
    title: "Cron",
    intro: "Use the simplest scheduler that meets the requirement.",
    learn: [
      "Cron is lightweight and built for time-based execution.",
      "It works well for simple jobs with few dependencies.",
      "It lacks the richer workflow visibility and dependency graph of an orchestrator."
    ],
    challenge: "When is Cron a reasonable choice?",
    options: ["Complex DAG with 40 dependencies", "Simple daily script with minimal dependencies", "Streaming events", "Interactive SQL notebook"],
    answer: 1,
    takeaway: "Do not introduce a heavy orchestrator when a simple scheduler is enough."
  },
  {
    title: "Airflow DAGs",
    intro: "Represent a workflow as tasks and dependencies.",
    learn: [
      "A DAG defines task dependencies without cycles.",
      "Retries and historical task runs improve operational control.",
      "A simple chain here is ELT → dbt run → dbt test."
    ],
    challenge: "What should happen if the ELT task fails?",
    options: ["dbt should still transform partial data", "Downstream dbt tasks should not run", "Delete the source", "Restart Docker Desktop manually"],
    answer: 1,
    takeaway: "Orchestration protects dependency order and makes failures observable."
  },
  {
    title: "Airbyte",
    intro: "Compare custom ingestion with a connector-based platform.",
    learn: [
      "Airbyte provides many ready-made source and destination connectors.",
      "It can reduce custom code for standard integrations.",
      "Custom ingestion remains useful when requirements are highly specialized."
    ],
    challenge: "What is the core build-vs-buy trade-off?",
    options: ["Python vs SQL syntax", "Control and customization vs setup/maintenance speed", "Linux vs Windows", "Batch vs primary keys"],
    answer: 1,
    takeaway: "Choose tooling based on maintenance burden and requirements, not popularity."
  },
  {
    title: "Idempotency",
    intro: "Design jobs so rerunning them does not corrupt or duplicate data.",
    learn: [
      "Retries are normal in production pipelines.",
      "A rerun should produce the same correct state whenever possible.",
      "Full reload, upsert, merge, and checkpoint strategies can support idempotency."
    ],
    challenge: "Why is idempotency important?",
    options: ["It makes SQL shorter", "Retries become safer", "It removes the need for monitoring", "It replaces dbt tests"],
    answer: 1,
    takeaway: "If a job may retry, design its side effects deliberately."
  },
  {
    title: "Incremental Loads",
    intro: "Understand why production pipelines usually avoid copying everything every run.",
    learn: [
      "Full reloads are simple but become expensive at scale.",
      "Incremental strategies move only new or changed records.",
      "Common techniques include timestamps, watermarks, CDC, and change logs."
    ],
    challenge: "Which is an incremental extraction strategy?",
    options: ["Dump every row every hour", "Load records newer than the last successful watermark", "Rebuild Docker images", "Run dbt docs"],
    answer: 1,
    takeaway: "Incremental loading reduces data movement and compute at the cost of more state management."
  },
  {
    title: "Observability",
    intro: "Know whether the pipeline is healthy before users report broken data.",
    learn: [
      "Track run status, duration, freshness, row volume, and data quality.",
      "Alert on meaningful failures and anomalies.",
      "Logs alone are helpful but are not a complete observability strategy."
    ],
    challenge: "Which metric best detects stale data?",
    options: ["Docker image size", "Data freshness / last successful load time", "Number of SQL keywords", "Git commit count"],
    answer: 1,
    takeaway: "A production pipeline needs visibility into both system health and data health."
  },
  {
    title: "Final Architecture",
    intro: "Reconstruct the entire system without relying on tool names.",
    learn: [
      "Source → ingestion → raw destination → transformation → serving.",
      "Orchestration coordinates tasks and retries.",
      "Quality and observability cut across every stage."
    ],
    challenge: "Which explanation is strongest in an interview?",
    options: [
      "I used Docker, dbt, and Airflow because they are popular.",
      "I chose components based on ingestion, transformation, orchestration, failure recovery, and data-quality needs.",
      "I memorized the commands.",
      "I would always use Airflow."
    ],
    answer: 1,
    takeaway: "Explain architecture through requirements and trade-offs, not through a list of tools."
  }
];