/* jshint asi: true */

function initMap() {
    $.ajax({
        type: "GET",
        url: "https://api.monzo.com/transactions?expand[]=merchant&account_id=ADD-ACCOUNT-ID-HERE",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ADD-TOKEN-HERE');
        },
        success: function(result) {
            var transactions = result.transactions;

            for (var i = 0; i < transactions.length; i++) {
                function ucFirst(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                if (transactions[i].merchant != null) {
                    if (transactions[i].merchant.online === false) {
                        var amount = ((transactions[i].amount) / 100).toFixed(2);
                        var category = transactions[i].category.replace(/_/g, ' ');

                        var splitDate = transactions[i].created.slice(0, 10).split('-');
                        var date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);

                        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

                        var transactionInfo = ({
                            lat: transactions[i].merchant.address.latitude,
                            lng: transactions[i].merchant.address.longitude,
                            merchantName: transactions[i].merchant.name,
                            localTransactionAmount: '£' + ((amount.length && amount[0] == '-') ? amount.slice(1) : amount),
                            category: ucFirst(category),
                            date: date.getDate() + ' ' +  months[date.getMonth()] + ' ' + date.getFullYear()
                        });

                        locations.push(transactionInfo);
                    }
                }
            }

            console.log(result.transactions[50]);

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 3,
                center: {
                    lat: 51.5074,
                    lng: 0.1278
                }
            });

            var iconBase = 'img/map-icons/';
            var icons = {
                Transport: {
                    icon: iconBase + 'transport.png'
                },
                Groceries: {
                    icon: iconBase + 'shopping.png'
                },
                'Eating out': {
                    icon: iconBase + 'food.png'
                },
                Cash: {
                    icon: iconBase + 'financial-services.png'
                },
                Bills: {
                    icon: iconBase + 'manufacturing.png'
                },
                Entertainment: {
                    icon: iconBase + 'night-life.png'
                },
                Holidays: {
                    icon: iconBase + 'vacant-land.png'
                },
                Shopping: {
                    icon: iconBase + 'shopping.png'
                },
                General: {
                    icon: iconBase + 'home-services.png'
                },
                Expenses: {
                    icon: iconBase + 'books-media.png'
                }
            };

            var infoWin = new google.maps.InfoWindow();
            var markers = locations.map(function(location, i) {
                var marker = new google.maps.Marker({
                    position: location,
                    icon: icons[location.category].icon
                });
                google.maps.event.addListener(marker, 'click', function(evt) {
                    console.log(location);
                    infoWin.setContent(
                        '<h3>' + location.merchantName + '</h3>' +
                        '<table class="info-table">' +
                          '<tr>' +
                            '<td class="bold">Transaction Amount (GBP)</td>' +
                            '<td>' + location.localTransactionAmount + '</td>' +
                          '</tr>' +
                          '<tr>' +
                            '<td class="bold">Category</td>' +
                            '<td>' + location.category + '</td>' +
                          '</tr>' +
                          '<tr>' +
                            '<td class="bold">Date</td>' +
                            '<td>' + location.date + '</td>' +
                          '</tr>' +
                        '</table>'
                    );
                    infoWin.open(map, marker);
                })
                return marker;
            });

            // Add a marker clusterer to manage the markers.
            var markerCluster = new MarkerClusterer(map, markers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });

        },
        error: function(result) {
            console.log(result);
        }
    });
}

var locations = []
