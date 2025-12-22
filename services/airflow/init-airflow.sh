#!/bin/bash
set -e

echo "Initializing Airflow database..."
airflow db migrate

echo "Creating admin user..."
airflow users create \
    --username admin \
    --firstname Admin \
    --lastname User \
    --role Admin \
    --email admin@edupath.com \
    --password admin || echo "User may already exist"

echo "Airflow initialization complete!"

