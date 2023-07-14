from cripto_wallet import app
from flask import render_template



@app.route("/")
def index():
    return render_template("index.html",page="Transactions", actual_page="index")