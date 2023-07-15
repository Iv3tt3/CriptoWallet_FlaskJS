
//in window.onload --> the fetch "/api/v1/transactions" functions used:

function process_response(response){
        return response.json()
}

function insert_cell_to_row(row, transaction_data){
    let the_cell = document.createElement("td") 
    the_cell.innerHTML = transaction_data
    row.appendChild(the_cell)
}

function display_transactions(data){
    if (data.ok){
        let the_father = document.querySelector("#transactions_table")
        the_father.innerHTML = ""
    
        let transactions = data.data
        for (let i=0; i< transactions.length; i++) {
            let the_row = document.createElement("tr") //Creamos una fila
            
            insert_cell_to_row(the_row, transactions[i].Date)
            insert_cell_to_row(the_row, transactions[i].Time)
            insert_cell_to_row(the_row, transactions[i].From_Coin)
            insert_cell_to_row(the_row, transactions[i].Amount_From)
            insert_cell_to_row(the_row, transactions[i].To_Coin)
            insert_cell_to_row(the_row, transactions[i].Amount_To)
            
            the_father.appendChild(the_row)
        }

    } else{
        alert ("Error" + data.data)
    }
}

function process_error(error){
    alert("Se ha producido un error;" + error)
}




window.onload = function () {


    // To display transactions in index.html:

    fetch("/api/v1/transactions")
        
        .then(process_response)
        .then(display_transactions)
        .catch(process_error)
}