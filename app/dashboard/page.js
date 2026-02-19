"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import Swal from "sweetalert2";

export default function DashboardPage() {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState("tax-invoice");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const [formData, setFormData] = useState({
        customerName: "",
        customerId: "",
        taxId: "",
        address: "",
        docDate: "",
        dueDate: "",
        salesperson: "Admin",
        docNumber: ""
    });

    const [mode, setMode] = useState("tax-invoice");

    if (activeMenu === "tax-invoice" && mode !== "tax-invoice") {
        setMode("tax-invoice");
        setFormData({
            customerName: "",
            customerId: "",
            taxId: "",
            address: "",
            docDate: "",
            dueDate: "",
            salesperson: "Admin",
            docNumber: ""
        });
    } else if (activeMenu === "quotation" && mode !== "quotation") {
        setMode("quotation");
        setFormData({
            customerName: "",
            customerId: "",
            taxId: "",
            address: "",
            docDate: "",
            dueDate: "",
            salesperson: "Admin",
            docNumber: ""
        });
    }

    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [invoiceItems, setInvoiceItems] = useState([
        { id: Date.now(), productId: '', name: '', unit: '', price: 0, quantity: 1, total: 0 }
    ]);
    const [totals, setTotals] = useState({ subtotal: 0, vat: 0, grandTotal: 0 });

    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [previewMode, setPreviewMode] = useState(false);
    const [autoPrint, setAutoPrint] = useState(false);

    useEffect(() => {
        setLoadingCustomers(true);
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                if (data.customers) {
                    setCustomers(data.customers);
                }
                setLoadingCustomers(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingCustomers(false);
            });
    }, []);

    if (activeMenu === "products" && products.length === 0 && !loadingProducts) {
        setLoadingProducts(true);
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                if (data.products) {
                    setProducts(data.products);
                }
                setLoadingProducts(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingProducts(false);
            });
    }

    useEffect(() => {
        if (activeMenu === "history") {
            setLoadingDocuments(true);
            fetch("/api/documents")
                .then((res) => res.json())
                .then((data) => {
                    if (data.documents) {
                        setDocuments(data.documents);
                    }
                    setLoadingDocuments(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingDocuments(false);
                });
        }
    }, [activeMenu]);

    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState([]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredCustomers(customers);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredCustomers(customers.filter(c =>
                (c.customer_name && c.customer_name.toString().toLowerCase().includes(lowerTerm)) ||
                (c.customer_id && c.customer_id.toString().toLowerCase().includes(lowerTerm))
            ));
        }
    }, [searchTerm, customers]);

    useEffect(() => {
        const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const vat = subtotal * 0.07;
        const grandTotal = subtotal + vat;
        setTotals({ subtotal, vat, grandTotal });
    }, [invoiceItems]);

    const selectCustomer = (customer) => {
        setFormData({
            ...formData,
            customerName: customer.customer_name,
            customerId: customer.customer_id,
            taxId: customer.customer_taxid,
            address: customer.customer_address
        });
        setSearchTerm(customer.customer_name);
        setIsDropdownOpen(false);
    };

    const handleBlur = () => {
        setTimeout(() => setIsDropdownOpen(false), 200);
    };

    const handleGenerateDocNumber = () => {
        const prefix = activeMenu === 'quotation' ? 'OP' : 'TAX';
        const randomNum = Math.floor(Math.random() * 1000000);
        const randomStr = randomNum.toString().padStart(6, '0');
        const formattedNumber = `${prefix}${randomStr.substring(0, 3)}-${randomStr.substring(3)}`;

        setFormData(prev => ({ ...prev, docNumber: formattedNumber }));
    };

    const handleAddProduct = async () => {
        const { value: formValues } = await Swal.fire({
            title: '<h3 style="font-size:1.5rem; color:#1e293b; margin-bottom:0.5rem">เพิ่มสินค้าใหม่</h3>',
            html:
                `
                <div class="swal-grid">
                    <div class="swal-form-group">
                        <label class="swal-label">🏷️ รหัสสินค้า</label>
                        <input id="swal-prod-id" class="swal-custom-input" placeholder="Auto (หรือกำหนดเอง)">
                    </div>
                    <div class="swal-form-group">
                        <label class="swal-label">📦 หน่วยนับ</label>
                        <input id="swal-prod-unit" class="swal-custom-input" placeholder="เช่น ชิ้น, อัน">
                    </div>
                    <div class="swal-form-group swal-full-width">
                        <label class="swal-label">📝 ชื่อสินค้า <span style="color:#ef4444">*</span></label>
                        <input id="swal-prod-name" class="swal-custom-input" placeholder="ระบุชื่อสินค้า">
                    </div>
                    <div class="swal-form-group">
                        <label class="swal-label">💰 ราคามาตรฐาน</label>
                        <input id="swal-prod-price" type="number" class="swal-custom-input" placeholder="0.00">
                    </div>
                </div>
                `,
            width: '600px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            preConfirm: () => {
                return [
                    document.getElementById('swal-prod-id').value,
                    document.getElementById('swal-prod-name').value,
                    document.getElementById('swal-prod-unit').value,
                    document.getElementById('swal-prod-price').value
                ]
            }
        });

        if (formValues) {
            const [id, name, unit, price] = formValues;

            if (!name) {
                Swal.fire('Error', 'กรุณาระบุชื่อสินค้า', 'error');
                return;
            }

            try {
                Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_id: id,
                        product_name: name,
                        product_unit: unit,
                        product_price: price
                    }),
                });
                const data = await res.json();
                if (data.product) {
                    setProducts([...products, data.product]);
                    Swal.fire('สำเร็จ', 'เพิ่มสินค้าเรียบร้อยแล้ว', 'success');
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Connection failed', 'error');
            }
        }
    };

    const handleEditProduct = async (product) => {
        const { value: formValues } = await Swal.fire({
            title: '<h3 style="font-size:1.5rem; color:#1e293b; margin-bottom:0.5rem">แก้ไขสินค้า</h3>',
            html:
                `
                <div class="swal-grid">
                    <div class="swal-form-group">
                        <label class="swal-label">🏷️ รหัสสินค้า</label>
                        <input id="swal-prod-id" class="swal-custom-input readonly" value="${product.product_id}" disabled>
                    </div>
                    <div class="swal-form-group">
                        <label class="swal-label">📦 หน่วยนับ</label>
                        <input id="swal-prod-unit" class="swal-custom-input" value="${product.product_unit || ''}" placeholder="เช่น ชิ้น">
                    </div>
                    <div class="swal-form-group swal-full-width">
                        <label class="swal-label">📝 ชื่อสินค้า <span style="color:#ef4444">*</span></label>
                        <input id="swal-prod-name" class="swal-custom-input" value="${product.product_name}" placeholder="ระบุชื่อสินค้า">
                    </div>
                    <div class="swal-form-group">
                        <label class="swal-label">💰 ราคามาตรฐาน</label>
                        <input id="swal-prod-price" type="number" class="swal-custom-input" value="${product.product_price || ''}" placeholder="0.00">
                    </div>
                </div>
                `,
            width: '600px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึกการแก้ไข',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            customClass: {
                popup: 'swal2-popup-custom'
            },
            preConfirm: () => {
                return [
                    document.getElementById('swal-prod-name').value,
                    document.getElementById('swal-prod-unit').value,
                    document.getElementById('swal-prod-price').value
                ]
            }
        });

        if (formValues) {
            const [name, unit, price] = formValues;
            if (!name) return;

            try {
                Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
                const res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_id: product.product_id,
                        product_name: name,
                        product_unit: unit,
                        product_price: price
                    }),
                });
                const data = await res.json();
                if (data.product) {
                    setProducts(products.map(p => p.product_id === product.product_id ? data.product : p));
                    Swal.fire('สำเร็จ', 'แก้ไขสินค้าเรียบร้อยแล้ว', 'success');
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Connection failed', 'error');
            }
        }
    };

    const handleAddInvoiceItem = () => {
        setInvoiceItems([
            ...invoiceItems,
            { id: Date.now(), productId: '', name: '', unit: '', price: 0, quantity: 1, total: 0 }
        ]);
    };

    const handleRemoveInvoiceItem = (id) => {
        if (invoiceItems.length > 1) {
            setInvoiceItems(invoiceItems.filter(item => item.id !== id));
        } else {
            setInvoiceItems([{ id: Date.now(), productId: '', name: '', unit: '', price: 0, quantity: 1, total: 0 }]);
        }
    };

    const handleUpdateInvoiceItem = (id, field, value) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };

                if (field === 'price' || field === 'quantity') {
                    const price = field === 'price' ? parseFloat(value) || 0 : item.price;
                    const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
                    newItem.total = price * qty;
                }

                return newItem;
            }
            return item;
        }));
    };

    const handleImportProduct = async () => {
        const options = {};
        if (products.length === 0) {
            try {
                const res = await fetch("/api/products");
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products);
                    data.products.forEach(p => {
                        options[p.product_id] = `${p.product_name} (${Number(p.product_price).toLocaleString()} บาท)`;
                    });
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            products.forEach(p => {
                options[p.product_id] = `${p.product_name} (${Number(p.product_price).toLocaleString()} บาท)`;
            });
        }

        const { value: productId } = await Swal.fire({
            title: 'เลือกสินค้าจากฐานข้อมูล',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'เลือกสินค้า...',
            showCancelButton: true,
            confirmButtonText: 'เพิ่มรายการ',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve();
                    } else {
                        resolve('กรุณาเลือกสินค้า');
                    }
                });
            }
        });

        if (productId) {
            const selectedProduct = products.find(p => String(p.product_id) === String(productId));
            if (selectedProduct) {
                const lastItem = invoiceItems[invoiceItems.length - 1];
                const isLastItemEmpty = !lastItem.name && !lastItem.productId && lastItem.price === 0;

                const newItem = {
                    id: Date.now(),
                    productId: selectedProduct.product_id,
                    name: selectedProduct.product_name,
                    unit: selectedProduct.product_unit,
                    price: selectedProduct.product_price,
                    quantity: 1,
                    total: selectedProduct.product_price * 1
                };

                if (isLastItemEmpty) {
                    setInvoiceItems(invoiceItems.map(item => item.id === lastItem.id ? newItem : item));
                } else {
                    setInvoiceItems([...invoiceItems, newItem]);
                }
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณจะไม่สามารถกู้คืนข้อมูลได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setProducts(products.filter(p => p.product_id !== id));
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว.', 'success');
                } else {
                    Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Connection failed', 'error');
            }
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'ออกจากระบบ?',
            text: "คุณต้องการออกจากระบบใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'ใช่, ออกจากระบบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                router.push("/login");
            }
        });
    };

    const handleAddCustomer = async () => {

        const { value: formValues } = await Swal.fire({
            title: '<h3 style="font-size:1.5rem; color:#1e293b; margin-bottom:0.5rem">เพิ่มลูกค้าใหม่</h3>',
            html:
                `
                <div class="swal-grid">
                    <div class="swal-form-group swal-full-width">
                        <label class="swal-label">👤 ชื่อลูกค้า <span style="color:#ef4444">*</span></label>
                        <input id="swal-input1" class="swal-custom-input" placeholder="ระบุชื่อลูกค้าบริษัท / บุคคลธรรมดา">
                    </div>
                    <div class="swal-form-group swal-full-width">
                        <label class="swal-label">🆔 เลขผู้เสียภาษี</label>
                        <input id="swal-input2" class="swal-custom-input" placeholder="ระบุเลข 13 หลัก (ถ้ามี)">
                    </div>
                    <div class="swal-form-group swal-full-width">
                        <label class="swal-label">📍 ที่อยู่</label>
                        <textarea id="swal-input3" class="swal-custom-input" rows="3" style="height:auto; min-height:80px" placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"></textarea>
                    </div>
                </div>
                `,
            width: '600px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึกข้อมูล',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#94a3b8',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues) {
            const [name, taxId, address] = formValues;

            if (!name) {
                Swal.fire('Error', 'กรุณาระบุชื่อลูกค้า', 'error');
                return;
            }

            try {
                Swal.fire({
                    title: 'กำลังบันทึก...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const res = await fetch('/api/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customer_name: name,
                        customer_taxid: taxId,
                        customer_address: address,
                    }),
                });

                const data = await res.json();

                if (data.customer) {
                    setCustomers([...customers, data.customer]);
                    Swal.fire('สำเร็จ', 'เพิ่มลูกค้าเรียบร้อยแล้ว', 'success');
                } else {
                    Swal.fire('เกิดข้อผิดพลาด', data.error || 'ไม่สามารถบันทึกได้', 'error');
                }
            } catch (err) {
                Swal.fire('เกิดข้อผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
            }
        }
    };

    const handleEditCustomer = async (customer) => {

        const { value: formValues } = await Swal.fire({
            title: 'แก้ไขข้อมูลลูกค้า',
            html:
                `
                <div class="swal-form-group">
                    <label class="swal-label">ชื่อลูกค้า <span style="color:red">*</span></label>
                    <input id="swal-input1" class="swal2-input" placeholder="ระบุชื่อลูกค้า" value="${customer.customer_name}">
                </div>
                <div class="swal-form-group">
                    <label class="swal-label">เลขผู้เสียภาษี</label>
                    <input id="swal-input2" class="swal2-input" placeholder="ระบุเลขผู้เสียภาษี" value="${customer.customer_taxid}">
                </div>
                <div class="swal-form-group">
                    <label class="swal-label">ที่อยู่</label>
                    <input id="swal-input3" class="swal2-input" placeholder="ระบุที่อยู่" value="${customer.customer_address}">
                </div>
                `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึกการแก้ไข',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            },
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues) {
            const [name, taxId, address] = formValues;

            if (!name) {
                Swal.fire('Error', 'กรุณาระบุชื่อลูกค้า', 'error');
                return;
            }

            try {
                Swal.fire({
                    title: 'กำลังบันทึก...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const res = await fetch('/api/customers', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: customer.customer_id,
                        customer_name: name,
                        customer_taxid: taxId,
                        customer_address: address
                    })
                });

                const data = await res.json();

                if (data.customer) {
                    const newCustomers = customers.map(c =>
                        c.customer_id === customer.customer_id ? data.customer : c
                    );
                    setCustomers(newCustomers);
                    Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
                } else {
                    Swal.fire('เกิดข้อผิดพลาด', data.error || 'ไม่สามารถแก้ไขได้', 'error');
                }
            } catch (err) {
                Swal.fire('เกิดข้อผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
            }
        }
    };

    const handleDeleteCustomer = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณจะไม่สามารถกู้คืนข้อมูลได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'ใช่, ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'กำลังลบ...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const res = await fetch(`/api/customers?id=${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setCustomers(customers.filter((c) => c.customer_id !== id));
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว.', 'success');
                } else {
                    const data = await res.json();
                    Swal.fire('เกิดข้อผิดพลาด', data.error || 'ไม่สามารถลบข้อมูลได้', 'error');
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
            }
        }
    };

    const handleViewDocument = async (docId) => {
        try {
            Swal.fire({ title: 'กำลังโหลด...', didOpen: () => Swal.showLoading() });
            const res = await fetch(`/api/documents?id=${docId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            const doc = data.document;

            if (doc) {
                setFormData({
                    customerName: doc.customer_name,
                    customerId: doc.customer_id,
                    taxId: doc.customer_taxid,
                    address: doc.customer_address,
                    docDate: doc.doc_date ? new Date(doc.doc_date).toISOString().split('T')[0] : '',
                    dueDate: doc.due_date ? new Date(doc.due_date).toISOString().split('T')[0] : '',
                    salesperson: doc.salesperson || 'Admin',
                    docNumber: doc.doc_number
                });

                if (doc.document_items) {
                    setInvoiceItems(doc.document_items.map(item => ({
                        id: Date.now() + Math.random(),
                        productId: item.product_id,
                        name: item.product_name,
                        unit: item.unit,
                        price: item.price,
                        quantity: item.quantity,
                        total: item.total
                    })));

                    setTotals({
                        subtotal: doc.total_amount,
                        vat: doc.vat_amount,
                        grandTotal: doc.grand_total
                    });
                }

                if (doc.type === 'quotation') setActiveMenu('quotation');
                else setActiveMenu('tax-invoice');

                Swal.close();
                setPreviewMode(true);
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'ไม่สามารถเรียกดูเอกสารได้', 'error');
        }
    };

    const handleSaveDocument = async () => {
        if (!formData.customerName) {
            Swal.fire('Error', 'กรุณาระบุชื่อลูกค้า', 'error');
            return;
        }
        if (invoiceItems.length === 0) {
            Swal.fire('Error', 'กรุณาเพิ่มรายการสินค้า', 'error');
            return;
        }
        try {
            Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

            const payload = {
                doc_number: formData.docNumber,
                type: activeMenu,
                customer_id: formData.customerId,
                customer_name: formData.customerName,
                customer_taxid: formData.taxId,
                customer_address: formData.address,
                doc_date: formData.docDate,
                due_date: formData.dueDate,
                salesperson: formData.salesperson,
                total_amount: totals.subtotal,
                vat_amount: totals.vat,
                grand_total: totals.grandTotal,
                items: invoiceItems
            };

            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.document) {
                Swal.fire({
                    title: 'บันทึกสำเร็จ!',
                    text: `เลขที่เอกสาร: ${data.document.doc_number}`,
                    icon: 'success',
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: 'ดูตัวอย่าง',
                    denyButtonText: 'ดูประวัติ',
                    cancelButtonText: 'ปิด',
                    confirmButtonColor: '#3b82f6',
                    denyButtonColor: '#10b981',
                    cancelButtonColor: '#6b7280'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setPreviewMode(true);
                    } else if (result.isDenied) {
                        setActiveMenu('history');
                    }
                });
            } else {
                let errorMsg = data.error || 'บันทึกไม่สำเร็จ';
                if (data.received) {
                    errorMsg += '\n\nReceived: ' + JSON.stringify(data.received, null, 2);
                }
                Swal.fire({
                    title: 'Error',
                    text: errorMsg,
                    icon: 'error',
                    width: '600px'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Connection failed', 'error');
        }
    };

    useEffect(() => {
        if (previewMode && autoPrint) {
            const timer = setTimeout(() => {
                window.print();
                setAutoPrint(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [previewMode, autoPrint]);

    if (previewMode) {
        return (
            <div className="preview-container">
                <div className="preview-toolbar">
                    <div className="preview-title">
                        <span className="page-icon quotation">📄</span>
                        {activeMenu === 'quotation' ? 'ใบเสนอราคา (Quotation)' : 'ใบกำกับภาษี (Tax Invoice)'}
                    </div>
                    <div className="preview-actions">
                        <button className="action-btn" onClick={() => setPreviewMode(false)}>
                            ⬅️ กลับไปแก้ไข
                        </button>
                        <button className="action-btn primary-btn" onClick={() => { setPreviewMode(true); setAutoPrint(true); }}>
                            🖨️ พิมพ์ / PDF
                        </button>
                    </div>
                </div>

                <div className="preview-content">
                    <div className="a4-paper">
                        <div className="invoice-header">
                            <div className="company-logo">
                                <div className="logo-placeholder">DARA AUTO</div>
                            </div>
                            <div className="company-info">
                                <h2>ห้างหุ้นส่วนจำกัด ดารา ออโต้คาร์</h2>
                                <p>216 หมู่ที่ 3 ตำบลปะโค อำเภอกุมภวาปี จังหวัดอุดรธานี 41370 (สำนักงานใหญ่)</p>
                                <p>โทร: 089-7116167, 081-5458877 (Auto) Fax: 042-398163</p>
                                <p>เลขประจำตัวผู้เสียภาษี Tax ID: 0413555000531</p>
                            </div>
                            <div className="doc-title-box">
                                <h3>{activeMenu === 'quotation' ? 'ใบเสนอราคา' : 'ใบกำกับภาษี/ใบเสร็จรับเงิน'}</h3>
                                <p>{activeMenu === 'quotation' ? 'QUOTATION' : 'TAX INVOICE / RECEIPT'}</p>
                            </div>
                        </div>

                        <div className="invoice-info-grid">
                            <div className="customer-box">
                                <table className="info-table">
                                    <tbody>
                                        <tr>
                                            <td className="label">รหัส:</td>
                                            <td>{formData.customerId || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">ชื่อ:</td>
                                            <td>{formData.customerName || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">ที่อยู่:</td>
                                            <td>{formData.address || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">โทรศัพท์:</td>
                                            <td>-</td>
                                        </tr>
                                        <tr>
                                            <td className="label">เลขภาษี:</td>
                                            <td>{formData.taxId || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="doc-box">
                                <table className="info-table">
                                    <tbody>
                                        <tr>
                                            <td className="label">เลขที่:</td>
                                            <td>{formData.docNumber || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">วันที่:</td>
                                            <td>{formData.docDate ? new Date(formData.docDate).toLocaleDateString('th-TH') : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">พนักงานขาย:</td>
                                            <td>{formData.salesperson}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">เอกสารอ้างอิง:</td>
                                            <td>-</td>
                                        </tr>
                                        <tr>
                                            <td className="label">วันครบกำหนด:</td>
                                            <td>{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('th-TH') : '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="invoice-items-container">
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%', textAlign: 'center' }}>ลำดับ</th>
                                        <th style={{ width: '15%' }}>รหัสสินค้า<br /><span className="sub-th">Code</span></th>
                                        <th style={{ width: '40%' }}>รายการสินค้า<br /><span className="sub-th">Description</span></th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>หน่วย<br /><span className="sub-th">Unit</span></th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>จำนวน<br /><span className="sub-th">Qty</span></th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>ราคาขาย<br /><span className="sub-th">Price</span></th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>จำนวนเงิน<br /><span className="sub-th">Amount</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                            <td>{item.productId || '-'}</td>
                                            <td>{item.name}</td>
                                            <td style={{ textAlign: 'center' }}>{item.unit}</td>
                                            <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td style={{ textAlign: 'right' }}>{Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {[...Array(Math.max(0, 10 - invoiceItems.length))].map((_, i) => (
                                        <tr key={`empty-${i}`} className="empty-row">
                                            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        <div className="invoice-footer">
                            <div className="footer-left">
                                <div className="payment-terms-box" style={{
                                    border: '1px solid #000',
                                    padding: '5px',
                                    fontSize: '12px',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>ชำระโดย<br />PAID BY</span>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', border: '1px solid #000' }}></div> เงินสด <br /> CASH</label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', border: '1px solid #000' }}></div> เช็ค <br /> CHEQUE</label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', border: '1px solid #000' }}></div> เงินโอน <br /> TRANSFER</label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <div style={{ marginRight: '10px' }}>ธนาคาร...............สาขา...............</div>
                                        <div>เลขที่เช็ค...............</div>
                                    </div>

                                    <div style={{ display: 'flex', marginBottom: '5px' }}>
                                        <div style={{ marginRight: '10px' }}>ลงวันที่..../..../.......</div>
                                        <div>จำนวนเงิน..........</div>
                                    </div>

                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                        <div>ผู้รับเงิน / COLLECTOR ........................................ วันที่ / Date......./......./.......</div>
                                    </div>
                                </div>

                                <div className="remark-box">
                                    <strong>หมายเหตุ (Remarks):</strong>
                                    <p>ได้รับสินค้าตามรายการข้างบนถูกต้องและอยู่ในสภาพเรียบร้อย</p>
                                </div>
                                <div className="text-amount">
                                    ( {(() => {
                                        const amount = totals.grandTotal;
                                        const bahtText = (num) => {
                                            num = Number(num);
                                            if (isNaN(num)) return "ศูนย์บาทถ้วน";

                                            const THB_TEXT_NUM = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
                                            const THB_TEXT_UNIT = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

                                            const numStr = num.toFixed(2);
                                            const [baht, satang] = numStr.split('.');

                                            if (Number(baht) === 0 && Number(satang) === 0) return "ศูนย์บาทถ้วน";

                                            let text = "";

                                            // Process Baht
                                            const bahtLen = baht.length;
                                            for (let i = 0; i < bahtLen; i++) {
                                                const digit = parseInt(baht[i]);
                                                const unitIdx = (bahtLen - i - 1) % 6;

                                                if (digit !== 0) {
                                                    if (unitIdx === 1 && digit === 1 && bahtLen > 1) { // 10 (Sip)
                                                        text += "";
                                                    } else if (unitIdx === 1 && digit === 2) { // 20 (Yi Sip)
                                                        text += "ยี่";
                                                    } else if (unitIdx === 0 && digit === 1 && bahtLen > 1 && i > 0) { // 1 (Ed)
                                                        text += "เอ็ด";
                                                    } else {
                                                        text += THB_TEXT_NUM[digit];
                                                    }
                                                    text += THB_TEXT_UNIT[unitIdx];
                                                } else if (unitIdx === 0 && (bahtLen - i - 1) >= 6) { // Million position
                                                    text += "ล้าน";
                                                }
                                            }

                                            if (text.length === 0) text = "ศูนย์";
                                            if (text) text += "บาท";

                                            // Process Satang
                                            if (Number(satang) === 0) {
                                                return text + "ถ้วน";
                                            } else {
                                                const satangLen = satang.length;
                                                for (let i = 0; i < satangLen; i++) {
                                                    const digit = parseInt(satang[i]);
                                                    const unitIdx = satangLen - i - 1;

                                                    if (digit !== 0) {
                                                        if (unitIdx === 1 && digit === 1) { // 10 (Sip)
                                                            text += "";
                                                        } else if (unitIdx === 1 && digit === 2) { // 20 (Yi Sip)
                                                            text += "ยี่";
                                                        } else if (unitIdx === 0 && digit === 1 && satangLen > 1) { // 1 (Ed)
                                                            text += "เอ็ด";
                                                        } else {
                                                            text += THB_TEXT_NUM[digit];
                                                        }
                                                        text += (unitIdx === 1 ? "สิบ" : "สตางค์");
                                                    }
                                                }
                                                return text;
                                            }
                                        };
                                        return bahtText(amount);
                                    })()} )
                                </div>
                            </div>
                            <div className="footer-right">
                                <div className="total-row">
                                    <span>รวมเงิน</span>
                                    <span>{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="total-row">
                                    <span>ส่วนลด</span>
                                    <span>0.00</span>
                                </div>
                                <div className="total-row">
                                    <span>หัก ณ ที่จ่าย</span>
                                    <span>0.00</span>
                                </div>
                                <div className="total-row">
                                    <span>มูลค่าสินค้าหลังหักส่วนลด</span>
                                    <span>{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="total-row">
                                    <span>ภาษีมูลค่าเพิ่ม 7%</span>
                                    <span>{totals.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="grand-total-row">
                                    <span>จํานวนเงินทั้งสิ้น</span>
                                    <span>{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="signatures">
                            <div className="sig-box">
                                <div className="sig-line"></div>
                                <p>ผู้รับของ</p>
                                <p>วันที่ ...../...../..........</p>
                            </div>
                            <div className="sig-box">
                                <div className="sig-line"></div>
                                <p>ผู้ส่งของ</p>
                                <p>วันที่ ...../...../..........</p>
                            </div>
                            <div className="sig-box">
                                <div className="sig-line"></div>
                                <p>ผู้มีอำนาจลงนาม</p>
                                <p>วันที่ ...../...../..........</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span style={{ fontSize: '1.2rem' }}>DARA AUTO</span>
                    <button
                        className="close-sidebar-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'none' // Hidden on desktop, shown via CSS query if needed
                        }}
                    >
                        ×
                    </button>
                </div>

                <ul className="sidebar-menu">
                    <li
                        className={`menu-item ${activeMenu === "tax-invoice" ? "active" : ""}`}
                        onClick={() => { setActiveMenu("tax-invoice"); setIsSidebarOpen(false); }}
                    >
                        <span className="menu-icon">📄</span>
                        ออกใบกำกับภาษี
                    </li>
                    <li
                        className={`menu-item ${activeMenu === "quotation" ? "active" : ""}`}
                        onClick={() => { setActiveMenu("quotation"); setIsSidebarOpen(false); }}
                    >
                        <span className="menu-icon">📑</span>
                        ออกใบเสนอราคา
                    </li>

                    <li
                        className={`menu-item ${activeMenu === "customers" ? "active" : ""}`}
                        onClick={() => { setActiveMenu("customers"); setIsSidebarOpen(false); }}
                    >
                        <span className="menu-icon">👥</span>
                        ฐานข้อมูลลูกค้า
                    </li>
                    <li
                        className={`menu-item ${activeMenu === "history" ? "active" : ""}`}
                        onClick={() => { setActiveMenu("history"); setIsSidebarOpen(false); }}
                    >
                        <span className="menu-icon">📜</span>
                        ประวัติเอกสาร
                    </li>
                    <li
                        className={`menu-item ${activeMenu === "products" ? "active" : ""}`}
                        onClick={() => { setActiveMenu("products"); setIsSidebarOpen(false); }}
                    >
                        <span className="menu-icon">📦</span>
                        ฐานข้อมูลสินค้า
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="menu-icon">↩️</span>
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div key={activeMenu} className="animate-fade-in">
                    <header className="main-header">
                        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                className="menu-toggle-btn"
                                onClick={toggleSidebar}
                                style={{
                                    display: 'none', // Controlled by CSS media query
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                ☰
                            </button>
                            <div className="page-title">
                                {activeMenu === "quotation" ? (
                                    <>
                                        <span className="page-icon quotation">📑</span>
                                        ออกใบเสนอราคา (Quotation)
                                    </>
                                ) : activeMenu === "customers" ? (
                                    <>
                                        <span className="page-icon customers">👥</span>
                                        ฐานข้อมูลลูกค้า
                                    </>
                                ) : activeMenu === "history" ? (
                                    <>
                                        <span className="page-icon history">📜</span>
                                        ประวัติเอกสาร (History)
                                    </>
                                ) : activeMenu === "products" ? (
                                    <>
                                        <span className="page-icon products">📦</span>
                                        ฐานข้อมูลสินค้า
                                    </>
                                ) : (
                                    <>
                                        <span className="page-icon invoice">📄</span>
                                        ออกใบกำกับภาษี (Tax Invoice)
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="header-actions">
                            {activeMenu === "customers" ? (
                                <button
                                    className="action-btn primary-btn btn-success"
                                    onClick={handleAddCustomer}
                                >
                                    + เพิ่มลูกค้าใหม่
                                </button>
                            ) : activeMenu === "products" ? (
                                <button
                                    className="action-btn primary-btn btn-success"
                                    onClick={handleAddProduct}
                                >
                                    + เพิ่มสินค้าใหม่
                                </button>
                            ) : activeMenu === "history" ? (
                                <span></span>
                            ) : (
                                <>
                                    <button className="action-btn" onClick={() => setPreviewMode(true)}>ดูตัวอย่างเอกสาร</button>
                                    <button className="action-btn primary-btn" onClick={() => { setPreviewMode(true); setAutoPrint(true); }}>🖨️ พิมพ์ / PDF</button>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="content-card">
                        <div className="card-header">
                            <div>
                                {activeMenu === "quotation" ? (
                                    <span className="mode-badge quotation">QUOTATION MODE</span>
                                ) : activeMenu === "customers" ? (
                                    <span className="mode-badge customers">CUSTOMERS DATABASE</span>
                                ) : activeMenu === "products" ? (
                                    <span className="mode-badge products">PRODUCTS DATABASE</span>
                                ) : activeMenu === "history" ? (
                                    <span className="mode-badge history">DOCUMENT HISTORY</span>
                                ) : (
                                    <span className="mode-badge invoice">TAX INVOICE MODE</span>
                                )}
                                <h2 className="card-title">
                                    {activeMenu === "customers" ? "ฐานข้อมูลลูกค้า (Customers)" :
                                        activeMenu === "products" ? "ฐานข้อมูลสินค้า (Products)" :
                                            activeMenu === "history" ? "ประวัติเอกสาร (Document History)" : "ข้อมูลเอกสาร"}
                                </h2>
                            </div>
                            {activeMenu !== "customers" && activeMenu !== "products" && activeMenu !== "history" && (
                                <button className="save-btn" onClick={handleSaveDocument}>
                                    💾 บันทึกเข้าระบบ
                                </button>
                            )}
                        </div>

                        {activeMenu === "customers" ? (
                            <div className="table-container">
                                <table className="customers-table">
                                    <thead>
                                        <tr>
                                            <th>รหัส</th>
                                            <th>ชื่อลูกค้า</th>
                                            <th>เลขภาษี</th>
                                            <th>ที่อยู่</th>
                                            <th className="center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingCustomers ? (
                                            <tr>
                                                <td colSpan="5" className="td-empty">กำลังโหลดข้อมูล...</td>
                                            </tr>
                                        ) : customers.length > 0 ? (
                                            customers.map((customer) => (
                                                <tr key={customer.customer_id}>
                                                    <td className="td-id">{customer.customer_id}</td>
                                                    <td className="td-name">{customer.customer_name}</td>
                                                    <td className="td-tax">{customer.customer_taxid}</td>
                                                    <td className="td-address">{customer.customer_address}</td>
                                                    <td className="td-actions">
                                                        <button
                                                            onClick={() => handleEditCustomer(customer)}
                                                            className="icon-btn edit"
                                                            title="แก้ไข"
                                                        >
                                                            📝
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCustomer(customer.customer_id)}
                                                            className="icon-btn delete"
                                                            title="ลบ"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="td-empty">ไม่พบข้อมูลลูกค้า</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeMenu === "history" ? (
                            <div className="table-container">
                                <table className="customers-table">
                                    <thead>
                                        <tr>
                                            <th>วันที่</th>
                                            <th>เลขที่เอกสาร</th>
                                            <th>ชื่อลูกค้า</th>
                                            <th>ประเภท</th>
                                            <th className="text-right">ยอดรวม</th>
                                            <th className="center">สถานะ</th>
                                            <th className="center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingDocuments ? (
                                            <tr>
                                                <td colSpan="7" className="td-empty">กำลังโหลดข้อมูล...</td>
                                            </tr>
                                        ) : documents.length > 0 ? (
                                            documents.map((doc) => (
                                                <tr key={doc.id}>
                                                    <td>{new Date(doc.doc_date).toLocaleDateString('th-TH')}</td>
                                                    <td className="td-id">{doc.doc_number}</td>
                                                    <td className="td-name">{doc.customer_name}</td>
                                                    <td>
                                                        <span className={`mode-badge ${doc.type === 'quotation' ? 'quotation' : 'invoice'}`}>
                                                            {doc.type === 'quotation' ? 'ใบเสนอราคา' : 'ใบกำกับภาษี'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right" style={{ textAlign: 'right' }}>
                                                        {Number(doc.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="center" style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.8rem',
                                                            backgroundColor: doc.status === 'paid' ? '#d1fae5' : '#f3f4f6',
                                                            color: doc.status === 'paid' ? '#059669' : '#6b7280'
                                                        }}>
                                                            {doc.status}
                                                        </span>
                                                    </td>
                                                    <td className="td-actions">
                                                        <button className="icon-btn" title="ดูเอกสาร" onClick={() => handleViewDocument(doc.id)}>👁️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="td-empty">ไม่พบประวัติเอกสาร</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeMenu === "products" ? (
                            <div className="table-container">
                                <table className="customers-table">
                                    <thead>
                                        <tr>
                                            <th>รหัสสินค้า</th>
                                            <th>ชื่อสินค้า</th>
                                            <th>หน่วย</th>
                                            <th>ราคามาตรฐาน</th>
                                            <th className="center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingProducts ? (
                                            <tr>
                                                <td colSpan="5" className="td-empty">กำลังโหลดข้อมูล...</td>
                                            </tr>
                                        ) : products.length > 0 ? (
                                            products.map((p) => (
                                                <tr key={p.product_id}>
                                                    <td className="td-id">{p.product_id}</td>
                                                    <td className="td-name">{p.product_name}</td>
                                                    <td>{p.product_unit}</td>
                                                    <td>{Number(p.product_price).toLocaleString()}</td>
                                                    <td className="td-actions">
                                                        <button onClick={() => handleEditProduct(p)} className="icon-btn edit" title="แก้ไข">📝</button>
                                                        <button onClick={() => handleDeleteProduct(p.product_id)} className="icon-btn delete" title="ลบ">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="td-empty">ไม่พบข้อมูลสินค้า</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="form-section">
                                <div className="left-col">
                                    <div className="form-group">
                                        <label>🔍 ค้นหาลูกค้าเดิม (Auto-fill)</label>
                                        <div className="searchable-dropdown">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="-- พิมพ์เพื่อค้นหา หรือเลือกจากรายการ --"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setIsDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                onBlur={handleBlur}
                                            />
                                            {isDropdownOpen && (
                                                <ul className="dropdown-list">
                                                    {filteredCustomers.length > 0 ? (
                                                        filteredCustomers.map((c) => (
                                                            <li
                                                                key={c.customer_id}
                                                                onClick={() => selectCustomer(c)}
                                                                className="dropdown-item"
                                                            >
                                                                <div className="d-flex justify-content-between">
                                                                    <span>{c.customer_name}</span>
                                                                    <span style={{ fontSize: '0.8em', color: '#64748b' }}>{c.customer_id}</span>
                                                                </div>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="dropdown-item no-result">ไม่พบข้อมูลลูกค้า</li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>ชื่อลูกค้า</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label>รหัสลูกค้า</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.customerId}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="form-group">
                                                <label>เลขผู้เสียภาษี</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.taxId}
                                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>ที่อยู่</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="right-col">
                                    <div className="info-panel">
                                        <div className="form-group">
                                            <label>เลขที่เอกสาร (Auto)</label>
                                            <div className="doc-number-group">
                                                <input
                                                    type="text"
                                                    className="form-control readonly"
                                                    value={formData.docNumber}
                                                    readOnly
                                                    style={{ color: activeMenu === 'quotation' ? '#d97706' : '#2563eb', fontWeight: 'bold' }}
                                                />
                                                <button className="refresh-btn" onClick={handleGenerateDocNumber}>🔄</button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>วันที่</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.docDate}
                                                onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>วันครบกำหนด</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>พนักงานขาย</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.salesperson}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeMenu !== "customers" && activeMenu !== "products" && activeMenu !== "history" && (
                            <div className="invoice-items-section" style={{ marginTop: '24px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>รายการสินค้า (Items)</h3>
                                    <div className="d-flex gap-2">
                                        <button className="action-btn" onClick={handleImportProduct} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                                            📦 เลือกจากฐานข้อมูล
                                        </button>
                                        <button className="action-btn" onClick={handleAddInvoiceItem} style={{ backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                                            + เพิ่มรายการ
                                        </button>
                                    </div>
                                </div>

                                <div className="table-container">
                                    <table className="customers-table width-100">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '5%' }}>#</th>
                                                <th style={{ width: '35%' }}>รายการสินค้า</th>
                                                <th style={{ width: '10%' }}>จำนวน</th>
                                                <th style={{ width: '10%' }}>หน่วย</th>
                                                <th style={{ width: '15%' }}>ราคา/หน่วย</th>
                                                <th style={{ width: '15%' }}>รวมเงิน</th>
                                                <th style={{ width: '10%', textAlign: 'center' }}>ลบ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                                    <td>
                                                        <input
                                                            className="form-control"
                                                            value={item.name}
                                                            placeholder="เช่น ค่าบริการ, สินค้า..."
                                                            onChange={(e) => handleUpdateInvoiceItem(item.id, 'name', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={item.quantity}
                                                            min="1"
                                                            onChange={(e) => handleUpdateInvoiceItem(item.id, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="form-control"
                                                            value={item.unit}
                                                            onChange={(e) => handleUpdateInvoiceItem(item.id, 'unit', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={item.price}
                                                            min="0"
                                                            step="0.01"
                                                            onChange={(e) => handleUpdateInvoiceItem(item.id, 'price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-right" style={{ paddingRight: '12px', textAlign: 'right' }}>
                                                        {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            className="icon-btn delete"
                                                            onClick={() => handleRemoveInvoiceItem(item.id)}
                                                            tabIndex="-1"
                                                        >
                                                            ❌
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row mt-4" style={{ display: 'flex', marginTop: '24px' }}>
                                    <div className="col-md-6" style={{ flex: 1, paddingRight: '1rem' }}>
                                        <label>หมายเหตุ</label>
                                        <textarea className="form-control" rows="3" placeholder="ระบุเงื่อนไขการชำระเงิน หรือหมายเหตุอื่นๆ..."></textarea>
                                    </div>
                                    <div className="col-md-6" style={{ flex: 1, paddingLeft: '1rem' }}>
                                        <div className="totals-box p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                                            <div className="d-flex justify-content-between mb-2 shadow-none" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>รวมเป็นเงิน (Subtotal)</span>
                                                <span className="font-weight-bold">{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>ภาษีมูลค่าเพิ่ม 7% (VAT)</span>
                                                <span>{totals.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="d-flex justify-content-between pt-2 border-top" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>
                                                <span>ยอดรวมสุทธิ (Grand Total)</span>
                                                <span>{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
}
