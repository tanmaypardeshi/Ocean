import os
import random
import json
import secrets
import torch

from apis import app, db, bcrypt, mail
from flask import jsonify, request, render_template
from flask_mail import Message

from .models import User

from transformers import (
    AutoModelWithLMHead,
    AutoTokenizer,
)

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
model = AutoModelWithLMHead.from_pretrained(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'bot'))

with open(os.getcwd() + '/apis/coral_config.json') as config_file:
    config = json.load(config_file)

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
                        sender=config.get('EMAIL'),
                        recipients=[email])
        msg.body = f"Your API Key is {apikey}."
        mail.send(msg)
        return render_template('getkey.html', apikey=f'API Key sent to {email}')
    except:
        return render_template('getkey.html', apikey=f'API Key for {email} already exists')

@app.route("/api/chat/", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        email = data['email']
        user = User.query.filter_by(email=email).first()
        check_key = user.password
        key = data['key']
        if bcrypt.check_password_hash(check_key, key):
            counter = data['counter']
            string1 = data['string1']
            string2 = data['string2']
            string3 = data['string3']
            reply = Coral(counter, string1, string2, string3)
            return jsonify({'reply': reply}, 200)
        return jsonify({'reply': 'Not authenticated'}, 401)
    except Exception as e:
        return jsonify({'reply': e.__str__()}, 400)


def Coral(step, string1="", string2="", string3=""):
    if step % 2 == 1:
        new_user_input_ids1 = tokenizer.encode(string1 + tokenizer.eos_token, return_tensors='pt')
        bot_input_ids = new_user_input_ids1
        chat_history_ids = model.generate(
            bot_input_ids, max_length=1000,
            pad_token_id=tokenizer.eos_token_id,
            top_p=0.92, top_k=50)
        return tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)

    if step % 2 == 0:
        new_user_input_ids1 = tokenizer.encode(string1 + tokenizer.eos_token, return_tensors='pt')
        new_user_input_ids2 = tokenizer.encode(string2 + tokenizer.eos_token, return_tensors='pt')
        new_user_input_ids3 = tokenizer.encode(string3 + tokenizer.eos_token, return_tensors='pt')
        bot_input_ids = torch.cat([new_user_input_ids1, new_user_input_ids2], dim=-1)
        bot_input_ids = torch.cat([bot_input_ids, new_user_input_ids3], dim=-1)
        chat_history_ids = model.generate(
            bot_input_ids, max_length=1000,
            pad_token_id=tokenizer.eos_token_id,
            top_p=0.92, top_k=50)
        return tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
