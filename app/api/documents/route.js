
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const { data: document, error } = await supabase
                .from("documents")
                .select(`
                    *,
                    document_items (*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching document:", error);
                return NextResponse.json(
                    { error: "หาเอกสารไม่พบ" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ document });
        } else {
            const { data: documents, error } = await supabase
                .from("documents")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching documents:", error);
                return NextResponse.json(
                    { error: "ไม่สามารถดึงประวัติเอกสารได้" },
                    { status: 500 }
                );
            }
            return NextResponse.json({ documents });
        }
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
        const body = await req.json();
        const {
            doc_number,
            type,
            customer_id,
            customer_name,
            customer_address,
            customer_taxid,
            doc_date,
            due_date,
            salesperson,
            total_amount,
            vat_amount,
            grand_total,
            items
        } = body;

        console.log("Received Payload:", body);
        const missingFields = [];
        if (!doc_number) missingFields.push("เลขที่เอกสาร (doc_number)");
        if (!customer_name) missingFields.push("ชื่อลูกค้า (customer_name)");
        if (!items || items.length === 0) missingFields.push("รายการสินค้า (items)");

        if (missingFields.length > 0) {
            console.log("Validation Failed:", missingFields);
            return NextResponse.json(
                {
                    error: `ข้อมูลไม่ครบ: ${missingFields.join(", ")}`,
                    received: body
                },
                { status: 400 }
            );
        }

        const { data: docData, error: docError } = await supabase
            .from("documents")
            .insert([
                {
                    doc_number,
                    type,
                    customer_id,
                    customer_name,
                    customer_address,
                    customer_taxid,
                    doc_date,
                    due_date,
                    salesperson,
                    total_amount,
                    vat_amount,
                    grand_total,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (docError) {
            console.error("Error saving document:", docError);
            return NextResponse.json(
                { error: "ไม่สามารถบันทึกเอกสารได้: " + docError.message },
                { status: 500 }
            );
        }

        const documentId = docData.id;
        const itemsToInsert = items.map(item => ({
            document_id: documentId,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            total: item.total
        }));

        const { error: itemsError } = await supabase
            .from("document_items")
            .insert(itemsToInsert);

        if (itemsError) {
            console.error("Error saving items:", itemsError);
            return NextResponse.json(
                { error: "บันทึกเอกสารสำเร็จ แต่บันทึกรายการสินค้าล้มเหลว" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, document: docData });

    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในระบบ" },
            { status: 500 }
        );
    }
}
