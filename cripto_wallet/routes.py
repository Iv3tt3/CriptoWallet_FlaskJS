from cripto_wallet import app
from flask import render_template, request, redirect, url_for
from cripto_wallet.models import DAOSqlite, calculator
import sqlite3

dao = DAOSqlite(app.config.get("PATH_SQLITE"))

@app.route("/")
def index():
    try:
        return render_template("index.html")
    except:
        return redirect("/fatalerror")
    
@app.route("/fatalerror")
def fatal_error():
    return render_template("fatalerror.html")

@app.route("/api/v1/transactions")
def all_transactions():
    try:
        transactions = dao.get_all_transactions()

        coin_options = app.config.get("COIN_OPTIONS_LIST")
        response = {
            "ok": True,
            "data": transactions,
            "coin_options": coin_options
        }
        return response
    except sqlite3.Error as e:
        response = {
            "ok": False,
            "data": "Database error. Please, contact support\nerror info: " + str(e)
        }
        return response, 400
    except ValueError as e:
        response = {
            "ok": False,
            "data": "Please, contact support\nerror info:" + str(e)
        }
        return response, 400

@app.route("/api/v1/rate/<From_Coin>/<To_Coin>/<Amount_From>")
def get_rate(From_Coin, To_Coin, Amount_From):
    status, data = calculator.get_rate(From_Coin, To_Coin, Amount_From)
    if status:
        response = {
            "ok": True,
            "data": data
        }
        return response
    else:
        response = {
            "ok": False,
            "data": "Calculator is not avaliable at this moment.\nPlease contact support.\n\nError in CoinAPI.io request.\nMore info: " + data
        }
        return response, 400

@app.route("/api/v1/insert", methods=["POST"])
def insert_transaction():
    try:
        data_validation, error_info = calculator.validate_data(
            request.json.get("Amount_From"), 
            request.json.get("From_Coin"),
            request.json.get("To_Coin"),
            request.json.get("Amount_To"),
            )
        if data_validation:
            try:
                dao.insert_transaction(calculator)
                response = {
                    "ok": True,
                    "data": "Purchase order completed"
                }
                return response, 201
            
            except sqlite3.Error as e:
                response = {
                    "ok": False,
                    "data": "Unexpected error: DB is currently not available.\nPlease contact support\n\nMore info: " + e
                }
                return response, 400

        else:
            response = {
                    "ok": False,
                    "data": error_info
                }
            return response, 400

    except ValueError as e:
        response = {
                    "ok": False,
                    "data": "Your purchase has NOT been completed.\nPlease contact support\n\nMore info: " + e
                }
        return response, 400
    
@app.route("/api/v1/status")
def investment_status():
    status, data = dao.wallet_status()

    if status:
        response = {
            "ok": True, 
            "data": data
        }
        return response
    
    else:
        response = {
            "ok": False, 
            "data": data
        }
        return response