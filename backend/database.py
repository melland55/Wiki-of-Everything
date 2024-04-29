import mysql.connector # type: ignore
import mysql.connector.pooling # type: ignore

# MySQL configuration
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'WikiOfEverything'
}

# Create a connection pool
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=5,  # Adjust the pool size as needed
    **mysql_config
)