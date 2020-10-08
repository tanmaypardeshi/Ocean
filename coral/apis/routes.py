import random
import secrets
import json
from apis import app, db, bcrypt, mail
from flask import jsonify, request, render_template
from flask_mail import Message

from .models import User


@app.route("/", methods=["GET"])
@app.route("/home/", methods=["GET"])
def home():
    return render_template('home.html')


@app.route("/getkey/", methods=["GET", "POST"])
def getkey():
    if request.method == 'GET':
        return render_template('getkey.html')
    name = request.form['name']
    email = request.form['email']
    if not name:
        return render_template('getkey.html', error='Please enter name')
    if not email:
        return render_template('getkey.html', error='Please enter email')
    apikey = secrets.token_hex(16)
    password = bcrypt.generate_password_hash(apikey).decode('utf-8')
    try:
        user = User(email=email, name=name, password=password)
        db.session.add(user)
        db.session.commit()
        msg = Message('API Key for Coral',
                      sender='credenzuser@gmail.com',
                      recipients=[email])
        msg.body = f"Your API Key is {apikey}."
        mail.send(msg)
        return render_template('getkey.html', apikey=f'API Key sent to your {email}')
    except:
        return render_template('getkey.html', error=f'API key for {email} already exists')


@app.route("/api/chat/", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        email = data['email']
        user = User.query.filter_by(email=email).first()
        check_key = user.password
        key = data['key']
        if bcrypt.check_password_hash(check_key, key):
            message = data['message']
            messages = ['Okay Boomer', 'Hi there',
                        'Nobody Cares', 'Sad Life',
                        'I am gonna pretend I didnt see that']
            msg = random.choice(messages)
            return jsonify({'reply': msg}, 200)
        return jsonify({'reply': 'Not authenticated'}, 401)
    except Exception as e:
        return jsonify({'reply': e.__str__()}, 400)

