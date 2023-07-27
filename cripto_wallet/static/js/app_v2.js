var wallet_balance = {}
var last_calcul_data = ""
var coptions

// BASIC FUNCTIONNS: Functions used in several functions:

function process_response(response){
        return response.json()
}

function process_error(error){
    alert("SOMETHING WENT WRONG\n"+error)
}

function process_coin_options(){
    let the_father1 = document.querySelector("#From_Coin")
    the_father1.innerHTML = ""

    let the_father2 = document.querySelector("#To_Coin")
    the_father2.innerHTML = ""
    
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

    }

}

function reset_data(){
    
    add_invisible_class("#new_transaction_grid")  
    add_invisible_class("#cancel_btn")
    add_invisible_class("#results_grid")
    add_invisible_class("#purchase_section")
    add_invisible_class("#form_info_msgs")

    remove_inactiveBtn_class("#new_btn")
    remove_inactiveBtn_class("#submit")
    remove_inactiveBtn_class("#order")

    let the_element = document.querySelector("#result_rate")
    the_element.innerHTML = ""

    the_element = document.querySelector("#invest_amount")
    the_element.innerHTML = ""

    the_element = document.querySelector("#result_amount")
    the_element.innerHTML = ""

    the_element = document.querySelector("#purchase_from")
    the_element.innerHTML = ""

    the_element = document.querySelector("#purchase_to")
    the_element.innerHTML = ""

    the_element = document.querySelector("#form_info_msgs")
    the_element.innerHTML = ""

    the_element = document.querySelector("#Amount_From")
    the_element.value = ""

    process_coin_options()

    last_calcul_data = ""

}

function INFOmsg_in_paragraph(paragraph_Id, INFOmsg){
    let the_paragraph = document.querySelector(paragraph_Id)
    the_paragraph.innerHTML = ""
    the_paragraph.classList.add("information_message")
    the_paragraph.innerHTML = INFOmsg
}

function insert_cell_to_row(row, data){
    let the_cell = document.createElement("td") 
    the_cell.innerHTML = data
    row.appendChild(the_cell)
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

//ALL TRANSACTIONS SECTION: Functions to display transactions on the main table

function get_main_content(){
    fetch("/api/v1/transactions")
        .then(process_response) //Check in BASIC functions
        .then(display_transactions)
        .then(process_coin_options) //Check in BASIC functions
        .catch(process_error) //Check in BASIC functions
}

function display_transactions(data){
    if (data.ok){

        coptions = data.coin_options
        wallet_balance = data.wallet_balance

        if (data.data.length != 0){
        
        remove_invisible_class("#transactions_bodytable")
        add_invisible_class("#transaction_info_msgs")
        let the_father = document.querySelector("#transaction_info_msgs")
        the_father.innerHTML = ""

        the_father = document.querySelector("#transactions_bodytable")
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
            INFOmsg_in_paragraph("#transaction_info_msgs", "No transactions in your wallet yet")
            add_invisible_class("#transactions_bodytable")
            } 

    } else{
        add_inactiveBtn_class("#status_btn")
        add_inactiveBtn_class("#new_btn")
        INFOmsg_in_paragraph("#transaction_info_msgs", "Currently not available <br> Sorry for the inconvenience <br> Please, contact support")
        throw new Error (data.data)
    }
}

//NEW TRASACTION FORM SECTION: Functions to display form, submit, validate and send info to server

    //Buttons for open/close section

function new_btn_action(event){
    event.preventDefault()

    remove_invisible_class("#new_transaction_grid")
    remove_invisible_class("#cancel_btn")

    add_inactiveBtn_class("#new_btn") 
}

function cancel_btn_action(event){
    event.preventDefault()
    reset_data()
}

    //Fuctions to validate form, send data to server and display results

function validate_form(event){
    event.preventDefault()

    let Amount_From = document.querySelector("#Amount_From").value
    if (Amount_From <= 0) {
        alert("Amount must be a positive number")
        return
    }

    let From_Coin = document.querySelector("#From_Coin").value

    if (From_Coin != "EUR"){

        let amount = wallet_balance[From_Coin][1] - wallet_balance[From_Coin][0]

        if (amount == 0){
            alert("No "+ From_Coin + " in your wallet\nPlease, check your wallet status and select a From Coin available in your wallet")
            return
        }
        if (amount < Amount_From) {
            alert("Not enough balance of " + From_Coin + " in your wallet\nYour current balance is " + amount + From_Coin)
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
        INFOmsg_in_paragraph("#form_info_msgs", "Currently not available <br> Sorry for the inconvenience <br> Please, try it later or contact support")
        add_invisible_class('#new_transaction_grid')
    }
}

function display_purchase_resume(event){
    
    event.preventDefault()

    remove_invisible_class("#purchase_section")

    add_inactiveBtn_class("#submit")
    add_inactiveBtn_class("#order")

    let the_element = document.querySelector("#purchase_from")
    the_element.innerHTML = ""
    the_element.innerHTML = last_calcul_data.Amount_From + " " + last_calcul_data.From_Coin
    

    the_element = document.querySelector("#purchase_to")
    the_element.innerHTML = ""
    the_element.innerHTML = last_calcul_data.Amount_To + " " + last_calcul_data.To_Coin

}

    //Functions to insert new transaction in database and display server response

function execute_purchase(event){
    event.preventDefault()

    let validation = validate_datachanges_by_inspector()

    if (validation) {

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
            .then(inform_data)
            .then(hide_status)
            .catch(process_error)
    }
    else {
        alert("SOMETHING WENT WRONG\nData has been corrupted. For your safety order was cancelled\nYou should start new transaction again, please calcul rate")
        reset_data()
        new_btn_action(event)

    }
}

function validate_datachanges_by_inspector(){

    let validation = true

    let purchase_from = document.querySelector("#purchase_from").innerHTML
    let data_purchase_from = last_calcul_data.Amount_From + " " + last_calcul_data.From_Coin
    if (purchase_from != data_purchase_from){
        validation = false
    }

    let purchase_to = document.querySelector("#purchase_to").innerHTML
    let data_purchase_to= last_calcul_data.Amount_To + " " + last_calcul_data.To_Coin
    if (purchase_to != data_purchase_to){
        validation = false
    }

    return validation
}

function inform_data(data){
    if (data.ok){
        alert(data.data)
        get_main_content()
        reset_data()
        return data
    } else {
        alert("SOMETHING WENT WRONG\n" + data.data)
    }
}

function hide_status(data){
    
    remove_inactiveBtn_class("#status_btn")
    add_invisible_class("#close_status_btn")
    add_invisible_class("#status_section")

    return data
}



//STATUS SECTION 

function get_status(event){
    event.preventDefault()

    add_inactiveBtn_class("#status_btn")
    remove_invisible_class("#close_status_btn")
    remove_invisible_class("#status_section")

    fetch("/api/v1/status")
        .then(process_response)
        .then(display_status_data)
        .catch(process_error)

}

function add_data_to_p_with_style(paragraph_Id, data){
    let the_paragraph = document.querySelector(paragraph_Id)
    the_paragraph.innerHTML = ""
    the_paragraph.style.fontWeight = 'bold';
    if (data<0){
        the_paragraph.style.color = 'red';
    }
    the_paragraph.innerHTML = data + "EUR"
}

function display_status_data(data){

    if (data.ok){
        let wallet_criptos = data.data.wallet_criptos
        if (wallet_criptos.length != 0){

            remove_invisible_class("#status_results")
            add_invisible_class("#status_info_msgs")
            let the_father = document.querySelector("#status_info_msgs")
            the_father.innerHTML = ""

            the_father = document.querySelector("#status_table")
            the_father.innerHTML = ""
            for (let i=0; i< wallet_criptos.length; i++) {
                let the_row = document.createElement("tr") 
                
                insert_cell_to_row(the_row, wallet_criptos[i][0])
                insert_cell_to_row(the_row, wallet_criptos[i][1])
                insert_cell_to_row(the_row, wallet_criptos[i][2])
                
                the_father.appendChild(the_row)
            }

            add_data_to_p_with_style("#wallet_value", data.data.wallet_value)
            add_data_to_p_with_style("#invested_euros", data.data.invested_euros)
            add_data_to_p_with_style("#refund_euros", data.data.refund_euros)
            add_data_to_p_with_style("#investment_result", data.data.investment_result)

        }else{
            INFOmsg_in_paragraph("#status_info_msgs", "Your wallet is empty")
            add_invisible_class("#status_results")
            } 

    } else{
        alert("SOMETHING WENT WRONG\n"+data.data)
        INFOmsg_in_paragraph("#status_info_msgs", "Your wallet status is not available\nSorry for the inconvenience\nPlease, contact support")
        add_invisible_class("#status_results")
        add_invisible_class("#status_table")

    }

}


function close_status(event){
    event.preventDefault()

    remove_inactiveBtn_class("#status_btn")
    add_invisible_class("#close_status_btn")
    add_invisible_class("#status_section")

}


window.onload = function () {

    // ALL TRANSACTION SECTION

    get_main_content()  
        
    // NEW TRANSACTION FORM

        // To open/close section
        
    let new_btn = document.querySelector("#new_btn")
    new_btn.addEventListener("click", new_btn_action)

    let cancel_btn = document.querySelector("#cancel_btn")
    cancel_btn.addEventListener("click", cancel_btn_action)

         // To submit, validate a form

    let submit_btn = document.querySelector("#submit")
    submit_btn.addEventListener("click", validate_form)

    let order_btn = document.querySelector("#order")
    order_btn.addEventListener("click", display_purchase_resume)

        // To insert new transaction in database:

    let purchase_btn = document.querySelector("#purchase")
    purchase_btn.addEventListener("click", execute_purchase)

    // STATUS SECTION

    let status_btn = document.querySelector("#status_btn")
    status_btn.addEventListener("click", get_status)

    let close_btn = document.querySelector("#close_status_btn")
    close_btn.addEventListener("click", close_status)

}