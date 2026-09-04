let input = document.getElementById("input")
let discussion = JSON.parse(localStorage.getItem("Sylqoramemory")) || []
let chats = JSON.parse(localStorage.getItem("Sylqorachats")) || []
let currentchatid = localStorage.getItem("SylqoraCurrentChatId") || null;
window.addEventListener("DOMContentLoaded", () => {
    let chatcontainer = document.querySelector(".Chat");

    discussion.forEach(msg => {
        let msgDiv = document.createElement("div");
        msgDiv.className = msg.role === "user" ? "UserBubble" : "Botmsg";
        msgDiv.innerHTML = Markdown(msg.content);
        chatcontainer.append(msgDiv);
    });
    chatcontainer.scrollTop = chatcontainer.scrollHeight;
    Displaychats();
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
    if (currentchatid){
        localStorage.setItem("SylqoraCurrentChatId", currentchatid);
    }else{
        localStorage.removeItem("SylqoraCurrentChatId")
    }

}
function Savechats() {
    localStorage.setItem("Sylqorachats", JSON.stringify(chats));
}
function Autosave(){
    if (discussion.length === 0)return;
    let firstmsg = discussion.find(m => m.role === "user");
    let chattitle = firstmsg?firstmsg.content: "New Conversation";
    let messagesCopy = [...discussion]
    if (!currentchatid){
        currentchatid = Date.now().toString();
        let newChat = {
            id : currentchatid,
            title: chattitle,
            messages: messagesCopy
        };
        chats.push(newChat);
    }else{
        let existing = chats.find(c=> c.id === currentchatid)
        if (existing ){
            existing.messages = messagesCopy;
            existing.title = chattitle 
        }else{
            chats.push({id:currentchatid, title: chattitle, messages: messagesCopy});
        }
    }
    Savediscussion();
    Savechats();
    Displaychats();
}

function ClearDiscussion() {
    if (discussion.some(m => m.role === "user")){
        Autosave();
    }
    discussion = [];
    currentchatid = null ;
    Savediscussion();
    
    let chat = document.querySelector(".Chat");
    let thinking = document.querySelector(".Thinking");
    chat.innerHTML = "";
    if (thinking) {
        thinking.style.display = "none";
    
        chat.append(thinking);
    }
    let welcometxt = "Hey there ! Ready to dive in?"
    discussion.push({role:"assistant", content : welcometxt})
    Savediscussion();
    sendBotMessage(welcometxt);
}
function Displaychats(){
    let chatlist = document.querySelector(".list");
    let thinking = document.querySelector(".Thinking")
    chatlist.innerHTML = "";
    
    chats.forEach(chat =>{
        let chatpiece = document.createElement("div")
        chatpiece.className = "chatpiece";
        chatpiece.textContent = chat.title;
        if (chat.id == currentchatid){
            chatpiece.classList.add("active");
        }
    
        chatpiece.onclick = () => {

        currentchatid = chat.id;
        discussion = [...chat.messages];
        Savediscussion();
        let chatcontainer = document.querySelector(".Chat")
        chatcontainer.innerHTML=""
        if (thinking){
            thinking.style.display = "none";
            chatcontainer.append(thinking);
        }
        discussion.forEach (msg =>{
            let msgdiv = document.createElement("div");
            msgdiv.className = msg.role === "user"?"UserBubble":"Botmsg";
            msgdiv.innerHTML = Markdown(msg.content);
            chatcontainer.append(msgdiv);
        })
        chatcontainer.scrollTop = chatcontainer.scrollHeight;
        Displaychats();

}
chatlist.append(chatpiece);
})
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
if (thinking){
    newMsg.append(thinking);
    thinking.style.display = "flex";
}
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
    Autosave();
}else{
    sendBotMessage("Sorry, I couldn't process your request. Please try again.");
}
}
input.addEventListener("keydown",(enter) => {
    if (enter.key === "Enter"){
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
    return data.Reply;

}

