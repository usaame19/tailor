'use client';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaPrint,
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {  COMPANY_NAME } from '@/lib/config';

const OrderView = ({ order }: { order: any }) => {
  const router = useRouter();


  // Function to handle generating the PDF invoice
  const handlePrintInvoice = () => {
    // Set page size to A5 (or custom smaller size)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [140, 200], // Smaller receipt-like size
    });

    // Set company name and details at the top
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${COMPANY_NAME}`, 10, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nairobi - Kenya', 10, 16);
    doc.text('+254 799 824 10', 10, 22);

    // Invoice title and date
    doc.setFontSize(10);
    doc.text('INVOICE', 120, 10, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 16, {
      align: 'right',
    });
    doc.text(`Invoice #: INV${order.id}`, 120, 22, { align: 'right' });

    // Seller Information
    doc.setFont('helvetica', 'bold');
    doc.text('Seller:', 10, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(order.user.name, 10, 38);
    doc.text(order.user.email, 10, 44);

    // Draw a line to separate header from body
    doc.line(10, 50, 130, 50);

    // Table for items
    const itemRows = order.items.map((item: any) => [
      item.product?.name || 'N/A',
      item.quantity.toString(),
      item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      (item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
      body: itemRows,
      styles: { fontSize: 8 }, // Small font for receipt style
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
      theme: 'grid',
    });

    // Calculate total
    const total = order.items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );

    // Total section
    const tableEndY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total:', 80, tableEndY);
    doc.text(total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 120, tableEndY, { align: 'right' });

    // Save the PDF
    doc.save(`Invoice_${order.id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back button with icon */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Order header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-300 w-full">
        <h1 className="text-xl md:text-2xl font-semibold mb-2">
          Order #{order.orderId}
        </h1>
        <p className="text-sm text-gray-600">
          Sold by: <strong>{order.user.name}</strong> (
          <a
            href={`mailto:${order.user.email}`}
            className="text-blue-500 hover:underline"
          >
            {order.user.email}
          </a>
          )
        </p>
      </div>

      {/* Order details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 space-y-4 md:space-y-0 lg:gap-6">
        {/* Order items */}
        <div className="col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-300 w-full">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4">Product Name</th>
                  <th className="py-2 px-4">Size</th>
                  <th className="py-2 px-4">Color</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Total Price</th>
                </tr>
              </thead>
              <tbody>
              {order.items.map((item: any, index: any) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border">
                      {item.product?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border">
                      {item.sku?.size == '0' ? '-' : item.sku?.size  || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border">
                      {item.sku?.variant?.color == '0' ? '-' : item.sku?.variant?.color || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border">{item.quantity}</td>
                    <td className="py-3 px-4 border">
                      {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-300 w-full">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="flex justify-between mb-4">
          <span>Cash Amount</span>
          <span>
            {order.cashAmount}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Digital Amount</span>
          <span>
            {order.digitalAmount}
          </span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span>
            {order.items
              .reduce(
                (acc: number, item: any) => acc + item.price * item.quantity,
                0
              )
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Print Invoice Button */}
      <div className="mt-6">
        <button
          onClick={handlePrintInvoice}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold shadow-md transition-colors duration-200"
        >
          <FaPrint className="mr-2 inline-block" /> Print Invoice
        </button>
      </div>
    </div>
  );
};

export default OrderView;
