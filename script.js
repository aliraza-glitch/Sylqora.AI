async function sendMessage(){
let input = document.getElementById("input")
let Message = input.value
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.textContent = Message
newMsg.append(userMsg)
input.value = ""
let answer = await toServer(Message)
sendBotMessage(answer)
}
input.addEventListener("keydown",(enter) => {
    if (enter.key == "Enter"){
        sendMessage();
    }
})
function sendBotMessage(answer){
    let Botmsg = document.createElement("div")
    Botmsg.className = "Botmsg"
    Botmsg.textContent = "Hey Great Question!. Let's work that out together"
    let findChat = document.querySelector(".Chat")
    findChat.append(Botmsg)
        Botmsg.textContent = answer
}

function getResponse(Userinput){
    let responses = []
    if(Userinput.includes("hello")){
        responses.push("Hey! I started thinking you would make me do all the studying by myself.😏")
    }
    if (Userinput.includes("momentum")){
        responses.push("Momentum is the product of mass and velocity of a body")
    }
    if (Userinput.includes("acceleration")){
        responses.push("Acceleration is the rate of change of velocity")
    }
    if (responses.length === 0){
        responses.push("How about we open a textbook for that one? 😭📚")
    }
    return responses
}

async function toServer(message){
    let msgData = {
        message: message
    }
    let response = await fetch("http://localhost:8000/chat",{
        method : "POST",   
        headers : {
            "Content-Type":"application/json"
        },
        body : JSON.stringify(msgData)
    })
    let data = await response.json()
    return data.Reply
}

async function Checkserver(){
    let check = await fetch("http://localhost:8000/health")
    let checktxt = await check.json()
    console.log("SERVER RESPONSE:", checktxt)
    document.getElementById("status").textContent = checktxt.status

}
document.getElementById("Checkbutton").addEventListener("click", Checkserver)
