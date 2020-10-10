import os
import random
import secrets
import torch

from apis import app, db, bcrypt, mail
from flask import jsonify, request, render_template
from flask_mail import Message

from .models import User

from sklearn.model_selection import train_test_split
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import DataLoader, Dataset, RandomSampler, SequentialSampler
from torch.utils.data.distributed import DistributedSampler
from tqdm.notebook import tqdm, trange

from transformers import (
    MODEL_WITH_LM_HEAD_MAPPING,
    WEIGHTS_NAME,
    AdamW,
    AutoConfig,
    AutoModelWithLMHead,
    AutoTokenizer,
    PreTrainedModel,
    PreTrainedTokenizer,
    get_linear_schedule_with_warmup,
)

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
model = AutoModelWithLMHead.from_pretrained("/home/tanmay/Code/Ocean/coral/bot/")


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
            counter = data['counter']
            chat_history = data['chat_history']
            print(message)
            print(counter)
            print(chat_history)
            reply = Coral(message, counter, chat_history)
            return jsonify({'reply': reply}, 200)
        return jsonify({'reply': 'Not authenticated'}, 401)
    except Exception as e:
        return jsonify({'reply': e.__str__()}, 400)


def Coral(text, step, prev_text):
    new_user_input_ids = tokenizer.encode(text + tokenizer.eos_token, return_tensors='pt')

    if step % 2 == 0:
        chat_history = tokenizer.encode(prev_text + tokenizer.eos_token, return_tensors='pt')

    bot_input_ids = torch.cat([chat_history, new_user_input_ids], dim=-1) if step % 2 == 0 else new_user_input_ids

    chat_history_ids = model.generate(
        bot_input_ids, max_length=1000,
        pad_token_id=tokenizer.eos_token_id,
        top_p=0.92, top_k=50)

    return tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
