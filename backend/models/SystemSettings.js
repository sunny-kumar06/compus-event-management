const mongoose = require("mongoose");
const defaultInstitutionConfig = require("../config/institution");

const systemSettingsSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: defaultInstitutionConfig.institution.name
    },
    shortName: {
      type: String,
      default: defaultInstitutionConfig.institution.shortName
    },
    productName: {
      type: String,
      default: defaultInstitutionConfig.institution.productName
    },
    tagline: {
      type: String,
      default: defaultInstitutionConfig.institution.tagline
    },
    logo: {
      type: String,
      default: defaultInstitutionConfig.institution.logo
    },
    favicon: {
      type: String,
      default: defaultInstitutionConfig.institution.favicon
    },
    website: {
      type: String,
      default: defaultInstitutionConfig.institution.website
    },
    email: {
      type: String,
      default: defaultInstitutionConfig.institution.email
    },
    phone: {
      type: String,
      default: defaultInstitutionConfig.institution.phone
    },
    address: {
      type: String,
      default: defaultInstitutionConfig.institution.address
    },
    primaryColor: {
      type: String,
      default: defaultInstitutionConfig.institution.theme.primaryColor
    },
    secondaryColor: {
      type: String,
      default: defaultInstitutionConfig.institution.theme.secondaryColor
    },
    accentColor: {
      type: String,
      default: defaultInstitutionConfig.institution.theme.accentColor
    },
    footerText: {
      type: String,
      default: defaultInstitutionConfig.institution.footerText
    },
    certificateSigners: [
      {
        name: String,
        title: String,
        institution: String
      }
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Method to get current active settings or default
systemSettingsSchema.statics.getCurrentSettings = async function () {
  const settings = await this.findOne();
  if (settings) return settings;
  // Initialize default
  return await this.create({
    institutionName: defaultInstitutionConfig.institution.name,
    shortName: defaultInstitutionConfig.institution.shortName,
    productName: defaultInstitutionConfig.institution.productName,
    tagline: defaultInstitutionConfig.institution.tagline,
    logo: defaultInstitutionConfig.institution.logo,
    favicon: defaultInstitutionConfig.institution.favicon,
    website: defaultInstitutionConfig.institution.website,
    email: defaultInstitutionConfig.institution.email,
    phone: defaultInstitutionConfig.institution.phone,
    address: defaultInstitutionConfig.institution.address,
    primaryColor: defaultInstitutionConfig.institution.theme.primaryColor,
    secondaryColor: defaultInstitutionConfig.institution.theme.secondaryColor,
    accentColor: defaultInstitutionConfig.institution.theme.accentColor,
    footerText: defaultInstitutionConfig.institution.footerText,
    certificateSigners: defaultInstitutionConfig.certificates.signers
  });
};

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
