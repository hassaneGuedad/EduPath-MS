FROM ghcr.io/mlflow/mlflow:v2.9.2

# Installer psycopg2 pour la connexion PostgreSQL
RUN pip install --no-cache-dir psycopg2-binary==2.9.9

EXPOSE 5000

CMD ["mlflow", "server", "--host", "0.0.0.0", "--port", "5000", "--backend-store-uri", "postgresql://edupath:edupath123@postgres:5432/mlflow_db", "--default-artifact-root", "/mlflow/artifacts"]

