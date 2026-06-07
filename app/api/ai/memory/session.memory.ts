type Message = {
    role: "user" | "assistant",
    content: string;
}

const session: Map<string, Message[]> = new Map();

export const getSession = (sessionId: string) => {
    if(!session.has(sessionId)){
        session.set(sessionId, [])
    }

    return session.get(sessionId)!;
}


export const addSession = (sessionId: string, message: Message) => {
    const session = getSession(sessionId);

    const normalize = message.role === 'assistant' && message.content.startsWith("Tool (") ? 
    {
        ...message,
        content: message.content.replace(/^Tool \([\w_]+\) returned:\n/, "Previously retrieved: ")
    } : message;

    session.push(normalize as any);
}