var currencyLayerApiURL = "http://apilayer.net/api/live?access_key=";
var currencyLayerAccessKey = "2cc88e01553c4343b15db221b6f941b6";
var coinDeskApiURL = "https://api.coindesk.com/v1/bpi/historical/close.json";


function getCurrenciesList(){
	$(".exchange-button").click(function(e){
		e.preventDefault();
		var amount = $(".currency-amount").val();
		var to = $(".to-currency").val();
		var action = "convert";
		$.ajax({
			url: currencyLayerApiURL+currencyLayerAccessKey,
			method: "GET"
		}).done(function(response){
			var codes = response.quotes; //Get the list of curencies
			for(code in codes){
				var currentCurrencyCode = code.substring(3,6); //Cut the USD out
				if(to === currentCurrencyCode){
					var rate = codes[code];
					var result = amount * rate;
					$(".exchange-result").text(result);
				}
			}
		});

	});
}

//This function make an ajax call to api to get the list
//of currencies. Then it would removes the USD from the name
// of currencies and add them to "From" and "To" select boxes
function getListOfCurrencyCodes(){
	$.ajax({ //Make Ajax call to api
		url: currencyLayerApiURL+currencyLayerAccessKey,
		method: "GET"
	}).done(function(response){ //When the response is ready
		if(response!=undefined){
			var codes = response.quotes; //Get the list of curencies
			for(code in codes){
				var currentCurrencyCode = code.substring(3,6); //Cut the USD out
				
				$('.from-currency').append($("<option>",{ //Add the list of currencies to from list
					value : currentCurrencyCode,
					text: currentCurrencyCode
				}));
				$('.to-currency').append($("<option>",{//Add the list of currencies to to list
					value : currentCurrencyCode,
					text: currentCurrencyCode
				}));
				$('.bitcoin-currency').append($("<option>",{//Add the list of currencies to bitcoin currency
					value : currentCurrencyCode,
					text: currentCurrencyCode
				}));
			}
		}
	});
}

//This function attach a Jquery UI datepicker to all elements with datepicker class
function initDatePickers(){
	$('.datepicker').each(function(){
		$(this).datepicker({
			maxDate: '0', //Max date shouln't be higher than today
			dateFormat: 'yy-mm-dd' //Date format
		});
	});
}

//Following attach a click listener to load-chart-button and on click it will send a
//request using selected date ranges and currency to coinDeskApi. After getting the
// response it send the response to drawBitcoinChart
function initBitcoin(){
	$('.load-chart-button').click(function(e){
		e.preventDefault();
		var from = $('.bitcoin-from-date').val();
		var to = $('.bitcoin-to-date').val();
		var currencyCode = $('.bitcoin-currency').val();
		if(from==="" || to===""){
			alert("Please select from & to dates!");
		}else{
			$.ajax({
				url: coinDeskApiURL+'?currency='+currencyCode+'&start='+from+'&end='+to,
				method: "GET"
			}).done(function(response){
				if(response!=""){
					var data = JSON.parse(response);
					drawBitcoinChart(data.bpi, currencyCode);
				}
			});
		}
	})
}

// This function use the provided data and chart.js library to draw the chart
function drawBitcoinChart(data , currencyCode){
	var months = [];
	var prices = [];
	//Adds months and prices to two seprate arrays to feed to char library
	for(month in data){
		months.push(month); 
		prices.push(data[month]);
	}
	
	//Chart configuration
	var config = {
		type: 'line',
		data: {
			labels: months,
			datasets: [{
				label: 'Price('+currencyCode+')',
				backgroundColor: 'rgba(220, 53, 69, 0.6)',
				borderColor: 'rgba(220, 53, 69, 0.6)',
				fill: false,
				data: prices,
			}]
		},
		options: {
			responsive: true,
			scales: {
				xAxes: [{
					display: true,
				}],
				yAxes: [{
					display: true,
					type: 'linear',
				}]
			}
		}
	};

	var ctx = document.getElementById('bitcoin-canvas').getContext('2d');
	window.myLine = new Chart(ctx, config);
}



$(document).ready(function(){
		getListOfCurrencyCodes();
		getCurrenciesList();
		initDatePickers();
		initBitcoin();
});
