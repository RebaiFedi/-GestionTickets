const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(to, subject, details) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f8f8; text-align: center; padding: 10px; font-size: 0.8em; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .details { background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .details p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Une nouvelle demande nécessite votre validation. Voici les détails :</p>
          <div class="details">
            ${generateDetailsHTML(details)}
          </div>
          <p>Veuillez vous connecter à la plateforme pour valider cette demande.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Se connecter à la plateforme</a>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlTemplate
    });
    console.log('Email envoyé: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

function generateDetailsHTML(details) {
  if (details.type === 'transfer') {
    return `
      <p><strong>Type :</strong> Demande de transfert</p>
      <p><strong>Numéro de transfert :</strong> ${details.transferNumber}</p>
      <p><strong>Quantité :</strong> ${details.quantity}</p>
      <p><strong>Date :</strong> ${details.date}</p>
      <p><strong>Destination :</strong> ${details.destination}</p>
      <p><strong>Magasin :</strong> ${details.store}</p>
    `;
  } else if (details.type === 'cegidUser') {
    return `
      <p><strong>Type :</strong> Demande de création utilisateur CEGID</p>
      <p><strong>Nom complet :</strong> ${details.fullName}</p>
      <p><strong>Groupe utilisateur :</strong> ${details.userGroup}</p>
      <p><strong>Login :</strong> ${details.userLogin}</p>
      <p><strong>Magasin :</strong> ${details.store}</p>
    `;
  } else {
    // Code existant pour les tickets
    return `
      <p><strong>Type :</strong> ${details.type === 'delete' ? 'Suppression' : 'Modification'}</p>
      <p><strong>Code :</strong> ${details.code}</p>
      <p><strong>Caissier :</strong> ${details.caissier}</p>
      ${details.type === 'delete' 
        ? `<p><strong>Cause :</strong> ${details.cause}</p>`
        : `<p><strong>Ancien mode de paiement :</strong> ${details.oldPaymentMethod}</p>
           <p><strong>Nouveau mode de paiement :</strong> ${details.newPaymentMethod}</p>
           ${details.oldPaymentMethod2 && details.newPaymentMethod2 
             ? `<p><strong>Ancien mode de paiement 2 :</strong> ${details.oldPaymentMethod2}</p>
                <p><strong>Nouveau mode de paiement 2 :</strong> ${details.newPaymentMethod2}</p>`
             : ''}
           <p><strong>Montant :</strong> ${details.amount} TND</p>`
      }`;
  }
}

module.exports = { sendEmail };
