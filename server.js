const http = require("http")
const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    console.log(req.url)
    console.log(req.method)
    if (req.method == "OPTIONS"){
        res.setHeader("Access-Control-Allow-Methods", "POST")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")
        res.end()
    }
    else if (req.url == "/health" && req.method == "GET"){
        let statusdata = {
            status:"online"
        }
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify(statusdata))
    }
    else if (req.url == "/about" && req.method == "GET"){
        res.end("Sylqora is a study companion AI")
    }
    else if (req.url == "/chat" && req.method == "POST" ){
        let body = ""
        req.on("data", (chunk) => {
            body += chunk
        })
        req.on("end",() =>{
            let msgData = JSON.parse(body)
            console.log(body)
            console.log(msgData.message)
            let Replydata = {
                Reply: "I have recieved your message"
            }
            let message = msgData.message
            if (message.includes("momentum")){
                Replydata.Reply = "Momentum is the product of mass and velocity of a body"
            }
            if (message.includes("acceleration")){
                Replydata.Reply= "Acceleration is the rate of change of velocity"
            }
            if (message.includes("hello")){
                Replydata.Reply= "Hey! Look who finally showed up."
            }
            if (message.includes("what")){
                Replydata.Reply="You are using AI the pinnacle of human technology for getting an answer to a question like that."
            }
            
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(Replydata))
    })
    }
    else 
        res.end("Hello from Sylqora")

})
const PORT = process.env.PORT || 8000
server.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})