CREATE TABLE "transactions" (
	"Id"	INTEGER,
	"Date"	TEXT NOT NULL,
	"Time"	TEXT NOT NULL,
	"From_Coin"	TEXT NOT NULL,
	"Amount_From"	REAL NOT NULL,
	"To_Coin"	TEXT NOT NULL,
	"Amount_To"	REAL NOT NULL,
	PRIMARY KEY("Id" AUTOINCREMENT)
);