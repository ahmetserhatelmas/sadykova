/** Supabase / auth hata metinlerini kullanıcıya Türkçe göstermek için */

export const DUPLICATE_EMAIL_MSG = "Bu mail zaten kayıtlıdır.";

export const EMAIL_RATE_LIMIT_MSG =
  "Çok sık doğrulama e-postası istendi; Supabase geçici olarak gönderimi durdurdu. Yaklaşık 15–60 dakika bekleyip tekrar deneyin. Sorun sürerse Supabase Dashboard → Project Settings → Auth → Rate Limits veya kendi SMTP ayarınızı kontrol edin.";

function isDuplicateSignupError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already")
  );
}

function isEmailRateLimited(message: string) {
  const m = message.toLowerCase();
  return m.includes("rate limit") || m.includes("too many requests");
}

export function formatSignUpError(message: string): string {
  if (isEmailRateLimited(message)) return EMAIL_RATE_LIMIT_MSG;
  if (isDuplicateSignupError(message)) return DUPLICATE_EMAIL_MSG;
  return message;
}

export function formatPasswordResetEmailError(message: string): string {
  if (isEmailRateLimited(message)) return EMAIL_RATE_LIMIT_MSG;
  return message;
}

export function formatLoginError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("email not confirmed") ||
    m.includes("not confirmed") ||
    m.includes("email address not confirmed")
  ) {
    return "E-postanız henüz doğrulanmadı. Kayıt e-postasındaki bağlantıya tıklayın (spam klasörüne de bakın).";
  }
  return message;
}
