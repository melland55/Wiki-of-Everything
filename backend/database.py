import mysql.connector # type: ignore
import mysql.connector.pooling # type: ignore
import os

# MySQL configuration
mysql_config = {
    #'host': os.getenv('MYSQL_HOST'),
    'host': 'host.docker.internal',
    #'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'WikiOfEverything'
}

# Create a connection pool
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=10,  # Adjust the pool size as needed
    **mysql_config
)