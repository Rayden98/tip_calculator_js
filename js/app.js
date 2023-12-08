let client = {
    table : '',
    hour: '',
    order: []
};

const categories = {
    1: 'Food',
    2: 'Drinks',
    3: 'Disserts'
}

const btnSaveClient = document.querySelector('#guardar-cliente');
btnSaveClient.addEventListener('click', saveClient);

function saveClient(){
    const table = document.querySelector('#mesa').value;
    const hour = document.querySelector('#hora').value;

    // Check if are there filds empty
    const emptyFields = [ table, hour ].some( field => field === '' );

    if(emptyFields){
        // Check if there is an alert
        const existAlert = document.querySelector('.invalid-feedback');
        if(!existAlert){
            const alert = document.createElement('DIV');
            alert.classList.add('invalid-feedback', 'd-block', 'text-center');
            alert.textContent = 'All the fields are mandatory';
            document.querySelector('.modal-body form').appendChild(alert);

            // Delete the alert
            setTimeout(() =>{
                alert.remove();
            }, 3000)
        }
        return;
    }

    // Assign data of the form to client
    client = { ...client, table, hour}

    // console.log(client)

    // Hide Modal
    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide()


    // Show the sections 
    showSections();

    // Get plates of the API of JSON-Server
    getPlates();
}

function showSections(){
    const hiddenSections = document.querySelectorAll('.d-none');
    hiddenSections.forEach(section => section.classList.remove('d-none'));
}

function getPlates(){
    const url = 'http://localhost:4000/platillos';
    
    fetch(url)
        .then( response => response.json())
        .then( result => showPlates(result))
        .catch( error => console.log(error));
}

function showPlates(dishes){
    const content = document.querySelector('#platillos .contenido');

    dishes.forEach(dish => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const name = document.createElement('DIV');
        name.classList.add('col-md-4');
        name.textContent = dish.nombre;

        const price = document.createElement('DIV');
        price.classList.add('col-md-3', 'fw-bold');
        price.textContent = `$${dish.precio}`;

        const category = document.createElement('DIV');
        category.classList.add('col-md-3');
        category.textContent = categories[dish.categoria];

        const inputAmount = document.createElement('INPUT');
        inputAmount.type = 'number';
        inputAmount.min = 0;
        inputAmount.value = 0;
        inputAmount.id = `product-${dish.id}`;
        inputAmount.classList.add('form-control');

        // Function that detect the amount and the dish that is adding
        inputAmount.onchange = function (){
            const amount = parseInt(inputAmount.value);
            addDish({...dish, amount});
        };

        const adding = document.createElement('DIV');
        adding.classList.add('col-md-2');
        adding.appendChild(inputAmount);

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(category);
        row.appendChild(adding);


        content.appendChild(row);
        
    })
}

function addDish(product){
    // Extract the actual order
    let { order } = client;

    // Check if the amount is greater than 0
    if(product.amount > 0){
        // Check if the element already exist in the array
        if( order.some(item => item.id === product.id)){
            // The item already exist, update the amount
            const orderUpdated = order.map( item1 => {
                if(item1.id === product.id){
                    item1.amount = product.amount;
                }
                return item1;
            });
            // Is assign the new array to client.order
            client.order = [...orderUpdated];
        }else{
            // The item doen't exist, we add it in the array of order
            client.order = [...order, product];   
        };
         
    }else{
        // Delete items when the amount is zero
        const result = order.filter( item2 => item2.id != product.id);
        client.order = [...result];
    }
    // clean the prior HTML code
    cleanHTML();

    if(client.order.length){
        // Show the summary
        updateSummary();
    }else{
        messageOrderEmpty();
    }
    
}

function updateSummary(){
    const content = document.querySelector('#resumen .contenido');

    const summary = document.createElement('DIV');
    summary.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Information of the table
    const table = document.createElement('P');
    table.textContent = 'Table: ';
    table.classList.add('fw-bold');

    const tableSpan = document.createElement('SPAN');
    tableSpan.textContent = client.table;
    tableSpan.classList.add('fw-normal');

    // Information of the hour

    const hour = document.createElement('P');
    hour.textContent = 'Hour: ';
    hour.classList.add('fw-bold');

    const hourSpan = document.createElement('SPAN');
    hourSpan.textContent = client.hour;
    hourSpan.classList.add('fw-normal');

    // Add to the parents elements
    table.appendChild(tableSpan);
    hour.appendChild(hourSpan);

    // Title of the section 
    const heading = document.createElement('H3');
    heading.textContent = 'Consumed Dishes';
    heading.classList.add('my-4', 'text-center');

    // Iter over the array of orders
    const group = document.createElement('UL');
    group.classList.add('list-group');
    const { order } = client;

    order.forEach(item3 => {
        
        const { nombre , amount, precio, id } = item3;
        
        const list = document.createElement('LI');
        list.classList.add('list-group-item');

        const nameEl = document.createElement('H4');
        nameEl.classList.add('my-4', 'black');
        nameEl.textContent = nombre;

        // Amount of the item
        const amountEl = document.createElement('P');
        amountEl.classList.add('fw-bold');
        amountEl.textContent = 'Amount: ';

        const amountValue = document.createElement('SPAN');
        amountValue.classList.add('fw-normal');
        amountValue.textContent = amount;

        // Price of the item
        const priceEl = document.createElement('P');
        priceEl.classList.add('fw-bold');
        priceEl.textContent = 'Price: ';

        const priceValue = document.createElement('SPAN');
        priceValue.classList.add('fw-normal');
        priceValue.textContent = `$${precio}`;

        // Subtotal of the item
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValue = document.createElement('SPAN');
        subtotalValue.classList.add('fw-normal');
        subtotalValue.textContent = calculateSubtotal( precio, amount );

        // Button to delete
        const btnDelete = document.createElement('BUTTON');
        btnDelete.classList.add('btn', 'btn-danger');
        btnDelete.textContent = 'Delete from the order';

        // Function for delete from the order
        btnDelete.onclick = function(){
            deleteProduct(id)
        }

        // Add values to their containers
        amountEl.appendChild(amountValue);
        priceEl.appendChild(priceValue);
        subtotalEl.appendChild(subtotalValue);

        // Add elements to LI
        list.appendChild(nameEl);
        list.appendChild(amountEl);
        list.appendChild(priceEl);
        list.appendChild(subtotalEl);
        list.appendChild(btnDelete);

        // Add list to main group
        group.appendChild(list);
    })

    // Add to the content
    summary.appendChild(heading);
    summary.appendChild(table);
    summary.appendChild(hour);
    summary.appendChild(group);



    content.appendChild(summary);

    // Show form of tips
    tipsForm(); 

}

function cleanHTML(){
    const content = document.querySelector('#resumen .contenido');

    while( content.firstChild){
        content.removeChild(content.firstChild);
    }
}

function calculateSubtotal(precio, amount){
    return `$ ${precio * amount}`;
}

function deleteProduct(id2){
    const { order } = client;
    const result = order.filter( item2 => item2.id != id2);
    client.order = [...result];

    // clean the prior HTML code
    cleanHTML()

     if(client.order.length){
        // Show the summary
        updateSummary();
    }else{
        messageOrderEmpty();
    }
    // The product has been eliminated get back the amount to 0 in the form
    const productEliminated = `#product-${id2}`;
    const inputEliminated = document.querySelector(productEliminated);
    inputEliminated.value = 0;
}

function messageOrderEmpty(){
    const content = document.querySelector('#resumen .contenido');

    const text = document.createElement('P');
    text.classList.add('text-center');
    text.textContent = 'Añade los elementos del pedido'

    content.appendChild(text);
}

function tipsForm(){
    
    const content = document.querySelector('#resumen .contenido');

    const form = document.createElement('DIV');
    form.classList.add('col-md-6', 'formulario');

    const divForm = document.createElement('DIV');
    divForm.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Tip';

    // Radio button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'tip';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calculateTip;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'tip';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calculateTip;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'tip';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calculateTip;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);


    // Add to main Div
    divForm.appendChild(heading);
    divForm.appendChild(radio10Div);
    divForm.appendChild(radio25Div);
    divForm.appendChild(radio50Div);



    // Add to the form
    form.appendChild(divForm);

    content.appendChild(form);
}

function calculateTip(){
    
    const {order} = client;
    let subtotal = 0;

    // Calculate the subtotal to pay
    order.forEach( item => {
        subtotal += item.amount * item.precio;
    })

    // Select the radio button with the tip of the client
    const tipSelected = document.querySelector('[name="tip"]:checked').value;
    
    // Calculate the tip
    const tip = ((subtotal * parseInt(tipSelected)) / 100);

    // Calculate the total to pay
    const total = subtotal + tip
    console.log(total)
    showTotalHTML(subtotal, total, tip);
}
function showTotalHTML(subtotal, total, tip){

    const divTotal = document.createElement('DIV');
    divTotal.classList.add('total-pay', 'my-5');

    // Subtotal
    const subtotalParagraph = document.createElement('P');
    subtotalParagraph.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParagraph.textContent = 'Subtotal consumption: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParagraph.appendChild(subtotalSpan);

    // Tip
    const tipParagraph = document.createElement('P');
    tipParagraph.classList.add('fs-4', 'fw-bold', 'mt-2');
    tipParagraph.textContent = 'Tip: ';

    const tipSpan = document.createElement('SPAN');
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${tip}`;

    tipParagraph.appendChild(tipSpan);

    // Total
    const totalParagraph = document.createElement('P');
    totalParagraph.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParagraph.textContent = 'Total: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParagraph.appendChild(totalSpan);

    // Delete the last result
    const totalPayDiv = document.querySelector('.total-pay');
    if(totalPayDiv){
        totalPayDiv.remove();
    }

    divTotal.appendChild(subtotalParagraph);
    divTotal.appendChild(tipParagraph);
    divTotal.appendChild(totalParagraph);

    const form = document.querySelector('.formulario > div');
    form.appendChild(divTotal);
}