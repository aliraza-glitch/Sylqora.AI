let input = document.getElementById("input")
async function sendMessage(){
let Message = input.value
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.textContent = Message
newMsg.append(userMsg)
input.value = ""
thinking = document.querySelector(".Thinking")
newMsg.append(thinking)
thinking.style.display = "flex"
let answer = await toServer(Message)
thinking.style.display = "none"
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
        Botmsg.innerHTML = answer
}



async function toServer(message){
    let msgData = {
        message: message
    }
    let response = await fetch("/api/chat",{
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
    let check = await fetch("/api/health")
    let checktxt = await check.json()
    console.log("SERVER RESPONSE:", checktxt)
    
}
document.getElementById("Checkbutton").addEventListener("click", Checkserver)
