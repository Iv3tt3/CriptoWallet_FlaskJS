from cripto_wallet import app
from flask import render_template
from cripto_wallet.models import DAOSqlite
import sqlite3


dao = DAOSqlite(app.config.get("PATH_SQLITE"))

@app.route("/")
def index():
    return render_template("index.html",page="Transactions", actual_page="index")


@app.route("/api/v1/transactions")
def all_transactions():
    try:
        transactions = dao.get_all_transactions()
        response = {
            "ok": True,
            "data": transactions
        }
        return response
    except sqlite3.Error as e:
        response = {
            "ok": False,
            "data": str(e)
        }
        return response, 400