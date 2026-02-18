
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .order("product_id", { ascending: true });

        if (error) {
            console.error("Error fetching products:", error);
            return NextResponse.json(
                { error: "ไม่สามารถดึงข้อมูลสินค้าได้" },
                { status: 500 }
            );
        }

        return NextResponse.json({ products });
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
        const { product_id, product_name, product_unit, product_price } = await req.json();

        if (!product_name) {
            return NextResponse.json(
                { error: "กรุณาระบุชื่อสินค้า" },
                { status: 400 }
            );
        }

        let newId = product_id;
        if (!newId) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            newId = randomNum.toString();
        }

        const { data, error } = await supabase
            .from("products")
            .insert([
                {
                    product_id: newId,
                    product_name: product_name,
                    product_unit: product_unit || "ชิ้น",
                    product_price: parseFloat(product_price) || 0
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating product:", error);
            return NextResponse.json(
                { error: "ไม่สามารถเพิ่มสินค้าได้: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, product: data });

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
        const { product_id, product_name, product_unit, product_price } = await req.json();

        if (!product_id || !product_name) {
            return NextResponse.json(
                { error: "ID และชื่อสินค้าต้องไม่ว่างเปล่า" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("products")
            .update({
                product_name,
                product_unit,
                product_price: parseFloat(product_price) || 0
            })
            .eq("product_id", product_id)
            .select()
            .single();

        if (error) {
            console.error("Error updating product:", error);
            return NextResponse.json(
                { error: "ไม่สามารถแก้ไขข้อมูลได้: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, product: data });

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
                { error: "ต้องระบุ Product ID" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("product_id", id);

        if (error) {
            console.error("Error deleting product:", error);
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
