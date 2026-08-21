function sendMessage(){
let input = document.getElementById("input")
let Message = input.value
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.textContent = Message
newMsg.append(userMsg)
input.value = ""
}
input.addEventListener("keydown",(enter) => {
    if (enter.key == "Enter"){
        sendMessage();
    }
})