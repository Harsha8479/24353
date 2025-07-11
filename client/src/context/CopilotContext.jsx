import { createContext, useContext, useState } from "react"
import toast from "react-hot-toast"
import axiosInstance from "../api/pollinationsApi"

const CopilotContext = createContext(null)

export const useCopilot = () => {
    const context = useContext(CopilotContext)
    if (context === null) {
        throw new Error(
            "useCopilot must be used within a CopilotContextProvider",
        )
    }
    return context
}

const CopilotContextProvider = ({ children }) => {
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [isRunning, setIsRunning] = useState(false)

    const generateCode = async () => {
        try {
            if (input.length === 0) {
                toast.error("Please write a prompt")
                return
            }

            toast.loading("Generating code...")
            setIsRunning(true)
            const response = await axiosInstance.post("/", {
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a code generator copilot for project named Code Sync. Generate code based on the given prompt without any explanation. Return only the code, formatted in Markdown using the appropriate language syntax (e.g., js for JavaScript, py for Python). Do not include any additional text or explanations. If you don't know the answer, respond with 'I don't know'.",
                    },
                    {
                        role: "user",
                        content: input,
                    },
                ],
                model: "mistral",
                private: true,
            })
            if (response.data) {
                toast.success("Code generated successfully")
                const code = response.data
                if (code) setOutput(code)
            }
            setIsRunning(false)
            toast.dismiss()
        } catch (error) {
            console.error(error)
            setIsRunning(false)
            toast.dismiss()
            toast.error("Failed to generate the code")
        }
    }

    return (
        <CopilotContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                generateCode,
            }}
        >
            {children}
        </CopilotContext.Provider>
    )
}

export { CopilotContextProvider }
export default CopilotContext