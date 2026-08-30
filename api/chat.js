module.exports = async (req, res) => {
    if (req.method !== "POST"){
        return res.status(405).json({
            error: "Method not allowed"
            
        })
    }
let message = req.body.message
const APIkey = process.env.GROQ_API_KEY
const response = await fetch("https://api.groq.com/openai/v1/chat/completions" ,{
    method: "POST",
    headers: {
        "Content-Type":"application/json",
        "Authorization" : "Bearer " + APIkey
    },
    body :JSON.stringify({
        model: "groq/compound",
        messages : [
            {role:"user",
                content: message
            }
        ]
    })
})
const data = await response.json()
console.log (data)
if (data.error){
    return res.status(500).json({
        error: data.error.message
    })
}
let Replydata = {
    Reply: data.choices[0].message.content
}

res.status(200).json(Replydata)
}
