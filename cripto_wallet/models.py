import sqlite3


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