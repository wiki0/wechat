var vm = new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        username: '', // Our username
        message: 'Hello Vue!',
        images: {"wiki":"brown.png"},
        joined: false // True if email and username have been filled in
    },

    created: function () {
        var self = this;
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function (e) {
            var msg = JSON.parse(e.data);
            var name = document.getElementById("name").value;
            if (msg.username in self.images || msg.username ==="wiki") {

                if (msg.username === name) {
                    self.chatContent += '<div class="media">'
                        + '<div class="media-body"><h4 class="media-heading text-right">'
                        + msg.username
                        + '</h4><div class="text-right">' + emojione.toImage(msg.message) + '</div></div>'
                        + '<div class="media-right"><img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + self.images[msg.username] + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>';
                } else {
                    self.chatContent += '<div class="media"><div class="media-left">'
                        + '<img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + self.images[msg.username] + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>'
                        + '<div class="media-body"><h4 class="media-heading">'
                        + msg.username
                        + '</h4>' + emojione.toImage(msg.message) + '</div>';
                }

            } else {
                console.log("false");
                var image = 'http://www.gravatar.com/avatar/';
                $.ajax({
                    url: "https://www.googleapis.com/customsearch/v1",
                    data: {
                        q: msg.username,
                        key: 'AIzaSyCqPGFsZjjPgp7cG5KTi3OhYKoMofeLiWI',
                        cx: '010386887610032054917:nibt9ljmdaa',
                        imgType: 'photo',
                        imgSize: 'medium',
                        searchType: 'image',
                        num: '3'
                    },
                    type: "get",
                    dataType: 'jsonp',
                    async: false,
                    success: function (data) {
                        var flag = false;
                        for (var i=0;i<3;i++){
                            if (!flag){
                                image = data.items[i].link;
                                console.log(image);
                                $.ajax({
                                    url: image,
                                    type: 'GET',
                                    async: false,
                                    complete: function(response){
                                        if(response.status != 403){
                                            flag = true;
                                        }else{
                                           console.log('403');
                                        }
                                    }
                                });
                            }
                        }

                        if (msg.username === name) {
                            self.chatContent += '<div class="media">'
                                + '<div class="media-body"><h4 class="media-heading text-right">'
                                + msg.username
                                + '</h4><div class="text-right">' + emojione.toImage(msg.message) + '</div></div>'
                                + '<div class="media-right"><img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + image + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>';
                        } else {
                            self.chatContent += '<div class="media"><div class="media-left">'
                                + '<img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + image + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>'
                                + '<div class="media-body"><h4 class="media-heading">'
                                + msg.username
                                + '</h4>' + emojione.toImage(msg.message) + '</div>';
                        }
                        self.images[msg.username] = image; // map.put(key, value);
                    },
                    error: function () {
                        console.log("error");
                    }
                });
            }

            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
        });
    },

    methods: {
        send: function () {
            if (this.newMsg !== '') {
                this.ws.send(
                    JSON.stringify({
                            username: this.username,
                            message: $('<p>').html(this.newMsg).text() // Strip out html
                        }
                    ));
                this.newMsg = ''; // Reset newMsg
            }
        },

        join: function () {
            this.username = $('<p>').html(this.username).text();
            this.joined = true;
        }
    }

});