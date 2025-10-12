// documentVerification.js
const Tesseract = require('tesseract.js');
const aadhaarValidator = require('aadhaar-validator');
const axios = require('axios'); // Add axios for downloading images

class DocumentVerifier {
  
  // Download image from URL and convert to buffer
  static async downloadImage(imageUrl) {
    try {
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  // Aadhaar Card Verification
  static async verifyAadhaar(aadhaarNumber, imageUrl) {
    try {
      // Step 1: Validate Aadhaar number format
      if (!aadhaarValidator.isValidNumber(aadhaarNumber)) {
        return { isValid: false, error: 'Invalid Aadhaar number format' };
      }

      // Step 2: Download image from URL
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Step 3: Extract text from image for verification
      const extractedText = await this.extractTextFromImage(imageBuffer);
      
      // Step 4: Check if Aadhaar number exists in extracted text
      const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
      const numberInImage = extractedText.includes(cleanAadhaar);
      
      console.log('Aadhaar Verification:', {
        number: cleanAadhaar,
        extractedText: extractedText.substring(0, 100) + '...',
        found: numberInImage
      });
      
      return {
        isValid: numberInImage,
        verified: numberInImage,
        details: {
          number: aadhaarNumber,
          formatValid: true,
          imageVerified: numberInImage,
          extractedText: extractedText.substring(0, 200) // For debugging
        }
      };
    } catch (error) {
      console.error('Aadhaar verification error:', error);
      return { isValid: false, error: error.message };
    }
  }

  // Driving License Verification
  static async verifyDrivingLicense(dlNumber, imageUrl) {
    try {
      // Step 1: Basic DL number validation
      if (!this.isValidDLFormat(dlNumber)) {
        return { isValid: false, error: 'Invalid DL number format' };
      }

      // Step 2: Download image from URL
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Step 3: Extract text from DL image
      const extractedText = await this.extractTextFromImage(imageBuffer);
      
      // Step 4: Verify DL number in image
      const cleanDL = dlNumber.replace(/\s/g, '').toUpperCase();
      const numberInImage = extractedText.includes(cleanDL);
      
      // Step 5: Extract additional details
      const details = this.extractDLDetails(extractedText);
      
      console.log('DL Verification:', {
        number: cleanDL,
        extractedText: extractedText.substring(0, 100) + '...',
        found: numberInImage,
        details
      });
      
      return {
        isValid: numberInImage,
        verified: numberInImage,
        details: {
          number: dlNumber,
          ...details,
          formatValid: true,
          imageVerified: numberInImage,
          extractedText: extractedText.substring(0, 200) // For debugging
        }
      };
    } catch (error) {
      console.error('DL verification error:', error);
      return { isValid: false, error: error.message };
    }
  }

  // Text extraction from image buffer
  static async extractTextFromImage(imageBuffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        { 
          logger: m => console.log(m.status), // Only log status to reduce noise
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /-',
          psm: 6 // Assume uniform block of text
        }
      );
      return text.replace(/\n/g, ' ').toUpperCase();
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  // DL format validation
  static isValidDLFormat(dlNumber) {
    // Indian DL format: XX-XX-XXXXXX-XXXXXX or similar variations
    const dlRegex = /^[A-Z]{2}\d{2}\s?\d{4}\s?\d{7}$/;
    return dlRegex.test(dlNumber.replace(/\s/g, ''));
  }

  // Extract DL details from text
  static extractDLDetails(text) {
    const details = {};
    
    // Extract name (simple pattern - looks for all caps words)
    const nameMatch = text.match(/([A-Z]{3,}(?:\s+[A-Z]{3,}){1,2})/);
    if (nameMatch) details.name = nameMatch[1];
    
    // Extract date of birth (DD-MM-YYYY or DD/MM/YYYY)
    const dobMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
    if (dobMatch) details.dob = dobMatch[1];
    
    // Extract validity
    const validityMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\s*to\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
    if (validityMatch) {
      details.validFrom = validityMatch[1];
      details.validTo = validityMatch[2];
    }
    
    return details;
  }
}

module.exports = DocumentVerifier;