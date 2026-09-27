import os
import subprocess
import time


def env(name, default=None):
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


POSTGRES_USER = env("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = env("POSTGRES_PASSWORD", "secret")
SOURCE_DB = env("SOURCE_DB", "source_db")
DESTINATION_DB = env("DESTINATION_DB", "destination_db")
SOURCE_HOST = env("SOURCE_HOST", "source_postgres")
DESTINATION_HOST = env("DESTINATION_HOST", "destination_postgres")


def run(command, password):
    process_env = os.environ.copy()
    process_env["PGPASSWORD"] = password
    print("$", " ".join(command), flush=True)
    subprocess.run(command, env=process_env, check=True)


def wait_for_postgres(host, database, retries=20, delay=2):
    for attempt in range(1, retries + 1):
        result = subprocess.run(
            ["pg_isready", "-h", host, "-U", POSTGRES_USER, "-d", database],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"{host}/{database} is ready.")
            return
        print(f"Waiting for {host}/{database} ({attempt}/{retries})...")
        time.sleep(delay)
    raise RuntimeError(f"PostgreSQL at {host}/{database} did not become ready")


def main():
    wait_for_postgres(SOURCE_HOST, SOURCE_DB)
    wait_for_postgres(DESTINATION_HOST, DESTINATION_DB)

    dump_file = "/tmp/source_dump.sql"

    run(
        [
            "pg_dump",
            "-h", SOURCE_HOST,
            "-U", POSTGRES_USER,
            "-d", SOURCE_DB,
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            "-f", dump_file,
        ],
        POSTGRES_PASSWORD,
    )

    run(
        [
            "psql",
            "-h", DESTINATION_HOST,
            "-U", POSTGRES_USER,
            "-d", DESTINATION_DB,
            "-v", "ON_ERROR_STOP=1",
            "-f", dump_file,
        ],
        POSTGRES_PASSWORD,
    )

    run(
        [
            "psql",
            "-h", DESTINATION_HOST,
            "-U", POSTGRES_USER,
            "-d", DESTINATION_DB,
            "-c", "SELECT COUNT(*) AS users_loaded FROM users; SELECT COUNT(*) AS orders_loaded FROM orders;",
        ],
        POSTGRES_PASSWORD,
    )

    print("ELT completed successfully.")


if __name__ == "__main__":
    main()
