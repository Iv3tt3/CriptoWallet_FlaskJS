from cripto_wallet import app
from flask import render_template, request
from cripto_wallet.models import DAOSqlite, calculator, coin_options
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
    except ValueError as e:
        response = {
            "ok": False,
            "data": str(e)
        }
        return response, 400

@app.route("/api/v1/rate/<From_Coin>/<To_Coin>/<Amount_From>")
def get_rate(From_Coin, To_Coin, Amount_From):
    try:
        status, error_info = calculator.get_rate(From_Coin, To_Coin, Amount_From)
        if status:
            response = {
                "ok": True,
                "data": calculator.data_to_dict()
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
                    "data": "Purchase order complete"
                }
                return response, 201

            except ValueError as e:
                response = {
                    "ok": False,
                    "data": str(e)
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
                    "data": str(e)
                }
        return response, 400
    
@app.route("/api/v1/status")
def investment_status():
    wallet_criptos, wallet_value, invested_euros, refund_euros, investment_result = dao.wallet_status()

    data = {
        "wallet_criptos" : wallet_criptos, 
        "wallet_value": wallet_value,
        "invested_euros": invested_euros,
        "refund_euros": refund_euros, 
        "investment_result": investment_result
    }

    response = {
        "ok": True, 
        "data": data
    }
    return response