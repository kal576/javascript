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

// Set prices for each bottle size
const bottlePrice = {
    "1l": 10,
    "5l": 45,
    "10l": 90,
    "20l": 180
};

//updating the bottle count when incrementing or decrementing
function updateBottleCount(bottle) {
    const bottleInputElement = document.getElementById(bottle);
    let count = parseInt(bottleInputElement.value) || 0;
    count += 1;
    if (count < 0) count = 0; //prevents negative values
    bottleInputElement.value = count;

    // Update the increment counter
    document.getElementById(`totalSold${bottle}`).innerText = count;
}

//updating the bottle count when decrementing
function decrementBottleCount(bottle) {
    const bottleInputElement = document.getElementById(bottle);
    let count = parseInt(bottleInputElement.value) || 0;

    // Get the previous count from totalBottlesSold
    const previousCount = totalBottlesSold[bottle];

    // Ensure count doesn't go below 0
    count = Math.max(previousCount - 1, 0);

    // Update the input value and the totalBottlesSold
    bottleInputElement.value = count;
    totalBottlesSold[bottle] = count;

    // Calculate the difference in count
    const diff = previousCount - count;
    const price = bottlePrice[bottle]; // Get the price for the current bottle size

    // Update only the cash total
    let totalCash = parseInt(document.getElementById('cashSale').innerText) || 0;
    totalCash -= price * diff;
    document.getElementById("cashSale").innerText = totalCash + " Ksh";

    // Update the displayed bottle count in the UI
    document.getElementById(`totalSold${bottle}`).innerText = count;

    bottleInputElement.value = "";
}


//prompting payment method to show whether it is mpesa or cash
function showPaymentModal() {
    document.getElementById("paymentModal").style.display = "block";
}

function updatePaymentMethod(method) {
    paymentMethod[method] = 1;
}

function confirm() {
    // Initialize total sales variables
    let totalMpesa = parseInt(document.getElementById('mpesaSale').innerText) || 0;
    let totalCash = parseInt(document.getElementById('cashSale').innerText) || 0;

    ["1l", "5l", "10l", "20l"].forEach(bottle => {
        const count = parseInt(document.getElementById(bottle).value) || 0;
        const previousCount = totalBottlesSold[bottle];

        if (count !== previousCount) {
            const price = bottlePrice[bottle]; // Get the price for the current bottle size

            // If the count has decreased, subtract the difference from cash
            if (count < previousCount) {
                const diff = previousCount - count;  // Calculate the difference
                totalCash -= price * diff;  // Subtract from total cash based on the price
            } else {
                // Update the total based on selected payment method
                if (document.getElementById('mpesa').checked) {
                    totalMpesa += price * (count - previousCount); // Add to Mpesa total
                } else if (document.getElementById('cash').checked) {
                    totalCash += price * (count - previousCount); // Add to Cash total
                }
            }

            totalBottlesSold[bottle] = count; // Update the total bottles sold
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
    document.getElementById('results').style.display = "flex";
    const opening = parseInt(document.getElementById('opening').value) || 0;
    const closing = parseInt(document.getElementById('closing').value) || 0;
    const cashSales = parseInt(document.getElementById('cashSale').innerText) || 0;
    const mpesaSales = parseInt(document.getElementById('mpesaSale').innerText) || 0;

    const meterDiff = closing - opening;
    const totalSales = cashSales + mpesaSales;

    document.getElementById("meterDifference").innerText = meterDiff + " Litres";
    document.getElementById("totalSales").innerText = totalSales + " Ksh";
}

function expenses() {
    let expInput = document.getElementById('expense').value.trim();
    let cash = parseInt(document.getElementById('cashSale').innerText);

    // Regular expression to match optional text (with spaces or symbols) before and after the number
    let regex = /([a-zA-Z\s\W]*)(\d+)([a-zA-Z\s\W]*)/;
    let match = expInput.match(regex);

    if (!match) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    // Extract text (optional) and the numeric value
    let text = match[1].trim() || "Unknown"; // Default to "Unknown" if no text is found
    let num = parseInt(match[2]);

    if (isNaN(num)) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    // Capitalize the first letter of the text
    let capitalizedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    // Hide the error message if input is valid
    document.getElementById('error').style.display = 'none';

    // Calculate the balance
    let balance = cash - num;
    document.getElementById('cashSale').innerText = balance + " Ksh";

    // Create a span element and append it to the expense list
    let span = document.createElement('span');
    span.innerText = `${capitalizedText}: ${num} Ksh`;
    span.className = 'exp';

    document.getElementById('expenseList').appendChild(span);

    // Clear the input field
    document.getElementById('expense').value = ''; 
}

function closeResults() {
    document.getElementById('results').style.display = "none";
}

function saveRecord() {
    const date = document.getElementById('recordDate').value;
    const record = {
        date: date,
        opening: document.getElementById('opening').value,
        closing: document.getElementById('closing').value,
        totalSold1l: totalBottlesSold["1l"],
        totalSold5l: totalBottlesSold["5l"],
        totalSold10l: totalBottlesSold["10l"],
        totalSold20l: totalBottlesSold["20l"],
        mpesaSale: document.getElementById('mpesaSale').innerText,
        cashSale: document.getElementById('cashSale').innerText
    };

    let records = JSON.parse(localStorage.getItem('records')) || [];
    const existingRecordIndex = records.findIndex(r => r.date === date);
    if (existingRecordIndex !== -1) {
        records[existingRecordIndex] = record;
    } else {
        records.push(record);
    }
    localStorage.setItem('records', JSON.stringify(records));
}

function displayRecordByDate() {
    const selectedDate = document.getElementById('recordDate').value;
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate > today) {
        alert('Error: Date is in the future.');
        return;
    }

    const record = records.find(record => record.date === selectedDate);
    if (!record) {
        const addData = confirm('No existing record for the selected date. Would you like to add data?');
        if (!addData){
            document.getElementById('recordDate').value = today;
            displayRecordByDate();
            return;
        }
       
    // Clear input fields to allow user to add data
    document.getElementById('opening').value = "";
    document.getElementById('closing').value = "";
    document.getElementById('totalSold1l').innerText = 0;
    document.getElementById('totalSold5l').innerText = 0;
    document.getElementById('totalSold10l').innerText = 0;
    document.getElementById('totalSold20l').innerText = 0;
    document.getElementById('mpesaSale').innerText = 0;
    document.getElementById('cashSale').innerText = 0;
    return;  
 }

    document.getElementById('opening').value = record.opening;
    document.getElementById('closing').value = record.closing;
    document.getElementById('totalSold1l').innerText = record.totalSold1l;
    document.getElementById('totalSold5l').innerText = record.totalSold5l;
    document.getElementById('totalSold10l').innerText = record.totalSold10l;
    document.getElementById('totalSold20l').innerText = record.totalSold20l;
    document.getElementById('mpesaSale').innerText = record.mpesaSale;
    document.getElementById('cashSale').innerText = record.cashSale;
}

// Call loadAutosave on page load to show existing records
window.onload = function() {
    loadAutosave();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
    displayRecordByDate();
};

function autosave() {
    const recordDate = document.getElementById("recordDate").value;
    const openingReading = document.getElementById("opening").value;
    const closingReading = document.getElementById("closing").value;
    const totalSold20l = document.getElementById("totalSold20l").innerText;
    const totalSold10l = document.getElementById("totalSold10l").innerText;
    const totalSold5l = document.getElementById("totalSold5l").innerText;
    const totalSold1l = document.getElementById("totalSold1l").innerText;
    const mpesaSale = document.getElementById("mpesaSale").innerText;
    const cashSale = document.getElementById("cashSale").innerText;

    //save the data
    const recordData = {
        date: recordDate,
        openingRecord: openingReading,
        closingRecord: closingReading,
        bottles: {
            "20l": totalSold20l,
            "10l": totalSold10l,
            "5l": totalSold5l,
            "1l": totalSold1l
        },
        mpesaSale: mpesaSale,
        cashSale: cashSale
    };

    //save the records
    localStorage.setItem("autosaveRecord", JSON.stringify(recordData));
}

function loadAutosave() {
    const autosaveRecord = JSON.parse(localStorage.getItem("autosaveRecord"));
    if (autosaveRecord) {
        document.getElementById("recordDate").value = autosaveRecord.date;
        document.getElementById("opening").value = autosaveRecord.openingRecord;
        document.getElementById("closing").value = autosaveRecord.closingRecord;
        document.getElementById("totalSold20l").innerText = autosaveRecord.bottles["20l"];
        document.getElementById("totalSold10l").innerText = autosaveRecord.bottles["10l"];
        document.getElementById("totalSold5l").innerText = autosaveRecord.bottles["5l"];
        document.getElementById("totalSold1l").innerText = autosaveRecord.bottles["1l"];
        document.getElementById("mpesaSale").innerText = autosaveRecord.mpesaSale;
        document.getElementById("cashSale").innerText = autosaveRecord.cashSale;
    }
}

document.getElementById("recordDate").addEventListener('input', autosave);
document.getElementById("opening").addEventListener('input', autosave);
document.getElementById("closing").addEventListener('input', autosave);
document.getElementById("1l").addEventListener('input', autosave);
document.getElementById("5l").addEventListener('input', autosave);
document.getElementById("10l").addEventListener('input', autosave);
document.getElementById("20l").addEventListener('input', autosave);

