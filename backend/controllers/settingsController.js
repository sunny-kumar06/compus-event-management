const SystemSettings = require("../models/SystemSettings");
const defaultInstitutionConfig = require("../config/institution");

// @desc    Get active institution branding and configuration
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getCurrentSettings();
    res.json({
      success: true,
      data: settings,
      defaults: defaultInstitutionConfig
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update institution branding and boilerplate configuration (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    const {
      institutionName,
      shortName,
      productName,
      tagline,
      logo,
      favicon,
      website,
      email,
      phone,
      address,
      primaryColor,
      secondaryColor,
      accentColor,
      footerText,
      certificateSigners
    } = req.body;

    if (institutionName) settings.institutionName = institutionName;
    if (shortName) settings.shortName = shortName;
    if (productName) settings.productName = productName;
    if (tagline) settings.tagline = tagline;
    if (logo !== undefined) settings.logo = logo;
    if (favicon !== undefined) settings.favicon = favicon;
    if (website !== undefined) settings.website = website;
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = address;
    if (primaryColor) settings.primaryColor = primaryColor;
    if (secondaryColor) settings.secondaryColor = secondaryColor;
    if (accentColor) settings.accentColor = accentColor;
    if (footerText) settings.footerText = footerText;
    if (certificateSigners && Array.isArray(certificateSigners)) {
      settings.certificateSigners = certificateSigners;
    }

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: "Institution branding and boilerplate settings updated successfully.",
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
