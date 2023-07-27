import sqlite3
import requests
from cripto_wallet import app
from datetime import datetime

available_coins = []
for value, coin in app.config.get("COIN_OPTIONS_LIST"):
    available_coins.append(coin)

class Calculator:
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
                Amount_To = float(Amount_From) * float(data['rate'])
                data = self.data_to_dict(From_Coin, To_Coin, Amount_From, Amount_To, data['rate'])
                return True, data
            else:
                return False, str(consult_response.status_code) + data['error']    
        except requests.exceptions.RequestException as error_str:
            return False, str(error_str) + str(url)
    
    def save_data(self, data):
        self.rate = (data['rate'])
        self.From_Coin = data["From_Coin"]
        self.To_Coin = data["To_Coin"]
        self.time = datetime.utcnow().isoformat()
        self.Amount_From = data["Amount_From"]
        self.Amount_To = data["Amount_To"]
    
    def reset_data(self):
        self.From_Coin = self.To_Coin = self.rate = self.Amount_From = self.Amount_To = self.time = ""

    def data_to_dict(self, From_Coin, To_Coin, Amount_From, Amount_To, rate):
        return {
            "rate" : rate,
            "From_Coin"	: From_Coin,
            "Amount_From" : Amount_From,
            "To_Coin" : To_Coin,
            "Amount_To"	: Amount_To
        }

    def validate_data(self, Amount_From, From_Coin, To_Coin, Amount_To):
        amount = dao.wallet_balance[From_Coin][1] - dao.wallet_balance[From_Coin][0]
        if From_Coin != "EUR" and amount == 0:
            error = f"No balance {From_Coin} in your wallet\nPlease check your status and select a From Coin available in your wallet"
            return False, error
        if From_Coin != "EUR" and amount < float(Amount_From):
            error = f"Not enought balance of {From_Coin}in your wallet\nYour currently balance is {amount}{From_Coin}"
            return False, error   
        
        time_now = datetime.utcnow().isoformat()
        dif_time = datetime.fromisoformat(time_now)-datetime.fromisoformat(self.time)
        if int(dif_time.seconds) // 60 > 5:
            error = "Your purchase has NOT been completed.\n\nTime exceeded. When you create an order you have only 5 MIN to confirm the purchase. Please start again and calcul again the rate, it maybe has changed."
            return False, error  
        elif Amount_From != self.Amount_From or From_Coin != self.From_Coin or To_Coin != self.To_Coin or Amount_To != self.Amount_To:
            error = "Your purchase has NOT been completed.\nPlease start again.\n\nDuring the purchase transaction we detected that the data was corrupted and it was canceled for your safety."
            return False, error
        else:
            return True, None


class DAOSqlite:
    def __init__(self, data_path):
        self.path = data_path
        self.wallet_balance = {}
        self.main_error = ""
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
        SELECT id, Date, Time, From_Coin, Amount_From, To_Coin, Amount_To
        FROM transactions
        ORDER by date
        ;"""
        conn = sqlite3.connect(self.path)
        cur = conn.cursor()
        cur.execute(query)
        data = cur.fetchall()
        transaction_list = []
        self.wallet_balance = {}
        for coin in available_coins:
            self.wallet_balance[coin] = [0,0]
        for transaction in data:
            transaction = self.convert_to_dict(transaction)
            self.validate_data(transaction)
            transaction = self.add_in_wallet_balance(transaction)
            transaction_list.append(transaction)
        conn.close()
        return transaction_list

    def convert_to_dict(self, transaction):
        return {
            "id": transaction[0],
            "Date" : transaction[1],
            "Time" : transaction[2],
            "From_Coin"	: transaction[3],
            "Amount_From" : transaction[4],
            "To_Coin" : transaction[5],
            "Amount_To"	: transaction[6]
        }
    
    def validate_data(self, transaction):
        
        try:
            datetime.strptime(transaction['Date'],'%Y-%m-%d')
            datetime.strptime(transaction['Time'],'%H:%M:%S')
        except:
            raise ValueError(f"Error in data validation\nerror details: format error in data/time of transaction id {transaction['id']}")
        
        if transaction['From_Coin'] not in available_coins or transaction['To_Coin'] not in available_coins:
            raise ValueError(f"Error in data validation\nerror details: format error in from/to coin of transaction id {transaction['id']}")
        
        try:
            Amount_From = float(transaction['Amount_From'])
            Amount_To = float(transaction['Amount_To'])
            if Amount_From <= 0 or Amount_To <= 0:
                raise ValueError(f"Error in data validation\nerror details: format error in from/to amount of transaction id {transaction['id']}")
        except:
            raise ValueError(f"Error in data validation\nerror details: format error in from/to amount of transaction id {transaction['id']}")
        
        return transaction
    
    def add_in_wallet_balance(self, transaction):
        self.wallet_balance[transaction["From_Coin"]][0] += transaction["Amount_From"]
        self.wallet_balance[transaction["To_Coin"]][1] += transaction["Amount_To"]

        return transaction
    
    def insert_transaction(self, calculator):
        time_now = datetime.utcnow().isoformat()
        date = time_now[0:10]
        time = time_now[11:19]
        transaction = self.convert_to_dict(('no_id', date, time, calculator.From_Coin, calculator.Amount_From, calculator.To_Coin, calculator.Amount_To))
        self.validate_data(transaction)
        query = """
        INSERT INTO transactions
                (Date, Time, From_Coin, Amount_From, To_Coin, Amount_To)
                VALUES (?,?,?,?,?,?)
        """
        conn = sqlite3.connect(self.path)
        cur = conn.cursor()
        
        cur.execute(query, (transaction["Date"], 
                            transaction["Time"], 
                            transaction["From_Coin"], 
                            transaction["Amount_From"], 
                            transaction["To_Coin"], 
                            transaction["Amount_To"]))
        conn.commit()
    
        calculator.reset_data()


    def wallet_status(self):
        wallet_criptos = []
        invested_euros = 0
        refund_euros = 0
        wallet_value = 0
        for coin in self.wallet_balance:
            cripto_amount = 0
            cripto_value = 0
            if coin == "EUR":
                invested_euros = self.wallet_balance[coin][0]
                refund_euros = self.wallet_balance[coin][1]
            else:
                cripto_amount = self.wallet_balance[coin][1] - self.wallet_balance[coin][0]
                if cripto_amount !=0:
                    status, data = calculator.get_rate(coin,"EUR",cripto_amount)
                    if status:
                        cripto_value = data["Amount_To"]
                        wallet_value += cripto_value
                        wallet_criptos.append((coin, cripto_amount, cripto_value))
                    else:
                        return False, data
        
        investment_result = refund_euros - invested_euros

        data = {
                "wallet_criptos" : wallet_criptos, 
                "wallet_value": wallet_value,
                "invested_euros": invested_euros,
                "refund_euros": refund_euros, 
                "investment_result": investment_result
            }
        return data

calculator = Calculator()
dao = DAOSqlite(app.config.get("PATH_SQLITE"))