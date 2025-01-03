let paymentMethod = {
    cash: 0,
    mpesa: 0,
};

// Object to keep track of total bottles sold
const totalBottlesSold = {
    "1l": 0,
    "5l": 0,
    "10l": 0,
    "20l": 0
};

//updating the bottle count when incrementing or decrementing
function updateBottleCount(bottle, change) {
    const bottleInputElement = document.getElementById(bottle);
    let count = parseInt(bottleInputElement.value) || 0;
    count += change;
    if (count < 0) count = 0; //prevents negative values
    bottleInputElement.value = count;

    // Update the increment counter
    document.getElementById(`totalSold${bottle}`).innerText = count;

    if (change > 0) {
        showPaymentModal();
    }
}

//prompting payment method to show whether it is mpesa or cash
function showPaymentModal() {
    document.getElementById("paymentModal").style.display = "block";
}

function confirm() {
    // Set prices for each bottle size
    const bottlePrice = {
        "1l": 10,
        "5l": 45,
        "10l": 90,
        "20l": 180
    };

    // Initialize total sales variables
    let totalMpesa = parseInt(document.getElementById('mpesaSale').innerText) || 0;
    let totalCash = parseInt(document.getElementById('cashSale').innerText) || 0;

    ["1l", "5l", "10l", "20l"].forEach(bottle => {
        const count = parseInt(document.getElementById(bottle).value) || 0;

        if (count > 0) {
            const price = bottlePrice[bottle]; // Get the price for the current bottle size

            // Update the total based on selected payment method
            if (document.getElementById('mpesa').checked) {
                totalMpesa += price * count; // Add to Mpesa total
            } else if (document.getElementById('cash').checked) {
                totalCash += price * count; // Add to Cash total
            }

            totalBottlesSold[bottle] += count; // Update the total bottles sold
            document.getElementById(bottle).value = ""; // Clear the input field for the bottle
        }
    });

    // Update the displayed sales totals
    document.getElementById("mpesaSale").innerText = totalMpesa + " Ksh";
    document.getElementById("cashSale").innerText = totalCash + " Ksh";

    // Display the total count of each bottle
    displayBottleCounts();

    // Clear the checkboxes
    document.getElementById("cash").checked = false; 
    document.getElementById("mpesa").checked = false; 

    document.getElementById("paymentModal").style.display = "none"; // Close the modal

    updateClosingMeterReading();
}

function updateClosingMeterReading() {
    // Set corresponding bottle litres
    const bottleLitres = {
        "20l": 20,
        "10l": 10,
        "5l": 5,
        "1l": 1
    };

    // Initialize total volume to 0
    let totalVolume = 0;

    // Loop through each bottle size to calculate total volume sold
    ["20l", "10l", "5l", "1l"].forEach(bottle => {
        const count = totalBottlesSold[bottle];
        const litres = bottleLitres[bottle];
        totalVolume += count * litres;
    });

    const opening = parseInt(document.getElementById('opening').value) || 0;
    const closing = opening + totalVolume;

    document.getElementById('closing').value = closing;
}

function displayBottleCounts() {
    document.getElementById("totalSold1l").innerText = totalBottlesSold["1l"];
    document.getElementById("totalSold5l").innerText = totalBottlesSold["5l"];
    document.getElementById("totalSold10l").innerText = totalBottlesSold["10l"];
    document.getElementById("totalSold20l").innerText = totalBottlesSold["20l"];
}

function calculate() {
    document.getElementById('results').style.display = "block";
    const opening = parseInt(document.getElementById('opening').value) || 0;
    const closing = parseInt(document.getElementById('closing').value) || 0;
    const cashSales = parseInt(document.getElementById('cashSale').innerText) || 0;
    const mpesaSales = parseInt(document.getElementById('mpesaSale').innerText) || 0;

    const meterDiff = closing - opening;
    const totalSales = cashSales + mpesaSales;

    document.getElementById("meterDifference").innerText = meterDiff + " Litres";
    document.getElementById("totalSales").innerText = totalSales + " Ksh";
}

function autoSave() {
    // create a variable to store the fields
    const record = {
        opening: document.getElementById('opening').value,
        closing: document.getElementById('closing').value,
        bottles: {
            "20l": document.getElementById('totalSold20l').innerText,
            "10l": document.getElementById('totalSold10l').innerText,
            "5l": document.getElementById('totalSold5l').innerText,
            "1l": document.getElementById('totalSold1l').innerText,
        },
        mpesa: document.getElementById('mpesaSale').innerText,
        cash: document.getElementById('cashSale').innerText,
    };

    //save the records in localstorage
    localStorage.setItem('autosaveRecord', JSON.stringify(record));
    console.log("record saved at" + new Date().toLocaleDateString());

    //automatically save data every 30 secs
    setInterval(autoSave, 30000)
}

function loadData() {
    const savedRecord = localStorage.getItem('autosaveRecord');
    if (savedRecord) {
        //fetch the record
        const record = JSON.parse(savedRecord);

        //populate the fields
        document.getElementById('opening').value = record.opening;
        document.getElementById('closing').value = record.closing;
        document.getElementById('totalSold20l').innerText = record.bottles["20l"];
        document.getElementById('totalSold10l').innerText = record.bottles["10l"];
        document.getElementById('totalSold5l').innerText = record.bottles["5l"];
        document.getElementById('totalSold1l').innerText = record.bottles["1l"];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    //event listener for calculating closing meter reading
    document.getElementById('opening').addEventListener('keydown', function(event){
        //check if enter key is hit
        if (event.key === 'Enter') {
            updateClosingMeterReading();//call the function
        }

        //event listener for displaying confirm prompt when enter is hit
        ["1l", "5l", "10l", "20l"].forEach(function (bottleId) {
            document.getElementById(bottleId).addEventListener('keydown', function(event){
                if (event.key === 'Enter') {
                    document.getElementById('paymentModal').style.display = 'flex';
                }
            });
        });
    });
})

//load data every time the page loads
window.onload = loadData;
