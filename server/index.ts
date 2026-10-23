import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { shopsRouter } from './routes/shops';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { returnsRouter } from './routes/returns';
import { reviewsRouter } from './routes/reviews';
import { notificationsRouter } from './routes/notifications';
import { sellerRouter } from './routes/seller';
import { adminRouter } from './routes/admin';

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
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mock Payment Gateway Endpoint (Demo Mode)
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

app.listen(PORT, () => {
  console.log(`🚀 Namma Santhe Server running on http://localhost:${PORT}`);
  console.log(`📦 Hyperlocal marketplace APIs ready at http://localhost:${PORT}/api/health`);
});
