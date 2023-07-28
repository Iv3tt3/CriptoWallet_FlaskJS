from cripto_wallet import app
from flask import render_template, request, redirect
from cripto_wallet.models import dao, calculator
import sqlite3


@app.route("/")
def index():
    js_path = (app.config.get("JAVASCRIPT_PATH"))
    if js_path == "/static/js/app_v1.js" or js_path == "/static/js/app_v2.js": 
        return render_template("index.html", js_path = js_path)
    else:
        dao.main_error = "Error info: JS path is not well format in the env file"
        return redirect("/fatalerror")
    
@app.route("/fatalerror")
def fatal_error():
    return render_template("fatalerror.html", error = dao.main_error)

@app.route("/api/v1/transactions")
def all_transactions():
    try:
        transactions = dao.get_all_transactions()
        coin_options = app.config.get("COIN_OPTIONS_LIST")
        wallet_balance = dao.wallet_balance
        response = {
            "ok": True,
            "data": transactions,
            "coin_options": coin_options,
            "wallet_balance": wallet_balance
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
            "data": "Please, contact support\nerror info: " + str(e)
        }
        return response, 400

@app.route("/api/v1/rate/<From_Coin>/<To_Coin>/<Amount_From>")
def get_rate(From_Coin, To_Coin, Amount_From):
    try:
        status, data = calculator.get_rate(From_Coin, To_Coin, Amount_From)
        if status:
            calculator.save_data(data)
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
    except Exception as e:
        response = {
                "ok": False,
                "data": "Please, contact support\nError Exception type in get rate route\n" + str(e)
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
            dao.insert_transaction(calculator)
            response = {
                "ok": True,
                "data": "SUCCESSFUL!\n\nYour purchase order has been completed successfully.\nPlease refresh website page"
            }
            return response, 201
        else:
            response = {
                    "ok": False,
                    "data": error_info
                }
            return response, 400
        
    except sqlite3.Error as e:
        response = {
            "ok": False,
            "data": "Your purchase has NOT been completed.\nPlease contact support\n\nMore info: DB is currently not available.\n" + str(e)
        }
        return response, 400
    
    except ValueError as e:
        response = {
                    "ok": False,
                    "data": "Your purchase has NOT been completed.\nPlease contact support\n\nMore info: " + str(e)
                }
        return response, 400
    
    except Exception as e:
        response = {
                "ok": False,
                "data": "Your purchase has NOT been completed.\nPlease contact support\n\nMore info: Exception type in insert trasaction route\n" + str(e)
            }
        return response, 400
    
@app.route("/api/v1/status")
def investment_status():
    try:
        data = dao.wallet_status()
        response = {
            "ok": True, 
            "data": data
        }
        return response
        
    except ValueError as e:
        response = {
            "ok": False, 
            "data": "Your wallet status is not available. Please, contact support\nMore info: ValueError in status route"
        }
        return response, 400
        
    except Exception as e:
        response = {
                "ok": False,
                "data": "Your wallet status is not available. Please, contact support\nMore info: Exception type in status route\n" + str(e)
            }
        return response, 400