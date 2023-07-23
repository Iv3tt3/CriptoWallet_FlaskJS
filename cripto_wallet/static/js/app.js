var available_wallet_balance = {}
var last_calcul_data = ""

// Used in various functions:

function process_response(response){
        return response.json()
}

function process_error(error){
    alert("SOMETHING WENT WRONG\n" + error)
    window.location.href = "/fatalerror"
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
        if (data.data.length != 0){
        let the_father = document.querySelector("#transactions_bodytable")
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


        }else{
            let the_father = document.querySelector("#transaction_info_msgs")
            the_father.innerHTML = ""
            the_paragraph = document.createElement("p") 
            the_paragraph.classList.add("information_message")
            the_paragraph.innerHTML = "No transactions in your wallet yet"
            the_father.appendChild(the_paragraph)
            add_invisible_class("#transactions_bodytable")
            } 

    } else{
        throw new Error ("Error" + data.data)
    }
    return data
}


/*
Used to:
1) display coins options in the select field of new transaction form (To change data of cripto options check your .env)
2) validate amount of each cripto available in wallet*/

function process_coinoptions(data){
    if (data.ok) {
        let the_father1 = document.querySelector("#From_Coin")
        the_father1.innerHTML = ""

        let the_father2 = document.querySelector("#To_Coin")
        the_father2.innerHTML = ""
        
    let coptions = data.coin_options
        let new_option = new Option("Select an option","option")
        let new_option2 = new Option("Select an option","option")
        the_father1.appendChild(new_option)
        the_father2.appendChild(new_option2)
        if (coptions[0][0] == "["){
            throw new Error ("Your coins options are not well format in the env file")
        }
        for (let i=0; i< coptions.length; i++) {
            new_option = new Option(coptions[i][1],coptions[i][0])
            new_option2 = new Option(coptions[i][1],coptions[i][0])
            the_father1.appendChild(new_option)
            the_father2.appendChild(new_option2)

            available_wallet_balance[coptions[i][0]] = 0
        }
    let transactions = data.data
        for (let i=0; i< transactions.length; i++) {  
            available_wallet_balance[transactions[i].From_Coin] = available_wallet_balance[transactions[i].From_Coin] - transactions[i].Amount_From
            available_wallet_balance[transactions[i].To_Coin] = available_wallet_balance[transactions[i].To_Coin] + transactions[i].Amount_To
        }
    } else{
        throw new Error ("Error" + data.data)
    }
    return data
}

// Display buttons New Form and Cancel:

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

//Used to validate form, get the rate and display rate results:

function validate_form(event){
    event.preventDefault()

    let Amount_From = document.querySelector("#Amount_From").value
    if (Amount_From <= 0) {
        alert("Amount must be a positive number")
        return
    }

    let From_Coin = document.querySelector("#From_Coin").value

    if (From_Coin != "EUR"){
        if (available_wallet_balance[From_Coin] == 0){
            alert("No "+ From_Coin + " in your wallet. Please, check your wallet status and select an existing coin or cripto")
            return
        }
        if (available_wallet_balance[From_Coin] < Amount_From) {
            alert("Not enough balance of " + From_Coin + " in your wallet. Your current balance is " + available_wallet_balance[From_Coin] + From_Coin)
            return
        }
    }

    if (From_Coin == "option"){
        alert("Please, select an option in FROM")
        return
    }

    let To_Coin = document.querySelector("#To_Coin").value

    if (To_Coin == From_Coin) {
        alert("Please, select a different coin or cripto in TO than in FROM")
        return
    }

    if (To_Coin == "option"){
        alert("Please, select an option in TO")
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
        the_paragraph.innerHTML = "1" + data.data.From_Coin + " = " + data.data.rate + data.data.To_Coin
        the_father.appendChild(the_paragraph)

        the_father = document.querySelector("#invest_amount")
        the_father.innerHTML = ""
        the_paragraph = document.createElement("p") 
        the_paragraph.innerHTML = data.data.Amount_From + data.data.From_Coin
        the_father.appendChild(the_paragraph)

        the_father = document.querySelector("#result_amount")
        the_father.innerHTML = ""
        the_paragraph = document.createElement("p") 
        the_paragraph.innerHTML = data.data.Amount_To + data.data.To_Coin
        the_father.appendChild(the_paragraph)

        last_calcul_data = data.data
        
    }
    else {
        alert("SOMETHING WENT WRONG\n" + data.data)
    }
}

//Used to reset form data and rate results when cancel 


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

    the_father = document.querySelector("#invest_amount")
    the_father.innerHTML = ""

    the_father = document.querySelector("#result_amount")
    the_father.innerHTML = ""

    the_father = document.querySelector("#purchase_from")
    the_father.innerHTML = ""

    the_father = document.querySelector("#purchase_to")
    the_father.innerHTML = ""

    last_calcul_data = ""

}

//Used to display purchase resume when create an order

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

//Used to confirm purchase and reset form data

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

//Used to confirm purchase

function refresh_display_transactions(data){
    if (data.ok){
        fetch("/api/v1/transactions")
            .then(process_response)
            .then(display_transactions)
            .then(process_coinoptions)
            .catch(process_error)
    } else {
        alert("SOMETHING WENT WRONG\n" + data.data)
    }
}

//Used to display status section and status data 

function display_status(event){
    event.preventDefault()

    add_inactiveBtn_class("#status_btn")
    remove_invisible_class("#close_status_btn")
    remove_invisible_class("#status_section")

    fetch("/api/v1/status")
        .then(process_response)
        .then(display_status_data)
        .catch(process_error)

}


//Used to display status data


function add_p_to_div(fatherId, title, data){
    let the_father = document.querySelector(fatherId)
    the_father.innerHTML = ""
    let the_paragraph = document.createElement("p") 
    the_paragraph.style.fontWeight = 'bold';
    if (data<0){
        the_paragraph.style.color = 'red';
    }
    the_paragraph.innerHTML = title + data + "EUR"
    the_father.appendChild(the_paragraph)
}

function display_status_data(data){

    if (data.ok){
        let wallet_criptos = data.data.wallet_criptos
        if (wallet_criptos.length != 0){
            let the_father = document.querySelector("#status_table")
            the_father.innerHTML = ""
            for (let i=0; i< wallet_criptos.length; i++) {
                let the_row = document.createElement("tr") 
                
                insert_cell_to_row(the_row, wallet_criptos[i][0])
                insert_cell_to_row(the_row, wallet_criptos[i][1])
                insert_cell_to_row(the_row, wallet_criptos[i][2])
                
                the_father.appendChild(the_row)
        
            }

            add_p_to_div("#wallet_value", "Current Wallet Value: ", data.data.wallet_value)
            
            add_p_to_div("#invested_euros", "Invested Euros: <br> ", data.data.invested_euros)
            
            add_p_to_div("#refund_euros", "Refund Euros: <br> ", data.data.refund_euros)
            
            add_p_to_div("#investment_result", "Investment Result: <br> ", data.data.investment_result)

        }else{
            let the_father = document.querySelector("#status_info_msgs")
            the_father.innerHTML = ""
            the_paragraph = document.createElement("p") 
            the_paragraph.classList.add("information_message")
            the_paragraph.innerHTML = "Your wallet is empty"
            the_father.appendChild(the_paragraph)
            add_invisible_class("#status_results")
            } 

    } else{
        alert("SOMETHING WENT WRONG\n" + data.data)
        let the_father = document.querySelector("#status_info_msgs")
        the_father.innerHTML = ""
        the_paragraph = document.createElement("p") 
        the_paragraph.classList.add("information_message")
        the_paragraph.innerHTML = data.data
        the_father.appendChild(the_paragraph)
        add_invisible_class("#status_results")
    }

}

//Used to close status section

function close_status(event){

    remove_inactiveBtn_class("#status_btn")
    add_invisible_class("#close_status_btn")
    add_invisible_class("#status_section")

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

    // Validate form, submit and display rate results:

    let submit_btn = document.querySelector("#submit")
    submit_btn.addEventListener("click", validate_form)

    let order_btn = document.querySelector("#order")
    order_btn.addEventListener("click", display_purchase_resume)

    // Confirm a purchase order:

    let purchase_btn = document.querySelector("#purchase")
    purchase_btn.addEventListener("click", execute_purchase)

    // Display and close status section

    let status_btn = document.querySelector("#status_btn")
    status_btn.addEventListener("click", display_status)

    let close_btn = document.querySelector("#close_status_btn")
    close_btn.addEventListener("click", close_status)

}