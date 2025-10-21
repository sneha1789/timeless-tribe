const axios = require('axios');

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const Coupon = require('../models/Coupon.js');
const Settings = require('../models/Settings.js');
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_SANDBOX_URL = process.env.ESEWA_SANDBOX_URL;
const ESEWA_SANDBOX_VERIFY_URL = process.env.ESEWA_SANDBOX_VERIFY_URL;


const puppeteer = require('puppeteer');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail'); 

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const generateInvoiceHTML = (order) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Invoice #${order._id.toString().slice(-8).toUpperCase()}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333; }
            .invoice-container { max-width: 800px; margin: 20px auto; background: #fff; border: 1px solid #dee2e6; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 30px; border-bottom: 2px solid #dee2e6; }
            .invoice-logo img { max-width: 150px; }
            .invoice-details { text-align: right; }
            .invoice-details h1 { margin: 0; font-size: 24px; color: #343a40; }
            .invoice-details p { margin: 2px 0; color: #6c757d; font-size: 14px; }
            .invoice-addresses { display: flex; justify-content: space-between; padding: 30px; }
            .address-block { width: 48%; }
            .address-block h3 { margin: 0 0 10px; font-size: 14px; color: #495057; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .address-block p { margin: 2px 0; font-size: 14px; line-height: 1.6; color: #6c757d; }
            .invoice-table { width: 100%; border-collapse: collapse; }
            .invoice-table th, .invoice-table td { padding: 12px 30px; text-align: left; }
            .invoice-table thead { background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; }
            .invoice-table th { font-size: 13px; font-weight: 600; color: #495057; text-transform: uppercase; }
            .invoice-table tbody tr { border-bottom: 1px solid #eee; }
            .invoice-table tbody tr:last-child { border-bottom: none; }
            .invoice-table .item-name { font-weight: 600; color: #343a40; }
            .invoice-table .item-meta { font-size: 12px; color: #888; }
            .invoice-totals { padding: 30px; border-top: 2px solid #dee2e6; }
            .totals-table { float: right; width: 40%; }
            .totals-table td { padding: 6px 0; font-size: 14px; }
            .totals-table .label { color: #6c757d; }
            .totals-table .amount { text-align: right; font-weight: 600; color: #343a40; }
            .totals-table tr.grand-total td { font-size: 18px; padding-top: 10px; border-top: 2px solid #343a40; }
            .invoice-footer { padding: 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <img src="https://res.cloudinary.com/dg9elubn7/image/upload/v1760527056/cloth_bcvlio.jpg" alt="Timeless Tribe Co.">
                </div>
                <div class="invoice-details">
                    <h1>INVOICE</h1>
                    <p>Invoice #: ${order._id.toString().slice(-8).toUpperCase()}</p>
                    <p>Order Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
            </div>
            <div class="invoice-addresses">
                <div class="address-block">
                    <h3>Billed To:</h3>
                    <p><strong>${order.shippingAddress.fullName}</strong></p>
                    <p>${order.shippingAddress.street}, ${order.shippingAddress.area}</p>
                    <p>${order.shippingAddress.city}, Nepal</p>
                    <p>Phone: ${order.shippingAddress.phone}</p>
                </div>
                <div class="address-block" style="text-align: right;">
                    <h3>Shipped From:</h3>
                    <p><strong>Timeless Tribe Co.</strong></p>
                    <p>123 Artisan Path, Thamel</p>
                    <p>Kathmandu, Nepal</p>
                    <p>support@timelesstribe.com</p>
                </div>
            </div>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name}</div>
                                <div class="item-meta">${item.variantName} / ${item.size}</div>
                            </td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">Rs. ${item.price.toLocaleString()}</td>
                            <td style="text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="invoice-totals">
                <table class="totals-table">
                    <tbody>
                        <tr>
                            <td class="label">Subtotal (MRP)</td>
                            <td class="amount">Rs. ${(order.itemsPrice + order.discountOnMRP).toLocaleString()}</td>
                        </tr>
                        ${order.discountOnMRP > 0 ? `
                        <tr>
                            <td class="label">Product Discounts</td>
                            <td class="amount">- Rs. ${order.discountOnMRP.toLocaleString()}</td>
                        </tr>
                        ` : ''}
                        ${order.couponDiscount > 0 ? `
                        <tr>
                            <td class="label">Coupon (${order.couponCode})</td>
                            <td class="amount">- Rs. ${order.couponDiscount.toLocaleString()}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td class="label">Shipping Fee</td>
                            <td class="amount">${order.shippingPrice > 0 ? `Rs. ${order.shippingPrice.toLocaleString()}` : 'Free'}</td>
                        </tr>
                        <tr class="grand-total">
                            <td class="label">TOTAL</td>
                            <td class="amount">Rs. ${order.totalPrice.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="clear: both;"></div>
            </div>
            <div class="invoice-footer">
                <p>Payment Method: ${order.paymentMethod.toUpperCase()}</p>
                <p>Thank you for your purchase!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


const finalizeOrderSuccess = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order || order.orderStatus !== 'pending_payment') {
    console.error(
      `finalizeOrderSuccess: Order ${orderId} not found or not in pending_payment status. Current status: ${order?.orderStatus}`,
    );
    return {
      success: false,
      message: 'Order not found or has already been processed.',
    };
  }

  const userId = order.user;

  console.log(
    `Finalizing Order ID: ${orderId} - Attempting atomic stock update...`,
  );

  try {
    for (const item of order.orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          'variants.name': item.variantName,
          'variants.stockBySize': {
            $elemMatch: { size: item.size, stock: { $gte: item.quantity } },
          },
        },
        {
          $inc: { 'variants.$[v].stockBySize.$[s].stock': -item.quantity },
        },
        {
          arrayFilters: [
            { 'v.name': item.variantName },
            { 's.size': item.size },
          ],
        },
      );

      if (!updatedProduct) {
        order.orderStatus = 'on-hold';
        order.cancellationReason = `Stock allocation failed for ${item.name}. Item is out of stock. Manual review required.`;
        await order.save();
        console.error(
          `RACE CONDITION DETECTED: Stock for ${item.name} was claimed. Order ${orderId} put on hold.`,
        );
        return {
          success: false,
          message: `Unfortunately, one or more items in your order just went out of stock. Your order has been placed on hold, and our team will contact you shortly.`,
        };
      }
    }
  } catch (error) {
    console.error(
      `Critical error during atomic stock update for order ${orderId}:`,
      error,
    );
    order.orderStatus = 'on-hold';
    order.cancellationReason =
      'A server error occurred during stock allocation.';
    await order.save();
    return {
      success: false,
      message: 'A server error occurred while finalizing your order stock.',
    };
  }

  try {
    console.log(
      `[finalizeOrderSuccess ${orderId}] Attempting to remove ordered items from user ${userId}'s cart...`,
    );
    const itemsToRemoveConditions = order.orderItems.map((item) => ({
      product: item.product,
      variantName: item.variantName,
      size: item.size,
    }));

    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          cart: {
            $or: itemsToRemoveConditions,
          },
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      console.log(
        `[finalizeOrderSuccess ${orderId}] Successfully removed items from user ${userId}'s cart.`,
      );
    } else {
      console.log(
        `[finalizeOrderSuccess ${orderId}] No items needed removal or user cart already updated for user ${userId}.`,
      );
    }
  } catch (cartError) {
    console.error(
      `[finalizeOrderSuccess ${orderId}] CRITICAL ERROR removing items from user ${userId}'s cart:`,
      cartError,
    );
  }

  order.orderStatus = 'processing';
  await order.save();

  try {
    const finalizedOrder = await Order.findById(orderId).populate('user', 'name email');
    if (finalizedOrder && finalizedOrder.user.email) {
      console.log(`[Email] Generating invoice and sending confirmation for order ${orderId}...`);
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] }); // Use --no-sandbox for Linux environments
      const page = await browser.newPage();
      const htmlContent = generateInvoiceHTML(finalizedOrder);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      // Fire and forget - don't let email failure block the main process
      sendOrderConfirmationEmail(finalizedOrder.user, finalizedOrder, pdfBuffer)
        .catch(emailError => console.error(`[Email] Asynchronous email sending failed for order ${orderId}:`, emailError));
    }
  } catch (emailError) {
    console.error(`[Email] Failed to generate PDF or send confirmation for order ${orderId}:`, emailError);
  }

  return { success: true };
};

const initiatePayment = async (req, res) => {
  const draftOrderId = req.params.id;
  const { paymentMethod } = req.body;

  try {
    const order = await Order.findById(draftOrderId);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ message: 'Order not found or access denied.' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid.' });
    }
    if (order.orderStatus !== 'pending_payment') {
      return res
        .status(400)
        .json({ message: 'This order is not in a pending payment state.' });
    }

    order.paymentMethod = paymentMethod;
    await order.save();

    if (paymentMethod === 'eSewa') {
      const transaction_uuid = order._id.toString();
      const total_amount = order.totalPrice.toFixed(2);
      const product_code = ESEWA_MERCHANT_CODE;
      const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const signature = crypto
        .createHmac('sha256', ESEWA_SECRET_KEY)
        .update(message)
        .digest('base64');
      const esewaV2Data = {
        amount: (order.itemsPrice - order.couponDiscount).toFixed(2),
        tax_amount: '0.00',
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: '0.00',
        product_delivery_charge: order.shippingPrice.toFixed(2),
        success_url: `${FRONTEND_URL}/order-success`,
        failure_url: `${FRONTEND_URL}/order-failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      };
      res.json({
        paymentGateway: 'eSewa',
        formData: esewaV2Data,
        paymentUrl: ESEWA_SANDBOX_URL,
      });
    } else if (paymentMethod === 'COD') {
      const result = await finalizeOrderSuccess(draftOrderId);
      if (result.success) {
        res.json({
          message: 'COD order placed successfully.',
          orderId: order._id,
          cod: true,
        });
      } else {
        res
          .status(400)
          .json({ message: result.message || 'Failed to place COD order.' });
      }
    } else {
      return res
        .status(400)
        .json({ message: `Invalid payment method: ${paymentMethod}` });
    }
  } catch (error) {
    console.error('Initiate Payment Error:', error);
    res
      .status(500)
      .json({ message: 'Server error initiating payment: ' + error.message });
  }
};

const verifyEsewaPaymentClient = async (req, res) => {
  try {
    const { decodedData } = req.body;
    console.log('Received eSewa callback data:', decodedData);

    const {
      transaction_uuid: orderId,
      transaction_code: transactionId,
      status,
    } = decodedData;

    if (!orderId || !transactionId || !status) {
      return res
        .status(400)
        .json({ success: false, message: 'Incomplete payment data.' });
    }

    if (status !== 'COMPLETE') {
      return res.status(400).json({
        success: false,
        message: `Payment status is not complete. Status: ${status}`,
      });
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      console.log(`Order ${orderId} is already paid, skipping processing`);
      return res.json({ success: true, message: 'Payment already verified.' });
    }

    const verificationUrl = `${ESEWA_SANDBOX_VERIFY_URL}?product_code=${ESEWA_MERCHANT_CODE}&total_amount=${order.totalPrice.toFixed(
      2,
    )}&transaction_uuid=${orderId}`;

    console.log('Verifying eSewa payment with URL:', verificationUrl);

    try {
      const esewaResponse = await axios.post(
        verificationUrl,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      console.log('eSewa verification raw response:', esewaResponse.data);

      const verificationData = esewaResponse.data;
      console.log('eSewa verification parsed:', verificationData);

      if (
        verificationData.status === 'COMPLETE' ||
        verificationData.response_code === 'Success' ||
        (verificationData.transaction_uuid === orderId &&
          verificationData.total_amount === order.totalPrice.toFixed(2))
      ) {
        console.log('eSewa payment verified successfully');

        if (order.paymentStatus === 'pending') {
          order.paymentStatus = 'paid';
          order.paidAt = Date.now();
          order.paymentGatewayId = transactionId;

          await order.save();

          const finalizeResult = await finalizeOrderSuccess(orderId);

          if (!finalizeResult.success) {
            console.error(
              `CRITICAL: Payment verified but stock allocation failed for order ${orderId}`,
            );
          }
        }

        res.json({ success: true, message: 'Payment verified successfully.' });
      } else {
        console.warn(
          `eSewa verification failed for order ${orderId}. Response:`,
          verificationData,
        );
        order.paymentStatus = 'failed';
        order.orderStatus = 'payment_failed';
        await order.save();
        res.status(400).json({
          success: false,
          message: `Payment verification failed. Status: ${verificationData.status}`,
        });
      }
    } catch (esewaError) {
      console.error(
        'eSewa API error:',
        esewaError.response?.data || esewaError.message,
      );

      console.log('Attempting fallback verification with transaction data...');

      if (order.paymentStatus === 'pending' && transactionId) {
        order.paymentStatus = 'paid';
        order.paidAt = Date.now();
        order.paymentGatewayId = transactionId;

        await order.save();

        const finalizeResult = await finalizeOrderSuccess(orderId);

        console.log(
          `Fallback: Marked order ${orderId} as paid based on callback data`,
        );
        res.json({
          success: true,
          message: 'Payment processed (fallback verification).',
        });
      } else {
        throw esewaError;
      }
    }
  } catch (error) {
    console.error('eSewa Payment Verification Error:', error);

    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    }

    try {
      const { decodedData } = req.body;
      if (decodedData?.transaction_uuid) {
        const order = await Order.findById(decodedData.transaction_uuid);
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.orderStatus = 'payment_failed';
          await order.save();
        }
      }
    } catch (saveError) {
      console.error('Failed to update order status:', saveError);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during payment verification.',
      debug: error.message,
    });
  }
};
const handlePaymentCallback = async (req, res) => {
  try {
    const { oid: orderId, refId: transactionId, amt: amountPaid } = req.query;

    if (!orderId || !transactionId || !amountPaid) {
      return res.redirect(
        `${FRONTEND_URL}/order-failure?orderId=${orderId}&error=incomplete_data`,
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/order-failure?orderId=${orderId}&error=order_not_found`,
      );
    }

    if (order.paymentStatus === 'paid') {
      return res.redirect(
        `${FRONTEND_URL}/order-success?data=${btoa(
          JSON.stringify({ transaction_uuid: orderId, status: 'COMPLETE' }),
        )}`,
      );
    }

    const verificationUrl = `${ESEWA_SANDBOX_VERIFY_URL}?amt=${order.totalPrice.toFixed(
      2,
    )}&rid=${transactionId}&pid=${orderId}&scd=${ESEWA_MERCHANT_CODE}`;
    const esewaResponse = await axios.get(verificationUrl);

    const responseText = esewaResponse.data.trim();
    if (responseText.includes('Success')) {
      order.paymentStatus = 'paid';
      order.paidAt = Date.now();
      order.paymentGatewayId = transactionId;
      await order.save();

      const finalizeResult = await finalizeOrderSuccess(orderId);

      if (finalizeResult.success) {
        const successData = btoa(
          JSON.stringify({ transaction_uuid: orderId, status: 'COMPLETE' }),
        );
        res.redirect(`${FRONTEND_URL}/order-success?data=${successData}`);
      } else {
        res.redirect(
          `${FRONTEND_URL}/order-failure?orderId=${orderId}&error=stock_issue&message=${encodeURIComponent(
            finalizeResult.message,
          )}`,
        );
      }
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.redirect(
        `${FRONTEND_URL}/order-failure?orderId=${orderId}&error=verification_failed`,
      );
    }
  } catch (error) {
    console.error(
      'Payment Callback Error:',
      error.response ? error.response.data : error.message,
    );
    const orderId = req.query?.oid || '';
    res.redirect(
      `${FRONTEND_URL}/order-failure?orderId=${orderId}&error=server_error`,
    );
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

const getOrderById = async (req, res) => {
  console.log(`[getOrderById] Received request for Order ID: ${req.params.id}`); // Log entry
  try {
    console.log(`[getOrderById] Attempting to find and populate order...`);
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email',
    );
    console.log(`[getOrderById] Order found: ${order ? 'Yes' : 'No'}`);

    if (order) {
      console.log(
        `[getOrderById] Order User ID: ${order.user?._id}, Request User ID: ${req.user?._id}`,
      );
    }

    if (order && order.user._id.toString() === req.user._id.toString()) {
      console.log(
        `[getOrderById] Authorization successful. Sending order data.`,
      );
      res.json(order);
    } else if (!order) {
      console.log(`[getOrderById] Order not found.`);
      res.status(404).json({ message: 'Order not found' });
    } else {
      console.log(`[getOrderById] Authorization failed.`);
      res.status(403).json({ message: 'Not authorized to view this order' });
    }
  } catch (error) {
    console.error(
      `[getOrderById] CRITICAL ERROR fetching order ${req.params.id}:`,
      error,
    );
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Order ID format' });
    }
    res.status(500).json({ message: 'Server error fetching order.' });
  }
};

const updateOrderPaymentMethod = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ message: 'Order not found or access denied.' });
    }
    if (order.paymentStatus !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Cannot update payment method for paid order.' });
    }
    order.paymentMethod = req.body.paymentMethod;
    await order.save();
    res.json({ message: 'Payment method updated successfully', order });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ message: 'Server error updating payment method.' });
  }
};

const createDraftOrder = async (req, res) => {
  const { itemIds, shippingAddressId, couponCode } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('cart.product');
    const settings = await Settings.getSingleton();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updateResult = await Order.updateMany(
      {
        user: userId,
        orderStatus: 'pending_payment',
        paymentStatus: 'pending',
      },
      {
        $set: {
          orderStatus: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Replaced by new draft order',
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      console.log(
        `Cancelled ${updateResult.modifiedCount} existing draft orders for user ${userId}`,
      );
    }

    const shippingAddress = user.addresses.id(shippingAddressId);
    if (!shippingAddress) {
      return res
        .status(400)
        .json({ message: 'Invalid shipping address selected.' });
    }

    const itemsToOrder = user.cart.filter(
      (item) => itemIds.includes(item._id.toString()) && item.product,
    );

    if (itemsToOrder.length !== itemIds.length || itemsToOrder.length === 0) {
      return res
        .status(400)
        .json({ message: 'Some selected items were not found in your cart.' });
    }

    for (const item of itemsToOrder) {
      const product = item.product;
      const variant = product.variants.find((v) => v.name === item.variantName);
      const sizeStock = variant?.stockBySize.find((s) => s.size === item.size);

      if (!variant || !sizeStock) {
        return res.status(400).json({
          message: `Configuration error for product ${product.name}.`,
        });
      }
      if (sizeStock.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${sizeStock.stock} available.`,
        });
      }
    }

    let orderItems = [];
    let itemsPrice = 0;
    let discountOnMRP = 0;

    for (const item of itemsToOrder) {
      const product = item.product;
      const variant = product.variants.find((v) => v.name === item.variantName);

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        variantName: item.variantName,
        size: item.size,
        image: variant.images?.[0]?.url || '',
        price: variant.price,
        originalPrice: variant.originalPrice,
        quantity: item.quantity,
      });

      itemsPrice += variant.price * item.quantity;
      discountOnMRP += (variant.originalPrice - variant.price) * item.quantity;
    }

    let couponDiscount = 0;
    let validCoupon = null;

    if (couponCode) {
      validCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        minimumPurchaseAmount: { $lte: itemsPrice },
      });

      if (validCoupon) {
        if (validCoupon.discountType === 'percentage') {
          const calculatedDiscount =
            (itemsPrice * validCoupon.discountValue) / 100;
          couponDiscount = validCoupon.maxDiscountAmount
            ? Math.min(calculatedDiscount, validCoupon.maxDiscountAmount)
            : calculatedDiscount;
        } else {
          couponDiscount = validCoupon.discountValue;
        }
        couponDiscount = Math.min(couponDiscount, itemsPrice);
      }
    }

    const priceAfterCoupon = itemsPrice - couponDiscount;
    const shippingPrice =
      priceAfterCoupon >= settings.freeShippingThreshold
        ? 0
        : settings.deliveryFee || 150;
    const totalPrice = priceAfterCoupon + shippingPrice;

    const draftOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        street: shippingAddress.street,
        area: shippingAddress.area,
        city: shippingAddress.city,
        phone: shippingAddress.phone,
      },
      itemsPrice,
      discountOnMRP,
      couponCode: validCoupon ? validCoupon.code : undefined,
      couponDiscount,
      shippingPrice,
      totalPrice,
      paymentMethod: 'pending',
      paymentStatus: 'pending',
      orderStatus: 'pending_payment',
    });

    const createdDraftOrder = await draftOrder.save();

    res.status(201).json({
      message: 'Draft order created successfully.',
      draftOrderId: createdDraftOrder._id,
      totalPrice: createdDraftOrder.totalPrice,
    });
  } catch (error) {
    console.error('Draft order creation error:', error);
    res.status(500).json({
      message: 'Server error during draft order creation: ' + error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const { reason } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res
        .status(404)
        .json({
          message:
            'Order not found or you do not have permission to modify it.',
        });
    }

    const cancellableStatuses = ['pending_payment', 'processing'];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res
        .status(400)
        .json({
          message: `Cannot cancel order with status: ${order.orderStatus}.`,
        });
    }

    console.log(
      `[Cancel Order ${orderId}] Restoring stock for ${order.orderItems.length} items...`,
    );
    for (const item of order.orderItems) {
      try {
        const updateResult = await Product.updateOne(
          {
            _id: item.product,
            'variants.name': item.variantName,
            'variants.stockBySize.size': item.size,
          },
          {
            $inc: { 'variants.$[v].stockBySize.$[s].stock': item.quantity },
          },
          {
            arrayFilters: [
              { 'v.name': item.variantName },
              { 's.size': item.size },
            ],
          },
        );
        if (updateResult.modifiedCount === 0) {
          console.warn(
            `[Cancel Order ${orderId}] Stock update potentially failed or item configuration changed for product ${item.product}, variant ${item.variantName}, size ${item.size}. Manual check might be needed.`,
          );
        } else {
          console.log(
            `[Cancel Order ${orderId}] Stock restored for ${item.name} (${item.variantName}/${item.size}): +${item.quantity}`,
          );
        }
      } catch (stockError) {
        console.error(
          `[Cancel Order ${orderId}] CRITICAL ERROR restoring stock for product ${item.product}:`,
          stockError,
        );
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by user';

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refund_initiated';
      console.log(
        `[Cancel Order ${orderId}] Order was paid. Marked payment status as '${order.paymentStatus}'. Manual refund process may be required.`,
      );
    } else {
      console.log(
        `[Cancel Order ${orderId}] Order payment status was '${order.paymentStatus}'. No refund action triggered.`,
      );
    }

    const updatedOrder = await order.save();
    console.log(
      `[Cancel Order ${orderId}] Order successfully cancelled by user ${userId}.`,
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      `[Cancel Order ${orderId}] Server error during cancellation:`,
      error,
    );
    res
      .status(500)
      .json({
        message: 'Server error during order cancellation: ' + error.message,
      });
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  initiatePayment,
  handlePaymentCallback,
  updateOrderPaymentMethod,
  verifyEsewaPaymentClient,
  createDraftOrder,
  cancelOrder,
};
