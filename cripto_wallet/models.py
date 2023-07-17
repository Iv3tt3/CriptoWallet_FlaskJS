import sqlite3
import requests
from cripto_wallet import app
from datetime import datetime

coin_options = [("option","Select an option"),
         ("EUR","EUR"),
         ("BTC","BTC"), 
         ("BNB","BNB"),
         ("ETH","ETH"),
         ("USDT","USDT"),
         ("XRP","XRP"),
         ("ADA","ADA"),
         ("SOL","SOL"),
         ("DOT","DOT"),
         ("MATIC","MATIC")]


class Calculs:
    def __init__(self):
        self.From_Coin = ""
        self.To_Coin = ""
        self.rate = ""
        self.Amount_From = ""
        self.Amount_To = ""
        self.time = ""
    
    def get_rate(self, From_Coin, To_Coin, Amount_From):
        apikey = app.config.get("COIN_IO_API_KEY")
        url = f"https://rest.coinapi.io/v1/exchangerate/{From_Coin}/{To_Coin}?apikey={apikey}"
        try: 
            consult_response = requests.get(url)
            data = consult_response.json() 
            if consult_response.status_code == 200:
                self.rate = (data['rate'])
                self.From_Coin = From_Coin
                self.To_Coin = To_Coin
                self.time = datetime.utcnow().isoformat()
                self.Amount_From = Amount_From
                self.Amount_To = float(Amount_From) * float(self.rate)
                return True, None
            else:
                return False, str(consult_response.status_code) + data['error']    
        
        except requests.exceptions.RequestException as error_str:
            return False, error_str + url
    
    def reset(self):
        self.From_Coin = self.To_Coin = self.rate = self.Amount_From = self.Amount_To = self.time = ""

    def data_to_dict(self):
        return {
            "rate" : self.rate,
            "time" : self.time,
            "From_Coin"	: self.From_Coin,
            "Amount_From" : self.Amount_From,
            "To_Coin" : self.To_Coin,
            "Amount_To"	: self.Amount_To
        }

    def validate_data(self, Amount_From, From_Coin, To_Coin, Amount_To):
        time_now = datetime.utcnow().isoformat()
        dif_time = datetime.fromisoformat(time_now)-datetime.fromisoformat(self.time)
        if int(dif_time.seconds) // 60 > 10:
            error = "Time exceeded. Please calcul again the rate"
            return False, error  
        elif Amount_From != self.Amount_From or From_Coin != self.From_Coin or To_Coin != self.To_Coin or Amount_To != self.Amount_To:
            error = "Corrupted transaction data. Please calcul again the rate"
            return False, error
        else:
            return True, None



class DAOSqlite:
    def __init__(self, data_path):
        self.path = data_path
        self.create_table_init()

    #Create a db sqlite table if not exist in the path (check path in FLASK_PATH_SQLITE in .env)
    
    def create_table_init(self):    
        query = """
        CREATE TABLE IF NOT EXISTS "transactions" (
            "Id"	INTEGER,
            "Date"	TEXT NOT NULL,
            "Time"	TEXT NOT NULL,
            "From_Coin"	TEXT NOT NULL,
            "Amount_From"	REAL NOT NULL,
            "To_Coin"	TEXT NOT NULL,
            "Amount_To"	REAL NOT NULL,
            PRIMARY KEY("Id" AUTOINCREMENT)
        );
        """
        conn = sqlite3.connect(self.path)
        cur = conn.cursor()
        cur.execute(query)
        conn.close()

    #Query to get all transactions in DB ordered by date. Return a list of dict transactions --> JSON

    def get_all_transactions(self):
        query = """
        SELECT Date, Time, From_Coin, Amount_From, To_Coin, Amount_To
        FROM transactions
        ORDER by date
        ;"""
        conn = sqlite3.connect(self.path)
        cur = conn.cursor()
        cur.execute(query)
        data = cur.fetchall()
        transaction_list = []
        for transaction in data:
            transaction = self.convert_to_dict(transaction)
            transaction_list.append(transaction)
        conn.close()
        return transaction_list
    
    # Convert a transaction into a dict. Needed for get_all_transactions method

    def convert_to_dict(self, transaction):
        return {
            "Date" : transaction[0],
            "Time" : transaction[1],
            "From_Coin"	: transaction[2],
            "Amount_From" : transaction[3],
            "To_Coin" : transaction[4],
            "Amount_To"	: transaction[5]
        }
    
    def insert_transaction(self, calculs):
        time_now = datetime.utcnow().isoformat()
        date = time_now[0:10]
        time = time_now[11:19]
        query = """
        INSERT INTO transactions
                (Date, Time, From_Coin, Amount_From, To_Coin, Amount_To)
                VALUES (?,?,?,?,?,?)
        """
        conn = sqlite3.connect(self.path)
        cur = conn.cursor()
        
        cur.execute(query, (date, time, calculs.From_Coin, calculs.Amount_From, calculs.To_Coin, calculs.Amount_To))
        conn.commit()