const User = require('../models/User');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product',
    });

    console.log('Cart items count:', user.cart.length);

    const validCart = user.cart.filter((item) => item.product !== null);

    console.log('Valid cart items count:', validCart.length);
    validCart.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        _id: item._id,
        productId: item.product?._id || 'NULL',
        productExists: !!item.product,
        productName: item.product?.name || 'NO PRODUCT',
      });
    });

    res.json(validCart);
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, variantName, size, quantity } = req.body;
  const userId = req.user._id;

  if (!productId || !variantName || !size || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid item data provided.' });
  }

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) {
      return res.status(400).json({ message: 'Selected variant not found.' });
    }
    const sizeStockInfo = variant.stockBySize.find((s) => s.size === size);
    if (!sizeStockInfo) {
      return res
        .status(400)
        .json({ message: 'Selected size not available for this variant.' });
    }

    const availableStock = sizeStockInfo.stock;

    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.product &&
        item.product.toString() === productId &&
        item.variantName === variantName &&
        item.size === size,
    );

    let finalQuantity = 0;
    let requiresSave = false;

    if (existingItemIndex > -1) {
      const currentQuantityInCart = user.cart[existingItemIndex].quantity;
      const requestedTotalQuantity = currentQuantityInCart + quantity;

      if (requestedTotalQuantity > availableStock) {
        return res
          .status(400)
          .json({
            message: `Cannot add ${quantity}. Only ${
              availableStock - currentQuantityInCart
            } more available.`,
          });
      }
      user.cart[existingItemIndex].quantity = requestedTotalQuantity;
      finalQuantity = requestedTotalQuantity;
      requiresSave = true;
    } else {
      if (quantity > availableStock) {
        return res
          .status(400)
          .json({
            message: `Cannot add ${quantity}. Only ${availableStock} available.`,
          });
      }
      user.cart.push({ product: productId, variantName, size, quantity });
      finalQuantity = quantity;
      requiresSave = true;
    }

    if (requiresSave) {
      await user.save();
    }

    const populatedUser = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
    });

    const validCart = populatedUser.cart.filter(
      (item) => item.product !== null,
    );

    res.status(requiresSave ? 201 : 200).json(validCart);
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res
      .status(500)
      .json({ message: 'Server error adding item to cart: ' + error.message });
  }
};
exports.updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  const newQuantity = Number(quantity);
  if (isNaN(newQuantity)) {
    return res.status(400).json({ message: 'Invalid quantity provided.' });
  }

  try {
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = user.cart.id(itemId);
    if (!item || !item.product) {
      return res
        .status(404)
        .json({ message: 'Cart item or associated product not found.' });
    }

    const variant = item.product.variants.find(
      (v) => v.name === item.variantName,
    );
    if (!variant) {
      item.remove();
      await user.save();
      console.warn(
        `Removed cart item ${itemId} due to missing variant ${item.variantName} in product ${item.product._id}`,
      );
      return res
        .status(404)
        .json({ message: 'Item variant details mismatch. Item removed.' });
    }
    const sizeStockInfo = variant.stockBySize.find((s) => s.size === item.size);
    if (!sizeStockInfo) {
      item.remove();
      await user.save();
      console.warn(
        `Removed cart item ${itemId} due to missing size ${item.size} in product ${item.product._id}`,
      );
      return res
        .status(404)
        .json({ message: 'Item size details mismatch. Item removed.' });
    }

    const availableStock = sizeStockInfo.stock;

    if (newQuantity > 0 && newQuantity > availableStock) {
      return res
        .status(400)
        .json({
          message: `Cannot set quantity to ${newQuantity}. Only ${availableStock} available.`,
        });
    }

    if (newQuantity <= 0) {
      item.remove();
    } else {
      item.quantity = newQuantity;
    }

    await user.save();

    const updatedPopulatedUser = await User.findById(userId).populate({
      path: 'cart.product',
      model: 'Product',
    });

    const validCart = updatedPopulatedUser.cart.filter(
      (cartItem) => cartItem.product !== null,
    );
    res.json(validCart);
  } catch (error) {
    console.error('Update Cart Item Error:', error);
    res
      .status(500)
      .json({ message: 'Server error updating cart item: ' + error.message });
  }
};

exports.updateCartItemDetails = async (req, res) => {
  const { itemId } = req.params;
  const { variantName, size } = req.body;

  if (!variantName || !size) {
    return res.status(400).json({ message: 'Variant and size are required.' });
  }

  try {
    const user = await User.findById(req.user._id);
    const item = user.cart.id(itemId);

    if (item) {
      item.variantName = variantName;
      item.size = size;
    } else {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await user.save();
    const populatedUser = await user.populate({
      path: 'cart.product',
      model: 'Product',
    });
    res.json(populatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { cart: { _id: itemId } } },
    );

    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product',
      match: { _id: { $exists: true } },
    });

    const validCart = user.cart.filter((item) => item.product !== null);
    res.json(validCart);
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cleanupCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product',
    });

    const originalCount = user.cart.length;
    user.cart = user.cart.filter((item) => item.product !== null);
    const newCount = user.cart.length;

    if (originalCount !== newCount) {
      await user.save();
      console.log(
        `Cleaned up ${originalCount - newCount} deleted products from cart`,
      );
    }

    res.json({
      message: `Removed ${originalCount - newCount} deleted products from cart`,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
