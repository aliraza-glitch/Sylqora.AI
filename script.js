let input = document.getElementById("input")
let quizmode = false
let quiztopic = ""
let quizquestion = 0
let quizscore = 0
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
        .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>') 
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
    let chattitle = firstmsg?firstmsg.content.slice(0,35): "New Conversation";
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
    quizmode = true;
    quizscore = 0
    input.value = ""
    input.placeholder = "What should I quiz you on ?"
    input.focus();
}
async function sendMessage(){
let Message = input.value.trim()
let displayMessage = Message;
if (!Message) return;
if(quizmode && quiztopic === ""){
    quiztopic = Message
    quizquestion = 1
    Message = "Start a quiz on " + quiztopic + ". Ask me one question only. Don't give the answer"
}else if (quizmode && quizquestion > 0 && quizquestion < 5){
    Message = "My answer is: " + Message + ". Check my answer. Respond naturally and briefly, like a teacher marking a student's answer. Avoid phrases like Great job, spot on, or you captured the core idea. Say correct, partially correct, or incorrect, explain the key point in 1-3 sentences, then ask the next question on " + quiztopic + ". At the very end, write exactly [RESULT: CORRECT] if my answer is correct or [RESULT: INCORRECT] if it is wrong.";
    quizquestion += 1
}else if(quizmode && quizquestion === 5){
    Message = "My answer is: " + Message + ". Check my answer. Respond naturally and briefly, like a teacher marking a student's answer. Avoid phrases like Great job, spot on, or you captured the core idea. Say correct, partially correct, or incorrect, explain the key point in 1-3 sentences, then ask the next question on " + quiztopic + ". At the very end, write exactly [RESULT: CORRECT] if my answer is correct or [RESULT: INCORRECT] if it is wrong.";
    quizquestion += 1
}
let welcome = document.querySelector(".welcometxt")
if(welcome){
    welcome.style.display = "none";
}
let newMsg = document.querySelector(".Chat")
let userMsg = document.createElement("div")
userMsg.className = "UserBubble"
userMsg.innerHTML = Markdown(displayMessage)
newMsg.append(userMsg)
input.value = ""
input.style.height = "44px"

let historyShot = [...discussion]
discussion.push({role: "user", content:displayMessage});
Savediscussion();
Autosave();
let activeChatIdatSend = currentchatid;
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
    if (answer.includes("[RESULT: CORRECT")){
        quizscore += 1;
    }
    answer = answer.replace(/\[RESULT:\s*(CORRECT|INCORRECT)\s*\]/gi, "");
    
    if (quizmode && quizquestion == 6){
        answer += "\n\n**Quiz complete - Score: " + quizscore + "/5**"
        quizmode = false
        quiztopic = ""
        quizquestion = 0
        input.placeholder = "Ask Sylqora anything"
    }
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
input.addEventListener("input", () =>{
    if (input.value === ""){
        input.style.height = "44px"
        return;
    }
    input.style.height = "auto";
    if(input.scrollHeight < 140){
        input.style.height = input.scrollHeight + "px";
    }else{
        input.style.height = "140px"
    }
})
input.addEventListener("keydown",(enter) => {
    if (enter.key === "Enter" && !enter.shiftKey){
        enter.preventDefault();
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
    try{
    let response = await fetch("/api/chat",{
        method : "POST",   
        headers : {
            "Content-Type":"application/json"
        },
        body : JSON.stringify(msgData)
    });
    if(!response.ok){
        throw new Error(`HTTP error: ${response.status}`)
    }
    let data = await response.json()
    console.log("API data:" ,data)
    return data.Reply;
}catch(error){
    console.error("Server error:", error);
    return null;

}
}

