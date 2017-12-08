var vm = new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        username: '', // Our username
        message: 'Hello Vue!',
        images: {"wiki": "brown.png"},
        joined: false // True if email and username have been filled in
    },

    created: function () {
        var self = this;
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function (e) {
            var msg = JSON.parse(e.data);
            self.showImage(msg);
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
        },

        googleImage: function (msg,index) {
            var self = this;
            var name = msg.username;
            if (index === 0)
                name = msg.message;
            $.ajax({
                url: "https://www.googleapis.com/customsearch/v1",
                data: {
                    q: name,
                    key: 'AIzaSyCqPGFsZjjPgp7cG5KTi3OhYKoMofeLiWI',
                    cx: '010386887610032054917:nibt9ljmdaa',
                    // imgType: 'photo',
                    imgSize: 'medium',
                    searchType: 'image',
                    num: '3'
                },
                type: "get",
                dataType: 'jsonp',
                success: function (data) {
                    var image = 'http://www.gravatar.com/avatar/';
                    var flag = false;
                    for (var i=0;i<3;i++){
                        if (!flag){
                            image = data.items[i].link;
                            $.ajax({
                                url: image,
                                type: 'GET',
                                timeout : 200,
                                async: false,
                                complete: function(response){
                                    if(response.status != 403){
                                        flag = true;
                                    }
                                }
                            });
                        }
                    }
                    self.images[name] = image; // map.put(key, value);
                    if (index ===0){
                        self.showMessage(msg);
                    }
                },
                error: function () {
                    console.log("error can not find image");
                }
            });
        },

        showImage: function (msg) {
            if (msg.username === "wiki") {
                this.chatContent +='<div class="media"><div class="media-left">'
                    +'<img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>'
                    +'<div class="media-body"><h4 class="media-heading">'
                    + msg.username
                    +'</h4>' + emojione.toImage(msg.message) + '</div>';
            }else if( msg.username in this.images){
                this.googleImage(msg,0);
            } else {
                this.googleImage(msg,1);
                this.googleImage(msg,0);
            }
        },

        showMessage: function (msg) {

            var name = document.getElementById("name").value;
            if (msg.username === name) {
                this.chatContent += '<div class="media">'
                    + '<div class="media-body"><h4 class="media-heading text-right">'
                    + msg.username
                    + '</h4><div class="text-right"><img src="' + this.images[msg.message] + '" class="img-thumbnail"></div></div>'
                    + '<div class="media-right"><img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>';
            } else {
                this.chatContent += '<div class="media"><div class="media-left">'
                    + '<img class="media-object" data-src="holder.js/54x54" alt="54x54" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 54px; height: 54px;"></div>'
                    + '<div class="media-body"><h4 class="media-heading">'
                    + msg.username
                    + '</h4><img src="' + this.images[msg.message] + '" class="img-thumbnail"></div>';
            }

            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
        }
    }

});