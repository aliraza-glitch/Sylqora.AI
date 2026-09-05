let input = document.getElementById("input")
let discussion = JSON.parse(localStorage.getItem("Sylqoramemory")) || []
let chats = JSON.parse(localStorage.getItem("Sylqorachats")) || []
let currentchatid = localStorage.getItem("SylqoraCurrentChatId") || null;
window.addEventListener("DOMContentLoaded", () => {
    let chatcontainer = document.querySelector(".Chat");
    let welcome = document.querySelector(".welcometxt")
    if (discussion.length > 0 && welcome){
        welcome.style.display = "none";
    }

    

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
        .replace(/^\s*-\s+(.*)$/gmol, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>')             
        .replace(/\n/g, '<br>');
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
    let welcome = document.querySelector(".welcometxt");

    let messages = chat.querySelectorAll(".UserBubble, .Botmsg");
    messages.forEach(msg => msg.remove())
    if(welcome){
        welcome.style.display = "block"
    }
    if (thinking) {
        thinking.style.display = "none";

    }
    Displaychats();
}
function Displaychats(){
    let chatlist = document.querySelector(".list");
    
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
        let welcome = document.querySelector(".welcometxt");  
        let thinking = document.querySelector(".Thinking")
        
        let messages = chatcontainer.querySelectorAll(".UserBubble, .Botmsg");
        messages.forEach(msg => msg.remove());
        if (welcome){
            welcome.style.display = discussion.length === 0?"block":"none";
        }
        if (thinking){
            thinking.style.display = "none";
            
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
function ExplainConcept(){
    input.value = "Explain ";
    input.focus();
}
function Quizme(){
    input.value = "Quiz me on ";
    input.focus();
}
async function sendMessage(){
let Message = input.value.trim()
if (!Message) return;
let welcome = document.querySelector(".welcometxt")
if(welcome){
    welcome.style.display = "none";
}
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.innerHTML = Markdown(Message)
newMsg.append(userMsg)
input.value = ""
let activeChatIdatSend = currentchatid;
let historyShot = [...discussion]
discussion.push({role: "user", content:Message});
Savediscussion();
Autosave();
let thinking = document.querySelector(".Thinking")
if (thinking){
    newMsg.append(thinking);
    thinking.style.display = "flex";
}
newMsg.scrollTop = newMsg.scrollHeight;

let answer = await toServer(Message, historyShot);

if (thinking){
    thinking.style.display = "none"
}
if (currentchatid !== activeChatIdatSend){
    
        let tagChat = chats.find(c=>c.id === activeChatIdatSend)
        if(tagChat){
            if(answer){
                tagChat.messages.push({role: "assistant", content: answer});
            }else{
            tagChat.messages.pop();
            }
            Savechats();
        }
    return;
}
if (answer) {
    
    discussion.push({role: "assistant", content: answer});
    Savediscussion();
    sendBotMessage(answer);
    Autosave();
}else{
    userMsg.remove();
    discussion.pop();
    Savediscussion();
    if (discussion.length>0){
        Autosave();
    }else if(currentchatid){
        chats= chats.filter(c => c.id !== currentchatid);
        currentchatid = null;
        Savediscussion();
        Savechats();
        Displaychats();
    }
    sendBotMessage("Sorry, I couldn't process your request. Please try again")

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

