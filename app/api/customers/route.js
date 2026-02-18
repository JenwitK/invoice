
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        const { data: customers, error } = await supabase
            .from("customers")
            .select("*")
            .order("customer_id", { ascending: true });

        if (error) {
            console.error("Error fetching customers:", error);
            return NextResponse.json(
                { error: "ไม่สามารถดึงข้อมูลลูกค้าได้" },
                { status: 500 }
            );
        }

        return NextResponse.json({ customers });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในระบบ" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const { customer_name, customer_taxid, customer_address } = await req.json();

        if (!customer_name) {
            return NextResponse.json(
                { error: "กรุณาระบุชื่อลูกค้า" },
                { status: 400 }
            );
        }

        const newId = Math.floor(10000 + Math.random() * 90000).toString();

        const { data, error } = await supabase
            .from("customers")
            .insert([
                {
                    customer_id: newId,
                    customer_name: customer_name,
                    customer_taxid: customer_taxid || "-",
                    customer_address: customer_address || "-"
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating customer:", error);
            return NextResponse.json(
                { error: "ไม่สามารถเพิ่มข้อมูลลูกค้าได้: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, customer: data });

    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในระบบ" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const { customer_id, customer_name, customer_taxid, customer_address } = await req.json();

        if (!customer_id || !customer_name) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ครบถ้วน (ต้องระบุ ID และชื่อ)" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("customers")
            .update({
                customer_name,
                customer_taxid,
                customer_address
            })
            .eq("customer_id", customer_id)
            .select()
            .single();

        if (error) {
            console.error("Error updating customer:", error);
            return NextResponse.json(
                { error: "ไม่สามารถแก้ไขข้อมูลได้: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, customer: data });

    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในระบบ" },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ต้องระบุ Customer ID" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("customer_id", id);

        if (error) {
            console.error("Error deleting customer:", error);
            return NextResponse.json(
                { error: "ไม่สามารถลบข้อมูลได้: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "ลบข้อมูลสำเร็จ" });

    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในระบบ" },
            { status: 500 }
        );
    }
}
