const User = require('../models/User');

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = req.body;

    if (newAddress.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    Object.assign(address, req.body);

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();
    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = address.isDefault;

    user.addresses.pull(req.params.addressId);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });

    await user.save();
    res.json({
      message: 'Default address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
