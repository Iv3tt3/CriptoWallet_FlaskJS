***Note: Readme translated to Spanish at the end***

# Cripto Wallet

This is a JS application that records simulated purchases/sales of cryptocurrencies.

The application keeps track of all the transactions made with the cryptocurrencies (purchases, exchanges and sales) and calculates the investment result. An external service is used to check the exchange rates.

Languages: English

## Basic Rules

1. User has an infinite balance of Euros to buy cryptocurrencies.

2. Cryptocurrencies can be exchanged. The amount of each cryptocurrency is limited to the balance in the wallet.

    _If a cryptocurrency has 0 balance in the wallet, it can't be sold or exchanged for another cryptocurrency. However, it can be purchased using Euros or another cryptocurrency with a balance in the wallet._

3. Cryptocurrencies in the wallet can be sold, and the invested Euros can be recovered.


## Functionality

There are three sections in this app:

- Main section displays all transactions table (purchases-exchanges-sales). The table shows invested/sold cripto amount, purchased cripto amount and transaction date and time.

- At the bottom, a button displays a form. This form calculates the exchange rate from one cryptocurrency to another, shows the result, and enables the user to make a new transaction. If a new transaction is made, it will appeared in the previous table.

- At the top, another button displays the wallet status. In this section there are the wallet cripto balance and its value in Euros at the time of the query, the total value of the wallet (in Euros) and the investment result (invested Euros - recovered Euros).

## Installation - Step by step

### External services

This application uses coinAPI.io as an external service to calculate the exchange rate.

To use the application, it is necessary to obtain an API key from [their website](https://www.coinapi.io/market-data-api/pricing)

Currently, they offer a free plan that allows 100 daily queries (Information updated on 28/07/2023).

### Environment variables

1. Replicate `.env_template` file and rename it to `.env`
2. Provide the follwing variables:
    - FLASK_APP: main.py (don't change this. Must be main.py)
    - FLASK_DEBUG: True or False. In production must be False, if you are going to modify the app it is more convenient to set it as True.
    - FLASK_SECRET_KEY: Any random secret key. You can generate one [here](https://randomkeygen.com)
    - FLASK_PATH_SQLITE: Data will be stored i a sqlite file. Options:
        (a) Create a new file without data. In this case, enter anny path you want and the app will create the file automatically when it runs. 
        (b) Use defult template with sample data. In this case, enter `data/criptowallet.db`
    - FLASK_COIN_IO_API_KEY: The apikey obtained in the previous step in coinAPI.io.
    - FLASK_COIN_OPTIONS_LIST: Emter the currencies you want to operate. Important:

        (a) Format in the `.env` file should be a list of lists. 
        Each currency is a list consistinng of a value _(internal name)_ and a text _(name for user)_. Example:

        `FLASK_COIN_OPTIONS_LIST=[["EUR","EUR"],["BTC","BTC"],["BNB","BNB"],["ETH","ETH"],["USDT","USDT"],["XRP","XRP"],["ADA","ADA"],["SOL","SOL"],["DOT","DOT"],["MATIC","MATIC"]]`

        (b) The value should be a name that coinAPI.io uses to name the currency. Otherwise, the app will not work as the query will return an error, so the exchange rate won't be calculated.

    - FLASK_JAVASCRIPT_PATH: Use `/static/js/app_v1.js` or `/static/js/app_v2.js`. Differences:

        (a) Classic version `/static/js/app_v1.js` complete a new transaction in 2 steps: user has two buttons (calculate and purchase).

        (b) New version `/static/js/app_v2.js` complete a new transaction in 3 steps: user has three buttons (calculate, create a order and purchase).

### Libraries

To run app is necessary to install the required libraries. Steps:

1. (Optional) Create and activate a virtual environment
2. Install all the dependencies from `requirements.txt` file by introducing the following:
```
pip install -r requirements.txt
```

## Run the app

When all previous steps are completed, run applicatio from the directory where it is installed by introducing the following:
```
flask run
```
_________________________________________________________________________

># Cripto Wallet
>
>Se trata de una aplicación en JS en la que se registran las compras/ventas simuladas de criptomonedas. 
>
>La aplicación registra todos los movimientos realizados con las monedas (compras, intercambios y ventas) y calcula el resultado de la inversión. Para consultar el tipo de cambio se utiliza un servicio externo.
>
>Idiomas: Inglés
>
>## Reglas básicas 
>
>1. Se dispone de una saldo infinito de Euros que el usuario puede usar para comprar criptos.
>
>2. Se pueden cambiar de unas criptos a otras. La cantidad de cada cripto está limitada al saldo que se tenga de cada una en la cartera. 
>
>    _Es decir, si una cripto tiene saldo 0 en la cartera no se podrá vender o intercambiar con otra cripto. Si se podrá comprar con Euros o otra cripto con saldo en la cartera._
>
>3. Se pueden vender las criptos de la cartera y recuperar los Euros invertidos.
>
>## Funcionalidad
>
>La aplicación tiene tres secciones:
>
>- La sección principal muestra una tabla con todas las transacciones de compra-intercambio-venta. La tabla detalla el importe de la moneda invertida/vendida, el importe de la moneda comprada, la fecha y hora de la transacción.
>
>- En la parte inferior, un botón despliega un formulario. Éste, permite calcular el tipo de cambio de una moneda a otra, muestra el resultado y permite realizar una nueva transacción. Si se realiza se mostrará en la tabla anterior.
>
>- En la parte superior, otro botón despliega el estado de la cartera. Esta sección muestra el saldo de las criptos en cartera y su valor en euros en el momento de realizar la consulta. Tambiėn muestra el valor total de la cartera (en euros) y el resultado de la inversión (euros invertidos - euros recuperados).
>
>## Instalacion del proyecto - Paso a paso
>
>### Servicios externos 
>
>La aplicación utiliza coinAPI.io como servicio externo para calcular el tipo de cambio de cada moneda. 
>
>Para utilizar la aplicación es necesario obtener una apikey en [su web](https://www.coinapi.io/market-data-api/pricing)
>
>Actualmente tienen un plan gratuito que permite realizar 100 consultas diarias (Información actualizada el 28/07/2023)
>
>### Variables de entorno 
>
>1. Replicar el fichero `.env_template` y renombrarlo a `.env`
>2. Informar las siguientes variables:
>    - FLASK_APP: main.py (no cambiar esta variable. Debe ser main.py)
>    - FLASK_DEBUG: True o False. Debe ser False en entornos de producción, si vas a modificar la aplicación es más cómodo True
>    - FLASK_SECRET_KEY: una clave secreta aleatoria cualquiera. Un buen sitio para generarlas es [este](https://randomkeygen.com)
>    - FLASK_PATH_SQLITE: Los datos se guardan en un fichero sqlite. Opciones:
>        (a) Crear un nuevo fichero sin datos. Para ello introduce un path cualquiera y el programa creará el fichero automáticamente al iniciarse.
>        (b) Utilitzar la plantilla por defecto con datos de ejemplo. En este caso introduce `data/criptowallet.db`
>    - FLASK_COIN_IO_API_KEY: la apikey de coinAPI.io obtenida en el apartado anterior
>    - FLASK_COIN_OPTIONS_LIST: Introduce las monedas con las que quieres operar. Importante:
>
>        (a) El formato en el `.env` debe ser una lista de listas. 
>        Cada moneda es una lista formada por el valor _(nombre interno)_ y el texto _(nombre que se muestra al usuario)_. Ejemplo:
>
>        `FLASK_COIN_OPTIONS_LIST=[["EUR","EUR"],["BTC","BTC"],["BNB","BNB"],["ETH","ETH"],["USDT","USDT"],["XRP","XRP"],["ADA","ADA"],["SOL","SOL"],["DOT","DOT"],["MATIC","MATIC"]]`
>
>        (b) El valor debe ser el nombre que utiliza coinAPI.io para la moneda. En caso contrario la aplicación no funcionará ya que la consulta producirá un error y no se calculará el tipo de cambio.
>
>    - FLASK_JAVASCRIPT_PATH: Usar `/static/js/app_v1.js` o `/static/js/app_v2.js`. Diferencia:
>
>        (a) La versión clasica `/static/js/app_v1.js` realiza una nueva transacción en 2 pasos: el usuario dispone de dos botones (calcular y comprar).
>
>        (b) La versión nueva `/static/js/app_v2.js` realiza una nueva transacción en 3 pasos: el usuario dispone de tres botones (calcular, crear una orden y comprar).
>
>### Librerías
>
>Para el funcionamiento de la aplicación es necesario instalar las librerías. Pasos:
>
>1. (Opcional) Crear un entorno virtual y activarlo
>2. Instalar todas las dependencias del `requirements.txt`, escribir en el terminal:
>```
>pip install -r requirements.txt
>```
>
>## Lanzar la aplicación
>
>Una vez realizados los pasos anteriores, lanzar la aplicación desde el directorio donde esta instalada. Escribir en el terminal:
>```
>flask run
>```