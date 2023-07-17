var wallet_criptos = {}
var last_calcul_data = ""

// Used more than once:

function process_response(response){
        return response.json()
}

function add_invisible_class(element_byID){
    document.querySelector(element_byID).classList.add("invisible")
}

function remove_invisible_class(element_byID){
    document.querySelector(element_byID).classList.remove("invisible")
}

function add_inactiveBtn_class(element_byID){
    document.querySelector(element_byID).classList.add("inactiveButton")
}

function remove_inactiveBtn_class(element_byID){
    document.querySelector(element_byID).classList.remove("inactiveButton")
}

//Display transactions in index.html:


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
            let the_row = document.createElement("tr") 
            
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
    return data
}

function process_error(error){
    alert("Se ha producido un error;" + error)
}

/*
Used to:
1) display coins options in select of new transaction form. To change data of cripto options check models.py
2) validate amount of each cripto available in wallet*/

function process_coinoptions(data){
    if (data.ok) {
        let the_father1 = document.querySelector("#From_Coin")
        the_father1.innerHTML = ""

        let the_father2 = document.querySelector("#To_Coin")
        the_father2.innerHTML = ""
        
    let coptions = data.coin_options
        for (let i=0; i< coptions.length; i++) {
            let new_option = new Option(coptions[i][1],coptions[i][0])
            let new_option2 = new Option(coptions[i][1],coptions[i][0])
            the_father1.appendChild(new_option)
            the_father2.appendChild(new_option2)

            if (coptions[i][0] != "option"){
                wallet_criptos[coptions[i][0]] = 0
            }
        }
    let transactions = data.data
        for (let i=0; i< transactions.length; i++) {  
            wallet_criptos[transactions[i].From_Coin] = wallet_criptos[transactions[i].From_Coin] - transactions[i].Amount_From
            wallet_criptos[transactions[i].To_Coin] = wallet_criptos[transactions[i].To_Coin] + transactions[i].Amount_To
        }
    } else{
        alert ("Error" + data.data)
    }
    return data
}


// Display new form buttons New From and Cancel:

function new_btn_action(event){
    event.preventDefault()

    remove_invisible_class("#new_transaction_grid")
    remove_invisible_class("#cancel_btn")

    add_inactiveBtn_class("#new_btn") 
}

function cancel_action(event){
    event.preventDefault()
    reset_data()
}

//Used to validate, submit and display results:

function validate_form(event){
    event.preventDefault()

    let Amount_From = document.querySelector("#Amount_From").value
    if (Amount_From <= 0) {
        alert("Must be positive number")
        return
    }

    let From_Coin = document.querySelector("#From_Coin").value

    if (From_Coin != "EUR"){
        if (wallet_criptos[From_Coin] == 0){
            alert("No "+ From_Coin + " in your wallet. Please, check your wallet status")
            return
        }
        if (wallet_criptos[From_Coin] < Amount_From) {
            alert("Not enough balance of " + From_Coin + " in your wallet. Your current balance is " + wallet_criptos[From_Coin] + From_Coin)
            return
        }
    }

    let To_Coin = document.querySelector("#To_Coin").value

    if (To_Coin == From_Coin) {
        alert("Select a different coin in To than in From")
        return
    }

    get_rate (Amount_From, From_Coin, To_Coin)

}

function get_rate(Amount_From, From_Coin, To_Coin){

    fetch("/api/v1/rate"+"/"+From_Coin+"/"+To_Coin+"/"+Amount_From)
        .then(process_response)
        .then(display_result)
}

function display_result(data){
    if (data.ok){

        remove_invisible_class("#results_grid")
    
        let the_father = document.querySelector("#result_rate")
        the_father.innerHTML = ""
        let the_paragraph = document.createElement("p") 
        the_paragraph.innerHTML = data.data.rate
        the_father.appendChild(the_paragraph)

        the_father = document.querySelector("#result_amount")
        the_father.innerHTML = ""
        the_paragraph = document.createElement("p") 
        the_paragraph.innerHTML = data.data.Amount_To
        the_father.appendChild(the_paragraph)

        last_calcul_data = data.data
        
    }
}

function reset_data(){
    
    add_invisible_class("#new_transaction_grid")  
    add_invisible_class("#cancel_btn")
    add_invisible_class("#results_grid")
    add_invisible_class("#purchase")

    remove_inactiveBtn_class("#new_btn")
    remove_inactiveBtn_class("#submit")
    remove_inactiveBtn_class("#order")

    let the_father = document.querySelector("#result_rate")
    the_father.innerHTML = ""

    the_father = document.querySelector("#result_amount")
    the_father.innerHTML = ""

    the_father = document.querySelector("#purchase_from")
    the_father.innerHTML = ""

    the_father = document.querySelector("#purchase_to")
    the_father.innerHTML = ""

}

function display_purchase_resume(event){
    
    event.preventDefault()

    remove_invisible_class("#purchase")

    add_inactiveBtn_class("#submit")
    add_inactiveBtn_class("#order")

    the_father = document.querySelector("#purchase_from")
    the_father.innerHTML = ""
    the_paragraph = document.createElement("p") 
    the_paragraph.innerHTML = last_calcul_data.Amount_From + " " + last_calcul_data.From_Coin
    the_father.appendChild(the_paragraph)

    the_father = document.querySelector("#purchase_to")
    the_father.innerHTML = ""
    the_paragraph = document.createElement("p") 
    the_paragraph.innerHTML = last_calcul_data.Amount_To + " " + last_calcul_data.To_Coin
    the_father.appendChild(the_paragraph)


}

//Used to execute purchase

function execute_purchase(event){
    event.preventDefault()
    let data = { 
        Amount_From: last_calcul_data.Amount_From,
        From_Coin: last_calcul_data.From_Coin,
        To_Coin: last_calcul_data.To_Coin,
        Amount_To: last_calcul_data.Amount_To
    }

    let options = { 
        body: JSON.stringify(data), 
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        }
    }

    fetch ("api/v1/insert", options) 
        .then(process_response)
        .then(refresh_display_transactions)
        .then(reset_data)
        .catch(process_error)
}

function refresh_display_transactions(data){
    if (data.ok){
        fetch("/api/v1/transactions")
            .then(process_response)
            .then(display_transactions)
            .then(process_coinoptions)
            .catch(process_error)
    } else {
        alert (data.data)
    }
}

window.onload = function () {


    // Display transactions in index.html:

    fetch("/api/v1/transactions")
        
        .then(process_response)
        .then(display_transactions)
        .then(process_coinoptions)
        .catch(process_error)  
        
    // Display new form buttons New From and Cancel:
        
    let new_btn = document.querySelector("#new_btn")
    new_btn.addEventListener("click", new_btn_action)

    let cancel_btn = document.querySelector("#cancel_btn")
    cancel_btn.addEventListener("click", cancel_action)

    // Validate, submit and display results:

    let submit_btn = document.querySelector("#submit")
    submit_btn.addEventListener("click", validate_form)

    let order_btn = document.querySelector("#order")
    order_btn.addEventListener("click", display_purchase_resume)

    // Execute a purchase order

    let purchase_btn = document.querySelector("#purchase")
    purchase_btn.addEventListener("click", execute_purchase)

}