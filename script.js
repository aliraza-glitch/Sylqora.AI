function sendMessage(){
let input = document.getElementById("input")
let Message = input.value
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.textContent = Message
newMsg.append(userMsg)
input.value = ""
let caseInsensitive = Message.toLowerCase()
sendBotMessage(caseInsensitive)
}
input.addEventListener("keydown",(enter) => {
    if (enter.key == "Enter"){
        sendMessage();
    }
})
function sendBotMessage(Userinput){
    let Botmsg = document.createElement("div")
    Botmsg.className = "Botmsg"
    Botmsg.textContent = "Hey Great Question!. Let's work that out together"
    let findChat = document.querySelector(".Chat")
    findChat.append(Botmsg)
        let answer = getResponse(Userinput)
        Botmsg.textContent = answer.join("\n")
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
