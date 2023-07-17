from cripto_wallet import app
from flask import render_template, request
from cripto_wallet.models import DAOSqlite, Calculs, coin_options
import sqlite3


dao = DAOSqlite(app.config.get("PATH_SQLITE"))
calculs = Calculs()

@app.route("/")
def index():
    return render_template("index.html",page="Transactions", actual_page="index")


@app.route("/api/v1/transactions")
def all_transactions():
    try:
        transactions = dao.get_all_transactions()
        response = {
            "ok": True,
            "data": transactions,
            "coin_options": coin_options
        }
        return response
    except sqlite3.Error as e:
        response = {
            "ok": False,
            "data": str(e)
        }
        return response, 400

@app.route("/api/v1/rate/<From_Coin>/<To_Coin>/<Amount_From>")
def get_rate(From_Coin, To_Coin, Amount_From):
    try:
        status, error_info = calculs.get_rate(From_Coin, To_Coin, Amount_From)
        if status:
            response = {
                "ok": True,
                "data": calculs.data_to_dict()
            }
            return response
        else:
            response = {
                "ok": False,
                "data": error_info
            }
            return response, 400
    except ValueError as e:
        response = {
            "ok": False,
            "data": str(e)
        }
        return response, 400
