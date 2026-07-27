export async function queueSupportEmail(data:{
    name: string;
    email: string;
    subject: string;
    message: string;
}){
    const serverURL = process.env.TASK_QUEUE_SERVER_URL;
    const apiKey = process.env.TASK_QUEUE_API_KEY;

    if (!serverURL || !apiKey) {
        console.error("Variables d'environnement manquantes : TASK_QUEUE_SERVER_URL ou TASK_QUEUE_API_KEY");
        return false;
    }

    const emailPayload = {
        To: "badingaguyde@gmail.com",
        Subject: `[Vitrine Support] - ${data.subject}`,
        Body: `
        <h2>Nouvelle demande de contact via le site vitrine</h2>
        <p><strong>Nom :</strong> ${data.name}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Message :</strong></p>
        <blockquote style="border-left: 3px solid #ff4c3b; padding-left: 10px;">${data.message}</blockquote>
        `,
        SenderName: "BANTU Vitrine"
    };

    const jobPayload = {
        type: 0,
        priority:1,
        payload: JSON.stringify(emailPayload),
        maxRetries: 3,
        queue: "default"
    };

    try {
        const response = await fetch(serverURL,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey
            },
            body: JSON.stringify(jobPayload)
        });

        if (!response.ok) {
            console.error("TaskQueueServer a retourné une erreur :",response.statusText);
            return false;
        }

        return true;
    }catch (error){
        console.error("Erreur lors de l'envoi de la requête au TaskQueueServer :", error);
        return false;
    }
}