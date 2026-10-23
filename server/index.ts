import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { authRouter } from './routes/auth';
import { shopsRouter } from './routes/shops';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { returnsRouter } from './routes/returns';
import { reviewsRouter } from './routes/reviews';
import { notificationsRouter } from './routes/notifications';
import { sellerRouter } from './routes/seller';
import { adminRouter } from './routes/admin';
import { paymentsRouter } from './routes/payments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'Namma Santhe Hyperlocal Marketplace',
    version: '2.0.0',
    phase: 'Phase 2: Shopping Convenience, Secure Payments & Delivery Management',
    timestamp: new Date().toISOString(),
  });
});

// Legacy Mock Payment Gateway Endpoint (Demo compatibility)
app.post('/api/payments/process-demo', (req: Request, res: Response) => {
  const { amount, method, orderReference } = req.body;
  const transactionId = `TXN-DEMO-${Date.now().toString().slice(-6)}`;
  res.json({
    success: true,
    paymentStatus: 'paid',
    transactionId,
    method: method || 'UPI',
    amount: amount || 0,
    timestamp: new Date().toISOString(),
    message: 'Demo payment simulated and authorized successfully.',
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/shops', shopsRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);

// Serve built frontend assets in production if dist directory exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Namma Santhe Server running on http://localhost:${PORT}`);
  console.log(`📦 Hyperlocal marketplace APIs ready at http://localhost:${PORT}/api/health`);
  console.log(`💳 Razorpay & Secure Delivery endpoints ready at http://localhost:${PORT}/api/payments`);
});
