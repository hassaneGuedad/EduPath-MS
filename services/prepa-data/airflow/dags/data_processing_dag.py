"""
DAG Airflow pour le traitement quotidien des données PrepaData
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
import requests
import os

default_args = {
    'owner': 'edupath',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'prepa_data_processing',
    default_args=default_args,
    description='Traitement quotidien des données étudiants',
    schedule_interval=timedelta(hours=6),  # Toutes les 6 heures
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['edupath', 'data-processing'],
)

def sync_lms_data():
    """Synchronise les données depuis LMSConnector"""
    lms_url = os.getenv('LMS_CONNECTOR_URL', 'http://lms-connector:3001')
    try:
        response = requests.get(f'{lms_url}/sync', timeout=30)
        response.raise_for_status()
        print(f"✅ LMS data synced: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Error syncing LMS data: {e}")
        raise

def process_student_features():
    """Traite les features pour tous les étudiants"""
    prepa_url = os.getenv('PREPA_DATA_URL', 'http://prepa-data:3002')
    # Dans un vrai scénario, on récupérerait la liste des étudiants depuis la DB
    student_ids = [1, 2, 3, 4, 5]  # Exemple
    
    processed = 0
    for student_id in student_ids:
        try:
            response = requests.get(f'{prepa_url}/features/{student_id}', timeout=10)
            if response.status_code == 200:
                processed += 1
                print(f"✅ Processed student {student_id}")
        except Exception as e:
            print(f"❌ Error processing student {student_id}: {e}")
    
    print(f"✅ Processed {processed}/{len(student_ids)} students")
    return processed

def log_processing_results(**context):
    """Log les résultats du traitement"""
    ti = context['ti']
    processed = ti.xcom_pull(task_ids='process_features')
    print(f"📊 Processing completed: {processed} students processed")

# Tâches
sync_task = PythonOperator(
    task_id='sync_lms_data',
    python_callable=sync_lms_data,
    dag=dag,
)

process_task = PythonOperator(
    task_id='process_features',
    python_callable=process_student_features,
    dag=dag,
)

log_task = PythonOperator(
    task_id='log_results',
    python_callable=log_processing_results,
    dag=dag,
)

# Définir l'ordre d'exécution
sync_task >> process_task >> log_task

