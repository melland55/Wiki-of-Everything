from flask import Flask # type: ignore
from flask_cors import CORS # type: ignore
from routes import setup_routes


app = Flask(__name__)
CORS(app)

setup_routes(app)
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
