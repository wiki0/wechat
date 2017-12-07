package main

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
)

var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan Message)           // broadcast channel
var historyArrary = [3][2]string{} //聊天历史
// Configure the upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Define our message object
type Message struct {
	Username string `json:"username"`
	Message  string `json:"message"`
}

func main() {
	// Create a simple file server
	path,_ := os.Getwd()
	log.Println(path)
	fs := http.FileServer(http.Dir(path+"/public/"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	go handleMessages()

	// Start the server on localhost port 8000 and log any errors
	log.Println("http server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	clients[ws] = true

	//聊天历史
	if historyArrary[0][0]==""{
		historyArrary[0][0]="wiki"
		historyArrary[0][1]="有什么想说的,这还没有人"
	}
	for x:=0;x<3 ; x++ {
		var history Message
		if historyArrary[x][0]!="" {
			history.Username = historyArrary[x][0]
			history.Message = historyArrary[x][1]
			err := ws.WriteJSON(history)
			if err != nil {
				log.Printf("error: %v", err)
				ws.Close()
				delete(clients, ws)
			}
		}
	}

	for {
		var msg Message
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
		// Send it out to every client that is currently connected
		for client := range clients {
			index := 0
			for x:=0;x<3 ; x++ {
				if historyArrary[x][0]=="" {
					index =x
					break
				}
			}
			if index <3 {
				historyArrary[index][0]=msg.Username
				historyArrary[index][1]=msg.Message
			}else{
				for x:=0;x<2 ; x++ {
					historyArrary[x][0]=historyArrary[x+1][0]
					historyArrary[x][1]=historyArrary[x+1][1]
				}
				historyArrary[2][0]=msg.Username
				historyArrary[2][1]=msg.Message
			}
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

