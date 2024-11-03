import prisma from '@/lib/prismaClient';

import bcrypt from 'bcrypt';
import { error } from 'console';

export async function GET () {
    try {
        const users = await prisma.user.findMany();

        if ( users.length == 0 ) {
            return new Response( JSON.stringify( { message: "Nenhum Usuário Encontrado!" }), { status: 404 });
        }

        return new Response(JSON.stringify(users), { status: 200 });
    }catch (error) {

        return new Response( JSON.stringify({ error: (error as Error).message }), { status: 500 });

    }
}

export async function POST (request: Request) {
    try {
        const data = await request.json();

        const { userName, password } = data;

        if ( !userName|| !password ) {
            return new Response ( JSON.stringify( { error: "Necessário Informar Usuário e Senha." } ), { status: 400 });
        }

        if ( /\s/.test(userName)) {
            return new Response ( JSON.stringify( { error: "Usuário não pode conter Espaços." } ), { status: 400 });
        }

        const existingUser = await prisma.user.unique({
            where:  {user: userName}
        });

        if ( existingUser ) {
            return new Response ( JSON.stringify( { error: "Usuário já Existe!" } ), { status: 400 });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { user: userName, password:  hashedPassword}
        });

        return new Response( JSON.stringify(newUser), { status: 201 });
    }catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}