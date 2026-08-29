module.exports = (req, res) => {
    if (req.method !== "POST"){
        return res.status(405).json({
            error: "Method not allowed"
            
        })
    }
let message = req.body.message
let Replydata = {
    Reply: "I have recieved your message"
}
if (message.includes("momentum")){
    Replydata.Reply = "Momentum is the product of mass and velocity of an object"
}
if (message.includes("acceleration")){
    Replydata.Reply = "Acceleration is the rate of change of velocity"
}
if (message.includes("hello")){
    Replydata.Reply = "Hey! Look who showed up"
}
if (message.includes("what")){
    Replydata.Reply = "You are using AI ,the pinnacle of human technology, to get an answer to a question like that "
}
res.status(200).json(Replydata)
}