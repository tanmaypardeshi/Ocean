import json
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_mail import Mail

with open(os.getcwd() + '/apis/coral_config.json') as config_file:
    config = json.load(config_file)

app = Flask(__name__)
app.config['SECRET_KEY'] = config.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = config.get('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = config.get('EMAIL')
app.config['MAIL_PASSWORD'] = config.get('PASSWORD')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
cors = CORS(app, resources={
    r"/*": {
        "origins": "*"
    }
})

from apis import routes
