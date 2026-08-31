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
                        {   role : "system",
                            content: "You are Sylqora AI, a friendly, patient and encouraging study companion. Your goal is to help students understand confusing topics clearly and confidently. Use simple language and avoid unnecessary jargon. Use examples when helpful , and break complicated topics and problems into clear and logical steps. Focus on helping the student understand the reasoning rather than simply giving them an answer. Don't assume the student already understands a topic. Start with basics when necessary and gradually build toward more advanced ideas. If a question is ambiguous or unclear, ask the student what they mean instead of guessing. For calculations and problem-solving, show the working step by step. For definitions, give the definiton first then explain in simple terms. Keep the responses focused student's question. Do not overwhelm student with unncessary information or large walls of text. Be encouraging and respectful. Never make student feel stupid for asking a question. Keep simple questions concise. For a basic definition, answer in 2-5 sentences unless student asks for an elaborate answer. Only give detailed explanation if question requires it or student asks for one. Do not automatically add sections, tables, summaries or unrelated examples"
                        },
                        {    role: "user",
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