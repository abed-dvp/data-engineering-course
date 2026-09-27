from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "data-engineering",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="elt_and_dbt",
    description="Simple batch ELT followed by dbt transformations",
    start_date=datetime(2026, 1, 1),
    schedule="0 7 * * *",
    catchup=False,
    default_args=default_args,
    tags=["learning", "elt"],
) as dag:
    elt = BashOperator(
        task_id="run_elt",
        bash_command="cd /opt/project && docker compose up --build --abort-on-container-exit elt_script",
    )

    dbt_run = BashOperator(
        task_id="dbt_run",
        bash_command="cd /opt/project/dbt_project && dbt run",
    )

    dbt_test = BashOperator(
        task_id="dbt_test",
        bash_command="cd /opt/project/dbt_project && dbt test",
    )

    elt >> dbt_run >> dbt_test
