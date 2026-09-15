let input = document.getElementById("input")
let quizmode = false
let quiztopic = ""
let quizquestion = 0
let quizscore = 0
let discussion = JSON.parse(localStorage.getItem("Sylqoramemory")) || []
let chats = JSON.parse(localStorage.getItem("Sylqorachats")) || []
let currentchatid = localStorage.getItem("SylqoraCurrentChatId") || null;
let explainmode = false
let explaintopic = ""
let flashcardmode = false
let flashcardtopic = ""
let flashcardnumber = 0
let flashcardanswer = ""
let flashcardrevealed = false
let previousflash = ""
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
        .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
        .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
        .replace(/^---$/gm, '<hr>')
        .replace(/\\\[/g, '')
        .replace(/\\\]/g, '')
        .replace(/\\,/g, '')
        .replace(/\\\*/g, '*')
        .replace(/\\_/g, '_')
        .replace(/`(.*?)`/g, '<code>$1</code>')
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
    quizmode = false;
    quiztopic = ""
    quizquestion = 0
    quizscore = 0
    input.placeholder = "Ask Sylqora anything ..."
    explainmode = false
    explaintopic = ""
    flashcardmode = false
    flashcardtopic = ""
    flashcardnumber = 0
    flashcardrevealed = false
    flashcardanswer = ""
    previousflash = ""
    document.querySelector(".flashcardbox").style.display = "none"
    document.querySelector(".quizstatus").style.display = "none"
    document.querySelector(".explainstatus").style.display = "none"
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
        quizmode = false;
        quiztopic = ""
        quizquestion = 0
        quizscore = 0
        flashcardanswer = ""
        flashcardmode = false
        flashcardnumber = 0
        previousflash = ""
        flashcardrevealed = false
        flashcardtopic = ""
        document.querySelector(".flashcardbox").style.display = "none"
        input.placeholder = "Ask Sylqora anything ..."
        document.querySelector(".quizstatus").style.display = "none"
        document.querySelector(".explainstatus").style.display = "none"

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
    flashcardmode = false
    flashcardtopic = ""
    document.querySelector(".flashcardbox").style.display = "none"
    quizmode=false
    quiztopic=""
    quizscore = 0
    quizquestion = 0
    document.querySelector(".quizstatus").style.display = "none"
    explainmode = true
    explaintopic = ""
    input.value = ""
    input.placeholder = "What should I explain ?"
    input.focus();
}
function Quizme(){
    flashcardmode = false
    flashcardtopic = ""
    document.querySelector(".flashcardbox").style.display = "none"
    quizmode = true;
    quizscore = 0
    quizquestion = 0
    quiztopic = ""
    input.value = ""
    input.placeholder = "What should I quiz you on ?"
    input.focus();
}
function Flashcards(){
    quizmode = false
    quiztopic = ""
    quizquestion = 0
    quizscore = 0
    explainmode = false 
    explaintopic = ""
    document.querySelector(".quizstatus").style.display = "none"
    document.querySelector(".explainstatus").style.display = "none"
    flashcardmode = true
    flashcardnumber = 0
    flashcardtopic = ""
    input.value = ""
    input.placeholder = "What topic should I make flashcards for?"
    input.focus();
}
function FlashcardButton(){
    if (flashcardrevealed === false){
    document.querySelector(".flashcardcontent").textContent = flashcardanswer
    document.querySelector(".flashcardbtn").textContent = "Next Card"
    flashcardrevealed = true
    }else{
        flashcardrevealed = false
        flashcardnumber += 1
        document.querySelector(".flashcardcontent").textContent = "Loading Card ..."
        document.querySelector(".flashcardbtn").style.display = "none"
        GenerateNextFlashCard()

    }
}

async function GenerateNextFlashCard(){
    let prompt = "Create a new flashcard on " + flashcardtopic + ". The previous question was: " + previousflash +
". Do not repeat it or ask essentially the same thing. Return exactly this format: QUESTION: [question] ANSWER: [answer]. Keep it concise."
    let answer = await toServer(prompt, discussion)
    if (answer && answer.includes("QUESTION:") && answer.includes("ANSWER:")){
        let question = answer.split("QUESTION:")[1].split("ANSWER:")[0].trim()
        previousflash = question
        flashcardanswer = answer.split("ANSWER:")[1].trim()
        document.querySelector(".flashcardcontent").textContent = question
        document.querySelector(".flashcardbtn").textContent = "Reveal Answer"
        document.querySelector(".flashcardbtn").style.display = "block"
    }
}

function OpenSide(){
    document.querySelector(".sidebar").classList.toggle("open")
    document.querySelector(".sidebaroverlay").classList.toggle("open")
}

async function sendMessage(){
let Message = input.value.trim()
let displayMessage = Message;
if (!Message) return;
if (flashcardmode && flashcardtopic === ""){
    flashcardtopic = Message
    flashcardnumber = 1
    let flashcardbox = document.querySelector(".flashcardbox")
    let flashcardcontent = document.querySelector(".flashcardcontent")
    let flashcardbtn = document.querySelector(".flashcardbtn")
    flashcardbox.style.display = "flex"
    flashcardcontent.textContent = "Loading Card ..."
    flashcardbtn.style.display = "none"
    Message = "Create one flashcard on " + flashcardtopic + ". Return exactly this format: QUESTION: [question] ANSWER: [answer]. Keep the question concise and make the answer suitable for active recall."
    input.placeholder = "Ask Sylqora anything ..."
}
if(explainmode && explaintopic === ""){
    explaintopic = Message
    let explainstatus = document.querySelector(".explainstatus")
    let topicdisplay = document.querySelector(".explaintopic")
    explainstatus.style.display = "flex"
    topicdisplay.textContent = "EXPLAIN · " + explaintopic  
    Message = "Explain " + explaintopic + " clearly and simply. Teach it step by step, use examples if useful and keep it focused and to the topic. In the end ask the user if they understand . Write equations in plain text do not use LaTex notation"
    explainmode = false
    input.placeholder = "Ask Sylqora anything ..."
}else if(quizmode && quiztopic === ""){
    quiztopic = Message
    quizquestion = 1
    let quizstatus = document.querySelector(".quizstatus")
    let topicdisplay = document.querySelector(".quiztopic")
    let progressdisplay = document.querySelector(".quizprogress")
    quizstatus.style.display = "flex"
    topicdisplay.textContent = "QUIZ . " + quiztopic;
    progressdisplay.textContent = "Question 1 of 5"
    Message = "Start a quiz on " + quiztopic + ". Ask me one question only. Don't give the answer"
}else if (quizmode && quizquestion > 0 && quizquestion < 5){
    Message = "My answer is: " + Message + ". Check my answer. Respond naturally and briefly, like a teacher marking a student's answer. Avoid phrases like Great job, spot on, or you captured the core idea. Say correct, partially correct, or incorrect, explain the key point in 1-3 sentences, then ask the next question on " + quiztopic + ". At the very end, write exactly [RESULT: CORRECT] if my answer is correct or [RESULT: INCORRECT] if it is wrong.";
    quizquestion += 1
    document.querySelector(".quizprogress").textContent = "Question " + quizquestion + " of 5"
}else if(quizmode && quizquestion === 5){
   Message = "My answer is: " + Message + ". Check my answer. Respond naturally and briefly like a teacher marking a student's answer. Avoid phrases like Great job, spot on, or you captured the core idea. Say correct, partially correct, or incorrect, explain the key point in 1-3 sentences, then end the quiz. Do not ask another question. At the very end, write exactly [RESULT: CORRECT] if my answer is correct or [RESULT: INCORRECT] if it is wrong."
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
    if (/\[RESULT:\s*CORRECT\s*\]/i.test(answer)){
        quizscore += 1;
    }
    answer = answer.replace(/\[RESULT:\s*(CORRECT|INCORRECT)\s*\]/gi, "");
    if (flashcardmode && answer.includes("QUESTION:") && answer.includes("ANSWER:")){
        let question = answer.split("QUESTION:")[1].split("ANSWER:")[0].trim()
        previousflash = question
        flashcardanswer = answer.split("ANSWER:")[1].trim()

        document.querySelector(".flashcardcontent").textContent = question
        document.querySelector(".flashcardbtn").style.display = "block"
        return;
    }
    if (quizmode && quizquestion == 6){
        answer += "\n\n**Quiz complete - Score: " + quizscore + "/5**"
        quizmode = false
        quiztopic = ""
        quizquestion = 0
        input.placeholder = "Ask Sylqora anything"
        document.querySelector(".quizstatus").style.display = "none"
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

