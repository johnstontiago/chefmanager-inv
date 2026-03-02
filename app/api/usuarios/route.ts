import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const user = session.user as any;
    if (user.rol !== "superuser") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        unidadId: true,
        pinCode: true,
        activo: true,
        createdAt: true,
        unidad: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const user = session.user as any;
    if (user.rol !== "superuser") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const { email, nombre, rol, unidadId, password, pinCode } = await request.json();

    if (!email || !nombre || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya existe" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        passwordHash,
        rol: rol || "viewer",
        unidadId: unidadId || null,
        pinCode: pinCode || null,
        activo: true,
      },
    });

    return NextResponse.json({ usuario: { ...usuario, passwordHash: undefined } });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
