module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        })
    }


    try {
        const message = req.body?.message

        if (!message) {
            return res.status(400).json({
                error: "No message received"
            })
        }

        const APIkey = process.env.GROQ_API_KEY

        if (!APIkey) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured"
            })
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + APIkey
                },
                body: JSON.stringify({
                    model: "groq/compound",
                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    max_tokens: 1000
                })
            }
        )

        const data = await response.json()

        console.log("GROQ STATUS:", response.status)
        console.log("GROQ RESPONSE:", data)

        if (!response.ok || data.error) {
            return res.status(500).json({
                error: data.error?.message || "Groq API request failed"
            })
        }

        const reply = data.choices?.[0]?.message?.content

        if (!reply) {
            return res.status(500).json({
                error: "Groq returned no message"
            })
        }

        return res.status(200).json({
            Reply: reply
        })

    } catch (error) {
        console.error("CHAT ERROR:", error)

        return res.status(500).json({
            error: "Server error: " + error.message
        })
    }

}