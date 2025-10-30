import axios from 'axios';

// GoHighLevel Email Service Configuration
class GHLEmailService {
  private isConfigured: boolean = false;
  private apiToken: string = '';
  private locationId: string = '';
  private fromEmail: string = '';
  private baseUrl: string = 'https://services.leadconnectorhq.com';

  constructor() {
    // Configure GoHighLevel if credentials are provided
    if (process.env.GHL_API_TOKEN && process.env.GHL_LOCATION_ID && process.env.GHL_FROM_EMAIL) {
      this.apiToken = process.env.GHL_API_TOKEN;
      this.locationId = process.env.GHL_LOCATION_ID;
      this.fromEmail = process.env.GHL_FROM_EMAIL;
      this.isConfigured = true;
      console.log('GoHighLevel email service configured');
    } else {
      console.log('GoHighLevel credentials not found - email functionality will be disabled');
    }
  }

  /**
   * Create or update a contact in GoHighLevel
   */
  private async createOrUpdateContact(email: string, firstName?: string, lastName?: string): Promise<string | null> {
    if (!this.isConfigured) {
      console.log(`GHL contact not created (no config): ${email}`);
      return null;
    }

    try {
      // First, search for existing contact
      const searchResponse = await axios.get(`${this.baseUrl}/contacts/`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        params: {
          locationId: this.locationId,
          email: email,
        }
      });

      let contactId: string;

      if (searchResponse.data?.contacts && searchResponse.data.contacts.length > 0) {
        // Contact exists, use existing ID
        contactId = searchResponse.data.contacts[0].id;
        console.log(`Existing GHL contact found: ${contactId}`);
      } else {
        // Create new contact with properly parsed first/last name
        const contactData: any = {
          locationId: this.locationId,
          email: email,
        };

        // Properly handle first name and last name to avoid duplication
        if (firstName) {
          contactData.firstName = firstName.trim();
        }
        if (lastName) {
          contactData.lastName = lastName.trim();
        }

        const createResponse = await axios.post(`${this.baseUrl}/contacts/`, contactData, {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json',
          }
        });

        contactId = createResponse.data.contact.id;
        console.log(`New GHL contact created: ${contactId} (${firstName} ${lastName})`);
      }

      return contactId;
    } catch (error: any) {
      console.error('Error creating/updating GHL contact:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Send email via GoHighLevel Conversations API
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`GHL email not sent (no config): ${options.subject} to ${options.to}`);
      return false;
    }

    try {
      // Create or get contact first
      const contactId = await this.createOrUpdateContact(options.to, options.firstName, options.lastName);
      
      if (!contactId) {
        console.error('Failed to create/find contact for email');
        return false;
      }

      // Send email via Conversations API
      const emailData = {
        type: 'Email',
        contactId: contactId,
        locationId: this.locationId,
        emailFrom: this.fromEmail,
        subject: options.subject,
        htmlBody: options.html,
        altBody: options.html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      };

      await axios.post(`${this.baseUrl}/conversations/messages`, emailData, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        }
      });

      console.log(`GHL email sent successfully: ${options.subject} to ${options.to}`);
      return true;
    } catch (error: any) {
      console.error('Error sending GHL email:', error.response?.data || error.message);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string, lastName?: string): Promise<boolean> {
    const resetUrl = `${process.env.REPLIT_DEPLOYMENT ? 'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .warning { background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello${firstName ? ' ' + firstName : ''},</p>
              <p>We received a request to reset your password for your PartnerConnector account.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </div>
              <p><strong>This link will expire in 1 hour</strong> for your security.</p>
              <p>Best regards,<br><strong>The PartnerConnector Team</strong></p>
            </div>
            <div class="footer">
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔐 Reset your PartnerConnector password',
      html,
      firstName,
      lastName
    });
  }

  async sendWelcomeEmail(email: string, firstName?: string, lastName?: string): Promise<boolean> {
    const name = firstName ? firstName : 'there';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: white; border: 1px solid #e5e7eb; }
            .feature-list { background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature-list li { margin: 10px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to PartnerConnector!</h1>
            </div>
            <div class="content">
              <p><strong>Hello ${name},</strong></p>
              <p>Welcome to PartnerConnector! We're excited to have you join our community of business partners earning commissions through payment processing referrals.</p>
              
              <div class="feature-list">
                <h3>🚀 What You Can Do:</h3>
                <ul>
                  <li>✅ Submit referrals and track their progress in real-time</li>
                  <li>💰 Earn commissions on successful conversions</li>
                  <li>👥 Build your team and earn multi-level commissions</li>
                  <li>📊 Access comprehensive reporting and analytics</li>
                  <li>🎓 Complete training modules to maximize your earnings</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.REPLIT_DEPLOYMENT ? 'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : 'http://localhost:5000'}/dashboard" class="button">Go to Dashboard</a>
              </div>

              <p style="margin-top: 30px;">If you have any questions, our support team is here to help!</p>
              <p>Best regards,<br><strong>The PartnerConnector Team</strong></p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you signed up for PartnerConnector.</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">partnerships@partnerconnector.co.uk</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Welcome to PartnerConnector - Start Earning Today!',
      html,
      firstName,
      lastName
    });
  }

  async sendEmailVerification(email: string, verificationToken: string, firstName?: string, lastName?: string): Promise<boolean> {
    const verifyUrl = `${process.env.REPLIT_DEPLOYMENT ? 'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hello${firstName ? ' ' + firstName : ''},</p>
              <p>Thank you for signing up for PartnerConnector! Please verify your email address to activate your account.</p>
              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Once verified, you'll have full access to submit referrals and start earning commissions.</p>
              <p>Best regards,<br><strong>The PartnerConnector Team</strong></p>
            </div>
            <div class="footer">
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; color: #10b981;">${verifyUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '✉️ Verify your PartnerConnector email',
      html,
      firstName,
      lastName
    });
  }

  async sendQuoteNotification(email: string, businessName: string, quoteAmount?: number, firstName?: string, lastName?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .highlight { background: #e5f7f0; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Quote Ready!</h1>
            </div>
            <div class="content">
              <p>Great news!</p>
              <p>A quote has been prepared for your referral: <strong>${businessName}</strong></p>
              ${quoteAmount ? `<div class="highlight">
                <h3>Quote Amount: £${quoteAmount.toLocaleString()}</h3>
              </div>` : ''}
              <p>The quote has been sent to the client for review. You'll be notified once they respond.</p>
              <p>Keep up the great work!</p>
              <p>Best regards,<br>The PartnerConnector Team</p>
            </div>
            <div class="footer">
              <p>Track all your referrals in your dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📋 Quote ready for ${businessName}`,
      html,
      firstName,
      lastName
    });
  }

  async sendCommissionNotification(email: string, businessName: string, amount: number, firstName?: string, lastName?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .highlight { background: #e5f7f0; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; text-align: center; }
            .amount { font-size: 2em; font-weight: bold; color: #10b981; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Commission Paid!</h1>
            </div>
            <div class="content">
              <p>Congratulations!</p>
              <p>Your commission has been processed for the referral: <strong>${businessName}</strong></p>
              <div class="highlight">
                <div class="amount">£${amount.toLocaleString()}</div>
                <p>has been paid to your account</p>
              </div>
              <p>Thank you for your continued partnership. Keep referring and earning!</p>
              <p>Best regards,<br>The PartnerConnector Team</p>
            </div>
            <div class="footer">
              <p>View your commission history in your dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `💰 Commission paid: £${amount.toLocaleString()}`,
      html,
      firstName,
      lastName
    });
  }
}

export const ghlEmailService = new GHLEmailService();
