var vm = new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        username: '', // Our username
        message: 'hello world!',
        images: {'wiki': 'favicon.ico'},
        show: true,
        flag:true,
        styleObject: {width: '0%'},
        joined: false // True if email and username have been filled in
    },
    watch: {
        chatContent: function (val, oldVal) {
            console.log('show: %s, old: %s', val, oldVal);
                var element = document.getElementById('chat-messages');
                    element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
                console.log( element.scrollHeight);
        }
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

        send: function (flag) {
            this.styleObject.width = "0%";
            this.flag = flag;
            if (this.newMsg !== '') {
                this.show = false;
                this.ws.send(
                    JSON.stringify({
                            username: this.username,
                            message: $('<p>').html(this.newMsg).text() // Strip out html
                        }
                    ));
                this.styleObject.width = "20%";
                this.newMsg = ''; // Reset newMsg
            }
            this.styleObject.width = "40%";
        },

        join: function () {
            this.username = $('<p>').html(this.username).text();
            this.joined = true;
        },

        googleImage: function (msg,index) {
            this.styleObject.width = "60%";
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
                                    console.log(response.status);
                                    if(response.status != 403){
                                        console.log(image);
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
                    if (index ===0){
                        self.flag = false;
                        self.showMessage(msg);
                        self.show = true;//显示输入框
                    }
                }
            });
        },

        showImage: function (msg) {
            if (msg.username === "wiki") {
                this.chatContent +='<div class="media"><div class="media-left">'
                    +'<img class="media-object" data-src="holder.js/48x48" alt="48x48" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 48px; height: 48px;"></div>'
                    +'<div class="media-body"><h4 class="media-heading">'
                    + msg.username
                    +'</h4>' + emojione.toImage(msg.message) + '</div>';

            }else if( msg.username in this.images){
                this.googleImage(msg,0);
            } else {
                this.googleImage(msg,1);
                if (this.flag){
                    this.googleImage(msg,0);
                }else {
                    this.showMessage(msg);
                }
            }
            for (var i=60;i<100;i++){
                this.styleObject.width = i+"%";
            }
        },

        showMessage: function (msg) {
            var name = document.getElementById("name").value;
            if (this.flag){
                if (msg.username === name) {
                    this.chatContent += '<div class="media">'
                        + '<div class="media-body"><h4 class="media-heading text-right">'
                        + msg.username
                        + '</h4><div class="text-right"><img src="' + this.images[msg.message] + '" class="img-thumbnail"></div></div>'
                        + '<div class="media-right"><img class="media-object" data-src="holder.js/48x48" alt="48x48" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 48px; height: 48px;"></div>';
                } else {
                    this.chatContent += '<div class="media"><div class="media-left">'
                        + '<img class="media-object" data-src="holder.js/48x48" alt="48x48" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 48px; height: 48px;"></div>'
                        + '<div class="media-body"><h4 class="media-heading">'
                        + msg.username
                        + '</h4><img src="' + this.images[msg.message] + '" class="img-thumbnail"></div>';
                }
            }else {
                if (msg.username === name) {
                    this.chatContent += '<div class="media">'
                        + '<div class="media-body"><h4 class="media-heading text-right">'
                        + msg.username
                        + '</h4><div class="text-right">' +  emojione.toImage(msg.message) + '</div></div>'
                        + '<div class="media-right"><img class="media-object" data-src="holder.js/48x48" alt="48x48" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 48px; height: 48px;"></div>';
                } else {
                    this.chatContent += '<div class="media"><div class="media-left">'
                        + '<img class="media-object" data-src="holder.js/48x48" alt="48x48" src="' + this.images[msg.username] + '" data-holder-rendered="true" style="width: 48px; height: 48px;"></div>'
                        + '<div class="media-body"><h4 class="media-heading">'
                        + msg.username
                        + '</h4>'  +  emojione.toImage(msg.message) + '</div>';
                }
            }
            this.show = true;//显示输入框
        }
    }

});