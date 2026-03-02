import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { pin } = body ?? {};

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: "PIN debe ser de 4 dígitos" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt((session.user as any).id) },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuario.pinCode !== pin) {
      return NextResponse.json(
        { error: "PIN incorrecto" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verificando PIN:", error);
    return NextResponse.json(
      { error: "Error al verificar PIN" },
      { status: 500 }
    );
  }
}
