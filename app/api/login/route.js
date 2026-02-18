import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { user, password } = await req.json();

    if (!user || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("user", user)
      .eq("password", password)
      .single();

    if (error || !userData) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = userData;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
