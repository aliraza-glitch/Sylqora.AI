let input = document.getElementById("input")
let discussion = JSON.parse(localStorage.getItem("Sylqoramemory")) || []
window.addEventListener("DOMContentLoaded", () => {
    let chatcontainer = document.querySelector(".Chat");
    discussion.forEach(msg => {
        let msgDiv = document.createElement("div");
        msgDiv.className = msg.role === "user" ? "UserBubble" : "Botmsg";
        msgDiv.innerHTML = Markdown(msg.content);
        chatcontainer.append(msgDiv);
    });
    chatcontainer.scrollTop = chatcontainer.scrollHeight;
})
function Markdown (text){
    if (!text) return"";
    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/\n/g, '<br>')
    return formatted;
}
function    Savediscussion() {
    localStorage.setItem("Sylqoramemory", JSON.stringify(discussion));
}
function ClearDiscussion() {
    localStorage.removeItem("Sylqoramemory");
    discussion = [];
    let chat = document.querySelector(".Chat");
    let thinking = document.querySelector(".Thinking");
    chat.innerHTML = "";
    if (thinking) {
        thinking.style.display = "none";
    
        chat.append(thinking);
    }
    
}
async function sendMessage(){
let Message = input.value.trim()
if (!Message) return;

let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.innerHTML = Markdown(Message)
newMsg.append(userMsg)
input.value = ""
let thinking = document.querySelector(".Thinking")
newMsg.append(thinking)
thinking.style.display = "flex"
newMsg.scrollTop = newMsg.scrollHeight;

let answer = await toServer(Message, discussion);

if (thinking){
    thinking.style.display = "none"
}
if (answer) {
    discussion.push({role: "user", content: Message});
    discussion.push({role: "assistant", content: answer});
    Savediscussion();
    sendBotMessage(answer);

}else{
    sendBotMessage("Sorry, I couldn't process your request. Please try again.");
}
}
input.addEventListener("keydown",(enter) => {
    if (enter.key == "Enter"){
        sendMessage();
    }
})
function sendBotMessage(answer){
    let Botmsg = document.createElement("div")
    Botmsg.className = "Botmsg"
    
    let findChat = document.querySelector(".Chat")
    findChat.append(Botmsg)
        Botmsg.innerHTML = Markdown(answer)
        findChat.scrollTop = findChat.scrollHeight;
}



async function toServer(message, history){
    let msgData = {
        message: message,
        history: history
    };
    let response = await fetch("/api/chat",{
        method : "POST",   
        headers : {
            "Content-Type":"application/json"
        },
        body : JSON.stringify(msgData)
    });
    let data = await response.json()
    console.log("API data:" ,data)
    return data.Reply
}

