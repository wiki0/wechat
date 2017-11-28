FROM golang:latest

MAINTAINER Razil "wiki0@live.cn"

WORKDIR $GOPATH/src/wechat
ADD . $GOPATH/src/wechat
RUN go get github.com/gorilla/websocket \
&& go build .

EXPOSE 8080

ENTRYPOINT ["./wechat"]