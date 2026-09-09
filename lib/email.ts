// lib/email.ts
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Em modo de teste (sem domínio verificado no Resend), o remetente precisa
// ser este endereço padrão do próprio Resend.
const FROM = process.env.EMAIL_FROM || "Aromas e Momentos <onboarding@resend.dev>";

export async function sendLoginCodeEmail(to: string, code: string) {
  if (!resend) {
    throw new Error(
      "RESEND_API_KEY não configurada. Defina essa variável de ambiente para enviar e-mails.",
    );
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Seu código de acesso - Aromas e Momentos",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color: #6b3b12;">Aromas e Momentos</h2>
        <p>Use o código abaixo para entrar no sistema:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #a76f4b;">
          ${code}
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          Esse código expira em 10 minutos. Se você não pediu esse acesso, pode ignorar este e-mail.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message || JSON.stringify(error)}`);
  }
}
