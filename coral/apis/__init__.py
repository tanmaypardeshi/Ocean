from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_mail import Mail

app = Flask(__name__)
app.config['SECRET_KEY'] = '1ac7f040338d0f5af035aeb5f160a9e2'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coral.db'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'credenzuser@gmail.com'
app.config['MAIL_PASSWORD'] = 'credenztechdays'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
cors = CORS(app, resources={
    r"/*": {
        "origins": "*"
    }
})

from apis import routes
