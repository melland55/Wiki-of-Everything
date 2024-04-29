from flask import Flask # type: ignore
from routes import generate_summary, generate_section_content
from flask_cors import CORS # type: ignore
from routes import setup_routes
import mysql.connector # type: ignore


app = Flask(__name__)
CORS(app)

setup_routes(app)
    
if __name__ == '__main__':
    app.run(debug=True)
