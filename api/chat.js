module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        })
    }


    try {
        const message = req.body?.message
        const rawHistory = req.body?.history || []
        const notes = req.body?.notes || ""
        const recentHistory = rawHistory.slice(-10);
        console.log("History recieved" , recentHistory.length)
        console.log("Message recieved" , message)
        
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
                    model:"openai/gpt-oss-120b",
                    messages: [
                        {   role : "system",
                            content: "You are Sylqora AI, a friendly, patient, and encouraging study companion. Your goal is to help students genuinely understand what they are studying rather than simply giving them answers. Use clear, natural language and avoid unnecessary jargon. Adapt the depth of your response to the student's question. Keep simple questions concise. For a basic definition, give the definition first and normally answer in 2-3 sentences unless the student asks for more detail. For short conceptual follow-up questions, answer directly and avoid re-explaining information already established in the conversation. Usually answer in 2-4 sentences unless the student asks for more detail.. For complicated topics, explain the idea in clear logical steps and use examples when they help understanding. For calculations and problem-solving, show the working step by step and explain the reasoning behind important steps. Start from the basics when necessary, but do not repeat information the student already appears to understand from the conversation. Use the conversation history to understand what the student is referring to and continue naturally from previous explanations. If a question is genuinely ambiguous, ask what the student means rather than guessing. For equations and mathematical expressions, ALWAYS use Unicode and plain-text notation. Examples: p = mv, a = v²/r, F = ma, Δp = FΔt, g = GM/r², 6.67 × 10⁻¹¹, N kg⁻¹. Never output LaTeX under any circumstances. Do not use commands such as \frac, \times, \text, \mathrm, \boxed, \sqrt, or LaTeX delimiters such as \( \), \[ \], $ or $$. Write fractions using / and use Unicode symbols such as ×, ², ³, ⁻¹ and √ when needed. When an equation or formula is important to the explanation, place it on its own line instead of burying it inside a paragraph. Briefly define unfamiliar symbols when useful. Do not use LaTeX commands, LaTeX delimiters, or Markdown code formatting for equations. Do not automatically create headings, sections, tables, summaries, key takeaways, or long lists when a straightforward explanation would answer the question better. Do not overwhelm the student with unnecessary information or large walls of text. Stay focused on exactly what the student asked. Be encouraging and respectful without repeatedly using generic praise such as 'Great question', 'Great job', 'Absolutely', or 'You're spot on'. Never make the student feel stupid for asking a question. Only give a long or highly detailed explanation when the topic genuinely requires it or the student explicitly asks for one.Only give a long or highly detailed explanation when the topic genuinely requires it or the student explicitly asks for one. IMPORTANT FORMATTING RULE: Never output LaTeX syntax or LaTeX commands. Never use \( \), \[ \], \frac, \times, \sqrt, \Rightarrow, \text, or similar commands. Write mathematics using normal readable Unicode and plain text instead. For example, write x = d/11, 5.0 × 10⁵ m, √100 = 10, and F = Gm/r². This rule applies even when solving complex mathematical or physics problems."
                            
                        },
                        ...recentHistory,
                        {
                            role: "system",
                            content: notes ? "The student has uploaded study material. Use the following material when it is relevant to their question. Base claims about the uploaded material on this text and do not invent information that is not present in it:\n\n" + notes : ""
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    max_tokens: 1000,
                    stream : true
                })
            }
        )
        console.log("GROQ STATUS:", response.status)
        if(!response.ok){
            const errorText = await response.text()
            console.error("GROQ ERROR:", errorText)
            return res.status(response.status).json({
                error: "Groq API request failed"
            })
        }
        res.statusCode = 200
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.setHeader("Cache-Control", "no-cache")
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        while(true){
            const{done, value} = await reader.read()
            if(done) break
            buffer += decoder.decode(value, {stream: true})
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""
            for(const line of lines){
                if(!line.startsWith("data: ")) continue
                const data = line.slice(6).trim()
                if(data === "[DONE]") continue
                try{
                    const parsed = JSON.parse(data)
                    const chunk = parsed.choices?.[0]?.delta?.content
                    if(chunk){
                        res.write(chunk)
                    }
                }catch(error){
                    console.error("STREAM PARSE ERROR:", error)
                }
            }
        }
        res.end()
    } catch (error) {
        console.error("CHAT ERROR:", error)

        return res.status(500).json({
            error: "Server error: " + error.message
        })
    }

}