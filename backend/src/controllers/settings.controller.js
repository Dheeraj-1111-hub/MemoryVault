const User = require('../models/User');

exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email settings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Ensure settings exist (for users created before this update)
    if (!user.settings) {
      user.settings = {
        model: 'Groq • llama-3.3-70b',
        temperature: 0.3,
        autoTagUploads: true,
        extractDates: true
      };
      await user.save();
    }

    res.status(200).json({
      success: true,
      profile: {
        name: user.name,
        email: user.email
      },
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, email, settings } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    
    if (settings) {
      user.settings = {
        ...user.settings.toObject(),
        ...settings
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      profile: {
        name: user.name,
        email: user.email
      },
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
