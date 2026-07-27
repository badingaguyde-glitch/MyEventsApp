import {NextResponse} from "next/server";
import {queueSupportEmail} from "@/lib/taskQueue";

export async function POST(request: Request){
    try {
        const body = await request.json();
        const {name, email, subject, message} = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({error: "Tous les champs sont requis."}, {status: 400});
        }

        const success = await queueSupportEmail({name, email, subject, message});

        if (!success){
            return NextResponse.json({error: "Erreur lors de l'envoi de l'email."}, {status: 500});
        }

        return NextResponse.json({message: "Votre message a été envoyé avec succès."}, {status: 200});
    } catch (error) {
        return NextResponse.json({error: "Erreur interne du serveur."}, {status: 500});
    }
}