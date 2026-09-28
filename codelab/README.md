# Abed Codelab — Data Engineering

A browser-based companion to the repository's complete Data Engineering 101 reference.

**Live:** https://abed-dvp.github.io/data-engineering-course/

## Learning flow

The Codelab deliberately mirrors the style of `python-as-fast-as-possible`:

1. **Learn** the concept.
2. Inspect a concise **example**.
3. Read what the example produces or demonstrates.
4. Complete **Your Turn**.
5. Run/preview your answer.
6. Use **Check answer**.
7. Reveal a solution only when needed.
8. Finish with a **Key takeaway**.

## What is interactive

### SQL steps

SQL lessons run against a small in-browser database using **sql.js / SQLite WebAssembly**.

You can:

- edit SQL,
- run it,
- inspect table results,
- check your query against the target result.

### Docker / ELT / dbt / Airflow / Airbyte steps

These concepts cannot realistically run as Docker daemons, PostgreSQL servers, or Airflow inside a static GitHub Pages site.

For these steps, the editor is used for:

- commands,
- configuration,
- architecture answers,
- debugging decisions,
- dbt syntax,
- Airflow dependency expressions.

**Check answer** verifies the important core elements of the answer.

The actual runnable infrastructure lives in the repository itself.

## Source of truth

The Codelab is not a separate course.

The canonical learning source is:

- the complete root `README.md`,
- the real project files,
- this Codelab as the interactive version of the same sequence.

## Course order

The core path follows the source video:

- Why Data Engineering
- Docker
- SQL
- Custom ELT Pipeline
- dbt
- Cron
- Airflow
- Airbyte

Additional lessons after the core course cover:

- idempotency
- incremental loads / CDC
- observability

These are labeled **Beyond the Video**.

## Progress

Completion and exercise answers are stored locally in your browser using `localStorage`.

No backend is required.
