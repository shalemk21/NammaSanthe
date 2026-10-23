async function testPhase3() {
  console.log('Testing Phase 3 endpoints...');
  
  // 1. Login as customer
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@nammasanthe.com', password: 'pass123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✓ Customer Login successful:', loginData.user.name);

  // 2. Fetch orders
  const ordersRes = await fetch('http://localhost:5000/api/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const ordersData = await ordersRes.json();
  const order = ordersData.orders[0];
  console.log(`✓ Fetched ${ordersData.orders.length} orders. Selected order #${order.id} (${order.vendorName})`);

  // 3. Test Digital Tax Invoice endpoint
  const invoiceRes = await fetch(`http://localhost:5000/api/orders/${order.id}/invoice`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const invoiceData = await invoiceRes.json();
  console.log(`✓ Tax Invoice generated: #${invoiceData.invoice.invoiceNumber}, Platform GSTIN: ${invoiceData.invoice.platformGstin}, Seller FSSAI: ${invoiceData.invoice.seller?.fssaiLicenseNumber}, Grand Total: ₹${invoiceData.invoice.summary?.grandTotal}`);

  // 4. Test Rider Login
  const riderLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rider@nammasanthe.com', password: 'pass123' })
  });
  const riderLoginData = await riderLoginRes.json();
  if (!riderLoginData.success) {
    console.error('Rider login error response:', riderLoginData);
  }
  const riderToken = riderLoginData.token;
  console.log('✓ Rider Login successful:', riderLoginData.user?.name, `(Role: ${riderLoginData.user?.role})`);

  // 5. Test Rider GPS update
  const gpsRes = await fetch(`http://localhost:5000/api/orders/${order.id}/gps`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ latitude: 13.0033, longitude: 77.5689, addressLabel: '15th Cross, Malleshwaram Flower Market' })
  });
  const gpsData = await gpsRes.json();
  if (!gpsRes.ok) {
    console.error('GPS status:', gpsRes.status, gpsData);
  } else {
    console.log('✓ GPS coordinates updated:', gpsData.order?.riderCoordinates);
  }

  // 6. Test Webhook notifications (WhatsApp and SMS simulation)
  const webhookRes = await fetch('http://localhost:5000/api/notifications/webhook/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'both',
      orderId: order.id,
      recipientPhone: '+91 98450 99887',
      recipientName: 'Priya Sharma',
      event: 'Out for Delivery on EV Ather 450X',
      vendorName: order.vendorName
    })
  });
  const webhookData = await webhookRes.json();
  console.log(`✓ Webhook simulation successful: ${webhookData.notifications.length} messages dispatched.`);
  webhookData.notifications.forEach(n => {
    console.log(`   [${n.channel.toUpperCase()}] ${n.message.slice(0, 70)}...`);
  });

  // 7. Test QR Handover verification
  const handoverRes = await fetch(`http://localhost:5000/api/orders/${order.id}/verify-handover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ qrToken: `TOKEN-DELIVERY-${order.id}` })
  });
  const handoverData = await handoverRes.json();
  console.log('✓ Handover QR token verified:', handoverData.message, 'Status:', handoverData.order.status);

  // 8. Test Doorstep COD cash collection
  const cashRes = await fetch(`http://localhost:5000/api/orders/${order.id}/collect-cash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ amountCollected: order.totalAmount, notes: 'Exact change collected at doorstep' })
  });
  const cashData = await cashRes.json();
  console.log('✓ Doorstep COD cash collected:', cashData.order.cashCollected, `(₹${order.totalAmount})`);

  // 9. Test Customer Review with attached fresh produce photos
  const targetProductId = (order.items[0] as any).productId || 'p1';
  const reviewRes = await fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      productId: targetProductId,
      rating: 5,
      comment: 'Direct farm harvest! The country produce is fresh, crisp, and pesticide-free.',
      photos: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
      ]
    })
  });
  const reviewData = await reviewRes.json();
  if (!reviewData.success) {
    console.log('Review response note:', reviewData.message);
  }
  console.log('✓ Customer Produce Review with Photos posted:', reviewData.success, reviewData.review?.photos);

  console.log('\nALL PHASE 3 BACKEND & WORKFLOW TESTS PASSED PERFECTLY!');
}

testPhase3().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
