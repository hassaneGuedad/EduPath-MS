import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# Configuration SMTP (à configurer via variables d'environnement)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@edupath.edu")

async def send_credentials_email(
    to_email: str,
    student_name: str,
    temporary_password: str
) -> bool:
    """
    Envoie un email contenant les identifiants de connexion à l'étudiant
    
    Args:
        to_email: Email de l'étudiant
        student_name: Nom de l'étudiant
        temporary_password: Mot de passe temporaire généré
    
    Returns:
        bool: True si l'email a été envoyé avec succès, False sinon
    """
    
    # Si les identifiants SMTP ne sont pas configurés, on simule l'envoi
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"📧 [SIMULATION] Email envoyé à {to_email}")
        print(f"   Mot de passe: {temporary_password}")
        return True
    
    try:
        # Créer le message
        message = MIMEMultipart("alternative")
        message["Subject"] = "🎓 Bienvenue sur EduPath - Vos identifiants de connexion"
        message["From"] = SMTP_FROM
        message["To"] = to_email
        
        # Corps du message en HTML
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #27ae60;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border: 1px solid #ddd;
                }}
                .credentials {{
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #27ae60;
                }}
                .password {{
                    background-color: #fff3cd;
                    padding: 15px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 18px;
                    font-weight: bold;
                    color: #856404;
                    text-align: center;
                    margin: 15px 0;
                }}
                .warning {{
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                }}
                .button {{
                    display: inline-block;
                    background-color: #27ae60;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 EduPath</h1>
                    <p>Plateforme d'apprentissage personnalisée</p>
                </div>
                
                <div class="content">
                    <h2>Bonjour {student_name or "étudiant(e)"},</h2>
                    
                    <p>Bienvenue sur <strong>EduPath</strong> ! Votre compte a été créé avec succès par votre professeur.</p>
                    
                    <div class="credentials">
                        <h3>📧 Vos identifiants de connexion :</h3>
                        <p><strong>Email :</strong> {to_email}</p>
                        <p><strong>Mot de passe temporaire :</strong></p>
                        <div class="password">{temporary_password}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important :</strong>
                        <ul>
                            <li>Ce mot de passe est <strong>temporaire</strong></li>
                            <li>Vous devez le changer lors de votre première connexion</li>
                            <li>Ne partagez jamais vos identifiants</li>
                            <li>Conservez ce mot de passe en lieu sûr jusqu'à votre première connexion</li>
                        </ul>
                    </div>
                    
                    <center>
                        <a href="http://localhost:3009/login" class="button">
                            🔗 Se connecter maintenant
                        </a>
                    </center>
                    
                    <h3>📝 Étapes suivantes :</h3>
                    <ol>
                        <li>Cliquez sur le bouton ci-dessus ou visitez : <strong>http://localhost:3009</strong></li>
                        <li>Entrez votre email et le mot de passe temporaire</li>
                        <li>Allez dans <strong>Paramètres</strong> (⚙️) pour changer votre mot de passe</li>
                        <li>Choisissez un mot de passe fort et unique</li>
                    </ol>
                    
                    <h3>🆘 Besoin d'aide ?</h3>
                    <p>Si vous rencontrez des difficultés pour vous connecter, contactez votre professeur ou l'administration.</p>
                </div>
                
                <div class="footer">
                    <p>Cet email a été généré automatiquement par EduPath</p>
                    <p>© 2025 EduPath - Tous droits réservés</p>
                    <p style="color: #999; font-size: 10px;">
                        Si vous n'êtes pas concerné par ce message, veuillez l'ignorer.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Corps du message en texte brut (fallback)
        text_body = f"""
        Bonjour {student_name or "étudiant(e)"},
        
        Bienvenue sur EduPath ! Votre compte a été créé avec succès.
        
        VOS IDENTIFIANTS DE CONNEXION :
        ================================
        Email : {to_email}
        Mot de passe temporaire : {temporary_password}
        
        ⚠️ IMPORTANT :
        - Ce mot de passe est temporaire
        - Vous devez le changer lors de votre première connexion
        - Ne partagez jamais vos identifiants
        
        COMMENT SE CONNECTER :
        1. Visitez : http://localhost:3009
        2. Entrez votre email et mot de passe temporaire
        3. Allez dans Paramètres (⚙️) pour changer votre mot de passe
        
        Besoin d'aide ? Contactez votre professeur.
        
        ---
        EduPath - Plateforme d'apprentissage personnalisée
        """
        
        # Attacher les deux versions
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        message.attach(part1)
        message.attach(part2)
        
        # Envoyer l'email
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        print(f"✅ Email envoyé avec succès à {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de l'email à {to_email}: {str(e)}")
        return False


async def send_password_changed_notification(
    to_email: str,
    student_name: str
) -> bool:
    """
    Envoie une notification de confirmation après changement de mot de passe
    
    Args:
        to_email: Email de l'étudiant
        student_name: Nom de l'étudiant
    
    Returns:
        bool: True si l'email a été envoyé avec succès, False sinon
    """
    
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"📧 [SIMULATION] Notification de changement de mot de passe envoyée à {to_email}")
        return True
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "✅ Votre mot de passe EduPath a été changé"
        message["From"] = SMTP_FROM
        message["To"] = to_email
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #27ae60; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background-color: #f9f9f9; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 EduPath</h1>
                </div>
                <div class="content">
                    <h2>Bonjour {student_name or "étudiant(e)"},</h2>
                    <p>✅ Votre mot de passe a été changé avec succès le {os.environ.get('TZ', 'UTC')}.</p>
                    <p>Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement votre professeur.</p>
                    <p>Cordialement,<br>L'équipe EduPath</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Bonjour {student_name or "étudiant(e)"},
        
        ✅ Votre mot de passe EduPath a été changé avec succès.
        
        Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement votre professeur.
        
        Cordialement,
        L'équipe EduPath
        """
        
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        message.attach(part1)
        message.attach(part2)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        print(f"✅ Notification de changement de mot de passe envoyée à {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de la notification à {to_email}: {str(e)}")
        return False
