import mysql.connector # type: ignore
import mysql.connector.pooling # type: ignore
import os

is_dev_mode = os.getenv('IS_DEV_MODE', 'false').lower() == 'true'

print(is_dev_mode)
mysql_config = {
    'host': 'localhost' if is_dev_mode else 'host.docker.internal',
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE'),
}

# Create a connection pool
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=10,  # Adjust the pool size as needed
    **mysql_config
)